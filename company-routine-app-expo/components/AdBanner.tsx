import React, { useState } from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';
import Constants from 'expo-constants';

// ── Environment detection ─────────────────────────────────────────
const isExpoGo    = Constants.appOwnership === 'expo';
const isProduction = process.env.EXPO_PUBLIC_APP_ENV === 'production';

const AD_UNIT_ID = isProduction
  ? 'ca-app-pub-9888510222037453/5866602592'       // real ad
  : 'ca-app-pub-3940256099942544/6300978111';       // Google official test banner

// ── Native module (skip in Expo Go) ──────────────────────────────
let NativeBannerAd: React.ComponentType<any> | null = null;
let NativeBannerAdSize: any = null;
let moduleLoadError = '';

if (!isExpoGo && Platform.OS === 'android') {
  try {
    const ads    = require('react-native-google-mobile-ads');
    NativeBannerAd   = ads.BannerAd;
    NativeBannerAdSize = ads.BannerAdSize;
  } catch (e: any) {
    moduleLoadError = e?.message ?? 'unknown module error';
  }
}

// ── Component ─────────────────────────────────────────────────────
type AdState = 'loading' | 'loaded' | 'failed';

export default function AdBanner() {
  const [adState, setAdState] = useState<AdState>('loading');
  const [adError, setAdError] = useState('');

  // Expo Go: completely hidden, no placeholder
  if (isExpoGo) return null;

  // Native module failed to load → show debug placeholder
  if (!NativeBannerAd || !NativeBannerAdSize) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderTitle}>AdMob Banner Area</Text>
        <Text style={styles.placeholderSub}>
          Module not loaded{moduleLoadError ? `: ${moduleLoadError}` : ''}
        </Text>
      </View>
    );
  }

  // Ad failed to load → show debug placeholder with error
  if (adState === 'failed') {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderTitle}>AdMob Banner Area</Text>
        {adError ? (
          <Text style={styles.placeholderSub} numberOfLines={2}>{adError}</Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <NativeBannerAd
        unitId={AD_UNIT_ID}
        size={NativeBannerAdSize.BANNER}
        onAdLoaded={() => {
          console.log('AdMob banner loaded');
          setAdState('loaded');
        }}
        onAdFailedToLoad={(error: any) => {
          const msg = error?.message ?? JSON.stringify(error);
          console.log('AdMob banner failed to load:', msg);
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
    minHeight: 50,
  },
  placeholder: {
    height: 50,
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
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
