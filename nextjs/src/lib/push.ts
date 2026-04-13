/**
 * Expo Push Notification helper
 */

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export async function sendExpoPush(
  pushToken: string,
  payload: PushPayload
): Promise<boolean> {
  if (!pushToken.startsWith('ExponentPushToken')) {
    console.warn('[PUSH] Invalid token:', pushToken.slice(0, 20));
    return false;
  }

  try {
    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: pushToken,
        sound: 'default',
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
      }),
    });

    if (!res.ok) {
      console.error('[PUSH] Failed:', await res.text());
      return false;
    }

    return true;
  } catch (err) {
    console.error('[PUSH] Error:', err);
    return false;
  }
}

/** Send push to multiple tokens */
export async function sendExpoPushBatch(
  tokens: string[],
  payload: PushPayload
): Promise<number> {
  const messages = tokens
    .filter((t) => t.startsWith('ExponentPushToken'))
    .map((to) => ({
      to,
      sound: 'default' as const,
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
    }));

  if (messages.length === 0) return 0;

  try {
    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messages),
    });

    if (!res.ok) {
      console.error('[PUSH] Batch failed:', await res.text());
      return 0;
    }

    return messages.length;
  } catch (err) {
    console.error('[PUSH] Batch error:', err);
    return 0;
  }
}
