import fs from 'node:fs/promises';
import path from 'node:path';

type DiskMeeting = { date: string; venue: string };
type FixtureFile = { lastUpdated?: string; season?: string; meetings?: DiskMeeting[] };

function seedFilePath(): string {
  const override = process.env.HKJC_FIXTURE_SEED_FILE;
  if (override) return path.resolve(override);
  return path.resolve(process.cwd(), 'data', 'fixtures.seed.json');
}

/**
 * Optional bootstrap: upsert Fixture from `apps/strapi/data/fixtures.seed.json`
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

  const meetings = rows.map((m) => ({
    raceDate: m.date,
    venue: m.venue as 'ST' | 'HV',
  }));

  const payload = {
    season: file.season || '2025-2026',
    lastUpdated: file.lastUpdated || new Date().toISOString(),
    meetings,
  };

  if (process.env.HKJC_FIXTURE_SYNC_ON_BOOT === 'false') {
    strapi.log.info('fixture-seed: skipped (HKJC_FIXTURE_SYNC_ON_BOOT=false)');
    return;
  }

  const existing = await documents('api::fixture.fixture').findFirst({
    populate: ['meetings'],
  });

  if (existing?.documentId) {
    await documents('api::fixture.fixture').update({
      documentId: existing.documentId,
      data: payload,
    });
    strapi.log.info(`fixture-seed: updated Fixture with ${meetings.length} meeting slots`);
  } else {
    await documents('api::fixture.fixture').create({ data: payload });
    strapi.log.info(`fixture-seed: created Fixture with ${meetings.length} meeting slots`);
  }
}
