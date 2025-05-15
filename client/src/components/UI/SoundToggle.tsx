import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSoundEffects } from '@/hooks/use-sound-effects';
import { motion } from 'framer-motion';

/**
 * Apple-inspired sound toggle button
 * 
 * This component allows users to toggle sound effects on/off
 * with an Apple-like design aesthetic and subtle animations.
 */
const SoundToggle: React.FC = () => {
  const { isMuted, toggleMute, playSound } = useSoundEffects();
  
  const handleToggle = () => {
    toggleMute();
    
    // Play notification sound when unmuting
    if (isMuted) {
      // We need to wait for the mute state to change
      setTimeout(() => playSound('notification'), 10);
    }
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggle}
              className="h-9 w-9 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label={isMuted ? "Enable sound effects" : "Disable sound effects"}
            >
              {isMuted ? (
                <VolumeX size={18} />
              ) : (
                <Volume2 size={18} />
              )}
            </Button>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-gray-800 text-white dark:bg-gray-700 rounded-xl text-xs py-1 px-2 shadow-lg">
          <p>{isMuted ? "Enable sound effects" : "Disable sound effects"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SoundToggle;