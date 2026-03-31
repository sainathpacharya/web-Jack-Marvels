import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import FormInput from '../components/forms/common/FormInput';
import FormTextarea from '../components/forms/common/FormTextarea';
import FormActions from '../components/forms/common/FormActions';
import { useProfileQuery, useUpdateProfileMutation } from '../features/profile/hooks/useProfileQuery';
import { useNotifications } from '../components/notifications/NotificationProvider';
import { digitsOnly, normalizeEmail, profileFormSchema, sanitizeTextInput } from '../lib/validation';
import { extractFieldErrorsFromCaughtError } from '../lib/validation/apiFieldErrors';

export default function ProfileScreen() {
  const navigate = useNavigate();
  const { success, error: notifyError } = useNotifications();
  const { data: profile, isLoading: profileLoading } = useProfileQuery();
  const updateProfileMutation = useUpdateProfileMutation();

  const defaults = useMemo(
    () => ({
      fullName: '',
      email: '',
      phone: '',
      address: '',
      profilePicture: '',
    }),
    []
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors, isDirty, isValid },
  } = useForm({
    resolver: zodResolver(profileFormSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: defaults,
  });

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        profilePicture: profile.profilePicture || '',
      });
    }
  }, [profile, reset]);

  const profileImage = watch('profilePicture');

  const onSubmit = async (values) => {
    const payload = {
      fullName: sanitizeTextInput(values.fullName, { maxLen: 200 }),
      email: normalizeEmail(values.email),
      phone: digitsOnly(values.phone),
      address: values.address ? sanitizeTextInput(values.address, { maxLen: 2000 }) : '',
      profilePicture: values.profilePicture
        ? sanitizeTextInput(values.profilePicture, { maxLen: 2000 })
        : '',
    };
    try {
      await updateProfileMutation.mutateAsync(payload);
      success('Profile updated successfully.');
    } catch (error) {
      const fieldErrors = extractFieldErrorsFromCaughtError(error);
      const keys = Object.keys(fieldErrors);
      if (keys.length) {
        keys.forEach((k) => setError(k, { message: fieldErrors[k] }));
      }
      notifyError(error?.message || 'Failed to update profile.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
        <p className="mt-1 text-sm text-gray-600">View and update your personal details.</p>

        {profileLoading ? <p className="mt-4 text-sm text-gray-600">Loading profile...</p> : null}

        <form className="mt-5 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormInput
            placeholder="Full Name"
            error={errors.fullName?.message}
            {...register('fullName')}
          />
          <FormInput
            placeholder="Email"
            error={errors.email?.message}
            autoComplete="email"
            {...register('email')}
          />
          <FormInput
            placeholder="Phone Number"
            maxLength={10}
            inputMode="numeric"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <FormInput
            placeholder="Profile Picture URL (optional)"
            error={errors.profilePicture?.message}
            {...register('profilePicture')}
          />
          <FormTextarea rows={3} placeholder="Address (optional)" error={errors.address?.message} {...register('address')} />

          {profileImage ? (
            <img src={profileImage} alt="Profile" className="h-20 w-20 rounded-full border border-gray-200 object-cover" />
          ) : null}

          <div className="grid grid-cols-1 gap-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700 sm:grid-cols-2">
            <p>
              <span className="font-semibold">Role:</span> {profile?.role || '-'}
            </p>
            <p>
              <span className="font-semibold">User ID:</span> {profile?.userId || '-'}
            </p>
            <p className="sm:col-span-2">
              <span className="font-semibold">Created Date:</span> {profile?.createdAt || '-'}
            </p>
          </div>

          <FormActions
            onCancel={() =>
              reset({
                fullName: profile?.fullName || '',
                email: profile?.email || '',
                phone: profile?.phone || '',
                address: profile?.address || '',
                profilePicture: profile?.profilePicture || '',
              })
            }
            onSubmit={handleSubmit(onSubmit)}
            submitLabel="Save Changes"
            submitting={updateProfileMutation.isPending}
            submitDisabled={!isDirty || !isValid}
          />
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full rounded-lg border border-gray-300 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
        </form>
      </div>
    </div>
  );
}
