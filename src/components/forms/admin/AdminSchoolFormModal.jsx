import React from 'react';
import FormModal from '../common/FormModal';
import FormInput from '../common/FormInput';
import FormTextarea from '../common/FormTextarea';
import FormActions from '../common/FormActions';

export default function AdminSchoolFormModal({
  title,
  value,
  errors,
  onChange,
  onCancel,
  onSubmit,
  submitting = false,
  submitLabel,
}) {
  return (
    <FormModal title={title} onClose={onCancel}>
      <div className="space-y-3">
        <FormInput value={value.name} onChange={(e) => onChange('name', e.target.value)} placeholder="School name *" error={errors.name} />
        <FormInput value={value.email} onChange={(e) => onChange('email', e.target.value)} placeholder="Email (optional)" />
        <FormTextarea value={value.address} onChange={(e) => onChange('address', e.target.value)} placeholder="Address" rows={2} error={errors.address} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormInput value={value.city} onChange={(e) => onChange('city', e.target.value)} placeholder="City" error={errors.city} />
          <FormInput value={value.state} onChange={(e) => onChange('state', e.target.value)} placeholder="State" error={errors.state} />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormInput value={value.pincode} onChange={(e) => onChange('pincode', e.target.value)} placeholder="Pincode (6 digits)" maxLength={6} error={errors.pincode} />
          <FormInput value={value.contactName} onChange={(e) => onChange('contactName', e.target.value)} placeholder="Contact person name" error={errors.contactName} />
        </div>
        <FormInput value={value.contactPhone} onChange={(e) => onChange('contactPhone', e.target.value)} placeholder="Contact mobile (mandatory) *" maxLength={10} error={errors.contactPhone} />
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Does the school have branches?</label>
          <div className="flex gap-6">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="radio" name="hasBranches" checked={value.hasBranches === true} onChange={() => onChange('hasBranches', true)} className="h-4 w-4 text-blue-600" />
              <span>Yes</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input type="radio" name="hasBranches" checked={value.hasBranches === false} onChange={() => onChange('hasBranches', false)} className="h-4 w-4 text-blue-600" />
              <span>No</span>
            </label>
          </div>
        </div>
        {value.hasBranches ? (
          <FormInput value={value.branchCode} onChange={(e) => onChange('branchCode', e.target.value)} placeholder="Branch code *" error={errors.branchCode} />
        ) : null}
      </div>
      <FormActions onCancel={onCancel} onSubmit={onSubmit} submitLabel={submitLabel} submitting={submitting} />
    </FormModal>
  );
}
