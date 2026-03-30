/*
 * Design: Vinyl Warmth — Scandinavian Minimalism
 * PlayerBar: Fixed top bar with transport controls, progress, and volume.
 * Warm cream background, terracotta accents, DM Sans typography.
 */

import { useMusicContext } from "@/contexts/MusicContext";
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Rewind,
  FastForward,
  RotateCcw,
  Volume2,
  VolumeX,
  Volume1,
  Music,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCallback } from "react";

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function PlayerBar() {
  const {
    tracks,
    currentTrackIndex,
    isPlaying,
    isPaused,
    volume,
    currentTime,
    duration,
    play,
    pause,
    stop,
    next,
    previous,
    seekTo,
    skipForward,
    skipBackward,
    goToStart,
    setVolume,
  } = useMusicContext();

  const currentTrack = currentTrackIndex !== null ? tracks[currentTrackIndex] : null;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      seekTo((val / 100) * duration);
    },
    [seekTo, duration]
  );

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setVolume(parseInt(e.target.value));
    },
    [setVolume]
  );

  const handleVolumeInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value);
      if (!isNaN(val)) setVolume(val);
    },
    [setVolume]
  );

  const VolumeIcon = volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="px-4 py-3">
        {/* Track info + progress */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Music className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">
                {currentTrack ? currentTrack.name : "Nenhuma música selecionada"}
              </p>
            </div>
            <span className="text-xs font-mono text-muted-foreground flex-shrink-0">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            onChange={handleSeek}
            className="w-full h-1 progress-bar"
            style={{ "--progress": `${progress}%` } as React.CSSProperties}
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Transport controls */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={skipBackward}>
                  <Rewind className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Voltar 10s</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={previous}>
                  <SkipBack className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Anterior</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToStart}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Início</TooltipContent>
            </Tooltip>

            {isPlaying ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    onClick={pause}
                  >
                    <Pause className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Pausar</TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    onClick={() => play()}
                  >
                    <Play className="w-4 h-4 ml-0.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reproduzir</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={stop}>
                  <Square className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Parar</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={next}>
                  <SkipForward className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Próxima</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={skipForward}>
                  <FastForward className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Avançar 10s</TooltipContent>
            </Tooltip>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <VolumeIcon className="w-4 h-4 text-muted-foreground" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 sm:w-28 h-1 volume-bar"
              style={{ "--volume": `${volume}%` } as React.CSSProperties}
            />
            <input
              type="number"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeInput}
              className="w-12 text-xs text-center font-mono bg-secondary border border-border rounded px-1 py-0.5"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
