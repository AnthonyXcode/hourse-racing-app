import type { ScrapedRaceMetadata } from './hkjc-historical-scraper';

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
    };
    if (r.raceName) out.raceName = r.raceName;
    return out;
  });
}
