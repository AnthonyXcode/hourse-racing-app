/**
 * Maps scraped / legacy JSON race rows (e.g. reference `RaceResult` shape) into
 * Strapi Document Service payloads for History.results (history.race-result components).
 */

type VenueCode = 'ST' | 'HV';

function venueToCode(v: unknown): VenueCode | null {
  if (v === 'ST' || v === 'HV') return v;
  if (v === 'Sha Tin') return 'ST';
  if (v === 'Happy Valley') return 'HV';
  return null;
}

function toDateOnly(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === 'string') {
    const d = value.slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null;
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return null;
}

function numOrUndef(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function intOrUndef(v: unknown): number | undefined {
  const n = numOrUndef(v);
  if (n === undefined) return undefined;
  const i = Math.trunc(n);
  return Number.isFinite(i) ? i : undefined;
}

const GOING_VALUES = new Set([
  'Firm',
  'Good to Firm',
  'Good',
  'Good to Yielding',
  'Yielding',
  'Soft',
  'Heavy',
  'Wet Fast',
  'Wet Slow',
]);

function normalizeGoing(v: unknown): string | undefined {
  if (typeof v !== 'string' || !v.trim()) return undefined;
  const t = v.trim();
  if (GOING_VALUES.has(t)) return t;
  return undefined;
}

function mapFinishRow(row: unknown) {
  if (!row || typeof row !== 'object') return null;
  const r = row as Record<string, unknown>;
  const horseNumber = intOrUndef(r.horseNumber);
  const finishPosition = intOrUndef(r.finishPosition);
  if (horseNumber == null || finishPosition == null) return null;
  const out: Record<string, unknown> = {
    horseNumber,
    finishPosition,
  };
  const ft = numOrUndef(r.finishTime);
  if (ft !== undefined) out.finishTime = ft;
  const margin = numOrUndef(r.margin);
  if (margin !== undefined) out.margin = margin;
  if (typeof r.horseName === 'string' && r.horseName) out.horseName = r.horseName;
  if (typeof r.horseCode === 'string' && r.horseCode) out.horseCode = r.horseCode;
  if (typeof r.jockeyName === 'string' && r.jockeyName) out.jockeyName = r.jockeyName;
  const jockeyId =
    typeof r.jockeyId === 'string' && r.jockeyId
      ? r.jockeyId
      : typeof r.jockeyCode === 'string' && r.jockeyCode
        ? r.jockeyCode
        : undefined;
  if (jockeyId) out.jockeyId = jockeyId;
  if (typeof r.trainerName === 'string' && r.trainerName) out.trainerName = r.trainerName;
  const trainerId =
    typeof r.trainerId === 'string' && r.trainerId
      ? r.trainerId
      : typeof r.trainerCode === 'string' && r.trainerCode
        ? r.trainerCode
        : undefined;
  if (trainerId) out.trainerId = trainerId;
  const draw = intOrUndef(r.draw);
  if (draw !== undefined && draw >= 1 && draw <= 20) out.draw = draw;
  const actualWeight = intOrUndef(r.actualWeight);
  if (actualWeight !== undefined && actualWeight >= 100 && actualWeight <= 140) out.actualWeight = actualWeight;
  const horseWeight = intOrUndef(r.horseWeight);
  if (horseWeight !== undefined && horseWeight >= 700 && horseWeight <= 2000) out.horseWeight = horseWeight;
  const odds = numOrUndef(r.winOdds);
  if (odds !== undefined) out.winOdds = odds;
  return out;
}

function mapDividendList(arr: unknown): { amount: number }[] {
  if (!Array.isArray(arr)) return [];
  const out: { amount: number }[] = [];
  for (const x of arr) {
    const n = numOrUndef(x);
    if (n !== undefined) out.push({ amount: n });
  }
  return out;
}

/**
 * One History.results entry suitable for `documents().create` / `update` `data.results`.
 */
export function mapJsonRaceToStrapiResult(row: unknown): Record<string, unknown> | null {
  if (!row || typeof row !== 'object') return null;
  const r = row as Record<string, unknown>;

  const raceId = typeof r.id === 'string' && r.id ? r.id : null;
  const venue = venueToCode(r.venue);
  const raceDate = toDateOnly(r.date);
  const raceNumber = intOrUndef(r.raceNumber);

  if (!raceId || !venue || !raceDate || raceNumber == null) return null;

  const surfaceRaw = r.surface;
  const surface =
    surfaceRaw === 'Turf' || surfaceRaw === 'AWT' ? surfaceRaw : undefined;

  const going = normalizeGoing(r.going);

  const out: Record<string, unknown> = {
    raceId,
    raceDate,
    venue,
    raceNumber,
  };

  if (typeof r.name === 'string' && r.name) out.raceName = r.name;
  const rc = r.class ?? r.raceClass;
  if (typeof rc === 'string' && rc) out.raceClass = rc;

  const distance = intOrUndef(r.distance);
  if (distance !== undefined) out.distance = distance;
  if (surface) out.surface = surface;
  if (going) out.going = going;

  const prize = intOrUndef(r.prizeMoney);
  if (prize !== undefined) out.prizeMoney = prize;

  const finishRaw = r.finishOrder;
  if (Array.isArray(finishRaw)) {
    const finishOrder = finishRaw.map(mapFinishRow).filter(Boolean);
    if (finishOrder.length > 0) out.finishOrder = finishOrder;
  }

  const placeDivs = mapDividendList(r.placeDividends);
  if (placeDivs.length > 0) out.placeDividends = placeDivs;

  const winD = numOrUndef(r.winDividend);
  if (winD !== undefined) out.winDividend = winD;
  const qd = numOrUndef(r.quinellaDividend);
  if (qd !== undefined) out.quinellaDividend = qd;

  const qpDivs = mapDividendList(r.quinellaPlaceDividends);
  if (qpDivs.length > 0) out.quinellaPlaceDividends = qpDivs;

  const td = numOrUndef(r.tierceDividend);
  if (td !== undefined) out.tierceDividend = td;
  const trid = numOrUndef(r.trioDividend);
  if (trid !== undefined) out.trioDividend = trid;

  return out;
}

/**
 * Maps an array of race JSON objects to Strapi `results` repeatable component data.
 */
export function mapJsonRacesToStrapiResults(rows: unknown): Record<string, unknown>[] {
  if (!Array.isArray(rows)) return [];
  return rows.map(mapJsonRaceToStrapiResult).filter((x): x is Record<string, unknown> => x != null);
}
