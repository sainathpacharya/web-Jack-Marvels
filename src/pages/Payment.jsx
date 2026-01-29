import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function Payment() {
  const [selectedMethod, setSelectedMethod] = useState('card');
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };
  return (
    <div>
      <header className="flex justify-between items-center px-6 md:px-20 py-5 bg-gradient-to-r from-green-100 to-blue-100 shadow">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-blue-800">
          Alpha Vlogs
        </h1>
        <div className="flex items-center gap-3">
    
          <button
            onClick={handleLogout}
            className="bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-700 transition text-sm"
          >
            Logout
          </button>
        </div>
      </header>

    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-white to-green-100 animate-pulse-slow z-0" />

      <div className="relative z-10 p-6 pt-24">
        {/* Selected Plan Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl mx-auto mb-8 text-center"
        >
          <h2 className="text-3xl font-extrabold text-green-700 mb-2">You're Choosing:</h2>
          <div className="bg-green-100 text-green-800 font-semibold py-3 px-6 rounded-xl shadow inline-block">
            💎 Premium Plan — ₹199/month
          </div>
        </motion.div>

        {/* Payment Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-2xl space-y-8"
        >
          {/* Payment Method Switch */}
          <div className="flex justify-center gap-6 flex-wrap">
            {['card', 'upi', 'netbanking', 'wallet'].map((method) => (
              <motion.button
                key={method}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedMethod(method)}
                className={`px-5 py-2 rounded-full border-2 font-medium transition ${
                  selectedMethod === method
                    ? 'bg-green-600 text-white border-green-600'
                    : 'border-gray-300 text-gray-700 hover:bg-green-100'
                }`}
              >
                {method === 'card' && '💳 Card'}
                {method === 'upi' && '📱 UPI'}
                {method === 'netbanking' && '🏦 Net Banking'}
                {method === 'wallet' && '👛 Wallet'}
              </motion.button>
            ))}
          </div>

          {/* Animated Form Display */}
          <AnimatePresence mode="wait">
            {selectedMethod === 'card' && (
              <motion.div
                key="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <label className="block mb-4">
                  <span className="font-medium text-gray-700">Card Number</span>
                  <input
                    type="text"
                    className="w-full mt-1 p-3 border rounded-lg border-gray-300"
                    placeholder="1234 5678 9012 3456"
                  />
                </label>
                <div className="flex gap-4">
                  <label className="w-1/2">
                    <span className="font-medium text-gray-700">Expiry Date</span>
                    <input
                      type="text"
                      className="w-full mt-1 p-3 border rounded-lg border-gray-300"
                      placeholder="MM/YY"
                    />
                  </label>
                  <label className="w-1/2">
                    <span className="font-medium text-gray-700">CVV</span>
                    <input
                      type="password"
                      className="w-full mt-1 p-3 border rounded-lg border-gray-300"
                      placeholder="123"
                    />
                  </label>
                </div>
              </motion.div>
            )}

            {selectedMethod === 'upi' && (
              <motion.div
                key="upi"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <label className="block">
                  <span className="font-medium text-gray-700">Enter UPI ID</span>
                  <input
                    type="text"
                    className="w-full mt-1 p-3 border rounded-lg border-gray-300"
                    placeholder="yourname@upi"
                  />
                </label>
              </motion.div>
            )}

            {selectedMethod === 'netbanking' && (
              <motion.div
                key="netbanking"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <label className="block">
                  <span className="font-medium text-gray-700">Select Bank</span>
                  <select className="w-full mt-1 p-3 border rounded-lg border-gray-300">
                    <option>State Bank of India</option>
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                    <option>Kotak Mahindra</option>
                  </select>
                </label>
              </motion.div>
            )}

            {selectedMethod === 'wallet' && (
              <motion.div
                key="wallet"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4"
              >
                {['Paytm', 'PhonePe', 'Google Pay', 'Amazon Pay'].map((wallet) => (
                  <div
                    key={wallet}
                    className="border rounded-xl py-4 text-center font-semibold text-gray-700 bg-gray-50 hover:bg-green-50 cursor-pointer"
                  >
                    {wallet}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-6 bg-green-600 text-white py-3 rounded-xl text-lg hover:bg-green-700 transition"
          >
            Pay ₹199 Now
          </motion.button>
        </motion.div>
      </div>
    </div>
    </div>
  );
}

export default Payment;
