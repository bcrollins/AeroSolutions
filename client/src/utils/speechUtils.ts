/**
 * Utility for working with the Web Speech API
 * Provides speech synthesis and recognition services
 */

// Speech Synthesis Types
export type SpeechVoiceInfo = {
  voice: SpeechSynthesisVoice;
  name: string;
  lang: string;
  isDefault: boolean;
  isLocalService: boolean;
};

export type SpeechOptions = {
  text: string;
  voice?: SpeechSynthesisVoice;
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
};

export type SpeechRecognitionOptions = {
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  lang?: string;
};

// Compatibility helpers
const SpeechRecognitionAPI = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
const SpeechGrammarListAPI = window.SpeechGrammarList || (window as any).webkitSpeechGrammarList;

// Check for browser support
export const isSpeechSynthesisSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
export const isSpeechRecognitionSupported = typeof window !== 'undefined' && (SpeechRecognitionAPI !== undefined);

// State variables
let speechSynthesisInitialized = false;
let availableVoices: SpeechVoiceInfo[] = [];
let defaultVoice: SpeechSynthesisVoice | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;
let currentRecognition: any = null; // SpeechRecognition instance

/**
 * Initialize the speech synthesis system
 * @returns Promise that resolves when voices are loaded
 */
export function initSpeechSynthesis(): Promise<void> {
  if (!isSpeechSynthesisSupported) {
    return Promise.reject(new Error('Speech synthesis is not supported in this browser'));
  }
  
  if (speechSynthesisInitialized) {
    return Promise.resolve();
  }
  
  return new Promise((resolve, reject) => {
    try {
      // Function to process available voices
      const processVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        
        if (voices.length === 0) {
          // Some browsers might need an additional wait
          setTimeout(processVoices, 100);
          return;
        }
        
        availableVoices = voices.map(voice => ({
          voice,
          name: voice.name,
          lang: voice.lang,
          isDefault: voice.default,
          isLocalService: voice.localService,
        }));
        
        // Find default voice
        defaultVoice = voices.find(voice => voice.default) || 
                      voices.find(voice => voice.lang.includes('en-US')) || 
                      voices[0] || null;
        
        speechSynthesisInitialized = true;
        resolve();
      };
      
      // Chrome and Edge load voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = processVoices;
      }
      
      // Initial call to handle browsers that load voices synchronously
      processVoices();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Get all available voices
 * @returns Array of voice information objects
 */
export function getVoices(): SpeechVoiceInfo[] {
  if (!speechSynthesisInitialized) {
    throw new Error('Speech synthesis not initialized. Call initSpeechSynthesis() first.');
  }
  
  return availableVoices;
}

/**
 * Get voices filtered by language
 * @param lang Language code to filter by (e.g. 'en-US', 'fr-FR')
 * @returns Filtered array of voice information objects
 */
export function getVoicesByLanguage(lang: string): SpeechVoiceInfo[] {
  if (!speechSynthesisInitialized) {
    throw new Error('Speech synthesis not initialized. Call initSpeechSynthesis() first.');
  }
  
  return availableVoices.filter(voice => voice.lang.includes(lang));
}

/**
 * Speak text using speech synthesis
 * @param options Speech options (text, voice, rate, pitch, volume, lang)
 * @returns Promise that resolves when speech is complete
 */
export function speak(options: SpeechOptions): Promise<void> {
  if (!isSpeechSynthesisSupported) {
    return Promise.reject(new Error('Speech synthesis is not supported in this browser'));
  }
  
  // Ensure synthesis is initialized
  if (!speechSynthesisInitialized) {
    return initSpeechSynthesis().then(() => speak(options));
  }
  
  return new Promise((resolve, reject) => {
    try {
      // Cancel any ongoing speech
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      
      // Create utterance
      const utterance = new SpeechSynthesisUtterance(options.text);
      
      // Set voice
      if (options.voice) {
        utterance.voice = options.voice;
      } else if (options.lang) {
        // Try to find a voice for the specified language
        const langVoices = getVoicesByLanguage(options.lang);
        if (langVoices.length > 0) {
          utterance.voice = langVoices[0].voice;
        } else {
          utterance.voice = defaultVoice;
        }
      } else {
        utterance.voice = defaultVoice;
      }
      
      // Set other options
      if (options.rate !== undefined) utterance.rate = options.rate;
      if (options.pitch !== undefined) utterance.pitch = options.pitch;
      if (options.volume !== undefined) utterance.volume = options.volume;
      if (options.lang !== undefined) utterance.lang = options.lang;
      
      // Set event handlers
      utterance.onend = () => {
        currentUtterance = null;
        resolve();
      };
      
      utterance.onerror = (event) => {
        currentUtterance = null;
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };
      
      // Store current utterance and speak
      currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
      
      // Chrome has a bug where speech synthesis sometimes stops
      // This is a workaround to keep it going
      const chromeWorkaround = () => {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
          chromeFix = setTimeout(chromeWorkaround, 5000);
        }
      };
      const chromeFix = setTimeout(chromeWorkaround, 5000);
      
      utterance.onend = () => {
        clearTimeout(chromeFix);
        currentUtterance = null;
        resolve();
      };
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Stop current speech synthesis
 */
export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

/**
 * Pause current speech synthesis
 */
export function pauseSpeaking(): void {
  if (isSpeechSynthesisSupported) {
    window.speechSynthesis.pause();
  }
}

/**
 * Resume paused speech synthesis
 */
export function resumeSpeaking(): void {
  if (isSpeechSynthesisSupported) {
    window.speechSynthesis.resume();
  }
}

/**
 * Check if speech synthesis is speaking
 * @returns Boolean indicating if speech is in progress
 */
export function isSpeaking(): boolean {
  return isSpeechSynthesisSupported && window.speechSynthesis.speaking;
}

/**
 * Check if speech synthesis is paused
 * @returns Boolean indicating if speech is paused
 */
export function isPaused(): boolean {
  return isSpeechSynthesisSupported && window.speechSynthesis.paused;
}

/**
 * Initialize speech recognition
 * @param options Recognition options
 * @returns Speech recognition instance
 */
export function initSpeechRecognition(options: SpeechRecognitionOptions = {}): any {
  if (!isSpeechRecognitionSupported) {
    throw new Error('Speech recognition is not supported in this browser');
  }
  
  try {
    // Create recognition instance
    const recognition = new SpeechRecognitionAPI();
    
    // Set options
    recognition.continuous = options.continuous !== undefined ? options.continuous : false;
    recognition.interimResults = options.interimResults !== undefined ? options.interimResults : false;
    recognition.maxAlternatives = options.maxAlternatives !== undefined ? options.maxAlternatives : 1;
    
    if (options.lang) {
      recognition.lang = options.lang;
    } else {
      recognition.lang = navigator.language || 'en-US';
    }
    
    // Store current recognition instance
    currentRecognition = recognition;
    
    return recognition;
  } catch (error) {
    throw new Error(`Failed to initialize speech recognition: ${error.message}`);
  }
}

/**
 * Start speech recognition with callback handlers
 * @param options Recognition options
 * @param onResult Callback for recognition results
 * @param onEnd Callback for recognition end
 * @param onError Callback for recognition errors
 * @returns Recognition control object
 */
export function startSpeechRecognition(
  options: SpeechRecognitionOptions = {},
  onResult: (transcript: string, isFinal: boolean) => void,
  onEnd?: () => void,
  onError?: (error: string) => void,
): { stop: () => void; abort: () => void } {
  if (!isSpeechRecognitionSupported) {
    if (onError) onError('Speech recognition is not supported in this browser');
    throw new Error('Speech recognition is not supported in this browser');
  }
  
  try {
    // Initialize recognition
    const recognition = initSpeechRecognition(options);
    
    // Set up event handlers
    recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript;
      const isFinal = event.results[last].isFinal;
      
      onResult(transcript, isFinal);
    };
    
    recognition.onend = () => {
      if (onEnd) onEnd();
    };
    
    recognition.onerror = (event: any) => {
      if (onError) onError(event.error);
    };
    
    // Start recognition
    recognition.start();
    
    // Return control object
    return {
      stop: () => recognition.stop(),
      abort: () => recognition.abort(),
    };
  } catch (error) {
    if (onError) onError(error.message);
    throw error;
  }
}

/**
 * Stop current speech recognition
 */
export function stopSpeechRecognition(): void {
  if (currentRecognition) {
    try {
      currentRecognition.stop();
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }
}

/**
 * Create a grammar list for speech recognition
 * @param grammar Grammar string in JSpeech Grammar Format (JSGF)
 * @returns Grammar list for use with speech recognition
 */
export function createGrammarList(grammar: string): any {
  if (!isSpeechRecognitionSupported || !SpeechGrammarListAPI) {
    throw new Error('Speech grammar is not supported in this browser');
  }
  
  try {
    const grammarList = new SpeechGrammarListAPI();
    grammarList.addFromString(grammar, 1);
    return grammarList;
  } catch (error) {
    throw new Error(`Failed to create grammar list: ${error.message}`);
  }
}

/**
 * Utility function to convert text to SSML for more control over speech
 * Note: Not all browsers support SSML
 * @param text Text to convert
 * @param options SSML options
 * @returns SSML string
 */
export function textToSSML(
  text: string, 
  options: {
    rate?: number;
    pitch?: number;
    voice?: string;
    emphasis?: 'strong' | 'moderate' | 'none' | 'reduced';
    breakTime?: number;
  } = {}
): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
  
  let ssml = `<speak>`;
  
  if (options.rate || options.pitch) {
    ssml += `<prosody`;
    if (options.rate) ssml += ` rate="${options.rate}"`;
    if (options.pitch) ssml += ` pitch="${options.pitch}"`;
    ssml += `>`;
  }
  
  if (options.voice) {
    ssml += `<voice name="${options.voice}">`;
  }
  
  if (options.emphasis) {
    ssml += `<emphasis level="${options.emphasis}">`;
  }
  
  ssml += escaped;
  
  if (options.breakTime) {
    ssml += `<break time="${options.breakTime}ms"/>`;
  }
  
  if (options.emphasis) ssml += `</emphasis>`;
  if (options.voice) ssml += `</voice>`;
  if (options.rate || options.pitch) ssml += `</prosody>`;
  
  ssml += `</speak>`;
  
  return ssml;
}