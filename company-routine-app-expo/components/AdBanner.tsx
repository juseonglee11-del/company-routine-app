import React, { useState } from 'react';
import { Platform, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

const AD_UNIT_ID = 'ca-app-pub-9888510222037453/5866602592';

export default function AdBanner() {
  const [visible, setVisible] = useState(true);

  if (Platform.OS !== 'android' || !visible) return null;

  return (
    <View style={{ alignItems: 'center', paddingVertical: 4 }}>
      <BannerAd
        unitId={AD_UNIT_ID}
        size={BannerAdSize.BANNER}
        onAdFailedToLoad={() => setVisible(false)}
      />
    </View>
  );
}
