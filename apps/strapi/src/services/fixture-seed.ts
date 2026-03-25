import fs from 'node:fs/promises';
import path from 'node:path';

type DiskMeeting = { date: string; venue: string };
/** Seed file may still include legacy `season` / `lastUpdated`; they are ignored. */
type FixtureFile = { meetings?: DiskMeeting[] };

function seedFilePath(): string {
  const override = process.env.HKJC_FIXTURE_SEED_FILE;
  if (override) return path.resolve(override);
  return path.resolve(process.cwd(), 'data', 'fixtures.seed.json');
}

function slotKey(date: string, venue: string): string {
  return `${date}_${venue}`;
}

/**
 * Optional bootstrap: create missing Fixture collection rows from `data/fixtures.seed.json`
 * (or `HKJC_FIXTURE_SEED_FILE`). Does not read or write any other app in the monorepo.
 */
export async function seedFixtureFromSeedFile(strapi: any): Promise<void> {
  const documents = strapi?.documents;
  if (!documents) {
    strapi?.log?.warn('fixture-seed: document service unavailable');
    return;
  }

  const fixturesPath = seedFilePath();
  let file: FixtureFile;
  try {
    const raw = await fs.readFile(fixturesPath, 'utf-8');
    file = JSON.parse(raw) as FixtureFile;
  } catch (e) {
    strapi.log.warn(
      `fixture-seed: could not read ${fixturesPath} (${e instanceof Error ? e.message : e})`
    );
    return;
  }

  const rows = file.meetings?.filter(
    (m) =>
      m &&
      typeof m.date === 'string' &&
      (m.venue === 'ST' || m.venue === 'HV')
  );
  if (!rows?.length) {
    strapi.log.warn('fixture-seed: seed file has no valid meetings');
    return;
  }

  if (process.env.HKJC_FIXTURE_SYNC_ON_BOOT === 'false') {
    strapi.log.info('fixture-seed: skipped (HKJC_FIXTURE_SYNC_ON_BOOT=false)');
    return;
  }

  let created = 0;
  let skipped = 0;
  for (const m of rows) {
    const key = slotKey(m.date, m.venue);
    const found = await documents('api::fixture.fixture').findFirst({
      filters: { key: { $eq: key } },
    });
    if (found) {
      skipped++;
      continue;
    }
    await documents('api::fixture.fixture').create({
      data: {
        key,
        raceDate: m.date,
        venue: m.venue as 'ST' | 'HV',
      },
    });
    created++;
  }

  strapi.log.info(
    `fixture-seed: fixture rows created=${created}, already present=${skipped} (from ${rows.length} seed entries)`
  );
}
