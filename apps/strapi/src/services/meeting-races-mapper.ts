import type { ScrapedRaceMetadata, ScrapedRaceRunner } from './hkjc-historical-scraper';

function mapRunnerToStrapi(runner: ScrapedRaceRunner): Record<string, unknown> {
  const o: Record<string, unknown> = { horseNumber: runner.horseNumber };
  if (runner.horseName) o.horseName = runner.horseName;
  if (runner.horseCode) o.horseCode = runner.horseCode;
  if (runner.jockeyName) o.jockeyName = runner.jockeyName;
  if (runner.jockeyId) o.jockeyId = runner.jockeyId;
  if (runner.trainerName) o.trainerName = runner.trainerName;
  if (runner.trainerId) o.trainerId = runner.trainerId;
  if (runner.jockeyDocumentId) {
    o.jockey = { connect: [runner.jockeyDocumentId] };
  }
  if (runner.trainerDocumentId) {
    o.trainer = { connect: [runner.trainerDocumentId] };
  }
  return o;
}

/**
 * Maps HKJC meeting metadata scrapes into Strapi `meeting.race-metadata` component payloads.
 */
export function mapScrapedRaceMetadataToStrapiRaces(
  rows: ScrapedRaceMetadata[]
): Record<string, unknown>[] {
  return rows.map((r) => {
    const out: Record<string, unknown> = {
      raceId: r.raceId,
      raceDate: r.raceDate,
      venue: r.venue,
      raceNumber: r.raceNumber,
      raceClass: r.raceClass,
      distance: r.distance,
      surface: r.surface,
      going: r.going,
      prizeMoney: r.prizeMoney,
      runners: (r.runners ?? []).map(mapRunnerToStrapi),
    };
    if (r.raceName) out.raceName = r.raceName;
    return out;
  });
}
