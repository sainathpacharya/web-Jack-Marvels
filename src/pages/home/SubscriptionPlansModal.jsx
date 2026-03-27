import React, { memo } from 'react';

function SubscriptionPlansModal({ open, onCloseAndPay }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl p-8 relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
          onClick={onCloseAndPay}
        >
          ✕
        </button>
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-indigo-700 mb-6">Choose the Right Plan for You</h2>
        <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
          Unlock exclusive benefits and participate in more events by selecting a subscription plan that fits your needs.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="border-2 border-yellow-300 rounded-2xl p-6 bg-yellow-50 hover:shadow-xl transition">
            <h3 className="text-xl font-bold text-yellow-600 mb-2">Basic Plan</h3>
            <p className="text-3xl font-extrabold text-yellow-700 mb-2">₹99 <span className="text-base font-medium">/month</span></p>
            <ul className="text-gray-700 text-sm space-y-2 mb-4">
              <li>Access to 5 events</li>
              <li>Standard support</li>
              <li>Email notifications</li>
            </ul>
            <button className="w-full bg-yellow-500 text-white py-2 rounded-xl hover:bg-yellow-600 transition" onClick={onCloseAndPay}>Choose Basic</button>
          </div>
          <div className="border-4 border-green-500 rounded-2xl p-6 bg-white shadow-lg transform scale-105">
            <h3 className="text-xl font-bold text-green-600 mb-2">Premium Plan</h3>
            <p className="text-3xl font-extrabold text-green-700 mb-2">₹199 <span className="text-base font-medium">/month</span></p>
            <ul className="text-gray-700 text-sm space-y-2 mb-4">
              <li>Unlimited event access</li>
              <li>Priority support</li>
              <li>Participation certificates</li>
              <li>Early event registration</li>
            </ul>
            <button className="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition" onClick={onCloseAndPay}>Choose Premium</button>
          </div>
          <div className="border-2 border-indigo-300 rounded-2xl p-6 bg-indigo-50 hover:shadow-xl transition">
            <h3 className="text-xl font-bold text-indigo-600 mb-2">Annual Plan</h3>
            <p className="text-3xl font-extrabold text-indigo-700 mb-2">₹999 <span className="text-base font-medium">/year</span></p>
            <ul className="text-gray-700 text-sm space-y-2 mb-4">
              <li>All Premium benefits</li>
              <li>Free merchandise kit</li>
              <li>1:1 mentor session (yearly)</li>
              <li>Priority email + phone support</li>
            </ul>
            <button className="w-full bg-indigo-600 text-white py-2 rounded-xl hover:bg-indigo-700 transition" onClick={onCloseAndPay}>Choose Annual</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(SubscriptionPlansModal);
