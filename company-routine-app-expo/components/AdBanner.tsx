import React, { useState } from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';
import Constants from 'expo-constants';

// ── Expo Go detection ─────────────────────────────────────────────
const isExpoGo = Constants.executionEnvironment === 'storeClient';

// ── Native module ─────────────────────────────────────────────────
let NativeBannerAd: React.ComponentType<any> | null = null;
let NativeBannerAdSize: any = null;
let testBannerId = 'ca-app-pub-3940256099942544/6300978111';

if (!isExpoGo && Platform.OS === 'android') {
  try {
    const ads        = require('react-native-google-mobile-ads');
    NativeBannerAd   = ads.BannerAd;
    NativeBannerAdSize = ads.BannerAdSize;
    if (ads.TestIds?.BANNER) testBannerId = ads.TestIds.BANNER;
  } catch {}
}

// ── Ad unit selection ─────────────────────────────────────────────
const isProduction = process.env.EXPO_PUBLIC_APP_ENV === 'production';
const AD_UNIT_ID = isProduction
  ? 'ca-app-pub-9888510222037453/5866602592'  // real banner (production only)
  : testBannerId;                              // TestIds.BANNER (development / preview)

// ── Component ─────────────────────────────────────────────────────
type AdState = 'loading' | 'loaded' | 'failed';

function Placeholder() {
  return (
    <View style={[StyleSheet.absoluteFill, styles.placeholder]}>
      <Text style={styles.placeholderText}>광고 영역 테스트</Text>
    </View>
  );
}

export default function AdBanner() {
  const [adState, setAdState] = useState<AdState>('loading');

  // Expo Go: AdMob native module not available
  if (isExpoGo) return null;

  // Native module failed to load (shouldn't happen in EAS build)
  if (!NativeBannerAd || !NativeBannerAdSize) {
    return (
      <View style={styles.wrapper}>
        <Placeholder />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {/* Placeholder shown while loading or on failure */}
      {adState !== 'loaded' && <Placeholder />}

      {/* BannerAd rendered immediately so it starts loading; hidden via opacity until ready */}
      {adState !== 'failed' && (
        <NativeBannerAd
          unitId={AD_UNIT_ID}
          size={NativeBannerAdSize.BANNER}
          onAdLoaded={() => setAdState('loaded')}
          onAdFailedToLoad={() => setAdState('failed')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: 60,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  placeholderText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
});
