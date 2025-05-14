import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Lock, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

interface UpsellPromptProps {
  type: 'tools' | 'courses' | 'content-calendar' | 'analytics' | 'code-assistant';
  currentTier?: 'free' | 'basic' | 'pro' | 'enterprise';
  requiredTier: 'basic' | 'pro' | 'enterprise';
  feature?: string;
  className?: string;
}

const UpsellPrompt: React.FC<UpsellPromptProps> = ({ 
  type, 
  currentTier = 'free', 
  requiredTier, 
  feature,
  className 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const { user } = useAuth();

  // If user is on a plan that already has access to this feature, don't show the upsell
  if (
    (requiredTier === 'basic' && ['basic', 'pro', 'enterprise'].includes(currentTier)) ||
    (requiredTier === 'pro' && ['pro', 'enterprise'].includes(currentTier)) ||
    (requiredTier === 'enterprise' && currentTier === 'enterprise')
  ) {
    return null;
  }

  // Get tier-specific messaging
  const getTierInfo = () => {
    switch (requiredTier) {
      case 'basic':
        return {
          name: 'Basic',
          price: '$19',
          color: 'blue',
          features: ['All Core Features', 'Unlimited Tool Usage', 'Basic Support']
        };
      case 'pro':
        return {
          name: 'Pro',
          price: '$49',
          color: 'purple',
          features: ['All Basic Features', 'Advanced Analytics', 'Priority Support', 'Custom Integrations']
        };
      case 'enterprise':
        return {
          name: 'Enterprise',
          price: '$199',
          color: 'gold',
          features: ['All Pro Features', 'Dedicated Support', 'Custom Solutions', 'Advanced Security']
        };
    }
  };

  // Get context-specific messaging
  const getTypeInfo = () => {
    switch (type) {
      case 'tools':
        return {
          title: `Unlock Unlimited Access to All Tools`,
          description: `Upgrade to ${requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} to access unlimited tools without restrictions.`
        };
      case 'courses':
        return {
          title: `Unlock Premium AI Courses`,
          description: `Upgrade to ${requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} to access all courses including ${feature || 'premium content'}.`
        };
      case 'content-calendar':
        return {
          title: `Unlock Advanced Content Calendar Features`,
          description: `Upgrade to ${requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} to access ${feature || 'advanced content generation and scheduling'}.`
        };
      case 'analytics':
        return {
          title: `Unlock Comprehensive Analytics Dashboard`,
          description: `Upgrade to ${requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} to access detailed analytics and performance metrics.`
        };
      case 'code-assistant':
        return {
          title: `Unlock Advanced Code Assistant Features`,
          description: `Upgrade to ${requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} to access ${feature || 'advanced code generation and optimization features'}.`
        };
      default:
        return {
          title: `Unlock Premium Features`,
          description: `Upgrade to ${requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} to access all premium features.`
        };
    }
  };

  const tierInfo = getTierInfo();
  const typeInfo = getTypeInfo();

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className={`w-full border border-blue-500/20 bg-blue-950/10 rounded-lg overflow-hidden ${className}`}
      >
        <div className="relative p-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-7 w-7 text-gray-400 hover:text-white hover:bg-blue-900/20"
            onClick={handleClose}
          >
            <X size={16} />
            <span className="sr-only">Close</span>
          </Button>

          <div className="flex items-start gap-3">
            <div className="mt-1 h-8 w-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
              <Lock size={18} />
            </div>
            <div className="space-y-2 pr-6">
              <div>
                <h3 className="text-base font-medium text-white">{typeInfo.title}</h3>
                <p className="text-sm text-gray-300">{typeInfo.description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-3 text-sm">
                <Link href="/pricing">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Upgrade to {tierInfo.name}
                  </Button>
                </Link>
                <Button variant="link" className="text-blue-400 hover:text-blue-300 px-0">
                  Learn more <ChevronRight size={14} className="ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-4 py-3 bg-gradient-to-r from-blue-600/10 to-blue-900/10 border-t border-blue-500/10">
          <div className="flex items-center gap-2 mb-2">
            <Star size={14} className="text-blue-400" />
            <span className="text-sm font-medium text-white">{tierInfo.name} Plan Features:</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-1">
            {tierInfo.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-1.5 text-xs text-gray-300">
                <CheckCircle size={12} className="text-blue-400" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UpsellPrompt;