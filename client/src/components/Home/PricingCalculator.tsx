import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { 
  FaCheck, 
  FaTimes, 
  FaInfoCircle, 
  FaLightbulb, 
  FaUserGraduate, 
  FaChartLine, 
  FaRocket
} from 'react-icons/fa';

// Pricing tiers and features
const pricingTiers = [
  {
    id: 'free',
    name: 'Free',
    icon: <FaLightbulb className="h-6 w-6 text-blue-400" />,
    description: 'Basic access to learn the fundamentals of AI',
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      { name: 'Access to introductory courses', included: true },
      { name: 'Limited community forum access', included: true },
      { name: 'AI readiness assessment', included: true },
      { name: 'Basic AI tools', included: true },
      { name: 'Course completion certificates', included: false },
      { name: 'Advanced learning paths', included: false },
      { name: 'Instructor feedback', included: false },
      { name: 'Hands-on projects', included: false },
      { name: 'AI job market resources', included: false },
      { name: 'Premium AI tools', included: false },
    ],
    popular: false,
    highlight: false,
    cta: 'Get Started Free',
    badge: ''
  },
  {
    id: 'basic',
    name: 'Basic',
    icon: <FaUserGraduate className="h-6 w-6 text-blue-500" />,
    description: 'Full access to beginner and intermediate content',
    monthlyPrice: 19,
    annualPrice: 192, // $16/mo paid annually
    features: [
      { name: 'Access to introductory courses', included: true },
      { name: 'Full community forum access', included: true },
      { name: 'AI readiness assessment', included: true },
      { name: 'Basic AI tools', included: true },
      { name: 'Course completion certificates', included: true },
      { name: 'Intermediate learning paths', included: true },
      { name: 'Limited instructor feedback', included: true },
      { name: 'Monthly hands-on projects', included: true },
      { name: 'AI job market resources', included: false },
      { name: 'Premium AI tools', included: false },
    ],
    popular: true,
    highlight: true,
    cta: 'Subscribe to Basic',
    badge: 'MOST POPULAR'
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: <FaChartLine className="h-6 w-6 text-blue-600" />,
    description: 'Complete access to all courses and premium features',
    monthlyPrice: 49,
    annualPrice: 490, // ~$41/mo paid annually
    features: [
      { name: 'Access to all courses', included: true },
      { name: 'Priority community forum access', included: true },
      { name: 'Advanced AI assessment & roadmap', included: true },
      { name: 'All AI tools', included: true },
      { name: 'Professional certificates', included: true },
      { name: 'All learning paths', included: true },
      { name: 'Unlimited instructor feedback', included: true },
      { name: 'Weekly hands-on projects', included: true },
      { name: 'Complete AI career resources', included: true },
      { name: 'Premium AI tools & models', included: true },
    ],
    popular: false,
    highlight: false,
    cta: 'Subscribe to Pro',
    badge: ''
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: <FaRocket className="h-6 w-6 text-blue-700" />,
    description: 'Tailored AI education solutions for organizations',
    monthlyPrice: 199,
    annualPrice: 1990, // ~$166/mo paid annually
    features: [
      { name: 'Custom course catalog', included: true },
      { name: 'Private organization forum', included: true },
      { name: 'Team assessment & progress tracking', included: true },
      { name: 'Enterprise AI tools deployment', included: true },
      { name: 'Custom certification program', included: true },
      { name: 'Customized learning paths', included: true },
      { name: 'Dedicated instructor support', included: true },
      { name: 'Custom project development', included: true },
      { name: 'Enterprise AI implementation', included: true },
      { name: 'Custom API access & integration', included: true },
    ],
    popular: false,
    highlight: false,
    cta: 'Contact Sales',
    badge: 'TEAMS'
  }
];

// Savings calculation
const calculateSavings = (monthly: number, annual: number) => {
  if (monthly === 0) return 0;
  const monthlyCost = monthly * 12;
  return Math.round(((monthlyCost - annual) / monthlyCost) * 100);
};

export default function PricingCalculator() {
  const [selectedTier, setSelectedTier] = useState('basic');
  const [isAnnual, setIsAnnual] = useState(true);
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState<string | null>(null);
  const [numUsers, setNumUsers] = useState(1);
  const [customFeaturesEnabled, setCustomFeaturesEnabled] = useState({
    aiTools: true,
    advancedCourses: true,
    careerResources: false,
    coaching: false
  });

  // Calculate price based on choices
  const calculatePrice = () => {
    const baseTier = pricingTiers.find(tier => tier.id === selectedTier);
    if (!baseTier) return 0;
    
    const basePrice = isAnnual ? baseTier.annualPrice : baseTier.monthlyPrice * 12;
    
    // Adjust for number of users (Enterprise tier scales differently)
    const userMultiplier = baseTier.id === 'enterprise' 
      ? Math.max(1, (numUsers - 5) * 0.9 + 1) // Scale price with volume discount
      : numUsers;
    
    // Calculate total
    let total = basePrice * userMultiplier;
    
    // Calculate per-user monthly price
    return {
      annual: isAnnual ? Math.round(total / 12) : Math.round(total),
      monthly: isAnnual ? Math.round(total / 12 / numUsers) : Math.round(total / numUsers)
    };
  };

  const price = calculatePrice();

  // Animation variants
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    hover: { scale: 1.03, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }
  };

  return (
    <div className="px-4 py-16 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Choose Your <span className="text-[#0066cc]">AI Learning</span> Plan
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Find the perfect subscription to accelerate your AI learning journey.
            Save up to 16% with annual billing.
          </p>
        </div>
        
        {/* Billing toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white p-1 rounded-lg shadow-sm inline-flex items-center">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !isAnnual ? 'bg-[#0066cc] text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setIsAnnual(false)}
            >
              Monthly
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isAnnual 
                  ? 'bg-[#0066cc] text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setIsAnnual(true)}
            >
              Annual <span className="text-xs font-normal opacity-90">Save 16%</span>
            </button>
          </div>
        </div>
        
        {/* Custom calculator */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-12 max-w-3xl mx-auto">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Calculate Your Subscription</h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Plan
                </label>
                <div className="flex flex-wrap gap-2">
                  {pricingTiers.map(tier => (
                    <button
                      key={tier.id}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium flex items-center ${
                        selectedTier === tier.id
                          ? 'border-[#0066cc] bg-blue-50 text-[#0066cc]'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedTier(tier.id)}
                    >
                      {tier.icon && <span className="mr-2">{tier.icon}</span>}
                      {tier.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Users
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={numUsers}
                  onChange={(e) => setNumUsers(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0066cc]"
                />
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>1</span>
                  <span>5</span>
                  <span>10</span>
                  <span>15</span>
                  <span>20+</span>
                </div>
                <div className="text-center mt-2 font-medium">
                  {numUsers} {numUsers === 1 ? 'user' : 'users'}
                </div>
              </div>
              
              <div>
                <h4 className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Features
                </h4>
                <div className="space-y-2">
                  {Object.entries(customFeaturesEnabled).map(([feature, enabled]) => (
                    <div key={feature} className="flex items-center">
                      <input
                        type="checkbox"
                        id={feature}
                        checked={enabled}
                        onChange={() => setCustomFeaturesEnabled(prev => ({
                          ...prev,
                          [feature]: !prev[feature]
                        }))}
                        className="h-4 w-4 rounded border-gray-300 text-[#0066cc] focus:ring-[#0066cc]"
                      />
                      <label htmlFor={feature} className="ml-2 text-sm text-gray-700">
                        {feature === 'aiTools' && 'AI Tools Access'}
                        {feature === 'advancedCourses' && 'Advanced Course Access'}
                        {feature === 'careerResources' && 'Career Resources & Job Board'}
                        {feature === 'coaching' && 'Personal AI Coaching'}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="font-medium text-lg text-gray-900 mb-4">Your Custom Package</h4>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-medium text-gray-900">
                    {pricingTiers.find(tier => tier.id === selectedTier)?.name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Billing:</span>
                  <span className="font-medium text-gray-900">
                    {isAnnual ? 'Annual' : 'Monthly'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Users:</span>
                  <span className="font-medium text-gray-900">{numUsers}</span>
                </div>
                
                <div className="border-t border-gray-200 my-4"></div>
                
                <div className="flex justify-between items-center text-lg">
                  <span className="text-gray-600">Total:</span>
                  <div className="text-right">
                    <div className="font-bold text-2xl text-gray-900">
                      ${price.annual}
                      <span className="text-sm font-medium text-gray-500">/mo</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      ${price.monthly} per user/month
                    </div>
                  </div>
                </div>
                
                {isAnnual && (
                  <div className="bg-green-50 text-green-700 px-3 py-2 rounded-md text-sm">
                    You save {calculateSavings(
                      pricingTiers.find(tier => tier.id === selectedTier)?.monthlyPrice || 0,
                      pricingTiers.find(tier => tier.id === selectedTier)?.annualPrice || 0
                    )}% with annual billing
                  </div>
                )}
              </div>
              
              <Link href="/subscriptionspage">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 px-4 bg-[#0066cc] hover:bg-[#0055b3] text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                  Subscribe Now
                </motion.button>
              </Link>
              
              <p className="text-xs text-gray-500 mt-4 text-center">
                Cancel anytime. All plans include a 7-day free trial.
              </p>
            </div>
          </div>
        </div>
        
        {/* Pricing cards grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pricingTiers.map((tier) => (
            <motion.div
              key={tier.id}
              variants={cardVariants}
              initial="initial"
              animate="animate"
              whileHover={tier.highlight ? "hover" : undefined}
              className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
                tier.highlight 
                  ? 'border-2 border-[#0066cc] shadow-lg' 
                  : 'border border-gray-200 bg-white shadow'
              }`}
              onMouseEnter={() => setIsHovered(tier.id)}
              onMouseLeave={() => setIsHovered(null)}
            >
              {/* Popular badge */}
              {tier.badge && (
                <div className="absolute top-0 right-0">
                  <div className="bg-[#0066cc] text-white text-xs font-bold px-3 py-1 tracking-wider transform translate-x-2 -translate-y-2 rotate-12">
                    {tier.badge}
                  </div>
                </div>
              )}
              
              <div className={`px-6 py-8 ${tier.highlight ? 'bg-blue-50' : 'bg-white'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
                  <div className="bg-white p-2 rounded-full shadow-sm">
                    {tier.icon}
                  </div>
                </div>
                
                <p className="text-gray-600 mb-5 h-12">{tier.description}</p>
                
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-extrabold text-gray-900">
                      ${isAnnual 
                        ? Math.round(tier.annualPrice / 12) 
                        : tier.monthlyPrice
                      }
                    </span>
                    <span className="ml-1 text-gray-500">/month</span>
                  </div>
                  
                  {tier.id !== 'free' && (
                    <p className="text-gray-500 text-sm mt-1">
                      {isAnnual 
                        ? `$${tier.annualPrice} billed annually` 
                        : `$${tier.monthlyPrice * 12} billed monthly`
                      }
                    </p>
                  )}
                  
                  {isAnnual && tier.id !== 'free' && (
                    <div className="mt-2 inline-block bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium">
                      Save {calculateSavings(tier.monthlyPrice, tier.annualPrice)}%
                    </div>
                  )}
                </div>
                
                <Link href={tier.id === 'enterprise' ? '/contact' : '/subscriptionspage'}>
                  <button 
                    className={`w-full py-2 px-4 rounded-lg font-medium ${
                      tier.highlight
                        ? 'bg-[#0066cc] hover:bg-[#0055b3] text-white shadow-sm' 
                        : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300'
                    } transition-colors`}
                  >
                    {tier.cta}
                  </button>
                </Link>
              </div>
              
              <div className="px-6 py-4 bg-white border-t border-gray-100">
                <h4 className="font-medium text-gray-900 mb-3">What's included:</h4>
                <ul className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <li 
                      key={index} 
                      className="flex items-start"
                      onMouseEnter={() => setIsTooltipVisible(`${tier.id}-${index}`)}
                      onMouseLeave={() => setIsTooltipVisible(null)}
                    >
                      {feature.included ? (
                        <FaCheck className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
                      ) : (
                        <FaTimes className="h-5 w-5 text-gray-300 flex-shrink-0 mr-2" />
                      )}
                      <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                        {feature.name}
                      </span>
                      
                      {isTooltipVisible === `${tier.id}-${index}` && (
                        <div className="absolute z-10 w-60 px-3 py-2 bg-gray-800 text-white text-sm rounded shadow-lg ml-6">
                          {feature.name} 
                          {feature.included 
                            ? ': Included in this plan' 
                            : ': Available in higher tier plans'
                          }
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* FAQ section */}
        <div className="mt-16 max-w-3xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h3>
          <div className="mt-8 space-y-6 text-left">
            <div>
              <h4 className="font-medium text-gray-900">Can I switch plans later?</h4>
              <p className="mt-2 text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be applied to your next billing cycle.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Do you offer refunds?</h4>
              <p className="mt-2 text-gray-600">
                We offer a 7-day free trial and a 30-day money-back guarantee if you're not satisfied with your subscription.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">What payment methods do you accept?</h4>
              <p className="mt-2 text-gray-600">
                We accept all major credit cards, PayPal, and various regional payment methods.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}