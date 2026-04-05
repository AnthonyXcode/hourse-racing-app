/**
 * Checks suggestion picks against actual race results (from History)
 * and updates the `result` field (correct/partial/incorrect).
 */
export async function updateSuggestionAccuracy(meetingKey: string): Promise<number> {
  const documents = strapi.documents;
  if (!documents) return 0;

  const parts = meetingKey.match(/^(\d{4}-\d{2}-\d{2})_([A-Z]+)_R(\d+)$/);
  if (!parts) return 0;

  const [, raceDate, venue, raceNoStr] = parts;
  const raceNo = parseInt(raceNoStr, 10);
  const historyName = `${raceDate}_${venue}`;

  const history = await documents('api::history.history').findFirst({
    filters: { name: { $eq: historyName } },
  });
  if (!history) return 0;

  const races: any[] = history.races ?? [];
  const raceResult = races.find((r: any) => r.raceNumber === raceNo);
  if (!raceResult) return 0;

  const finishPlacings: any[] = raceResult.finishPlacings ?? [];
  const winnerNumbers = finishPlacings
    .filter((f: any) => f.placing === 1)
    .map((f: any) => f.horseNumber);
  const placeNumbers = finishPlacings
    .filter((f: any) => f.placing <= 3)
    .map((f: any) => f.horseNumber);

  const suggestions = await documents('api::suggestion.suggestion').findMany({
    filters: {
      name: { $startsWith: meetingKey },
      result: 'pending',
    },
  });

  let updated = 0;

  for (const sug of suggestions) {
    const picks: { horseNumber: number }[] = sug.picks ?? [];
    const pickedNumbers = picks.map((p) => p.horseNumber);
    let result: 'correct' | 'partial' | 'incorrect' = 'incorrect';

    if (sug.type === 'win') {
      const hits = pickedNumbers.filter((n) => winnerNumbers.includes(n));
      if (hits.length > 0) result = hits.length === winnerNumbers.length ? 'correct' : 'partial';
    } else if (sug.type === 'place') {
      if (pickedNumbers.some((n) => placeNumbers.includes(n))) result = 'correct';
    } else if (sug.type === 'trio') {
      const hits = pickedNumbers.filter((n) => placeNumbers.includes(n));
      if (hits.length >= 3) result = 'correct';
      else if (hits.length > 0) result = 'partial';
    }

    await documents('api::suggestion.suggestion').update({
      documentId: sug.documentId,
      data: { result },
    });
    updated++;
  }

  return updated;
}
