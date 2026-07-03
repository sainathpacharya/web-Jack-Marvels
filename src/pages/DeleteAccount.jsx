import React, { useEffect } from 'react';

const APP_NAME = 'Alpha Vlogs';
const TAGLINE = "Discover Your Child's Talent";
const CONTACT_EMAIL = 'support@alphavlogs.com';

const STEPS = [
  <>Open the <strong>{APP_NAME}</strong> app on your device.</>,
  <>Tap the <strong>Profile</strong> icon in the top-right corner of the home screen.</>,
  <>Scroll down and tap <strong>&quot;Delete Account&quot;</strong>.</>,
  <>Confirm your choice in the two confirmation dialogs that appear.</>,
  <>Your account will be <strong>permanently deleted immediately</strong> and you will be signed out.</>,
];

const DELETED_DATA = [
  'Your profile and account information',
  'Your registered phone number',
  'Your login credentials and OTP access',
  'All activity, preferences, and settings',
  'Access to premium subscriptions',
];

const RETAINED_DATA = [
  'Anonymised deletion log (for compliance) — retained 90 days, then auto-deleted',
  'Subscription billing records (required by payment law) — retained as per applicable law',
];

function StepNumber({ n }) {
  return (
    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-orange text-sm font-semibold text-white">
      {n}
    </span>
  );
}

function XIcon() {
  return (
    <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  );
}

export default function DeleteAccount() {
  useEffect(() => {
    document.title = `Delete Your Account | ${APP_NAME}`;
    return () => {
      document.title = 'Alpha Vlogs App';
    };
  }, []);

  return (
    <div className="theme-page py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <img
            src="/alpha-vlogs-logo.png"
            alt={`${APP_NAME} logo`}
            className="w-14 h-14 rounded-full object-cover"
          />
          <div>
            <h1 className="text-xl font-bold text-gray-900">{APP_NAME}</h1>
            <p className="text-sm text-gray-500">{TAGLINE}</p>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-red-600 mb-3">
          Delete Your Account
        </h2>
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-8">
          You can delete your account and associated data directly from within the {APP_NAME} app.
          Follow the steps below to permanently remove your account.
        </p>

        {/* Steps */}
        <h3 className="text-xs font-bold tracking-wider text-gray-900 mb-4">
          HOW TO DELETE YOUR ACCOUNT
        </h3>
        <ol className="space-y-4 mb-8">
          {STEPS.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <StepNumber n={i + 1} />
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed pt-0.5">{step}</p>
            </li>
          ))}
        </ol>

        {/* Data deleted */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-4">
          <h4 className="text-sm font-bold text-red-600 mb-3">
            Data that will be permanently deleted:
          </h4>
          <ul className="space-y-2">
            {DELETED_DATA.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                <XIcon />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Data retained */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-4">
          <h4 className="text-sm font-bold text-blue-700 mb-3">
            Data that may be retained temporarily:
          </h4>
          <ul className="space-y-2">
            {RETAINED_DATA.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckIcon />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Note */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8">
          <div className="flex items-start gap-3">
            <ClockIcon />
            <p className="text-sm text-gray-700 leading-relaxed">
              All personal data is deleted <strong>immediately</strong> upon confirmation.
              Only anonymised compliance logs are retained for up to 90 days as required by
              applicable data protection laws.
            </p>
          </div>
        </div>

        {/* Contact */}
        <p className="text-sm text-gray-600 text-center leading-relaxed mb-6">
          Can&apos;t access the app or need help? Contact us at{' '}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-blue-600 font-medium hover:underline"
          >
            {CONTACT_EMAIL}
          </a>{' '}
          and we will process your deletion request within{' '}
          <strong>7 working days</strong>.
        </p>

        {/* Compliance badge */}
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-medium px-4 py-2 rounded-full">
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Committed to Google Play Families Policy
          </span>
        </div>
      </div>
    </div>
  );
}
