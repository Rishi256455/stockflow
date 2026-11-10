'use server';

import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { createSession, destroySession, requireSession } from '@/lib/auth';

const fail = (path, msg) => redirect(`${path}?error=${encodeURIComponent(msg)}`);

/* ---------- Auth ---------- */

const signupSchema = z
  .object({
    email: z.string().trim().toLowerCase().email('Enter a valid email address'),
    organizationName: z.string().trim().min(1, 'Enter an organization name'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match' });

export async function signup(formData) {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) fail('/signup', parsed.error.issues[0].message);
  const d = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: d.email } });
  if (existing) fail('/signup', 'That email is already registered. Log in instead.');

  const passwordHash = await bcrypt.hash(d.password, 10);
  const user = await prisma.user.create({
    data: {
      email: d.email,
      passwordHash,
      organization: { create: { name: d.organizationName } },
    },
  });
  await createSession(user);
  redirect('/dashboard');
}

export async function login(formData) {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  const user = email ? await prisma.user.findUnique({ where: { email } }) : null;
  const ok = user && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) fail('/login', 'Email or password is incorrect.');
  await createSession(user);
  redirect('/dashboard');
}

export async function logout() {
  destroySession();
  redirect('/login');
}

/* ---------- Products ---------- */

const optNumber = z.preprocess(
  (v) => (v === '' || v == null ? undefined : Number(v)),
  z.number({ invalid_type_error: 'Prices and threshold must be numbers' }).min(0, 'Values cannot be negative').optional()
);
const optInt = z.preprocess(
  (v) => (v === '' || v == null ? undefined : Number(v)),
  z.number({ invalid_type_error: 'Threshold must be a number' }).int('Threshold must be a whole number').min(0, 'Values cannot be negative').optional()
);

const productSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  sku: z.string().trim().min(1, 'SKU is required'),
  description: z.string().trim().optional(),
  quantity: z.coerce
    .number({ invalid_type_error: 'Quantity must be a number' })
    .int('Quantity must be a whole number')
    .min(0, 'Quantity cannot be negative'),
  costPrice: optNumber,
  sellingPrice: optNumber,
  lowStockThreshold: optInt,
});

export async function saveProduct(formData) {
  const session = await requireSession();
  const id = String(formData.get('id') || '');
  const back = id ? `/products/${id}/edit` : '/products/new';

  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) fail(back, parsed.error.issues[0].message);
  const d = parsed.data;

  const data = {
    name: d.name,
    sku: d.sku,
    description: d.description || null,
    quantity: d.quantity,
    costPrice: d.costPrice ?? null,
    sellingPrice: d.sellingPrice ?? null,
    lowStockThreshold: d.lowStockThreshold ?? null,
    lastUpdatedBy: session.email,
  };

  try {
    if (id) {
      const res = await prisma.product.updateMany({
        where: { id, organizationId: session.oid },
        data,
      });
      if (res.count === 0) fail('/products', 'Product not found.');
    } else {
      await prisma.product.create({ data: { ...data, organizationId: session.oid } });
    }
  } catch (e) {
    if (e?.code === 'P2002') fail(back, 'That SKU is already used in your organization.');
    throw e;
  }
  revalidatePath('/', 'layout');
  redirect('/products');
}

export async function deleteProduct(formData) {
  const session = await requireSession();
  const id = String(formData.get('id') || '');
  await prisma.product.deleteMany({ where: { id, organizationId: session.oid } });
  revalidatePath('/', 'layout');
  redirect('/products');
}

export async function adjustStock(formData) {
  const session = await requireSession();
  const id = String(formData.get('id') || '');
  const delta = Number(formData.get('delta'));
  const note = String(formData.get('note') || '').trim();
  if (!Number.isInteger(delta) || delta === 0) fail('/products', 'Enter a whole number other than 0.');

  const product = await prisma.product.findFirst({ where: { id, organizationId: session.oid } });
  if (!product) fail('/products', 'Product not found.');
  if (product.quantity + delta < 0) fail('/products', 'Quantity cannot go below 0.');

  await prisma.product.update({
    where: { id },
    data: {
      quantity: product.quantity + delta,
      lastUpdatedBy: session.email,
      lastNote: note || null,
    },
  });
  revalidatePath('/', 'layout');
  redirect('/products');
}

/* ---------- Settings ---------- */

export async function saveSettings(formData) {
  const session = await requireSession();
  const v = Number(formData.get('defaultLowStockThreshold'));
  if (!Number.isInteger(v) || v < 0) fail('/settings', 'Enter a whole number, 0 or higher.');
  await prisma.organization.update({
    where: { id: session.oid },
    data: { defaultLowStockThreshold: v },
  });
  revalidatePath('/', 'layout');
  redirect('/settings?saved=1');
}
