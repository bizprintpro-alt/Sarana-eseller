// Email templates for transactional emails

const HEADER = `<div style="background:#E8242C;padding:20px;text-align:center"><h1 style="color:#fff;margin:0;font-size:20px">eseller.mn</h1></div>`;
const FOOTER = `<div style="padding:16px;text-align:center;font-size:11px;color:#888"><p>© ${new Date().getFullYear()} eseller.mn — Монголын нэгдсэн цахим худалдаа</p><p><a href="https://eseller.mn" style="color:#E8242C">eseller.mn</a></p></div>`;
const WRAP = (content: string) => `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden">${HEADER}<div style="padding:24px">${content}</div>${FOOTER}</div>`;
const BTN = (text: string, url: string) => `<a href="${url}" style="display:inline-block;background:#E8242C;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px">${text}</a>`;

export const EMAIL_TEMPLATES = {
  WELCOME: (name: string) => ({
    subject: `${name}, Eseller.mn-д тавтай морил!`,
    html: WRAP(`<h2>Сайн байна уу, ${name}!</h2><p>Монголын нэгдсэн цахим худалдааны платформд тавтай морилно уу.</p>${BTN('Дэлгүүр үзэх →', 'https://eseller.mn/store')}`),
  }),

  ORDER_CONFIRMED: (orderNumber: string, trackingCode: string, total: number) => ({
    subject: `✅ Захиалга #${orderNumber} баталгаажлаа`,
    html: WRAP(`<h2>Захиалга баталгаажлаа!</h2><p>Захиалга: <strong>#${orderNumber}</strong></p><p>Нийт дүн: <strong>${total.toLocaleString()}₮</strong></p>${BTN('Хянах →', `https://eseller.mn/track/${trackingCode}`)}`),
  }),

  DELIVERY_UPDATE: (orderNumber: string, status: string, trackingCode: string) => ({
    subject: `🚚 Захиалга #${orderNumber} — ${status}`,
    html: WRAP(`<h2>${status}</h2><p>Захиалга <strong>#${orderNumber}</strong> шинэчлэгдлээ.</p>${BTN('Tracking харах →', `https://eseller.mn/track/${trackingCode}`)}`),
  }),

  PROMO: (title: string, description: string, couponCode?: string) => ({
    subject: `🔥 ${title}`,
    html: WRAP(`<h2 style="text-align:center">${title}</h2><p style="text-align:center">${description}</p>${couponCode ? `<div style="background:#FEF3C7;border:2px dashed #F59E0B;padding:16px;border-radius:8px;margin:16px 0;text-align:center"><p style="margin:0;font-size:12px">Купон код:</p><h3 style="margin:4px 0;color:#92400E;font-size:24px">${couponCode}</h3></div>` : ''}${BTN('Одоо авах →', 'https://eseller.mn/store')}`),
  }),
};
