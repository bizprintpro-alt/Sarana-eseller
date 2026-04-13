/**
 * eseller.mn — Push Notification Setup
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { PushAPI } from './api';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  } as Notifications.NotificationBehavior),
});

/**
 * Register for push notifications and send token to server
 */
export async function registerPushToken(): Promise<string | null> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return null;
    }

    // Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Eseller',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#E8242C',
      });
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;

    // Send to server
    await PushAPI.registerToken(token, Platform.OS).catch(() => {});

    return token;
  } catch {
    return null;
  }
}

/**
 * Parse notification data for deep linking
 */
export function getDeepLinkFromNotification(notification: Notifications.Notification): string | null {
  const data = notification.request.content.data;
  if (!data) return null;

  switch (data.type) {
    case 'order_new':
      return '/(seller)/orders';
    case 'delivery_assigned':
      return '/(driver)';
    case 'order_delivered':
      return `/order/${data.orderId}`;
    case 'payment_success':
      return `/order/${data.orderId}`;
    default:
      return null;
  }
}
