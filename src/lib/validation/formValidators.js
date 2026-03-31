import {
  adminPromoterFormSchema,
  adminSchoolFormSchema,
  partnerAccountFormSchema,
  registerWizardSchema,
  superAdminPromoterFormSchema,
} from './schemas';
import { zodErrorToFlatFieldErrors } from './zodUtils';

/**
 * @param {Record<string, unknown>} form
 * @returns {Record<string, string>}
 */
export function validateAdminSchoolForm(form) {
  const r = adminSchoolFormSchema.safeParse({
    name: form.name,
    email: form.email ?? '',
    address: form.address,
    city: form.city,
    state: form.state,
    pincode: form.pincode,
    contactName: form.contactName,
    contactPhone: form.contactPhone,
    hasBranches: Boolean(form.hasBranches),
    branchCode: form.branchCode ?? '',
  });
  if (r.success) return {};
  return zodErrorToFlatFieldErrors(r.error);
}

/**
 * @param {Record<string, unknown>} form
 * @returns {Record<string, string>}
 */
export function validateAdminPromoterForm(form) {
  const r = adminPromoterFormSchema.safeParse({
    name: form.name,
    email: form.email,
    phone: form.phone,
    pincode: form.pincode,
    promoCode: form.promoCode,
    referralCode: form.referralCode,
  });
  if (r.success) return {};
  return zodErrorToFlatFieldErrors(r.error);
}

/**
 * @param {Record<string, unknown>} form
 * @returns {Record<string, string>}
 */
export function validatePartnerAccountForm(form) {
  const r = partnerAccountFormSchema.safeParse({
    name: form.name,
    email: form.email,
    mobileNumber: form.mobileNumber,
  });
  if (r.success) return {};
  return zodErrorToFlatFieldErrors(r.error);
}

/**
 * Validates Register.jsx wizard state (all branches).
 * @param {Record<string, unknown>} state
 * @returns {{ ok: boolean; errors: Record<string, string> }}
 */
/**
 * @param {Record<string, unknown>} form
 * @returns {Record<string, string>}
 */
export function validateSuperAdminPromoterForm(form) {
  const r = superAdminPromoterFormSchema.safeParse(form);
  if (r.success) return {};
  return zodErrorToFlatFieldErrors(r.error);
}

export function validateRegisterWizardState(state) {
  const input = {
    registrationType: state.registrationType,
    email: state.email,
    mobile: state.mobile,
    password: state.password,
    confirmPassword: state.confirmPassword,
    influencerName: state.influencerName,
    influencerHouse: state.influencerHouse,
    influencerStreet: state.influencerStreet,
    influencerDistrict: state.influencerDistrict,
    influencerState: state.influencerState,
    influencerPincode: state.influencerPincode,
    influencerPromoCode: state.influencerPromoCode,
    influencerInstagramProfileLink: state.influencerInstagramProfileLink,
    influencerYoutubeProfileLink: state.influencerYoutubeProfileLink,
    schoolName: state.schoolName,
    schoolHouse: state.schoolHouse,
    schoolStreet: state.schoolStreet,
    schoolDistrict: state.schoolDistrict,
    schoolState: state.schoolState,
    schoolPincode: state.schoolPincode,
    schoolHasMultipleBranches: state.schoolHasMultipleBranches,
    schoolBranchCode: state.schoolBranchCode,
  };
  const r = registerWizardSchema.safeParse(input);
  if (r.success) return { ok: true, errors: {} };
  return { ok: false, errors: zodErrorToFlatFieldErrors(r.error) };
}
