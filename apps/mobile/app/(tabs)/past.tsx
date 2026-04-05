import { useQuery } from '@tanstack/react-query';
import { YStack, Text, Card, Paragraph, Spinner, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { strapi } from '../../lib/api';

const RESULT_COLORS: Record<string, string> = {
  correct: '$green10',
  partial: '$yellow10',
  incorrect: '$red10',
  pending: '$gray10',
};

export default function PastScreen() {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['pastSuggestions'],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const res = await strapi.find<{ data: any[] }>('suggestions', {
        filters: { raceDate: { $lt: today } },
        sort: ['raceDate:desc'],
        populate: 'meeting',
        pagination: { pageSize: 100 },
      });
      return res.data ?? [];
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F1F5F9' }} edges={['bottom']}>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Spinner size="large" />
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F1F5F9' }} edges={['bottom']}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id?.toString() ?? item.name}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={
          <YStack padding="$4" alignItems="center">
            <Paragraph color="$gray11">{t('past.noPast')}</Paragraph>
          </YStack>
        }
        renderItem={({ item }) => (
          <Card padding="$4" borderWidth={1} borderColor="$borderColor" borderRadius="$4">
            <YStack gap="$2">
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontWeight="bold">{item.raceDate}</Text>
                <Text
                  color={RESULT_COLORS[item.result] ?? '$gray10'}
                  fontWeight="bold"
                  textTransform="uppercase"
                  fontSize="$3"
                >
                  {item.result}
                </Text>
              </XStack>
              <XStack gap="$2" alignItems="center">
                <Text
                  backgroundColor="$blue3"
                  color="$blue11"
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius="$2"
                  fontSize="$2"
                  fontWeight="bold"
                >
                  {t(`suggestion.${item.type}`, { defaultValue: item.type })}
                </Text>
                <Text color="$gray11" fontSize="$3">
                  {item.meeting?.venue} R{item.meeting?.raceNumber}
                </Text>
              </XStack>
              <Text color="$gray12" fontSize="$3">
                {t('past.picks', {
                  picks: (item.picks ?? []).map((p: any) => `#${p.horseNumber} ${p.horseName}`).join(', '),
                })}
              </Text>
            </YStack>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}
