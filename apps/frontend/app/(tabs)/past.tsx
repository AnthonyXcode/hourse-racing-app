import {
  YStack,
  Text,
  Card,
  Paragraph,
  Spinner,
  XStack,
  Button,
  H4,
  Separator,
} from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { usePastAnalyses } from '../../hooks';
import type { PastItem, PastPlacing, RaceDividends } from '../../hooks/usePastAnalyses';
import type {
  DerivedPick,
  DerivedSuggestion,
  AccuracyResult,
} from '../../lib/analysis-helpers';

const RESULT_COLORS: Record<string, string> = {
  correct: '$green10',
  partial: '$yellow10',
  incorrect: '$red10',
  pending: '$gray10',
};

const RESULT_BG: Record<string, string> = {
  correct: '$green3',
  partial: '$yellow3',
  incorrect: '$red3',
  pending: '$gray3',
};

type BetType = 'place' | 'win' | 'trio';

interface SuggestionRow {
  item: PastItem;
  suggestion: DerivedSuggestion & { result: AccuracyResult };
}

function buildRows(data: PastItem[], type: BetType): SuggestionRow[] {
  const rows: SuggestionRow[] = [];
  for (const item of data) {
    const s = item.suggestions.find((s) => s.type === type);
    if (s) rows.push({ item, suggestion: s });
  }
  return rows;
}

function countResults(rows: SuggestionRow[]) {
  let correct = 0;
  let partial = 0;
  let incorrect = 0;
  for (const r of rows) {
    if (r.suggestion.result === 'correct') correct++;
    else if (r.suggestion.result === 'partial') partial++;
    else if (r.suggestion.result === 'incorrect') incorrect++;
  }
  const total = correct + partial + incorrect;
  const rate = total > 0 ? ((correct + partial * 0.5) / total) * 100 : 0;
  return { correct, partial, incorrect, total, rate };
}

function isHit(horseNumber: number, placings: PastPlacing[]): boolean {
  return placings.some((p) => p.horseNumber === horseNumber);
}

const BET_UNIT = 10;

function computeBetInfo(
  type: BetType,
  suggestion: SuggestionRow['suggestion'],
  item: PastItem,
): { invest: number; payout: number } {
  const { dividends, finishPositionMap, placings } = item;

  if (type === 'place') {
    const pick = suggestion.picks[0];
    if (!pick) return { invest: BET_UNIT, payout: 0 };
    const pos = finishPositionMap[pick.horseNumber];
    if (pos != null && pos <= 3 && dividends.placeDividends && dividends.placeDividends.length >= pos) {
      return { invest: BET_UNIT, payout: dividends.placeDividends[pos - 1]! };
    }
    return { invest: BET_UNIT, payout: 0 };
  }

  if (type === 'win') {
    const numPicks = suggestion.picks.length;
    const invest = BET_UNIT * numPicks;
    const winner = suggestion.picks.find((p) => finishPositionMap[p.horseNumber] === 1);
    if (winner && dividends.winDividend) {
      return { invest, payout: dividends.winDividend };
    }
    return { invest, payout: 0 };
  }

  if (type === 'trio') {
    const placedNumbers = placings.map((p) => p.horseNumber);
    const pickedNumbers = new Set(suggestion.picks.map((p) => p.horseNumber));
    const allCovered = placedNumbers.length >= 3 && placedNumbers.every((n) => pickedNumbers.has(n));
    if (allCovered && dividends.trioDividend) {
      return { invest: BET_UNIT, payout: dividends.trioDividend };
    }
    return { invest: BET_UNIT, payout: 0 };
  }

  return { invest: BET_UNIT, payout: 0 };
}

function PickTag({
  pick,
  hit,
  role,
  finishPosition,
  t,
}: {
  pick: DerivedPick;
  hit: boolean;
  role?: 'banker' | 'leg';
  finishPosition?: number;
  t: (key: string) => string;
}) {
  return (
    <XStack
      gap="$1"
      alignItems="center"
      backgroundColor={hit ? '$green3' : '$gray3'}
      paddingHorizontal="$2"
      paddingVertical="$1"
      borderRadius="$2"
      borderWidth={hit ? 1 : 0}
      borderColor="$green8"
    >
      {role && (
        <Text fontSize={10} fontWeight="bold" color={role === 'banker' ? '$orange10' : '$blue10'}>
          {role === 'banker' ? t('past.banker') : t('past.leg')}
        </Text>
      )}
      <Text fontSize="$2" fontWeight={hit ? 'bold' : '400'} color={hit ? '$green11' : '$gray11'}>
        #{pick.horseNumber} {pick.horseName}
      </Text>
      {finishPosition != null && (
        <Text fontSize={10} color={hit ? '$green11' : '$red10'}>
          (#{finishPosition})
        </Text>
      )}
      {hit && <Text fontSize={10}>&#10003;</Text>}
    </XStack>
  );
}

function sumBetTotals(rows: SuggestionRow[], type: BetType) {
  let invest = 0;
  let payout = 0;
  for (const row of rows) {
    const info = computeBetInfo(type, row.suggestion, row.item);
    invest += info.invest;
    payout += info.payout;
  }
  return { invest, payout, profit: payout - invest };
}

function SummaryBar({
  stats,
  betTotals,
  t,
}: {
  stats: ReturnType<typeof countResults>;
  betTotals?: { invest: number; payout: number; profit: number };
  t: (key: string) => string;
}) {
  const roi = betTotals && betTotals.invest > 0
    ? ((betTotals.payout - betTotals.invest) / betTotals.invest) * 100
    : undefined;

  return (
    <YStack gap="$1" paddingVertical="$2" alignItems="flex-end">
      <XStack gap="$2" alignItems="center">
        <Text fontSize="$3" fontWeight="bold" color="$green10">
          {stats.rate.toFixed(0)}%
        </Text>
        <XStack gap="$1" alignItems="center">
          <Text fontSize={8} color="$green10">&#9679;</Text>
          <Text fontSize="$2" color="$gray11">{stats.correct}</Text>
        </XStack>
        <XStack gap="$1" alignItems="center">
          <Text fontSize={8} color="$yellow10">&#9679;</Text>
          <Text fontSize="$2" color="$gray11">{stats.partial}</Text>
        </XStack>
        <XStack gap="$1" alignItems="center">
          <Text fontSize={8} color="$red10">&#9679;</Text>
          <Text fontSize="$2" color="$gray11">{stats.incorrect}</Text>
        </XStack>
        <Text fontSize="$2" color="$gray9">({stats.total})</Text>
      </XStack>

      {betTotals && betTotals.invest > 0 && (
        <Text
          fontSize="$2"
          fontWeight="bold"
          color={betTotals.profit > 0 ? '$green10' : betTotals.profit < 0 ? '$red10' : '$gray9'}
        >
          {t('past.invest')}: ${betTotals.invest}  {t('past.return')}: ${betTotals.payout.toFixed(1)}
        </Text>
      )}

      {roi != null && (
        <Text
          fontSize="$2"
          fontWeight="bold"
          color={roi > 0 ? '$green10' : roi < 0 ? '$red10' : '$gray9'}
        >
          ROI: {roi > 0 ? '+' : ''}{roi.toFixed(0)}%
        </Text>
      )}
    </YStack>
  );
}

interface MeetingGroup {
  key: string;
  date: string;
  venue: string;
  rows: SuggestionRow[];
}

function groupByMeeting(rows: SuggestionRow[]): MeetingGroup[] {
  const map = new Map<string, MeetingGroup>();
  for (const row of rows) {
    const key = `${row.item.raceDate}_${row.item.venue}`;
    let group = map.get(key);
    if (!group) {
      group = { key, date: row.item.raceDate, venue: row.item.venue, rows: [] };
      map.set(key, group);
    }
    group.rows.push(row);
  }
  return Array.from(map.values());
}

function RaceRow({
  row,
  type,
  t,
}: {
  row: SuggestionRow;
  type: BetType;
  t: (key: string) => string;
}) {
  const router = useRouter();
  const { item, suggestion } = row;
  const placings = item.placings ?? [];
  const posMap = item.finishPositionMap ?? {};
  const oddsMap = item.winOddsMap ?? {};
  const betInfo = computeBetInfo(type, suggestion, item);
  const profit = betInfo.payout - betInfo.invest;

  const checkHit = (horseNumber: number): boolean => {
    if (type === 'win') {
      return posMap[horseNumber] === 1;
    }
    return isHit(horseNumber, placings);
  };

  return (
    <YStack
      gap="$2"
      paddingVertical="$1.5"
      pressStyle={{ opacity: 0.7 }}
      onPress={() => router.push(`/race/${item.meetingKey}`)}
      cursor="pointer"
    >
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontSize="$2" color="$gray11">
          R{item.raceNo}
        </Text>
        <Text
          fontSize="$2"
          fontWeight="bold"
          color={RESULT_COLORS[suggestion.result]}
          backgroundColor={RESULT_BG[suggestion.result]}
          paddingHorizontal="$2"
          paddingVertical={2}
          borderRadius="$2"
        >
          {t(`accuracy.${suggestion.result}`)}
        </Text>
      </XStack>

      <XStack flexWrap="wrap" gap="$1">
        {type === 'place' ? (
          suggestion.picks.map((pick) => (
            <PickTag
              key={pick.horseNumber}
              pick={pick}
              hit={checkHit(pick.horseNumber)}
              finishPosition={posMap[pick.horseNumber]}
              t={t}
            />
          ))
        ) : type === 'trio' && suggestion.banker ? (
          <>
            <PickTag pick={suggestion.banker} hit={checkHit(suggestion.banker.horseNumber)} role="banker" t={t} />
            {(suggestion.legs ?? []).map((leg) => (
              <PickTag key={leg.horseNumber} pick={leg} hit={checkHit(leg.horseNumber)} role="leg" t={t} />
            ))}
          </>
        ) : (
          suggestion.picks.map((pick) => (
            <PickTag key={pick.horseNumber} pick={pick} hit={checkHit(pick.horseNumber)} t={t} />
          ))
        )}
      </XStack>

      {type !== 'place' && placings.length > 0 && (
        <Text fontSize={11} color="$gray9">
          {t('past.actualResult')}: {placings.map((p) => `${p.finishPosition}. #${p.horseNumber} ${p.horseName}`).join('  ')}
        </Text>
      )}

      <XStack gap="$3" alignItems="center">
        {type !== 'trio' && (
          <Text fontSize={11} color="$gray9">
            {t('past.odds')}: {suggestion.picks.map((p) => {
              const o = oddsMap[p.horseNumber];
              return `#${p.horseNumber} ${o != null ? o.toFixed(1) : '-'}`;
            }).join('  ')}
          </Text>
        )}
        <Text fontSize={11} color="$gray9">
          {t('past.invest')}: ${betInfo.invest}
        </Text>
        <Text fontSize={11} fontWeight="bold" color={profit > 0 ? '$green10' : profit < 0 ? '$red10' : '$gray9'}>
          {t('past.return')}: ${betInfo.payout > 0 ? betInfo.payout.toFixed(1) : '0'}
        </Text>
      </XStack>
    </YStack>
  );
}

function MeetingGroupRow({
  meeting,
  type,
  t,
}: {
  meeting: MeetingGroup;
  type: BetType;
  t: (key: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const stats = countResults(meeting.rows);
  const totals = sumBetTotals(meeting.rows, type);

  return (
    <YStack>
      <YStack
        paddingVertical="$2"
        gap="$1"
        pressStyle={{ opacity: 0.7 }}
        onPress={() => setOpen((v) => !v)}
        cursor="pointer"
      >
        <XStack justifyContent="space-between" alignItems="center">
          <XStack gap="$2" alignItems="center">
            <Text fontSize="$3" fontWeight="bold">
              {meeting.date}
            </Text>
            <Text fontSize="$2" color="$gray11">
              {meeting.venue}
            </Text>
          </XStack>
          <Text fontSize={12} color="$gray9">{open ? '▲' : '▼'}</Text>
        </XStack>

        <XStack gap="$2" alignItems="center" flexWrap="wrap">
          <XStack gap="$1" alignItems="center">
            <Text fontSize={8} color="$green10">&#9679;</Text>
            <Text fontSize="$1" color="$gray11">{stats.correct}</Text>
          </XStack>
          <XStack gap="$1" alignItems="center">
            <Text fontSize={8} color="$yellow10">&#9679;</Text>
            <Text fontSize="$1" color="$gray11">{stats.partial}</Text>
          </XStack>
          <XStack gap="$1" alignItems="center">
            <Text fontSize={8} color="$red10">&#9679;</Text>
            <Text fontSize="$1" color="$gray11">{stats.incorrect}</Text>
          </XStack>
          <Text fontSize="$1" color="$gray9">/{stats.total}</Text>
          <Text
            fontSize="$1"
            fontWeight="bold"
            color={totals.profit > 0 ? '$green10' : totals.profit < 0 ? '$red10' : '$gray9'}
          >
            ${totals.invest}→${totals.payout.toFixed(1)}
          </Text>
        </XStack>
      </YStack>

      {open && (
        <YStack paddingLeft="$2">
          {meeting.rows.map((row, i) => (
            <YStack key={row.item.meetingKey}>
              {i > 0 && <Separator borderColor="$gray5" />}
              <RaceRow row={row} type={type} t={t} />
            </YStack>
          ))}
        </YStack>
      )}
      <Separator borderWidth={2} borderColor="$gray8" />
    </YStack>
  );
}

function BetSection({
  type,
  rows,
  t,
}: {
  type: BetType;
  rows: SuggestionRow[];
  t: (key: string) => string;
}) {
  const stats = countResults(rows);
  if (rows.length === 0) return null;

  const meetings = groupByMeeting(rows);
  const betTotals = sumBetTotals(rows, type);

  return (
    <Card padding="$4" borderWidth={1} borderColor="$borderColor" borderRadius="$4">
      <YStack gap="$1">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$5" fontWeight="bold">
            {t(`suggestion.${type}`)}
          </Text>
          <SummaryBar stats={stats} betTotals={betTotals} t={t} />
        </XStack>

        <Separator />

        {meetings.map((meeting) => (
          <MeetingGroupRow key={meeting.key} meeting={meeting} type={type} t={t} />
        ))}
      </YStack>
    </Card>
  );
}

export default function PastScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching } = usePastAnalyses();
  const [legendOpen, setLegendOpen] = useState(false);

  const onRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['pastAnalyses'] });
  }, [queryClient]);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F1F5F9' }} edges={['bottom']}>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Spinner size="large" />
        </YStack>
      </SafeAreaView>
    );
  }

  const items = data ?? [];
  const placeRows = buildRows(items, 'place');
  const winRows = buildRows(items, 'win');
  const trioRows = buildRows(items, 'trio');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F1F5F9' }} edges={['bottom']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={onRefresh} />}
      >
        <XStack justifyContent="space-between" alignItems="center">
          <H4>{t('past.title')}</H4>
          <Button
            size="$3"
            chromeless
            onPress={onRefresh}
            disabled={isFetching}
            opacity={isFetching ? 0.5 : 1}
          >
            {isFetching ? <Spinner size="small" /> : <Text fontSize={18}>↻</Text>}
          </Button>
        </XStack>

        <Card
          padding="$3"
          borderWidth={1}
          borderColor="$blue6"
          borderRadius="$4"
          backgroundColor="$blue2"
          pressStyle={{ opacity: 0.8 }}
          onPress={() => setLegendOpen((v) => !v)}
        >
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize="$3" fontWeight="bold" color="$blue11">
              {t('past.legendTitle')}
            </Text>
            <Text color="$blue11">{legendOpen ? '▲' : '▼'}</Text>
          </XStack>
          {legendOpen && (
            <YStack gap="$2" marginTop="$2">
              <XStack gap="$2" alignItems="flex-start">
                <Text fontSize={8} color="$green10" marginTop={4}>&#9679;</Text>
                <Paragraph fontSize="$2" color="$gray11" flex={1}>{t('past.legendCorrect')}</Paragraph>
              </XStack>
              <XStack gap="$2" alignItems="flex-start">
                <Text fontSize={8} color="$yellow10" marginTop={4}>&#9679;</Text>
                <Paragraph fontSize="$2" color="$gray11" flex={1}>{t('past.legendPartial')}</Paragraph>
              </XStack>
              <XStack gap="$2" alignItems="flex-start">
                <Text fontSize={8} color="$red10" marginTop={4}>&#9679;</Text>
                <Paragraph fontSize="$2" color="$gray11" flex={1}>{t('past.legendIncorrect')}</Paragraph>
              </XStack>
              <Separator marginVertical="$1" />
              <Paragraph fontSize="$2" color="$gray11">{t('past.legendPlaceDesc')}</Paragraph>
              <Paragraph fontSize="$2" color="$gray11">{t('past.legendWinDesc')}</Paragraph>
              <Paragraph fontSize="$2" color="$gray11">{t('past.legendTrioDesc')}</Paragraph>
            </YStack>
          )}
        </Card>

        {items.length === 0 ? (
          <YStack padding="$4" alignItems="center">
            <Paragraph color="$gray11">{t('past.noPast')}</Paragraph>
          </YStack>
        ) : (
          <>
            <BetSection type="place" rows={placeRows} t={t} />
            <BetSection type="win" rows={winRows} t={t} />
            <BetSection type="trio" rows={trioRows} t={t} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
