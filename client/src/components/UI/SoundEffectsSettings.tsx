import React from 'react';
import SoundToggle from '@/components/UI/SoundToggle';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import SoundButton from '@/components/UI/SoundButton';
import { VolumeX, Volume2 } from 'lucide-react';
import { useSoundEffects } from '@/hooks/use-sound-effects';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface SoundEffectsSettingsProps {
  className?: string;
}

/**
 * Component for controlling sound effect settings
 */
export const SoundEffectsSettings: React.FC<SoundEffectsSettingsProps> = ({ className }) => {
  const { 
    settings, 
    toggleSounds, 
    setVolume, 
    playSound 
  } = useSoundEffects();
  
  const soundEnabled = settings.enabled;

  // Play a test sound with current volume
  const handleTestSound = () => {
    if (soundEnabled) {
      playSound('notification');
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Sound Effects</CardTitle>
        <CardDescription>Customize the audio experience of the platform</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="sound-enabled" className="flex items-center cursor-pointer">
            {soundEnabled ? <Volume2 className="mr-2 h-4 w-4" /> : <VolumeX className="mr-2 h-4 w-4" />}
            <span>Enable sound effects</span>
          </Label>
          <SoundToggle 
            id="sound-enabled" 
            checked={soundEnabled} 
            onToggle={setSoundEnabled}
            soundOnChecked="success"
            soundOnUnchecked="click"
          />
        </div>
        
        <div className={`space-y-2 ${!soundEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between">
            <Label htmlFor="volume-slider">Volume</Label>
            <span className="text-sm text-muted-foreground">{Math.round(volume * 100)}%</span>
          </div>
          <Slider
            id="volume-slider"
            min={0}
            max={1}
            step={0.05}
            value={[volume]}
            onValueChange={(values) => setVolume(values[0])}
            className="w-full"
            disabled={!soundEnabled}
          />
        </div>
        
        <SoundButton 
          variant="outline" 
          size="sm" 
          onClick={handleTestSound}
          disabled={!soundEnabled}
          className="w-full mt-2"
          soundEffect="notification"
        >
          Test Sound
        </SoundButton>
        
        <p className="text-xs text-muted-foreground mt-4">
          Sound effects provide subtle audio feedback for actions like completing tasks, receiving notifications, and more.
        </p>
      </CardContent>
    </Card>
  );
};

export default SoundEffectsSettings;