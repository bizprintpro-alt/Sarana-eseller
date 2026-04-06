import QRCode from 'qrcode';

export interface ShareContent {
  url: string;
  qrCodeDataUrl: string;
}

/**
 * Generate a QR code data URL for a given URL
 */
export async function generateQRCode(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    width: 400,
    margin: 2,
    color: { dark: '#0A0A0A', light: '#FFFFFF' },
    errorCorrectionLevel: 'M',
  });
}

/**
 * Generate share content for a store/entity
 */
export async function generateEntityShareContent(slug: string): Promise<ShareContent> {
  const url = `https://eseller.mn/${slug}`;
  const qrCodeDataUrl = await generateQRCode(url);
  return { url, qrCodeDataUrl };
}

/**
 * Generate share content for a seller/affiliate
 */
export async function generateSellerShareContent(username: string): Promise<ShareContent> {
  const url = `https://eseller.mn/seller/${username}`;
  const qrCodeDataUrl = await generateQRCode(url);
  return { url, qrCodeDataUrl };
}

/**
 * Generate social share URLs
 */
export function getSocialShareUrls(url: string, title: string) {
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
    twitter: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encoded}`,
    telegram: `https://t.me/share/url?url=${encoded}&text=${encodedTitle}`,
    copy: url,
  };
}
