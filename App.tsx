import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { MainView } from './components/MainView';
import { Player } from './components/Player';
import type { Track } from './types';
import { TRACKS } from './constants';

const App: React.FC = () => {
  const [tracks] = useState<Track[]>(TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrack = currentTrackIndex !== null ? tracks[currentTrackIndex] : null;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (isPlaying && !isLoading) {
      audioRef.current?.play().catch(error => console.error("Error playing audio:", error));
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying, isLoading]);

  const handleSelectTrack = (index: number) => {
    if (currentTrackIndex === index) {
      setIsPlaying(prev => !prev);
    } else {
      setCurrentTrackIndex(index);
      setProgress(0);
      setIsPlaying(true);
      setIsLoading(true);
    }
  };

  const handlePlayPause = useCallback(() => {
    if (currentTrackIndex === null && tracks.length > 0) {
      setCurrentTrackIndex(0);
      setIsPlaying(true);
      setIsLoading(true);
    } else {
      setIsPlaying(prev => !prev);
    }
  }, [currentTrackIndex, tracks.length]);
  
  const handleNext = useCallback(() => {
    if (currentTrackIndex !== null) {
      const nextIndex = (currentTrackIndex + 1) % tracks.length;
      handleSelectTrack(nextIndex);
    }
  }, [currentTrackIndex, tracks.length, handleSelectTrack]);

  const handlePrev = useCallback(() => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
    } else if (currentTrackIndex !== null) {
      const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
      handleSelectTrack(prevIndex);
    }
  }, [currentTrackIndex, tracks.length, handleSelectTrack]);
  
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleCanPlay = () => {
    setIsLoading(false);
  };
  
  const handleWaiting = () => {
    setIsLoading(true);
  };
  
  const handleAudioError = (e: any) => {
    console.error("Audio Error:", e.target.error);
    setIsLoading(false);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(audioRef.current){
      const newTime = Number(e.target.value);
      audioRef.current.currentTime = newTime;
      setProgress(newTime);
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
  };


  return (
    <div className="h-screen w-screen bg-spotify-black text-spotify-gray-100 flex flex-col font-[sans-serif]">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <MainView tracks={tracks} onSelectTrack={handleSelectTrack} currentTrackIndex={currentTrackIndex} isPlaying={isPlaying} />
      </div>
      <Player 
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        isLoading={isLoading}
        progress={progress}
        duration={duration}
        volume={volume}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrev={handlePrev}
        onProgressChange={handleProgressChange}
        onVolumeChange={handleVolumeChange}
      />
      <audio 
        ref={audioRef} 
        src={currentTrack?.audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleNext}
        onCanPlay={handleCanPlay}
        onWaiting={handleWaiting}
        onError={handleAudioError}
      />
    </div>
  );
};

export default App;