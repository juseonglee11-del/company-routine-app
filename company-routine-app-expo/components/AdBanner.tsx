import React, { useState } from 'react';
import { Platform, View } from 'react-native';
import Constants from 'expo-constants';

const isExpoGo = Constants.appOwnership === 'expo';

// Use Google's official test banner ID for non-production builds
const isProduction = process.env.EXPO_PUBLIC_APP_ENV === 'production';
const AD_UNIT_ID = isProduction
  ? 'ca-app-pub-9888510222037453/5866602592'
  : 'ca-app-pub-3940256099942544/6300978111';

let NativeBannerAd: React.ComponentType<any> | null = null;
let NativeBannerAdSize: Record<string, string> | null = null;

if (!isExpoGo && Platform.OS === 'android') {
  try {
    const ads = require('react-native-google-mobile-ads');
    NativeBannerAd = ads.BannerAd;
    NativeBannerAdSize = ads.BannerAdSize;
  } catch {
    // prebuild not run or module unavailable
  }
}

type AdState = 'loading' | 'loaded' | 'failed';

export default function AdBanner() {
  const [adState, setAdState] = useState<AdState>('loading');

  // Hide in Expo Go or when native module is unavailable
  if (!NativeBannerAd || !NativeBannerAdSize) return null;

  // Remove component entirely after failure (no dead space)
  if (adState === 'failed') return null;

  return (
    <View style={{ alignItems: 'center', minHeight: 50 }}>
      <NativeBannerAd
        unitId={AD_UNIT_ID}
        size={NativeBannerAdSize.BANNER}
        onAdLoaded={() => {
          console.log('AdMob banner loaded');
          setAdState('loaded');
        }}
        onAdFailedToLoad={(error: any) => {
          console.log('AdMob banner failed to load:', error?.message ?? error);
          setAdState('failed');
        }}
      />
    </View>
  );
}
