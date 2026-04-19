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
import type { PastItem, PastPlacing } from '../../hooks/usePastAnalyses';
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

function PickTag({
  pick,
  placings,
  role,
  t,
}: {
  pick: DerivedPick;
  placings: PastPlacing[];
  role?: 'banker' | 'leg';
  t: (key: string) => string;
}) {
  const hit = isHit(pick.horseNumber, placings);
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
      {hit && <Text fontSize={10}>&#10003;</Text>}
    </XStack>
  );
}

function SummaryBar({
  stats,
  t,
}: {
  stats: ReturnType<typeof countResults>;
  t: (key: string) => string;
}) {
  return (
    <XStack gap="$3" alignItems="center" paddingVertical="$2">
      <Text fontSize="$3" fontWeight="bold" color="$green10">
        {stats.rate.toFixed(0)}%
      </Text>
      <XStack gap="$2">
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
      </XStack>
      <Text fontSize="$2" color="$gray9">({stats.total})</Text>
    </XStack>
  );
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
  const { item, suggestion } = row;
  const placings = item.placings ?? [];

  return (
    <YStack gap="$2" paddingVertical="$2">
      <XStack justifyContent="space-between" alignItems="center">
        <XStack gap="$2" alignItems="center">
          <Text fontSize="$2" fontWeight="bold">
            {item.raceDate}
          </Text>
          <Text fontSize="$2" color="$gray11">
            {item.venue} R{item.raceNo}
          </Text>
        </XStack>
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
        {type === 'trio' && suggestion.banker ? (
          <>
            <PickTag pick={suggestion.banker} placings={placings} role="banker" t={t} />
            {(suggestion.legs ?? []).map((leg) => (
              <PickTag key={leg.horseNumber} pick={leg} placings={placings} role="leg" t={t} />
            ))}
          </>
        ) : (
          suggestion.picks.map((pick) => (
            <PickTag key={pick.horseNumber} pick={pick} placings={placings} t={t} />
          ))
        )}
      </XStack>

      {placings.length > 0 && (
        <Text fontSize={11} color="$gray9">
          {t('past.actualResult')}: {placings.map((p) => `${p.finishPosition}. #${p.horseNumber} ${p.horseName}`).join('  ')}
        </Text>
      )}
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

  return (
    <Card padding="$4" borderWidth={1} borderColor="$borderColor" borderRadius="$4">
      <YStack gap="$1">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$5" fontWeight="bold">
            {t(`suggestion.${type}`)}
          </Text>
          <SummaryBar stats={stats} t={t} />
        </XStack>

        <Separator />

        {rows.map((row) => (
          <YStack key={row.item.meetingKey}>
            <RaceRow row={row} type={type} t={t} />
            <Separator />
          </YStack>
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
