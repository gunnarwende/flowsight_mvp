"use client";

import { useRef, useState, useEffect } from "react";

interface AudioPlayerProps {
  src: string;
  label: string;
  duration?: string;
  variant?: "hero" | "section";
}

export default function AudioPlayer({ src, label, duration, variant = "hero" }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (audio.duration) setProgress(audio.currentTime / audio.duration);
    };
    const onEnded = () => {
      setPlaying(false);
      setProgress(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  };

  const isHero = variant === "hero";

  return (
    <div className="flex flex-col items-center gap-3">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Play/Pause Button */}
      <button
        onClick={toggle}
        className={`group relative flex items-center justify-center rounded-full transition-all ${
          isHero
            ? "h-14 w-14 bg-gold-500 hover:bg-gold-400 hover:shadow-lg hover:shadow-gold-500/25"
            : "h-12 w-12 bg-gold-500 hover:bg-gold-400 hover:shadow-lg hover:shadow-gold-500/20"
        }`}
        aria-label={playing ? "Pause" : "Abspielen"}
      >
        {playing ? (
          <svg className={`${isHero ? "h-5 w-5" : "h-4 w-4"} text-navy-950`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg className={`${isHero ? "h-5 w-5" : "h-4 w-4"} ml-0.5 text-navy-950`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}

        {/* Progress ring */}
        {playing && (
          <svg
            className="absolute inset-0 -rotate-90"
            viewBox="0 0 56 56"
          >
            <circle
              cx="28" cy="28" r="26"
              fill="none"
              stroke="rgba(201,162,39,0.3)"
              strokeWidth="2"
            />
            <circle
              cx="28" cy="28" r="26"
              fill="none"
              stroke="#c9a227"
              strokeWidth="2"
              strokeDasharray={`${2 * Math.PI * 26}`}
              strokeDashoffset={`${2 * Math.PI * 26 * (1 - progress)}`}
              strokeLinecap="round"
              className="transition-[stroke-dashoffset] duration-300"
            />
          </svg>
        )}
      </button>

      {/* Label */}
      <span className={`text-sm font-medium ${isHero ? "text-navy-400" : "text-navy-400"}`}>
        {playing ? "Wird abgespielt…" : label}
        {duration && !playing && (
          <span className="ml-1.5 text-navy-500">{duration}</span>
        )}
      </span>
    </div>
  );
}
