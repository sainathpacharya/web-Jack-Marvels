import React from 'react';
import bgImage from '../assets/images/bg.jpg';
function Subscribe() {
  const plans = [
    { duration: '1 Month', price: '₹199' },
    { duration: '3 Months', price: '₹499' },
    { duration: '12 Months', price: '₹1499' },
  ];

  return (
    <div className="min-h-screen bg-green-50 p-6 pt-28" style={{
      backgroundImage: `url(${bgImage})`,
    }}>
      <h2 className="text-3xl font-bold text-green-700 mb-8 text-center">Subscribe</h2>
      <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-lg p-6 text-center border border-green-200 hover:shadow-xl transition"
          >
            <h3 className="text-xl font-semibold text-green-700 mb-2">{plan.duration}</h3>
            <p className="text-lg text-green-800 font-bold">{plan.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Subscribe;
