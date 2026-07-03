import React from 'react';
import bgImage from '../assets/images/bg.jpg';

function Subscribe() {
  const plans = [
    { duration: '1 Month', price: '₹199' },
    { duration: '3 Months', price: '₹499' },
    { duration: '12 Months', price: '₹1499' },
  ];

  return (
    <div
      className="theme-page bg-cover bg-center bg-no-repeat pt-28"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <h2 className="theme-page-title text-center">Subscribe</h2>
      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-3">
        {plans.map((plan, index) => (
          <div key={index} className="theme-card text-center transition hover:shadow-lg">
            <h3 className="mb-2 font-script text-2xl text-purple-800">{plan.duration}</h3>
            <p className="font-display text-lg font-bold text-brand-orange">{plan.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Subscribe;
