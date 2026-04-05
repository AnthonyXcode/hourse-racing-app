import { Tabs, useRouter, usePathname } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Animated,
  Pressable,
} from 'react-native';
import { useRef, useState, useEffect, useCallback } from 'react';
import { setLanguage } from '../../lib/i18n';

const MOBILE_BREAKPOINT = 768;

const NAV_ITEMS = [
  { name: 'index', path: '/(tabs)' },
  { name: 'past', path: '/(tabs)/past' },
  { name: 'upcoming', path: '/(tabs)/upcoming' },
] as const;

function HeaderBar() {
  const { t, i18n } = useTranslation();
  const { width } = useWindowDimensions();
  const isMobile = width < MOBILE_BREAKPOINT;
  const [menuOpen, setMenuOpen] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = pathname === '/' ? 'index'
    : pathname === '/past' ? 'past'
    : pathname === '/upcoming' ? 'upcoming'
    : pathname === '/profile' ? 'profile'
    : 'index';

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: menuOpen ? 1 : 0,
      duration: menuOpen ? 250 : 200,
      useNativeDriver: true,
    }).start();
  }, [menuOpen, fadeAnim]);

  const navigate = useCallback(
    (path: string) => {
      router.push(path as any);
      setMenuOpen(false);
    },
    [router],
  );

  const toggleLang = useCallback(async () => {
    await setLanguage(i18n.language === 'en' ? 'zh' : 'en');
  }, [i18n.language]);

  return (
    <View style={s.headerContainer}>
      <View style={s.header}>
        {/* Logo */}
        <TouchableOpacity
          onPress={() => navigate('/(tabs)')}
          style={s.logoWrap}
          activeOpacity={0.7}
        >
          <Text style={s.logoIcon}>🏇</Text>
          <Text style={s.logoText}>HK Racing</Text>
        </TouchableOpacity>

        {/* Desktop tabs */}
        {!isMobile && (
          <View style={s.desktopNav}>
            {NAV_ITEMS.map((item) => {
              const isFocused = activeTab === item.name;
              return (
                <TouchableOpacity
                  key={item.name}
                  onPress={() => navigate(item.path)}
                  style={[s.navTab, isFocused && s.navTabActive]}
                  activeOpacity={0.7}
                >
                  <Text style={[s.navLabel, isFocused && s.navLabelActive]}>
                    {t(`tabs.${item.name === 'index' ? 'home' : item.name}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Right actions */}
        <View style={s.rightActions}>
          {!isMobile && (
            <>
              <TouchableOpacity onPress={toggleLang} style={s.langBtn} activeOpacity={0.7}>
                <Text style={s.langText}>
                  {i18n.language === 'en' ? '中文' : 'EN'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigate('/(tabs)/profile')}
                style={[s.profileBtn, activeTab === 'profile' && s.profileBtnActive]}
                activeOpacity={0.7}
              >
                <Text style={s.profileIcon}>👤</Text>
              </TouchableOpacity>
            </>
          )}

          {isMobile && (
            <TouchableOpacity
              onPress={() => setMenuOpen((v) => !v)}
              style={s.hamburger}
              activeOpacity={0.7}
            >
              <Text style={s.hamburgerIcon}>{menuOpen ? '✕' : '☰'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Mobile overlay */}
      {isMobile && menuOpen && (
        <Animated.View style={[s.overlay, { opacity: fadeAnim }]}>
          <Pressable style={s.overlayBg} onPress={() => setMenuOpen(false)} />
          <Animated.View
            style={[
              s.menu,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {NAV_ITEMS.map((item) => {
              const isFocused = activeTab === item.name;
              return (
                <TouchableOpacity
                  key={item.name}
                  onPress={() => navigate(item.path)}
                  style={[s.menuItem, isFocused && s.menuItemActive]}
                  activeOpacity={0.7}
                >
                  <Text style={[s.menuLabel, isFocused && s.menuLabelActive]}>
                    {t(`tabs.${item.name === 'index' ? 'home' : item.name}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <View style={s.menuDivider} />

            <TouchableOpacity
              onPress={() => navigate('/(tabs)/profile')}
              style={[s.menuItem, activeTab === 'profile' && s.menuItemActive]}
              activeOpacity={0.7}
            >
              <Text style={[s.menuLabel, activeTab === 'profile' && s.menuLabelActive]}>
                👤  {t('tabs.profile')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { toggleLang(); setMenuOpen(false); }}
              style={s.menuItem}
              activeOpacity={0.7}
            >
              <Text style={s.menuLabel}>
                🌐  {i18n.language === 'en' ? '中文' : 'English'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A1628' }} edges={['top']}>
      <HeaderBar />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      >
        <Tabs.Screen name="index" options={{ title: t('tabs.home') }} />
        <Tabs.Screen name="past" options={{ title: t('tabs.past') }} />
        <Tabs.Screen name="upcoming" options={{ title: t('tabs.upcoming') }} />
        <Tabs.Screen name="profile" options={{ title: t('tabs.profile') }} />
      </Tabs>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  headerContainer: {
    zIndex: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A1628',
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    fontSize: 22,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  desktopNav: {
    flexDirection: 'row',
    marginLeft: 32,
    gap: 4,
  },
  navTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  navTabActive: {
    backgroundColor: 'rgba(27, 106, 232, 0.15)',
  },
  navLabel: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  navLabelActive: {
    color: '#60A5FA',
  },

  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 8,
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  langText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  profileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBtnActive: {
    backgroundColor: 'rgba(27, 106, 232, 0.3)',
  },
  profileIcon: {
    fontSize: 18,
  },

  hamburger: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hamburgerIcon: {
    color: '#FFFFFF',
    fontSize: 22,
  },

  overlay: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    bottom: -1000,
    zIndex: 200,
  },
  overlayBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menu: {
    backgroundColor: '#0F1D32',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  menuItemActive: {
    backgroundColor: 'rgba(27, 106, 232, 0.15)',
  },
  menuLabel: {
    color: '#CBD5E1',
    fontSize: 16,
    fontWeight: '600',
  },
  menuLabelActive: {
    color: '#60A5FA',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#1E293B',
    marginVertical: 4,
    marginHorizontal: 16,
  },
});
