/*
 * Design: Vinyl Warmth — Scandinavian Minimalism
 * NowPlayingPanel: Right panel showing current track and upcoming queue.
 * Collapsible, with vinyl record artwork and warm tones.
 */

import { useMusicContext } from "@/contexts/MusicContext";
import {
  ChevronRight,
  ChevronLeft,
  Music,
  Repeat,
  Repeat1,
  Shuffle,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const VINYL_TEXTURE_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663176210128/bDFy4oMtca7MUikvERE6tr/vinyl-texture-m43mtq33kRuNGhzCQvKBNP.webp";

export default function NowPlayingPanel() {
  const {
    tracks,
    currentTrackIndex,
    isPlaying,
    queueIds,
    showPanel,
    setShowPanel,
    play,

    shuffleEnabled,
    repeatMode,
    toggleShuffle,
    cycleRepeatMode,

    removeFromQueue,
    moveQueueItemUp,
    moveQueueItemDown,
  } = useMusicContext();

  const currentTrack = currentTrackIndex !== null ? tracks[currentTrackIndex] : null;
  const queueTracks = queueIds.map((id) => tracks.find((t) => t.id === id)).filter(Boolean);

  function renderRepeatIcon() {
    if (repeatMode === "one") return <Repeat1 className="w-4 h-4" />;
    return <Repeat className="w-4 h-4" />;
  }

  function repeatLabel() {
    if (repeatMode === "off") return "Repeat: Off";
    if (repeatMode === "all") return "Repeat: All";
    return "Repeat: One";
  }

  if (!showPanel) {
    return (
      <div className="flex items-start pt-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setShowPanel(true)}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border-l border-border bg-card/50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-display text-base">Reprodução</h3>

        <div className="flex items-center gap-1">
          {/* Shuffle */}
          <Button
            variant={shuffleEnabled ? "default" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={toggleShuffle}
            title={shuffleEnabled ? "Shuffle ligado" : "Shuffle desligado"}
          >
            <Shuffle className="w-4 h-4" />
          </Button>

          {/* Repeat */}
          <Button
            variant={repeatMode !== "off" ? "default" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={cycleRepeatMode}
            title={repeatLabel()}
          >
            {renderRepeatIcon()}
          </Button>

          {/* Collapse */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 lg:flex hidden"
            onClick={() => setShowPanel(false)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Current track artwork */}
        <div className="flex flex-col items-center">
          <div
            className={`w-32 h-32 rounded-full overflow-hidden shadow-lg mb-4 ${
              isPlaying ? "animate-[spin_8s_linear_infinite]" : ""
            }`}
          >
            <img src={VINYL_TEXTURE_URL} alt="Vinyl" className="w-full h-full object-cover" />
          </div>

          {currentTrack ? (
            <div className="text-center">
              <p className="font-semibold text-sm mb-1 px-2 truncate max-w-full">
                {currentTrack.name}
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {formatTime(currentTrack.duration)}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Nenhuma música</p>
            </div>
          )}
        </div>

        {/* Queue */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Próximas
          </h4>

          {queueTracks.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">Nenhuma música na fila</p>
          ) : (
            <div className="space-y-1">
              {queueTracks.map((track, idx) => {
                if (!track) return null;

                const globalIndex = tracks.findIndex((t) => t.id === track.id);

                // A primeira da fila é a "próxima"
                const isNext = idx === 0;

                return (
                  <div
                    key={track.id}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${
                      isNext
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-secondary/80 border border-transparent"
                    }`}
                  >
                    {/* Play */}
                    <button
                      className="flex items-center gap-2 flex-1 min-w-0 text-left"
                      onClick={() => play(globalIndex)}
                    >
                      <span className="text-xs font-mono text-muted-foreground w-5 text-right flex-shrink-0">
                        {idx + 1}
                      </span>
                      <Music className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <span
                        className={`text-xs truncate flex-1 ${
                          isNext ? "font-semibold text-primary" : ""
                        }`}
                      >
                        {track.name}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground flex-shrink-0">
                        {formatTime(track.duration)}
                      </span>
                    </button>

                    {/* Move up/down */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveQueueItemUp(idx)}
                        disabled={idx === 0}
                        title="Mover para cima"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveQueueItemDown(idx)}
                        disabled={idx === queueTracks.length - 1}
                        title="Mover para baixo"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </Button>

                      {/* Remove */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => removeFromQueue(track.id)}
                        title="Remover da fila"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}