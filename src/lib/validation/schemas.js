import { z } from 'zod';
import {
  PASSWORD_MAX_LENGTH,
  STRONG_PASSWORD_REGEX,
} from '../passwordPolicy';
import { collapseWhitespace, digitsOnly, normalizeEmail, trimInput } from './sanitize';

/** Letters (unicode), spaces, periods, apostrophes, hyphens — no digits. */
const PERSON_NAME_REGEX = /^[\p{L}\s.'-]{2,200}$/u;

/** Schools / orgs — allows digits (e.g. “Sector 12”). */
const ORG_NAME_REGEX = /^[\p{L}0-9\s.'&/-]{2,200}$/u;

const requiredAddressLine = z
  .string()
  .transform((s) => trimInput(s))
  .pipe(
    z
      .string()
      .min(1, 'This field is required.')
      .max(200)
      .refine((s) => !/[<>]/.test(s), { message: 'Remove < or > characters.' })
  );

/** Optional social/profile links — avoid strict URL parsing so pasted handles still work. */
const optionalSocialLinkSchema = z
  .string()
  .transform((s) => trimInput(s))
  .refine((s) => !s || (s.length <= 500 && !/[<>]/.test(s)), {
    message: 'Use a shorter link without < or > characters, or leave blank.',
  });

export const emailSchema = z
  .string()
  .transform((s) => normalizeEmail(s))
  .pipe(z.string().min(1, 'Email is required.').email('Enter a valid email address.'));

export const mobileINSchema = z
  .string()
  .transform((s) => digitsOnly(s))
  .pipe(
    z
      .string()
      .length(10, 'Enter a valid 10-digit mobile number.')
      .regex(/^[6-9]\d{9}$/, 'Mobile number must start with 6–9.')
  );

export const pincodeINRequiredSchema = z
  .string()
  .transform((s) => trimInput(s))
  .pipe(z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode.'));

export const pincodeINOptionalSchema = z
  .string()
  .transform((s) => trimInput(s))
  .refine((s) => !s || /^\d{6}$/.test(s), { message: 'Enter a valid 6-digit pincode or leave blank.' });

export const personNameSchema = z
  .string()
  .transform((s) => collapseWhitespace(s))
  .pipe(
    z
      .string()
      .min(2, 'Must be at least 2 characters.')
      .regex(
        PERSON_NAME_REGEX,
        'Use letters, spaces, hyphens, apostrophes, or periods only (no numbers).'
      )
  );

export const organizationNameSchema = z
  .string()
  .transform((s) => collapseWhitespace(s))
  .pipe(
    z
      .string()
      .min(2, 'Must be at least 2 characters.')
      .max(200)
      .regex(
        ORG_NAME_REGEX,
        'Use letters, numbers, spaces, or basic punctuation only.'
      )
  );

export const strongPasswordSchema = z
  .string()
  .min(1, 'Password is required.')
  .max(PASSWORD_MAX_LENGTH, 'Password is too long.')
  .refine((p) => STRONG_PASSWORD_REGEX.test(p), {
    message:
      'Use at least 8 characters including uppercase, lowercase, a number, and a symbol.',
  });

export const loginFormSchema = z.object({
  username: z
    .string()
    .transform((s) => {
      const t = trimInput(s);
      return t.includes('@') ? t.toLowerCase() : t;
    })
    .refine((s) => s.length > 0, { message: 'Username or email is required.' })
    .refine((s) => s.length <= 200, { message: 'Username is too long.' })
    .refine(
      (s) => !s.includes('@') || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s),
      { message: 'Enter a valid email address.' }
    ),
  password: z.string().min(1, 'Password is required.'),
});

export const profileFormSchema = z.object({
  fullName: personNameSchema,
  email: emailSchema,
  phone: mobileINSchema,
  profilePicture: z.union([z.string().max(2000), z.literal('')]),
  address: z.union([z.string().max(2000), z.literal('')]),
});

export const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password.'),
    newPassword: strongPasswordSchema,
    confirmPassword: z.string().min(1, 'Confirm your new password.'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

const alphanumericOptional = z
  .string()
  .transform((s) => trimInput(s))
  .refine((s) => !s || /^[a-zA-Z0-9]+$/.test(s), {
    message: 'Use letters and numbers only.',
  });

const alphanumericRequired = z
  .string()
  .transform((s) => trimInput(s))
  .pipe(
    z
      .string()
      .min(1, 'This field is required.')
      .regex(/^[a-zA-Z0-9]+$/, 'Use letters and numbers only.')
  );

/**
 * Public registration (Register.jsx) — validates shared + role-specific fields.
 */
export const registerWizardSchema = z
  .object({
    registrationType: z.enum(['PROMOTOR', 'SCHOOL']),
    email: z.string(),
    mobile: z.string(),
    password: z.string(),
    confirmPassword: z.string(),
    influencerName: z.string().optional(),
    influencerHouse: z.string().optional(),
    influencerStreet: z.string().optional(),
    influencerDistrict: z.string().optional(),
    influencerState: z.string().optional(),
    influencerPincode: z.string().optional(),
    influencerPromoCode: z.string().optional(),
    influencerInstagramProfileLink: z.string().optional(),
    influencerYoutubeProfileLink: z.string().optional(),
    schoolName: z.string().optional(),
    schoolHouse: z.string().optional(),
    schoolStreet: z.string().optional(),
    schoolDistrict: z.string().optional(),
    schoolState: z.string().optional(),
    schoolPincode: z.string().optional(),
    schoolHasMultipleBranches: z.boolean().optional(),
    schoolBranchCode: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const emailResult = emailSchema.safeParse(data.email);
    if (!emailResult.success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['email'], message: emailResult.error.issues[0]?.message });
    }
    const mobResult = mobileINSchema.safeParse(data.mobile);
    if (!mobResult.success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['mobile'], message: mobResult.error.issues[0]?.message });
    }
    const pwResult = strongPasswordSchema.safeParse(data.password);
    if (!pwResult.success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['password'], message: pwResult.error.issues[0]?.message });
    }
    if (!data.confirmPassword) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['confirmPassword'], message: 'Confirm password is required.' });
    } else if (data.password !== data.confirmPassword) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['confirmPassword'], message: 'Passwords do not match.' });
    }

    if (data.registrationType === 'PROMOTOR') {
      const n = personNameSchema.safeParse(data.influencerName ?? '');
      if (!n.success) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['name'], message: n.error.issues[0]?.message });
      }
      for (const [key, val, label] of [
        ['house', data.influencerHouse, 'house'],
        ['street', data.influencerStreet, 'street'],
        ['district', data.influencerDistrict, 'district'],
        ['state', data.influencerState, 'state'],
      ]) {
        const r = requiredAddressLine.safeParse(val ?? '');
        if (!r.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [label],
            message: r.error.issues[0]?.message ?? 'Required.',
          });
        }
      }
      const pc = pincodeINRequiredSchema.safeParse(data.influencerPincode ?? '');
      if (!pc.success) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['pincode'], message: pc.error.issues[0]?.message });
      }
      const pr = alphanumericOptional.safeParse(data.influencerPromoCode ?? '');
      if (!pr.success) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['promoCode'], message: pr.error.issues[0]?.message });
      }
      const ig = optionalSocialLinkSchema.safeParse(data.influencerInstagramProfileLink ?? '');
      if (!ig.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['instagram'],
          message: ig.error.issues[0]?.message,
        });
      }
      const yt = optionalSocialLinkSchema.safeParse(data.influencerYoutubeProfileLink ?? '');
      if (!yt.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['youtube'],
          message: yt.error.issues[0]?.message,
        });
      }
    }

    if (data.registrationType === 'SCHOOL') {
      const sn = organizationNameSchema.safeParse(data.schoolName ?? '');
      if (!sn.success) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['schoolName'], message: sn.error.issues[0]?.message });
      }
      for (const [pathKey, val, label] of [
        ['schoolHouse', data.schoolHouse, 'schoolHouse'],
        ['schoolStreet', data.schoolStreet, 'schoolStreet'],
        ['schoolDistrict', data.schoolDistrict, 'schoolDistrict'],
        ['schoolState', data.schoolState, 'schoolState'],
      ]) {
        const r = requiredAddressLine.safeParse(val ?? '');
        if (!r.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [pathKey],
            message: r.error.issues[0]?.message ?? 'Required.',
          });
        }
      }
      const pc = pincodeINRequiredSchema.safeParse(data.schoolPincode ?? '');
      if (!pc.success) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['schoolPincode'], message: pc.error.issues[0]?.message });
      }
      if (data.schoolHasMultipleBranches) {
        const br = alphanumericRequired.safeParse(data.schoolBranchCode ?? '');
        if (!br.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['schoolBranchCode'],
            message: br.error.issues[0]?.message,
          });
        }
      }
    }
  });

export const adminSchoolFormSchema = z
  .object({
    name: z.string(),
    email: z.string().optional(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
    contactName: z.string(),
    contactPhone: z.string(),
    hasBranches: z.boolean(),
    branchCode: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const nameR = organizationNameSchema.safeParse(data.name);
    if (!nameR.success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['name'], message: nameR.error.issues[0]?.message });
    }
    if (trimInput(data.email || '')) {
      const em = emailSchema.safeParse(data.email);
      if (!em.success) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['email'], message: em.error.issues[0]?.message });
      }
    }
    for (const [k, v, msg] of [
      ['address', data.address, 'Address is required.'],
      ['city', data.city, 'City is required.'],
      ['state', data.state, 'State is required.'],
    ]) {
      const t = trimInput(v || '');
      if (!t) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [k], message: msg });
      } else if (/[<>]/.test(t)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [k], message: 'Remove < or > characters.' });
      }
    }
    const pc = pincodeINRequiredSchema.safeParse(data.pincode ?? '');
    if (!pc.success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['pincode'], message: pc.error.issues[0]?.message });
    }
    const cn = personNameSchema.safeParse(data.contactName ?? '');
    if (!cn.success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['contactName'], message: cn.error.issues[0]?.message });
    }
    const ph = mobileINSchema.safeParse(data.contactPhone ?? '');
    if (!ph.success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['contactPhone'], message: ph.error.issues[0]?.message });
    }
    if (data.hasBranches) {
      const b = alphanumericRequired.safeParse(data.branchCode ?? '');
      if (!b.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['branchCode'],
          message: b.error.issues[0]?.message,
        });
      }
    }
  });

export const adminPromoterFormSchema = z
  .object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    pincode: z.string().optional(),
    promoCode: z.string().optional(),
    referralCode: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const nameR = personNameSchema.safeParse(data.name);
    if (!nameR.success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['name'], message: nameR.error.issues[0]?.message });
    }
    const em = emailSchema.safeParse(data.email);
    if (!em.success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['email'], message: em.error.issues[0]?.message });
    }
    const ph = mobileINSchema.safeParse(data.phone ?? '');
    if (!ph.success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['phone'], message: ph.error.issues[0]?.message });
    }
    const pc = pincodeINOptionalSchema.safeParse(data.pincode ?? '');
    if (!pc.success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['pincode'], message: pc.error.issues[0]?.message });
    }
    const pr = alphanumericOptional.safeParse(data.promoCode ?? '');
    if (!pr.success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['promoCode'], message: pr.error.issues[0]?.message });
    }
    const rf = alphanumericOptional.safeParse(data.referralCode ?? '');
    if (!rf.success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['referralCode'], message: rf.error.issues[0]?.message });
    }
  });

export const partnerAccountFormSchema = z
  .object({
    name: z.string(),
    email: z.string(),
    mobileNumber: z.string(),
  })
  .superRefine((data, ctx) => {
    const nameR = personNameSchema.safeParse(data.name);
    if (!nameR.success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['name'], message: nameR.error.issues[0]?.message });
    }
    const em = emailSchema.safeParse(data.email);
    if (!em.success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['email'], message: em.error.issues[0]?.message });
    }
    const ph = mobileINSchema.safeParse(data.mobileNumber ?? '');
    if (!ph.success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['mobileNumber'], message: ph.error.issues[0]?.message });
    }
  });

export const addStudentFormSchema = z.object({
  name: personNameSchema,
  className: z
    .string()
    .transform((s) => collapseWhitespace(s))
    .pipe(z.string().min(1, 'Class is required.').max(50)),
  section: z
    .string()
    .transform((s) => trimInput(s))
    .pipe(z.string().max(20)),
  rollNumber: z
    .string()
    .transform((s) => trimInput(s))
    .pipe(z.string().max(30)),
});

/** SuperAdminDashboard local promoter form (Redux-only; still validate for UX). */
export const superAdminPromoterFormSchema = z
  .object({
    name: z.string(),
    email: z.string(),
    mobile: z.string(),
    address: z.string(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    referralCode: z.string().optional(),
    promoCode: z.string().optional(),
    discountPercent: z.string(),
    instagramProfileLink: z.string().optional(),
    youtubeProfileLink: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const nameR = personNameSchema.safeParse(data.name);
    if (!nameR.success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['name'], message: nameR.error.issues[0]?.message });
    }
    const em = emailSchema.safeParse(data.email);
    if (!em.success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['email'], message: em.error.issues[0]?.message });
    }
    const mob = mobileINSchema.safeParse(data.mobile ?? '');
    if (!mob.success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['mobile'], message: mob.error.issues[0]?.message });
    }
    const addr = trimInput(data.address ?? '');
    if (!addr) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['address'], message: 'Address is required.' });
    } else if (/[<>]/.test(addr)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['address'], message: 'Remove < or > characters.' });
    }
    const pc = pincodeINOptionalSchema.safeParse(data.pincode ?? '');
    if (!pc.success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['pincode'], message: pc.error.issues[0]?.message });
    }
    const pr = alphanumericOptional.safeParse(data.promoCode ?? '');
    if (!pr.success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['promoCode'], message: pr.error.issues[0]?.message });
    }
    const rf = alphanumericOptional.safeParse(data.referralCode ?? '');
    if (!rf.success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['referralCode'], message: rf.error.issues[0]?.message });
    }
    const ig = optionalSocialLinkSchema.safeParse(data.instagramProfileLink ?? '');
    if (!ig.success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['instagramProfileLink'], message: ig.error.issues[0]?.message });
    }
    const yt = optionalSocialLinkSchema.safeParse(data.youtubeProfileLink ?? '');
    if (!yt.success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['youtubeProfileLink'], message: yt.error.issues[0]?.message });
    }
    const disc = trimInput(data.discountPercent ?? '');
    if (!disc) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['discountPercent'],
        message: 'Discount % is required for the promoter promo.',
      });
    } else {
      const n = parseInt(disc, 10);
      if (Number.isNaN(n) || n < 1 || n > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['discountPercent'],
          message: 'Discount % must be between 1 and 100.',
        });
      }
    }
  });

export const eventDateRangeSchema = z
  .object({
    fromDate: z.string(),
    toDate: z.string(),
  })
  .superRefine((data, ctx) => {
    const from = trimInput(data.fromDate);
    const to = trimInput(data.toDate);
    if (!from) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['fromDate'], message: 'From date is required.' });
    }
    if (!to) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['toDate'], message: 'To date is required.' });
    }
    if (from && to && from > to) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['toDate'],
        message: 'To date must be on or after the from date.',
      });
    }
  });
