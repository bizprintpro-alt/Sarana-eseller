// ══════════════════════════════════════════════════════════════
// eseller.mn — Input Validation Schemas (Zod)
// ══════════════════════════════════════════════════════════════

import { z } from 'zod';

// ═══ Common ═══
export const phoneSchema = z.string().min(8).max(15).regex(/^[\d+-]+$/, 'Утасны дугаар буруу');
export const emailSchema = z.string().email('Имэйл хаяг буруу');
export const priceSchema = z.number().int().min(0).max(100_000_000);
export const slugSchema = z.string().regex(/^[a-z0-9-]+$/, 'Зөвхөн жижиг үсэг, тоо, зураас').min(2).max(100);

// ═══ Auth ═══
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, 'Нууц үг 6+ тэмдэгт'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Нэр 2+ тэмдэгт').max(100),
  email: emailSchema,
  password: z.string().min(6).max(100),
  role: z.enum(['buyer', 'seller', 'affiliate', 'delivery']).optional(),
});

// ═══ Products ═══
export const productSchema = z.object({
  name: z.string().min(2).max(200),
  price: priceSchema,
  salePrice: priceSchema.optional(),
  description: z.string().max(10000).optional(),
  category: z.string().max(100).optional(),
  stock: z.number().int().min(0).optional(),
});

// ═══ Services ═══
export const serviceSchema = z.object({
  name: z.string().min(2).max(200),
  price: priceSchema,
  duration: z.number().int().min(5).max(480).optional(),
  description: z.string().max(5000).optional(),
  category: z.string().max(100).optional(),
});

// ═══ Bookings ═══
export const bookingSchema = z.object({
  serviceId: z.string().min(1),
  shopId: z.string().min(1),
  customerName: z.string().min(2).max(100),
  customerPhone: phoneSchema,
  scheduledAt: z.string().datetime(),
  notes: z.string().max(500).optional(),
});

// ═══ Reviews ═══
export const reviewSchema = z.object({
  productId: z.string().min(1),
  orderId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

// ═══ Entity Registration ═══
export const entityRegisterSchema = z.object({
  entityType: z.enum(['store', 'agent', 'company', 'auto_dealer', 'service']),
  name: z.string().min(2).max(200),
  slug: slugSchema,
  phone: phoneSchema.optional(),
  description: z.string().max(2000).optional(),
});

// ═══ Modifier ═══
export const modifierGroupSchema = z.object({
  name: z.string().min(1).max(100),
  required: z.boolean().optional(),
  multiple: z.boolean().optional(),
});

export const modifierOptionSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().int().min(0).max(1_000_000),
});

// ═══ Helper: validate and return or throw ═══
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((i) => i.message).join(', ');
    throw new Error(errors);
  }
  return result.data;
}

// ═══ Sanitize: strip HTML tags from string ═══
export function sanitize(str: string): string {
  return str.replace(/<[^>]*>/g, '').trim();
}
