import { YStack, Text, Card, Paragraph, Spinner, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { usePastAnalyses } from '../../hooks';

const RESULT_COLORS: Record<string, string> = {
  correct: '$green10',
  partial: '$yellow10',
  incorrect: '$red10',
  pending: '$gray10',
};

export default function PastScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data, isLoading } = usePastAnalyses();

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
        keyExtractor={(item) => item.meetingKey}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={
          <YStack padding="$4" alignItems="center">
            <Paragraph color="$gray11">{t('past.noPast')}</Paragraph>
          </YStack>
        }
        renderItem={({ item }) => (
          <Card
            padding="$4"
            borderWidth={1}
            borderColor="$borderColor"
            borderRadius="$4"
            pressStyle={{ scale: 0.98 }}
            onPress={() => router.push(`/race/${item.meetingKey}`)}
          >
            <YStack gap="$2">
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontWeight="bold">{item.raceDate}</Text>
                <Text color="$gray11">{item.venue} R{item.raceNo}</Text>
              </XStack>

              {item.suggestions.map((s) => (
                <YStack key={s.type} gap="$1">
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
                      {t(`suggestion.${s.type}`)}
                    </Text>
                    <Text
                      color={RESULT_COLORS[s.result] ?? '$gray10'}
                      fontWeight="bold"
                      textTransform="uppercase"
                      fontSize="$2"
                    >
                      {t(`accuracy.${s.result}`)}
                    </Text>
                  </XStack>
                  <Text color="$gray12" fontSize="$2">
                    {s.picks.map((p) => `#${p.horseNumber} ${p.horseName}`).join(', ')}
                  </Text>
                </YStack>
              ))}
            </YStack>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}
