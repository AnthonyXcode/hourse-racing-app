/**
 * Race Analysis Job — orchestrates Monte Carlo analysis for meetings.
 *
 * Can target a single meeting (by key) or batch-analyze all upcoming races
 * that don't have an Analysis record yet.
 */

import { format } from 'date-fns';
import { analyzeRaceByKey } from './race-analyzer';
import { generateSuggestionsForAnalysis } from './suggestion-generator';

function analysisName(meetingKey: string): string {
  const now = format(new Date(), 'yyyyMMddHHmmss');
  return `${meetingKey}_${now}`;
}

/**
 * Run Monte Carlo analysis for a single meeting and persist the result.
 */
export async function runAnalysisForMeeting(
  strapi: any,
  meetingKey: string,
): Promise<{ name: string }> {
  const documents = strapi.documents as any;

  strapi.log.info(`race-analysis: analyzing ${meetingKey} …`);
  const { results, simulationRuns, meetingDocumentId } = await analyzeRaceByKey(strapi, meetingKey);

  const name = analysisName(meetingKey);

  const analysisDoc = await documents('api::analysis.analysis').create({
    data: {
      name,
      meeting: meetingDocumentId,
      simulationRuns,
      results: results.map((r) => ({
        horseNumber: r.horseNumber,
        horseName: r.horseName,
        horseCode: r.horseCode,
        winProbability: r.winProbability,
        placeProbability: r.placeProbability,
        expectedPosition: r.expectedPosition,
        ranking: r.ranking,
        formRecordCount: r.formRecordCount,
      })),
      analyzedAt: new Date().toISOString(),
    },
  });

  try {
    const populated = await documents('api::analysis.analysis').findOne({
      documentId: analysisDoc.documentId,
      populate: { results: true, meeting: true },
    });
    if (populated) {
      const count = await generateSuggestionsForAnalysis(populated);
      strapi.log.info(`race-analysis: generated ${count} suggestions for ${meetingKey}`);
    }
  } catch (e) {
    strapi.log.error(`race-analysis: suggestion generation failed for ${meetingKey}: ${e instanceof Error ? e.message : String(e)}`);
  }

  strapi.log.info(`race-analysis: ${meetingKey} done → ${name} (${results.length} runners)`);
  return { name };
}

/**
 * Analyze all upcoming meetings that don't have an Analysis record yet.
 */
export async function runAnalysisForUpcomingRaces(strapi: any): Promise<{
  analyzed: number;
  skipped: number;
  failed: number;
}> {
  const documents = strapi.documents as any;
  const todayIso = format(new Date(), 'yyyy-MM-dd');

  const pageSize = 200;
  let page = 1;
  const upcomingMeetings: any[] = [];

  while (true) {
    const batch = await documents('api::meeting.meeting').findMany({
      filters: {
        raceDate: { $gte: todayIso },
        raceNumber: { $notNull: true },
      },
      sort: 'key:ASC',
      limit: pageSize,
      start: (page - 1) * pageSize,
    });
    if (!batch || batch.length === 0) break;
    upcomingMeetings.push(...batch);
    if (batch.length < pageSize) break;
    page++;
  }

  if (upcomingMeetings.length === 0) {
    strapi.log.info('race-analysis: no upcoming meetings found');
    return { analyzed: 0, skipped: 0, failed: 0 };
  }

  strapi.log.info(`race-analysis: found ${upcomingMeetings.length} upcoming meeting(s)`);

  let analyzed = 0;
  let skipped = 0;
  let failed = 0;

  for (const m of upcomingMeetings) {
    const key = m.key as string;
    if (!key) { skipped++; continue; }

    const existing = await documents('api::analysis.analysis').findFirst({
      filters: { name: { $startsWith: key } },
    });
    if (existing) {
      skipped++;
      continue;
    }

    try {
      await runAnalysisForMeeting(strapi, key);
      analyzed++;
    } catch (e) {
      strapi.log.error(
        `race-analysis: failed for ${key}: ${e instanceof Error ? e.message : String(e)}`,
      );
      failed++;
    }
  }

  strapi.log.info(`race-analysis: analyzed=${analyzed} skipped=${skipped} failed=${failed}`);
  return { analyzed, skipped, failed };
}
