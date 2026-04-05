interface HorseResult {
  horseNumber: number;
  horseName: string;
  horseCode: string;
  winProbability: number;
  placeProbability: number;
  ranking: number;
}

interface Pick {
  horseNumber: number;
  horseName: string;
  horseCode: string;
}

function generateWinPicks(results: HorseResult[]): Pick[] {
  return results
    .filter((r) => r.ranking <= 3)
    .sort((a, b) => a.ranking - b.ranking)
    .map(({ horseNumber, horseName, horseCode }) => ({ horseNumber, horseName, horseCode }));
}

function generatePlacePicks(results: HorseResult[]): Pick[] {
  const top = results.find((r) => r.ranking === 1);
  return top ? [{ horseNumber: top.horseNumber, horseName: top.horseName, horseCode: top.horseCode }] : [];
}

function generateTrioPicks(results: HorseResult[]): Pick[] {
  return results
    .filter((r) => r.placeProbability >= 0.2)
    .sort((a, b) => a.ranking - b.ranking)
    .map(({ horseNumber, horseName, horseCode }) => ({ horseNumber, horseName, horseCode }));
}

export async function generateSuggestionsForAnalysis(analysisRecord: any): Promise<number> {
  const documents = strapi.documents;
  if (!documents) return 0;

  const results: HorseResult[] = (analysisRecord.results ?? []).map((r: any) => ({
    horseNumber: r.horseNumber,
    horseName: r.horseName ?? '',
    horseCode: r.horseCode ?? '',
    winProbability: r.winProbability,
    placeProbability: r.placeProbability,
    ranking: r.ranking,
  }));

  if (results.length === 0) return 0;

  const meeting = analysisRecord.meeting;
  const meetingKey = typeof meeting === 'object' ? meeting.key : null;
  if (!meetingKey) return 0;

  const parts = meetingKey.match(/^(\d{4}-\d{2}-\d{2})_([A-Z]+)_R(\d+)$/);
  if (!parts) return 0;
  const raceDate = parts[1];
  const baseName = meetingKey;

  const strategies: Array<{ type: string; picksFn: (r: HorseResult[]) => Pick[] }> = [
    { type: 'win', picksFn: generateWinPicks },
    { type: 'place', picksFn: generatePlacePicks },
    { type: 'trio', picksFn: generateTrioPicks },
  ];

  let created = 0;

  for (const { type, picksFn } of strategies) {
    const name = `${baseName}_${type}`;
    const picks = picksFn(results);

    const existing = await documents('api::suggestion.suggestion').findFirst({
      filters: { name: { $eq: name } },
    });

    if (existing) {
      await documents('api::suggestion.suggestion').update({
        documentId: existing.documentId,
        data: {
          picks,
          analysis: analysisRecord.documentId,
        },
      });
    } else {
      const meetingDoc = await documents('api::meeting.meeting').findFirst({
        filters: { key: { $eq: meetingKey } },
      });

      await documents('api::suggestion.suggestion').create({
        data: {
          name,
          type: type as 'win' | 'place' | 'trio',
          picks,
          result: 'pending',
          raceDate,
          meeting: meetingDoc?.documentId ?? null,
          analysis: analysisRecord.documentId,
        },
      });
    }
    created++;
  }

  return created;
}

export async function generateSuggestionsForMeetingKey(meetingKey: string): Promise<number> {
  const documents = strapi.documents;
  if (!documents) return 0;

  const analysis = await documents('api::analysis.analysis').findFirst({
    filters: { name: { $startsWith: meetingKey } },
    sort: 'analyzedAt:desc',
    populate: { results: true, meeting: true },
  });

  if (!analysis) return 0;
  return generateSuggestionsForAnalysis(analysis);
}
