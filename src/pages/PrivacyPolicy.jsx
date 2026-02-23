import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const LAST_UPDATED = 'February 23, 2025';
const APP_NAME = 'Alpha Vlogs';
const CONTACT_EMAIL = 'smileyscr@gmail.com';

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = `Privacy Policy | ${APP_NAME}`;
    return () => {
      document.title = 'Alpha Vlogs App';
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Privacy Policy
            </h1>
            <Link
              to="/"
              className="text-sm font-medium text-green-600 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <article className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-10">
          <p className="text-sm text-gray-500 mb-8">
            Last updated: {LAST_UPDATED}
          </p>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              1. Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed">
              This Privacy Policy describes how <strong>{APP_NAME}</strong> (“we”, “our”, or “us”) collects, uses, and shares information when you use our mobile application. By using {APP_NAME}, you agree to the practices described in this policy. If you do not agree, please do not use the app.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              2. Information We Collect
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We may collect the following types of information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>
                <strong>Device information:</strong> Device type, operating system, unique device identifiers, and similar technical data.
              </li>
              <li>
                <strong>Usage data:</strong> How you use the app, features you access, and interaction with content.
              </li>
              <li>
                <strong>Account information:</strong> If you create an account, we may collect name, email, and other details you provide.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              3. Internet and Network Usage
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {APP_NAME} requires internet access to provide core features. When you use the app, we may collect data related to your network usage (e.g., connection type, general location inferred from IP) to deliver and improve the service. We do not track your browsing history outside the app.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              4. Analytics
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We use basic analytics to understand how users interact with the app (e.g., screen views, feature usage). This helps us fix issues and improve the product. Analytics data is aggregated and does not personally identify you unless you have an account and we link usage to that account as described in this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              5. Google Play Services
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our app may use Google Play Services (e.g., for updates, authentication, or other features). Use of the app is also subject to the Google Play Terms of Service and the Google Privacy Policy. Google may collect and process data as described in their policies when you use our app on Android.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              6. How We Use Your Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Provide, maintain, and improve the app;</li>
              <li>Personalize your experience where applicable;</li>
              <li>Send important notices (e.g., security or policy changes);</li>
              <li>Comply with legal obligations and protect our rights.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              7. Sharing of Information
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We do not sell your personal information. We may share data with service providers who assist in operating the app (e.g., hosting, analytics) under strict confidentiality. We may also disclose information if required by law or to protect our users and rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              8. Data Security
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We implement reasonable technical and organizational measures to protect your data. No method of transmission or storage is 100% secure; we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              9. Children’s Privacy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {APP_NAME} is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us and we will delete it promptly.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              10. Your Rights and Choices
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Depending on your region, you may have rights to access, correct, or delete your personal data. You can also limit certain permissions (e.g., location) in your device settings. To exercise your rights or ask questions, contact us at the email below.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              11. Changes to This Policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will post the updated policy in the app and update the “Last updated” date. Continued use of the app after changes constitutes acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              12. Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed">
              For privacy-related questions or requests, contact us at:{' '}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-green-600 hover:text-green-700 font-medium underline focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
              >
                {CONTACT_EMAIL}
              </a>
            </p>
          </section>
        </article>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
          >
            ← Return to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
