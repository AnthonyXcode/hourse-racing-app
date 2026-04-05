import { Tabs } from 'expo-router';
import { Text } from 'tamagui';
import { useTranslation } from 'react-i18next';

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#0A1628' },
        headerTintColor: '#fff',
        tabBarStyle: { backgroundColor: '#0A1628', borderTopColor: '#1E293B' },
        tabBarActiveTintColor: '#1B6AE8',
        tabBarInactiveTintColor: '#64748B',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color }) => <Text color={color} fontSize={20}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="past"
        options={{
          title: t('tabs.past'),
          tabBarIcon: ({ color }) => <Text color={color} fontSize={20}>📊</Text>,
        }}
      />
      <Tabs.Screen
        name="upcoming"
        options={{
          title: t('tabs.upcoming'),
          tabBarIcon: ({ color }) => <Text color={color} fontSize={20}>🏇</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color }) => <Text color={color} fontSize={20}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
