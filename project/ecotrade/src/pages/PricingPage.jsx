import React from 'react';
import { Check } from 'lucide-react';

const PricingPage = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'month',
      description: 'Perfect for getting started',
      features: [
        'Up to 5 RFQs per month',
        'Basic search and filters',
        'Email support',
        'Community access'
      ],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'Pro',
      price: '$99',
      period: 'month',
      description: 'For growing businesses',
      features: [
        'Unlimited RFQs',
        'Advanced search and filters',
        'Priority support',
        'Analytics dashboard',
        'Custom integrations',
        'NDA management'
      ],
      cta: 'Upgrade to Pro',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large organizations',
      features: [
        'Everything in Pro',
        'Dedicated account manager',
        'Custom workflows',
        'API access',
        'SLA guarantee',
        'On-premise deployment option'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Pricing Plans</h1>
        <p className="text-xl text-gray-600">Choose the plan that fits your needs</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`bg-white border-2 rounded-lg p-8 ${
              plan.popular
                ? 'border-[#4881F8] shadow-lg scale-105'
                : 'border-gray-200'
            }`}
          >
            {plan.popular && (
              <div className="bg-[#4881F8] text-white text-center py-1 rounded-full text-sm font-medium mb-4 -mt-4">
                Most Popular
              </div>
            )}
            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
            <p className="text-gray-600 mb-6">{plan.description}</p>
            <div className="mb-6">
              <span className="text-4xl font-bold">{plan.price}</span>
              {plan.period && <span className="text-gray-600">/{plan.period}</span>}
            </div>
            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start">
                  <Check size={20} className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <button
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                plan.popular
                  ? 'bg-[#4881F8] text-white hover:bg-[#3b6fe0]'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-gray-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Need a custom solution?</h2>
        <p className="text-gray-600 mb-6">Contact us to discuss your specific requirements</p>
        <button className="px-6 py-2 bg-[#4881F8] text-white rounded-lg hover:bg-[#3b6fe0] transition-colors">
          Contact Sales
        </button>
      </div>
    </div>
  );
};

export default PricingPage;

