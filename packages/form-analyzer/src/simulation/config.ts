import type { Race, Venue } from "../types";
import { MonteCarloSimulator } from "./monteCarlo";

export const MONTE_CARLO_RUNS = 10_000;

const PERFORMANCE_STDEV_BY_VENUE: Record<Venue, number> = {
  "Happy Valley": 11,
  "Sha Tin": 8,
};

/** Venue-specific performance variance (matches Strapi / reference CLI tools). */
export function performanceStdDevForVenue(venue: Venue): number {
  return PERFORMANCE_STDEV_BY_VENUE[venue] ?? 8;
}

export function createSimulatorForRace(race: Race): MonteCarloSimulator {
  return new MonteCarloSimulator({
    runs: MONTE_CARLO_RUNS,
    performanceStdDev: performanceStdDevForVenue(race.venue),
  });
}
