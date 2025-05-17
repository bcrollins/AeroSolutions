import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward } from 'lucide-react';
import { useSoundEffects } from '@/hooks/use-sound-effects';

interface VideoPlayerProps {
  src: string;
  thumbnail?: string;
  title?: string;
  autoPlay?: boolean;
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
  startTime?: number;
  skipIntro?: boolean;
  skipIntroSeconds?: number;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  thumbnail,
  title,
  autoPlay = false,
  onComplete,
  onProgress,
  startTime = 0,
  skipIntro = false,
  skipIntroSeconds = 0
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);
  const [bufferedProgress, setBufferedProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(startTime);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSkipIntro, setShowSkipIntro] = useState(skipIntro);
  const [isWaiting, setIsWaiting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { playSound } = useSoundEffects();

  // Handle video loaded metadata to set duration
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
      if (startTime > 0 && startTime < videoElement.duration) {
        videoElement.currentTime = startTime;
        setCurrentTime(startTime);
      }
    };

    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [startTime]);

  // Handle play/pause state changes
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isPlaying) {
      const playPromise = videoElement.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay was prevented, reset state
          setIsPlaying(false);
        });
      }
    } else {
      videoElement.pause();
    }
  }, [isPlaying]);

  // Monitor playback progress
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const updateProgress = () => {
      const currentProgress = (videoElement.currentTime / videoElement.duration) * 100;
      setProgress(currentProgress);
      setCurrentTime(videoElement.currentTime);
      
      if (onProgress) {
        onProgress(currentProgress);
      }

      // Show "Skip Intro" button during intro if applicable
      if (skipIntro && 
          videoElement.currentTime > 0 && 
          videoElement.currentTime < skipIntroSeconds) {
        setShowSkipIntro(true);
      } else {
        setShowSkipIntro(false);
      }

      // Update buffered progress
      if (videoElement.buffered.length > 0) {
        const bufferedEnd = videoElement.buffered.end(videoElement.buffered.length - 1);
        const bufferedProgress = (bufferedEnd / videoElement.duration) * 100;
        setBufferedProgress(bufferedProgress);
      }
    };

    // Check if video has completed playback
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(100);
      if (onComplete) {
        onComplete();
      }
    };

    // Handle waiting state (buffering)
    const handleWaiting = () => {
      setIsWaiting(true);
    };

    // Handle when video is playing again after buffering
    const handlePlaying = () => {
      setIsWaiting(false);
    };

    videoElement.addEventListener('timeupdate', updateProgress);
    videoElement.addEventListener('ended', handleEnded);
    videoElement.addEventListener('waiting', handleWaiting);
    videoElement.addEventListener('playing', handlePlaying);

    return () => {
      videoElement.removeEventListener('timeupdate', updateProgress);
      videoElement.removeEventListener('ended', handleEnded);
      videoElement.removeEventListener('waiting', handleWaiting);
      videoElement.removeEventListener('playing', handlePlaying);
    };
  }, [onComplete, onProgress, skipIntro, skipIntroSeconds]);

  // Handle volume/mute changes
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    videoElement.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Handle auto-hide controls
  useEffect(() => {
    const hideControls = () => {
      if (isPlaying) {
        setShowControls(false);
      }
    };

    if (isPlaying) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(hideControls, 3000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, showControls]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const togglePlay = () => {
    playSound('click');
    setIsPlaying(!isPlaying);
    setShowControls(true);
    
    // Reset the auto-hide timer
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    }
  };

  const toggleMute = () => {
    playSound('click');
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !videoRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress((newTime / duration) * 100);
    
    playSound('click');
  };

  const toggleFullscreen = () => {
    playSound('click');
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const skipIntroHandler = () => {
    if (!videoRef.current) return;
    
    playSound('click');
    videoRef.current.currentTime = skipIntroSeconds;
    setCurrentTime(skipIntroSeconds);
    setShowSkipIntro(false);
  };

  const forward10Seconds = () => {
    if (!videoRef.current) return;
    
    playSound('click');
    const newTime = Math.min(videoRef.current.currentTime + 10, duration);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const rewind10Seconds = () => {
    if (!videoRef.current) return;
    
    playSound('click');
    const newTime = Math.max(videoRef.current.currentTime - 10, 0);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (timeInSeconds: number): string => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      ref={containerRef}
      className={`relative group w-full h-full bg-black rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
      onMouseMove={() => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
          controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
          }, 3000);
        }
      }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full cursor-pointer"
        poster={thumbnail}
        onClick={togglePlay}
        playsInline
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Loading Spinner */}
      {isWaiting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Skip Intro Button */}
      {showSkipIntro && (
        <div className="absolute bottom-24 right-4 z-10">
          <button
            onClick={skipIntroHandler}
            className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-900 font-semibold py-2 px-4 rounded-md transition-all shadow-md hover:shadow-lg"
          >
            Skip Intro
          </button>
        </div>
      )}

      {/* Title Overlay (shown briefly on start) */}
      {title && (
        <div className={`absolute top-4 left-4 right-4 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
          <h3 className="text-white text-lg font-semibold drop-shadow-md">{title}</h3>
        </div>
      )}

      {/* Video Controls */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Progress Bar */}
        <div 
          ref={progressBarRef}
          className="w-full h-1.5 bg-gray-600 rounded-full cursor-pointer mb-4 relative"
          onClick={handleProgressBarClick}
        >
          {/* Buffered Progress */}
          <div 
            className="absolute h-full bg-gray-400 rounded-full"
            style={{ width: `${bufferedProgress}%` }}
          ></div>
          
          {/* Playback Progress */}
          <div 
            className="absolute h-full bg-blue-500 rounded-full"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 transform translate-x-1/2 -translate-y-1/2 top-1/2 w-3 h-3 bg-blue-500 rounded-full"></div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-blue-400 transition-colors focus:outline-none"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>

            {/* Rewind/Forward Buttons */}
            <button
              onClick={rewind10Seconds}
              className="text-white hover:text-blue-400 transition-colors focus:outline-none hidden sm:block"
              aria-label="Rewind 10 seconds"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            
            <button
              onClick={forward10Seconds}
              className="text-white hover:text-blue-400 transition-colors focus:outline-none hidden sm:block"
              aria-label="Forward 10 seconds"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            {/* Time Display */}
            <div className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Volume Controls */}
            <div className="flex items-center">
              <button
                onClick={toggleMute}
                className="text-white hover:text-blue-400 transition-colors focus:outline-none"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 accent-blue-500 mx-2 hidden sm:block"
              />
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-blue-400 transition-colors focus:outline-none"
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Play/Pause Overlay (big button in center) */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="bg-black bg-opacity-50 hover:bg-opacity-60 text-white rounded-full p-4 transition-transform transform hover:scale-110 focus:outline-none"
            aria-label="Play"
          >
            <Play className="w-10 h-10" />
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;