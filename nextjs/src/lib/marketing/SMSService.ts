/**
 * SMS Service — Unitel primary, MobiCom fallback
 * For campaign sends + transactional SMS
 */

const UNITEL_URL = process.env.UNITEL_SMS_URL || 'https://sms.unitel.mn/api/v1';
const UNITEL_KEY = process.env.UNITEL_SMS_KEY || '';
const MOBICOM_URL = process.env.MOBICOM_SMS_URL || '';
const MOBICOM_KEY = process.env.MOBICOM_SMS_KEY || '';

export interface SMSResult {
  success: boolean;
  provider: 'unitel' | 'mobicom' | 'demo';
  messageId?: string;
  error?: string;
}

export async function sendSMS(phone: string, message: string): Promise<SMSResult> {
  // Demo mode
  if (!UNITEL_KEY && !MOBICOM_KEY) {
    console.log(`[SMS DEMO] To: ${phone} | Message: ${message}`);
    return { success: true, provider: 'demo', messageId: `demo_${Date.now()}` };
  }

  // Try Unitel first
  if (UNITEL_KEY) {
    try {
      const res = await fetch(`${UNITEL_URL}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${UNITEL_KEY}` },
        body: JSON.stringify({ phone, message, sender: 'eseller.mn' }),
      });
      if (res.ok) {
        const data = await res.json();
        return { success: true, provider: 'unitel', messageId: data.id };
      }
    } catch {}
  }

  // Fallback to MobiCom
  if (MOBICOM_KEY) {
    try {
      const res = await fetch(`${MOBICOM_URL}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${MOBICOM_KEY}` },
        body: JSON.stringify({ phone, message, sender: 'eseller.mn' }),
      });
      if (res.ok) {
        const data = await res.json();
        return { success: true, provider: 'mobicom', messageId: data.id };
      }
    } catch {}
  }

  return { success: false, provider: 'unitel', error: 'All providers failed' };
}

/** Send bulk SMS (with rate limiting) */
export async function sendBulkSMS(
  recipients: { phone: string; message: string }[],
  onProgress?: (sent: number, total: number) => void,
): Promise<{ sent: number; failed: number }> {
  let sent = 0, failed = 0;

  for (let i = 0; i < recipients.length; i++) {
    const r = recipients[i];
    const result = await sendSMS(r.phone, r.message);
    if (result.success) sent++; else failed++;
    onProgress?.(i + 1, recipients.length);

    // Rate limit: 10 SMS/second
    if (i % 10 === 9) await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return { sent, failed };
}
