/**
 * Email Service — Resend primary
 * For campaign sends + transactional emails
 */

const RESEND_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = process.env.EMAIL_FROM || 'eseller.mn <noreply@eseller.mn>';

export interface EmailResult {
  success: boolean;
  provider: 'resend' | 'demo';
  messageId?: string;
  error?: string;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<EmailResult> {
  // Demo mode
  if (!RESEND_KEY) {
    console.log(`[EMAIL DEMO] To: ${to} | Subject: ${subject}`);
    return { success: true, provider: 'demo', messageId: `demo_${Date.now()}` };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_KEY}` },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, provider: 'resend', messageId: data.id };
    }

    const error = await res.text();
    return { success: false, provider: 'resend', error };
  } catch (err) {
    return { success: false, provider: 'resend', error: String(err) };
  }
}

/** Send bulk emails */
export async function sendBulkEmail(
  recipients: { email: string; subject: string; html: string }[],
  onProgress?: (sent: number, total: number) => void,
): Promise<{ sent: number; failed: number }> {
  let sent = 0, failed = 0;

  for (let i = 0; i < recipients.length; i++) {
    const r = recipients[i];
    const result = await sendEmail(r.email, r.subject, r.html);
    if (result.success) sent++; else failed++;
    onProgress?.(i + 1, recipients.length);

    // Rate limit: 5 emails/second (Resend limit)
    if (i % 5 === 4) await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return { sent, failed };
}

/** Build HTML email template */
export function buildEmailTemplate(title: string, body: string, ctaUrl?: string, ctaText?: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:Inter,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:20px">
  <div style="background:#E8242C;padding:16px 24px;border-radius:12px 12px 0 0;text-align:center">
    <span style="color:#fff;font-size:20px;font-weight:900;letter-spacing:-0.02em">eseller<span style="opacity:0.7">.mn</span></span>
  </div>
  <div style="background:#fff;padding:32px 24px;border-radius:0 0 12px 12px;border:1px solid #E5E5E5;border-top:none">
    <h1 style="font-size:22px;font-weight:700;color:#0A0A0A;margin:0 0 16px">${title}</h1>
    <div style="font-size:14px;color:#555;line-height:1.8">${body}</div>
    ${ctaUrl ? `
    <div style="text-align:center;margin:28px 0 0">
      <a href="${ctaUrl}" style="display:inline-block;background:#E8242C;color:#fff;padding:14px 32px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none">
        ${ctaText || 'Дэлгэрэнгүй →'}
      </a>
    </div>` : ''}
  </div>
  <p style="text-align:center;font-size:11px;color:#999;margin:16px 0 0">
    © ${new Date().getFullYear()} eseller.mn — Борлуулагчтай л борлуулалт байна
  </p>
</div>
</body>
</html>`;
}
