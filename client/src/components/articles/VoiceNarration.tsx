import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Settings,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { trackEvent } from '@/lib/analytics';

interface VoiceNarrationProps {
  content: string;
  title: string;
}

const VoiceNarration: React.FC<VoiceNarrationProps> = ({ content, title }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [currentSection, setCurrentSection] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  
  // Convert markdown content to plain text for speech synthesis
  const plainTextContent = content
    .replace(/#+\s(.*)/g, '$1. ') // Replace headings with text and period
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markers
    .replace(/\*(.*?)\*/g, '$1') // Remove italic markers
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1') // Extract link text
    .replace(/```([\s\S]*?)```/g, 'Code block. ') // Replace code blocks
    .replace(/`(.*?)`/g, '$1') // Remove inline code markers
    .replace(/\n+/g, ' ') // Replace multiple newlines with space
    .trim();
  
  // Split content into manageable sections for speech synthesis
  const sections = [
    `${title}.`, // Start with the title
    ...plainTextContent.split(/(?<=\.)\s+(?=[A-Z])/).filter(Boolean) // Split by sentences
  ];
  
  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // Get available voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        
        // Select an English voice by default
        const englishVoice = voices.find(voice => 
          voice.lang.includes('en') && voice.name.includes('Google') || 
          voice.lang.includes('en-US') || 
          voice.lang.includes('en-GB')
        ) || voices[0];
        
        setSelectedVoice(englishVoice);
        setIsInitialized(true);
      };

      loadVoices();
      
      // Chrome requires waiting for voices to load
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
      }
      
      // Clean up on unmount
      return () => {
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      };
    }
  }, []);

  // Handle play/pause toggle
  const togglePlay = () => {
    if (!isInitialized || !window.speechSynthesis) return;
    
    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      trackEvent('narration_paused', 'engagement', title);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      } else {
        speakSection(currentSection);
        trackEvent('narration_started', 'engagement', title);
      }
      setIsPlaying(true);
    }
  };
  
  // Speak a specific section of content
  const speakSection = (sectionIndex: number) => {
    if (!isInitialized || !window.speechSynthesis || !selectedVoice) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    if (sectionIndex >= sections.length) {
      setIsPlaying(false);
      setCurrentSection(0);
      return;
    }
    
    setCurrentSection(sectionIndex);
    
    // Create utterance for current section
    const utterance = new SpeechSynthesisUtterance(sections[sectionIndex]);
    utterance.voice = selectedVoice;
    utterance.rate = rate;
    utterance.volume = isMuted ? 0 : volume;
    
    // When this section ends, move to the next one
    utterance.onend = () => {
      speakSection(sectionIndex + 1);
    };
    
    // Handle errors
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsPlaying(false);
    };
    
    // Store reference to current utterance
    utteranceRef.current = utterance;
    
    // Start speaking
    window.speechSynthesis.speak(utterance);
  };
  
  // Skip to previous section
  const prevSection = () => {
    const newSection = Math.max(0, currentSection - 1);
    if (isPlaying) {
      speakSection(newSection);
    } else {
      setCurrentSection(newSection);
    }
  };
  
  // Skip to next section
  const nextSection = () => {
    const newSection = Math.min(sections.length - 1, currentSection + 1);
    if (isPlaying) {
      speakSection(newSection);
    } else {
      setCurrentSection(newSection);
    }
  };
  
  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    
    if (utteranceRef.current && isPlaying) {
      utteranceRef.current.volume = isMuted ? volume : 0;
    }
  };
  
  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    
    if (utteranceRef.current && isPlaying) {
      utteranceRef.current.volume = isMuted ? 0 : newVolume;
    }
  };
  
  // Handle rate change
  const handleRateChange = (value: number[]) => {
    const newRate = value[0];
    setRate(newRate);
    
    if (utteranceRef.current && isPlaying) {
      utteranceRef.current.rate = newRate;
    }
  };
  
  // Handle voice change
  const handleVoiceChange = (voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice);
    
    if (isPlaying) {
      // Restart current section with new voice
      speakSection(currentSection);
    }
  };
  
  const progressPercentage = 
    sections.length > 0 ? (currentSection / sections.length) * 100 : 0;
  
  return (
    <div className="bg-gray-900 rounded-lg p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-white">Listen to Article</span>
        
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMute}
            className="h-7 w-7 text-gray-300 hover:text-white hover:bg-gray-800"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-7 w-7 text-gray-300 hover:text-white hover:bg-gray-800"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="top" className="w-80">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Voice</h4>
                  <select 
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                    onChange={(e) => {
                      const voice = availableVoices.find(v => v.name === e.target.value);
                      if (voice) handleVoiceChange(voice);
                    }}
                    value={selectedVoice?.name}
                  >
                    {availableVoices.map((voice) => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium">Speed</h4>
                    <span className="text-sm">{rate.toFixed(1)}x</span>
                  </div>
                  <Slider
                    value={[rate]}
                    min={0.5}
                    max={2}
                    step={0.1}
                    onValueChange={handleRateChange}
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium">Volume</h4>
                    <span className="text-sm">{Math.round(volume * 100)}%</span>
                  </div>
                  <Slider
                    value={[volume]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="h-1 w-full bg-gray-800 rounded mb-3">
        <div 
          className="h-full bg-blue-600 rounded"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      {/* Playback controls */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevSection}
          disabled={currentSection === 0}
          className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-800 disabled:opacity-50"
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        
        <Button
          variant="default"
          size="default"
          onClick={togglePlay}
          className="h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={nextSection}
          disabled={currentSection >= sections.length - 1}
          className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-800 disabled:opacity-50"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default VoiceNarration;