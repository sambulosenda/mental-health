import { Share, Platform } from 'react-native';
import * as SMS from 'expo-sms';

// Placeholder URLs - update when app is published
const APP_STORE_URL = 'https://apps.apple.com/app/softmind/id000000000';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.softmind';

export const getShareMessage = () => {
  const downloadUrl = Platform.OS === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;

  return `I've been using Softmind to track my mental wellness and it's been a game-changer. It helps me understand my moods, build healthy habits, and take care of my mental health with guided exercises and journaling.

Take a moment for yourself - download Softmind:
${downloadUrl}`;
};

export async function shareApp(): Promise<boolean> {
  try {
    const result = await Share.share({
      message: getShareMessage(),
      title: 'Share Softmind',
    });
    return result.action === Share.sharedAction;
  } catch {
    return false;
  }
}

export async function sendSMSInvites(phoneNumbers: string[]): Promise<boolean> {
  try {
    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      return false;
    }

    const { result } = await SMS.sendSMSAsync(phoneNumbers, getShareMessage());
    return result === 'sent' || result === 'unknown';
  } catch {
    return false;
  }
}

export async function checkSMSAvailable(): Promise<boolean> {
  return SMS.isAvailableAsync();
}
