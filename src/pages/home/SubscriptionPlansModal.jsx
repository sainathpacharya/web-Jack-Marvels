import React, { memo } from 'react';

function SubscriptionPlansModal({ open, onCloseAndPay }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4">
      <div className="theme-card-lg relative w-full max-w-5xl">
        <button
          className="absolute right-4 top-4 text-xl text-gray-500 hover:text-black"
          onClick={onCloseAndPay}
        >
          ✕
        </button>
        <h2 className="theme-page-title text-center">Choose the Right Plan for You</h2>
        <p className="mx-auto mb-10 max-w-2xl text-center font-body text-gray-600">
          Unlock exclusive benefits and participate in more events by selecting a subscription plan that fits your needs.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="border-2 border-yellow-300 rounded-2xl p-6 bg-yellow-50 hover:shadow-xl transition">
            <h3 className="mb-2 font-script text-2xl text-yellow-600">Basic Plan</h3>
            <p className="mb-2 font-display text-3xl font-bold text-yellow-700">₹99 <span className="text-base font-medium">/month</span></p>
            <ul className="mb-4 space-y-2 font-body text-sm text-gray-700">
              <li>Access to 5 events</li>
              <li>Standard support</li>
              <li>Email notifications</li>
            </ul>
            <button className="w-full rounded-xl bg-yellow-500 py-2 font-script text-lg font-bold text-white transition hover:bg-yellow-600" onClick={onCloseAndPay}>Choose Basic</button>
          </div>
          <div className="scale-105 transform rounded-2xl border-4 border-brand-orange bg-white p-6 shadow-lg">
            <h3 className="mb-2 font-script text-2xl text-brand-orange">Premium Plan</h3>
            <p className="mb-2 font-display text-3xl font-bold text-brand-orange">₹199 <span className="text-base font-medium">/month</span></p>
            <ul className="mb-4 space-y-2 font-body text-sm text-gray-700">
              <li>Unlimited event access</li>
              <li>Priority support</li>
              <li>Participation certificates</li>
              <li>Early event registration</li>
            </ul>
            <button className="theme-btn-primary w-full py-2" onClick={onCloseAndPay}>Choose Premium</button>
          </div>
          <div className="rounded-2xl border-2 border-purple-200 bg-white/70 p-6 transition hover:shadow-xl">
            <h3 className="mb-2 font-script text-2xl text-purple-700">Annual Plan</h3>
            <p className="mb-2 font-display text-3xl font-bold text-purple-800">₹999 <span className="text-base font-medium">/year</span></p>
            <ul className="mb-4 space-y-2 font-body text-sm text-gray-700">
              <li>All Premium benefits</li>
              <li>Free merchandise kit</li>
              <li>1:1 mentor session (yearly)</li>
              <li>Priority email + phone support</li>
            </ul>
            <button className="theme-btn-accent w-full py-2" onClick={onCloseAndPay}>Choose Annual</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(SubscriptionPlansModal);
