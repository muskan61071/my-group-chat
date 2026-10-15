import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface VoiceMessageProps {
  url: string;
  duration?: number;
}

export function VoiceMessage({ url, duration = 12 }: VoiceMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.ontimeupdate = () => {
      setCurrentTime(Math.floor(audio.currentTime));
    };

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [url]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {
        // Mock fallback toggle
        setIsPlaying(true);
      });
      setIsPlaying(true);
    }
  };

  const formatSecs = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // 18 waveform bars with pseudo-random heights
  const bars = [8, 14, 20, 10, 18, 24, 16, 12, 22, 18, 14, 20, 10, 16, 24, 18, 12, 8];

  return (
    <div className="voice-message-player">
      <button className="play-pause-btn" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
        {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
      </button>

      <div className="waveform-track">
        {bars.map((height, i) => {
          const isActive = (i / bars.length) * (duration || 1) <= currentTime;
          return (
            <div
              key={i}
              className="waveform-bar"
              style={{
                height: `${height}px`,
                backgroundColor: isActive ? 'var(--color-brand-primary)' : 'var(--color-border)',
              }}
            />
          );
        })}
      </div>

      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', minWidth: '32px' }}>
        {formatSecs(currentTime > 0 ? currentTime : duration || 0)}
      </span>
    </div>
  );
}
