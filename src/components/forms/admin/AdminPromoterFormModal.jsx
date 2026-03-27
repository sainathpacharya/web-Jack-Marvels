import React from 'react';
import FormModal from '../common/FormModal';
import FormInput from '../common/FormInput';
import FormTextarea from '../common/FormTextarea';
import FormActions from '../common/FormActions';

export default function AdminPromoterFormModal({
  value,
  errors,
  onChange,
  onCancel,
  onSubmit,
  submitting = false,
}) {
  return (
    <FormModal title="Add Promoter (Admin)" onClose={onCancel}>
      <div className="space-y-3">
        <FormInput value={value.name} onChange={(e) => onChange('name', e.target.value)} placeholder="Promoter name *" error={errors.name} />
        <FormInput value={value.email} onChange={(e) => onChange('email', e.target.value)} placeholder="Email *" error={errors.email} />
        <FormInput value={value.phone} onChange={(e) => onChange('phone', e.target.value)} placeholder="Phone (10 digits, 6-9 start) *" maxLength={10} error={errors.phone} />
        <FormTextarea value={value.address} onChange={(e) => onChange('address', e.target.value)} placeholder="Address" rows={2} />
        <FormInput value={value.instagramProfileLink} onChange={(e) => onChange('instagramProfileLink', e.target.value)} placeholder="Instagram profile link (optional)" />
        <FormInput value={value.youtubeProfileLink} onChange={(e) => onChange('youtubeProfileLink', e.target.value)} placeholder="YouTube profile link (optional)" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormInput value={value.city} onChange={(e) => onChange('city', e.target.value)} placeholder="City" />
          <FormInput value={value.state} onChange={(e) => onChange('state', e.target.value)} placeholder="State" />
        </div>
        <FormInput value={value.pincode} onChange={(e) => onChange('pincode', e.target.value)} placeholder="Pincode (6 digits)" maxLength={6} error={errors.pincode} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormInput value={value.promoCode} onChange={(e) => onChange('promoCode', e.target.value)} placeholder="Promo code (optional)" />
          <FormInput value={value.referralCode} onChange={(e) => onChange('referralCode', e.target.value)} placeholder="Referral code (optional)" />
        </div>
      </div>
      <FormActions onCancel={onCancel} onSubmit={onSubmit} submitLabel="Add Promoter" submitting={submitting} />
    </FormModal>
  );
}
