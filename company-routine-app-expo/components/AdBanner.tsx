import React, { useState } from 'react';
import { Platform, View } from 'react-native';
import Constants from 'expo-constants';

// Expo Go does not support native modules not bundled in its SDK.
// Guard the require() so it never runs in Expo Go.
const isExpoGo = Constants.appOwnership === 'expo';

let NativeBannerAd: React.ComponentType<any> | null = null;
let NativeBannerAdSize: Record<string, string> | null = null;

if (!isExpoGo && Platform.OS === 'android') {
  try {
    const ads = require('react-native-google-mobile-ads');
    NativeBannerAd = ads.BannerAd;
    NativeBannerAdSize = ads.BannerAdSize;
  } catch {
    // prebuild not run yet, or module unavailable
  }
}

const AD_UNIT_ID = 'ca-app-pub-9888510222037453/5866602592';

export default function AdBanner() {
  const [visible, setVisible] = useState(true);

  if (!NativeBannerAd || !NativeBannerAdSize || !visible) return null;

  return (
    <View style={{ alignItems: 'center', paddingVertical: 4 }}>
      <NativeBannerAd
        unitId={AD_UNIT_ID}
        size={NativeBannerAdSize.BANNER}
        onAdFailedToLoad={() => setVisible(false)}
      />
    </View>
  );
}
