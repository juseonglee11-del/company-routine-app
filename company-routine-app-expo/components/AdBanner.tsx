import React, { useState } from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';
import Constants from 'expo-constants';

// ── Expo Go detection ─────────────────────────────────────────────
// executionEnvironment === 'storeClient' is more reliable than appOwnership in SDK 54
const isExpoGo = Constants.executionEnvironment === 'storeClient';

// ── Ad unit selection ─────────────────────────────────────────────
const isProduction = process.env.EXPO_PUBLIC_APP_ENV === 'production';
const AD_UNIT_ID = isProduction
  ? 'ca-app-pub-9888510222037453/5866602592'       // real ad (production only)
  : 'ca-app-pub-3940256099942544/6300978111';       // Google official test banner

// ── Native module ─────────────────────────────────────────────────
let NativeBannerAd: React.ComponentType<any> | null = null;
let NativeBannerAdSize: any = null;
let moduleLoadError = '';

if (!isExpoGo && Platform.OS === 'android') {
  try {
    const ads      = require('react-native-google-mobile-ads');
    NativeBannerAd   = ads.BannerAd;
    NativeBannerAdSize = ads.BannerAdSize;
  } catch (e: any) {
    moduleLoadError = e?.message ?? 'unknown module error';
    console.log('[AdBanner] module load error:', moduleLoadError);
  }
}

// ── Component ─────────────────────────────────────────────────────
type AdState = 'loading' | 'loaded' | 'failed';

function DebugBox({ sub }: { sub?: string }) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderTitle}>AdMob Banner Area</Text>
      {sub ? <Text style={styles.placeholderSub} numberOfLines={2}>{sub}</Text> : null}
    </View>
  );
}

export default function AdBanner() {
  const [adState, setAdState] = useState<AdState>('loading');
  const [adError, setAdError] = useState('');

  // Only hide in Expo Go — always show something in native builds
  if (isExpoGo) return null;

  // Module failed to load
  if (!NativeBannerAd || !NativeBannerAdSize) {
    return <DebugBox sub={moduleLoadError ? `Module error: ${moduleLoadError}` : 'Module not loaded (prebuild required)'} />;
  }

  // Ad failed — show placeholder with error message
  if (adState === 'failed') {
    return <DebugBox sub={adError || 'Ad load failed'} />;
  }

  // Loading or loaded — always wrap with a visible background so layout is confirmed
  return (
    <View style={styles.wrapper}>
      {/* Gray background visible while ad loads; hidden once ad paints over it */}
      {adState === 'loading' && (
        <View style={StyleSheet.absoluteFill}>
          <DebugBox sub={`env: ${process.env.EXPO_PUBLIC_APP_ENV ?? 'unset'} · loading…`} />
        </View>
      )}
      <NativeBannerAd
        unitId={AD_UNIT_ID}
        size={NativeBannerAdSize.BANNER}
        onAdLoaded={() => {
          console.log('[AdBanner] loaded — unit:', AD_UNIT_ID);
          setAdState('loaded');
        }}
        onAdFailedToLoad={(error: any) => {
          const msg = error?.message ?? JSON.stringify(error);
          console.log('[AdBanner] failed:', msg);
          setAdError(msg);
          setAdState('failed');
        }}
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
  placeholder: {
    height: 60,
    width: '100%',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#bbb',
    borderStyle: 'dashed',
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginVertical: 4,
  },
  placeholderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
  },
  placeholderSub: {
    fontSize: 10,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 2,
  },
});
