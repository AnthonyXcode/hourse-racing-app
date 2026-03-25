import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

type MeetingRow = { date: string; venue: 'ST' | 'HV' };
type FixtureStore = { lastUpdated: string; season: string; meetings: MeetingRow[] };

function meetingKey(date: string, venue: string): string {
  return `${date}_${venue}`;
}

function parseResultsFilename(name: string): { date: string; venue: 'ST' | 'HV' } | null {
  const m = /^results_(\d{8})_(ST|HV)\.json$/i.exec(name);
  if (!m) return null;
  const y = m[1].slice(0, 4);
  const mo = m[1].slice(4, 6);
  const d = m[1].slice(6, 8);
  return { date: `${y}-${mo}-${d}`, venue: m[2].toUpperCase() as 'ST' | 'HV' };
}

function getReferenceRoot(): string {
  const fromEnv = process.env.HKJC_REFERENCE_ROOT;
  if (fromEnv) return path.resolve(fromEnv);
  return path.resolve(process.cwd(), '..', 'reference');
}

async function readFixtureFromDisk(referenceRoot: string): Promise<FixtureStore | null> {
  const fixturesFile = path.join(referenceRoot, 'data', 'historical', 'fixtures.json');
  try {
    const raw = await fs.readFile(fixturesFile, 'utf-8');
    return JSON.parse(raw) as FixtureStore;
  } catch {
    return null;
  }
}

function defaultFixtures(): FixtureStore {
  return {
    lastUpdated: new Date().toISOString(),
    season: '2025-2026',
    meetings: [],
  };
}

function runSubprocess(
  command: string,
  args: string[],
  cwd: string,
  timeoutMs: number
): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, CI: 'false' },
      shell: false,
    });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      resolve({ code: null, stdout, stderr: `${stderr}\n[timeout ${timeoutMs}ms]` });
    }, timeoutMs);
    child.stdout?.on('data', (c: Buffer) => {
      stdout += c.toString();
    });
    child.stderr?.on('data', (c: Buffer) => {
      stderr += c.toString();
    });
    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr });
    });
  });
}

export async function runHkjcDailyJob(strapi: any): Promise<void> {
  const documents = strapi.documents;
  if (!documents) {
    strapi.log.error('hkjc-daily-job: strapi.documents unavailable');
    return;
  }

  const referenceRoot = getReferenceRoot();
  const historicalDir = path.join(referenceRoot, 'data', 'historical');
  const scrapeEnabled = process.env.HKJC_SCRAPER_ENABLED !== 'false';
  const scrapeTimeoutMs = Number(process.env.HKJC_SCRAPER_TIMEOUT_MS || 3_600_000);

  const hc = await documents('api::healthcheck.healthcheck').create({
    data: {
      jobName: 'daily_hkjc_sync',
      startedAt: new Date().toISOString(),
      status: 'running',
      summary: 'Started daily HKJC sync',
    },
  });
  const hcId = hc?.documentId;
  if (!hcId) {
    strapi.log.error('hkjc-daily-job: could not create healthcheck');
    return;
  }

  const metrics: Record<string, unknown> = {
    phases: [] as object[],
  };
  const phases = metrics.phases as { name: string; status: string; detail?: string }[];

  const fail = async (summary: string) => {
    await documents('api::healthcheck.healthcheck').update({
      documentId: hcId,
      data: {
        status: 'failure',
        completedAt: new Date().toISOString(),
        summary,
        metrics,
      },
    });
  };

  try {
    // --- Fixtures ---
    let store: FixtureStore | null = await readFixtureFromDisk(referenceRoot);
    if (store && store.meetings?.length) {
      const fixtureRow = await documents('api::fixture.fixture').findFirst({});
      const fixturePayload = {
        season: store.season,
        lastUpdated: store.lastUpdated || new Date().toISOString(),
        meetings: store.meetings,
      };
      if (fixtureRow?.documentId) {
        await documents('api::fixture.fixture').update({
          documentId: fixtureRow.documentId,
          data: fixturePayload,
        });
      } else {
        await documents('api::fixture.fixture').create({ data: fixturePayload });
      }
      phases.push({
        name: 'fixtures',
        status: 'success',
        detail: `${store.meetings.length} meetings in fixture record`,
      });
    } else {
      phases.push({
        name: 'fixtures',
        status: 'skipped',
        detail: 'No data/historical/fixtures.json (or empty); using Strapi fixture or skipping meetings',
      });
      const fixtureRow = await documents('api::fixture.fixture').findFirst({});
      if (fixtureRow?.meetings && Array.isArray(fixtureRow.meetings) && fixtureRow.meetings.length) {
        store = {
          season: fixtureRow.season || 'unknown',
          lastUpdated: fixtureRow.lastUpdated || new Date().toISOString(),
          meetings: fixtureRow.meetings as MeetingRow[],
        };
      } else {
        store = defaultFixtures();
      }
    }

    // --- Meetings (from fixture store) ---
    if (store.meetings.length > 0) {
      let created = 0;
      let alreadyHad = 0;
      for (const m of store.meetings) {
        const key = meetingKey(m.date, m.venue);
        const found = await documents('api::meeting.meeting').findFirst({
          filters: { key: { $eq: key } },
        });
        if (found) {
          alreadyHad++;
          continue;
        }
        await documents('api::meeting.meeting').create({
          data: {
            key,
            raceDate: m.date,
            venue: m.venue,
            scrapeStatus: 'not_started',
          },
        });
        created++;
      }
      phases.push({
        name: 'meetings',
        status: 'success',
        detail: `created ${created}, already had ${alreadyHad}`,
      });
      metrics.meetingsCreated = created;
      metrics.meetingsExisting = alreadyHad;
    } else {
      phases.push({ name: 'meetings', status: 'skipped', detail: 'No meetings in fixture' });
    }

    // --- Historical scrape (reference Playwright script) ---
    if (scrapeEnabled) {
      try {
        await fs.access(path.join(referenceRoot, 'package.json'));
        const result = await runSubprocess(
          'pnpm',
          ['exec', 'tsx', 'tools/sync-historical.ts'],
          referenceRoot,
          scrapeTimeoutMs
        );
        metrics.scraperExitCode = result.code;
        metrics.scraperStderrTail = result.stderr.slice(-4000);
        if (result.code === 0) {
          phases.push({ name: 'historical_scrape', status: 'success' });
        } else {
          phases.push({
            name: 'historical_scrape',
            status: 'partial',
            detail: `exit ${result.code}`,
          });
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        phases.push({ name: 'historical_scrape', status: 'failure', detail: msg });
        strapi.log.warn(`hkjc-daily-job: scraper skipped or failed: ${msg}`);
      }
    } else {
      phases.push({ name: 'historical_scrape', status: 'skipped', detail: 'HKJC_SCRAPER_ENABLED=false' });
    }

    // --- Import results_*.json into History ---
    let imported = 0;
    let importErrors = 0;
    try {
      const files = await fs.readdir(historicalDir);
      const jsonFiles = files.filter((f) => /^results_\d{8}_(ST|HV)\.json$/i.test(f));
      for (const file of jsonFiles) {
        const parsed = parseResultsFilename(file);
        if (!parsed) continue;
        const key = meetingKey(parsed.date, parsed.venue);
        const meeting = await documents('api::meeting.meeting').findFirst({
          filters: { key: { $eq: key } },
        });
        if (!meeting?.documentId) continue;

        const fullPath = path.join(historicalDir, file);
        const raw = await fs.readFile(fullPath, 'utf-8');
        const results = JSON.parse(raw);

        const existingHist = await documents('api::history.history').findFirst({
          filters: { meeting: { documentId: { $eq: meeting.documentId } } },
        });

        const historyPayload = {
          meeting: meeting.documentId,
          results,
          scrapedAt: new Date().toISOString(),
          source: 'hkjc',
        };

        try {
          if (existingHist?.documentId) {
            await documents('api::history.history').update({
              documentId: existingHist.documentId,
              data: historyPayload,
            });
          } else {
            await documents('api::history.history').create({ data: historyPayload });
          }
          imported++;
          await documents('api::meeting.meeting').update({
            documentId: meeting.documentId,
            data: {
              scrapeStatus: 'success',
              lastScrapedAt: new Date().toISOString(),
            },
          });
        } catch {
          importErrors++;
        }
      }
      phases.push({
        name: 'history_import',
        status: importErrors ? 'partial' : 'success',
        detail: `imported ${imported}, errors ${importErrors}`,
      });
      metrics.historiesImported = imported;
      metrics.historiesImportErrors = importErrors;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      phases.push({ name: 'history_import', status: 'failure', detail: msg });
    }

    const anyFailure = phases.some((p) => p.status === 'failure');
    const anyPartial = phases.some((p) => p.status === 'partial');
    const overall = anyFailure ? 'partial' : anyPartial ? 'partial' : 'success';

    await documents('api::healthcheck.healthcheck').update({
      documentId: hcId,
      data: {
        status: overall,
        completedAt: new Date().toISOString(),
        summary: 'Daily HKJC sync finished',
        metrics,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    strapi.log.error(`hkjc-daily-job: ${msg}`);
    await fail(msg);
  }
}
