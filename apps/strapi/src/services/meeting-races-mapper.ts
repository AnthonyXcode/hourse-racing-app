import type { ScrapedRaceMetadata, ScrapedRaceRunner } from './hkjc-historical-scraper';

function mapRunnerToStrapi(runner: ScrapedRaceRunner): Record<string, unknown> {
  const o: Record<string, unknown> = { horseNumber: runner.horseNumber };
  if (runner.horseName) o.horseName = runner.horseName;
  if (runner.horseCode) o.horseCode = runner.horseCode;
  if (runner.jockeyName) o.jockeyName = runner.jockeyName;
  if (runner.jockeyId) o.jockeyId = runner.jockeyId;
  if (runner.trainerName) o.trainerName = runner.trainerName;
  if (runner.trainerId) o.trainerId = runner.trainerId;
  if (runner.winOdds != null && Number.isFinite(runner.winOdds)) {
    o.winOdds = runner.winOdds;
  }
  if (runner.jockeyDocumentId) {
    o.jockey = { connect: [runner.jockeyDocumentId] };
  }
  if (runner.trainerDocumentId) {
    o.trainer = { connect: [runner.trainerDocumentId] };
  }

  // racecard-table fields
  if (runner.draw != null && runner.draw >= 1 && runner.draw <= 14) o.draw = runner.draw;
  if (runner.weight != null && runner.weight >= 100 && runner.weight <= 140) o.weight = runner.weight;
  if (runner.age != null && runner.age >= 2 && runner.age <= 12) o.age = runner.age;
  if (runner.currentRating != null && runner.currentRating >= 10 && runner.currentRating <= 140) {
    o.currentRating = runner.currentRating;
  }
  if (runner.ratingChange != null && runner.ratingChange >= -30 && runner.ratingChange <= 30) {
    o.ratingChange = runner.ratingChange;
  }
  if (runner.gear && runner.gear.length > 0) o.gear = JSON.stringify(runner.gear);
  if (runner.isScratched) o.isScratched = true;

  // horse-profile fields
  if (runner.sex) o.sex = runner.sex;
  if (runner.color) o.color = runner.color;
  if (runner.origin) o.origin = runner.origin;
  if (runner.sire) o.sire = runner.sire;
  if (runner.dam) o.dam = runner.dam;
  if (runner.seasonStarts != null) o.seasonStarts = runner.seasonStarts;
  if (runner.seasonWins != null) o.seasonWins = runner.seasonWins;
  if (runner.seasonPlaces != null) o.seasonPlaces = runner.seasonPlaces;
  if (runner.careerStarts != null) o.careerStarts = runner.careerStarts;
  if (runner.careerWins != null) o.careerWins = runner.careerWins;
  if (runner.careerPlaces != null) o.careerPlaces = runner.careerPlaces;
  if (runner.totalPrizeMoney != null && runner.totalPrizeMoney > 0) {
    o.totalPrizeMoney = String(runner.totalPrizeMoney);
  }

  if (runner.pastPerformances && runner.pastPerformances.length > 0) {
    o.pastPerformances = JSON.stringify(runner.pastPerformances);
  }

  return o;
}

export type PerRaceMeetingPayload = {
  raceNumber: number;
  raceName?: string;
  raceClass?: string;
  distance?: number;
  surface?: string;
  going?: string;
  prizeMoney?: string;
  runners: Record<string, unknown>[];
};

/**
 * Maps a single ScrapedRaceMetadata into a per-race Meeting payload
 * (top-level race fields + runners array).
 */
export function mapScrapedRaceToMeetingPayload(
  meta: ScrapedRaceMetadata
): PerRaceMeetingPayload {
  const out: PerRaceMeetingPayload = {
    raceNumber: meta.raceNumber,
    runners: (meta.runners ?? []).map(mapRunnerToStrapi),
  };
  if (meta.raceName) out.raceName = meta.raceName;
  if (meta.raceClass) out.raceClass = meta.raceClass;
  if (meta.distance) out.distance = meta.distance;
  if (meta.surface) out.surface = meta.surface;
  if (meta.going) out.going = meta.going;
  if (meta.prizeMoney != null) out.prizeMoney = String(meta.prizeMoney);
  return out;
}
