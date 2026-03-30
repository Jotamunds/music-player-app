/*
 * Design: Vinyl Warmth — Scandinavian Minimalism
 * Home: Main page layout.
 * Desktop (lg+): Player top, List left (~62%), NowPlaying right (~38%), Settings bottom.
 * Medium (md): Player top, List + NowPlaying stacked vertically, Settings bottom.
 * Small: Player top, list below, NowPlaying collapsed, Settings collapsible.
 */

import { MusicProvider, useMusicContext } from "@/contexts/MusicContext";
import PlayerBar from "@/components/PlayerBar";
import TrackList from "@/components/TrackList";
import NowPlayingPanel from "@/components/NowPlayingPanel";
import SettingsPanel from "@/components/SettingsPanel";
import { useState, useCallback } from "react";
import { ListMusic } from "lucide-react";
import { Button } from "@/components/ui/button";

function AppLayout() {
  const { addFiles } = useMusicContext();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set false if leaving the main container
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        await addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const [showMobileQueue, setShowMobileQueue] = useState(false);

  return (
    <div
      className="h-screen flex flex-col bg-background overflow-hidden relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Global drop overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-[100] bg-primary/5 border-2 border-dashed border-primary/40 flex items-center justify-center pointer-events-none">
          <div className="bg-card/95 backdrop-blur-sm rounded-xl px-8 py-6 shadow-lg text-center">
            <ListMusic className="w-10 h-10 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Solte os arquivos de áudio aqui</p>
          </div>
        </div>
      )}

      {/* Top: Player controls */}
      <PlayerBar />

      {/* Middle: List + Panel */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Track list */}
        <div className="flex-1 lg:flex-[1.62] overflow-hidden flex flex-col">
          <TrackList />
        </div>

        {/* Right: Now playing panel — desktop */}
        <div className="lg:flex-[1] lg:max-w-xs xl:max-w-sm overflow-hidden hidden lg:flex flex-col">
          <NowPlayingPanel />
        </div>
      </div>

      {/* Mobile queue toggle */}
      <div className="lg:hidden border-t border-border">
        <button
          className="w-full flex items-center justify-between px-4 py-2 hover:bg-secondary/50 transition-colors"
          onClick={() => setShowMobileQueue(!showMobileQueue)}
        >
          <div className="flex items-center gap-2">
            <ListMusic className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Fila de Reprodução</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {showMobileQueue ? "Ocultar" : "Mostrar"}
          </span>
        </button>
        {showMobileQueue && (
          <div className="max-h-48 overflow-y-auto">
            <NowPlayingPanel />
          </div>
        )}
      </div>

      {/* Bottom: Settings */}
      <SettingsPanel />
    </div>
  );
}

export default function Home() {
  return (
    <MusicProvider>
      <AppLayout />
    </MusicProvider>
  );
}
