import React, { useState } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import Constants from 'expo-constants';

// ── Expo Go detection ─────────────────────────────────────────────
// executionEnvironment === 'storeClient' is more reliable than appOwnership in SDK 54
const isExpoGo = Constants.executionEnvironment === 'storeClient';

// ── Native module ─────────────────────────────────────────────────
let NativeBannerAd: React.ComponentType<any> | null = null;
let NativeBannerAdSize: any = null;
let testBannerId = 'ca-app-pub-3940256099942544/6300978111'; // TestIds.BANNER fallback

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

export default function AdBanner() {
  const [adState, setAdState] = useState<AdState>('loading');

  if (isExpoGo) return null;
  if (!NativeBannerAd || !NativeBannerAdSize) return null;
  if (adState === 'failed') return null;

  return (
    <View style={styles.wrapper}>
      {adState === 'loading' && <View style={[StyleSheet.absoluteFill, styles.loadingBg]} />}
      <NativeBannerAd
        unitId={AD_UNIT_ID}
        size={NativeBannerAdSize.BANNER}
        onAdLoaded={() => setAdState('loaded')}
        onAdFailedToLoad={() => setAdState('failed')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    minHeight: 60,
    marginVertical: 4,
  },
  loadingBg: {
    height: 60,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
});
