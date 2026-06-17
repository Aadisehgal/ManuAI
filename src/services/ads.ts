import {
  MobileAds,
  BannerAd,
  BannerAdSize,
  RewardedAd,
  RewardedAdEventType,
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

const PUBLISHER_ID = 'ca-app-pub-3684441716460567';
const BANNER_UNIT_ID = `${PUBLISHER_ID}/7116352504`;
const REWARDED_UNIT_ID = `${PUBLISHER_ID}/7885822933`;
const INTERSTITIAL_UNIT_ID = `${PUBLISHER_ID}/1234567890`;

let rewardedAd: RewardedAd | null = null;
let interstitialAd: InterstitialAd | null = null;

export function initializeAds(): Promise<void> {
  return MobileAds().initialize();
}

export function getBannerAdUnitId(): string {
  return __DEV__ ? TestIds.BANNER : BANNER_UNIT_ID;
}

export function getRewardedAdUnitId(): string {
  return __DEV__ ? TestIds.REWARDED : REWARDED_UNIT_ID;
}

export function getInterstitialAdUnitId(): string {
  return __DEV__ ? TestIds.INTERSTITIAL : INTERSTITIAL_UNIT_ID;
}

export function loadRewardedAd(): Promise<boolean> {
  return new Promise((resolve) => {
    if (rewardedAd) {
      resolve(true);
      return;
    }
    const ad = RewardedAd.createForAdRequest(getRewardedAdUnitId());
    const unsubLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      rewardedAd = ad;
      unsubLoaded();
      resolve(true);
    });
    const unsubError = ad.addAdEventListener('error', () => {
      unsubLoaded();
      unsubError();
      resolve(false);
    });
    ad.load();
    setTimeout(() => { if (!rewardedAd) { unsubLoaded(); unsubError(); resolve(false); } }, 30000);
  });
}

export function showRewardedAd(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!rewardedAd) { resolve(false); return; }
    const unsubEarned = rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      unsubEarned();
      rewardedAd = null;
      resolve(true);
    });
    const unsubClosed = rewardedAd.addAdEventListener('closed', () => {
      unsubEarned();
      rewardedAd = null;
      resolve(false);
    });
    rewardedAd.show();
  });
}

export function loadInterstitialAd(): Promise<boolean> {
  return new Promise((resolve) => {
    if (interstitialAd) { resolve(true); return; }
    const ad = InterstitialAd.createForAdRequest(getInterstitialAdUnitId());
    const unsubLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      interstitialAd = ad;
      unsubLoaded();
      resolve(true);
    });
    const unsubError = ad.addAdEventListener(AdEventType.ERROR, () => {
      unsubLoaded();
      resolve(false);
    });
    ad.load();
    setTimeout(() => { if (!interstitialAd) { unsubLoaded(); resolve(false); } }, 30000);
  });
}

export function showInterstitialAd(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!interstitialAd) { resolve(false); return; }
    const unsubClosed = interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      interstitialAd = null;
      resolve(true);
    });
    interstitialAd.show();
  });
}

export {BannerAd, BannerAdSize};
