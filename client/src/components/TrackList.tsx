/*
 * Design: Vinyl Warmth — Scandinavian Minimalism
 * TrackList: Main list of tracks with drag handle, checkbox, name, duration, options menu.
 * Paper-like cards with subtle shadows, terracotta active states.
 */

import { useMusicContext, MusicFile } from "@/contexts/MusicContext";
import { useEffect, useRef, useState, useCallback } from "react";
import Sortable from "sortablejs";
import {
  GripVertical,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Play,
  Pause,
  Square,
  Trash2,
  Info,
  FolderOpen,
  CheckSquare,
  ListChecks,
  Plus,
  Music2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function TrackList() {
  const {
    tracks,
    currentTrackIndex,
    isPlaying,
    selectedIds,
    multiSelectMode,
    play,
    pause,
    stop,
    toggleSelect,
    selectAll,
    deselectAll,
    toggleMultiSelect,
    playSelected,
    reorderTracks,
    moveTrackUp,
    moveTrackDown,
    removeTrack,
    addFiles,
  } = useMusicContext();

  const listRef = useRef<HTMLDivElement>(null);
  const sortableRef = useRef<Sortable | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [infoTrack, setInfoTrack] = useState<MusicFile | null>(null);

  // Initialize SortableJS
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    // destrói o sortable antigo com segurança
    if (sortableRef.current) {
      try {
        sortableRef.current.destroy();
      } catch (err) {
        console.warn("Erro ao destruir Sortable antigo:", err);
      }
      sortableRef.current = null;
    }

    // cria um novo sortable
    const sortable = Sortable.create(el, {
      handle: ".drag-handle",
      animation: 200,
      ghostClass: "sortable-ghost",
      dragClass: "sortable-drag",
      onEnd: (evt) => {
        const { oldIndex, newIndex } = evt;
        if (oldIndex !== undefined && newIndex !== undefined && oldIndex !== newIndex) {
          reorderTracks(oldIndex, newIndex);
        }
      },
    });

    sortableRef.current = sortable;

    return () => {
      // só destrói se ainda for o mesmo elemento
      try {
        sortable.destroy();
      } catch (err) {
        console.warn("Erro ao destruir Sortable:", err);
      }

      if (sortableRef.current === sortable) {
        sortableRef.current = null;
      }
    };
  }, [reorderTracks, tracks.length]);

  const handleAddFiles = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        await addFiles(e.target.files);
        e.target.value = "";
      }
    },
    [addFiles]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-lg text-foreground">Biblioteca</h2>
          <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded">
            {tracks.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleAddFiles}>
                <Plus className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Adicionar músicas</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={multiSelectMode ? "default" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={toggleMultiSelect}
              >
                <ListChecks className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{multiSelectMode ? "Seleção única" : "Seleção múltipla"}</TooltipContent>
          </Tooltip>

          {multiSelectMode && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={selectAll}>
                    <CheckSquare className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Selecionar tudo</TooltipContent>
              </Tooltip>

              {selectedIds.size > 0 && (
                <div className="flex items-center gap-1 ml-1 pl-1 border-l border-border">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={playSelected}
                      >
                        <Play className="w-3 h-3" /> Reproduzir ({selectedIds.size})
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Reproduzir selecionadas</TooltipContent>
                  </Tooltip>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.ogg,.flac,.m4a,.aac,.wma"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Track list */}
      {tracks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Music2 className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-1">Nenhuma música adicionada</p>
          <p className="text-xs text-muted-foreground mb-4">
            Clique no botão + ou arraste arquivos de áudio aqui
          </p>
          <Button variant="outline" size="sm" onClick={handleAddFiles} className="gap-2">
            <FolderOpen className="w-4 h-4" /> Selecionar arquivos
          </Button>
        </div>
      ) : (
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto px-2 py-2 space-y-1"
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer.files.length > 0) {
              await addFiles(e.dataTransfer.files);
            }
          }}
        >
          {tracks.map((track, index) => {
            const isCurrent = currentTrackIndex === index;
            const isSelected = selectedIds.has(track.id);

            return (
              <div
                key={track.id}
                data-id={track.id}
                className={`
                  group flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-150
                  ${isCurrent ? "bg-primary/10 border border-primary/20" : "hover:bg-secondary/80 border border-transparent"}
                  ${isSelected ? "bg-primary/5 border-primary/15" : ""}
                `}
              >
                {/* Drag handle */}
                <div className="drag-handle flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors">
                  <GripVertical className="w-4 h-4" />
                </div>

                {/* Checkbox */}
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleSelect(track.id)}
                  className="flex-shrink-0"
                />

                {/* Track info — clickable to play */}
                <button
                  className="flex-1 min-w-0 text-left flex items-center gap-2"
                  onClick={() => play(index)}
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm truncate ${isCurrent ? "font-semibold text-primary" : "font-medium"}`}
                    >
                      {isCurrent && isPlaying && (
                        <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2 animate-pulse" />
                      )}
                      {track.name}
                    </p>
                  </div>
                </button>

                {/* Duration */}
                <span className="text-xs font-mono text-muted-foreground flex-shrink-0 tabular-nums">
                  {formatTime(track.duration)}
                </span>

                {/* Move buttons */}
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => moveTrackUp(index)}
                    disabled={index === 0}
                  >
                    <ChevronUp className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => moveTrackDown(index)}
                    disabled={index === tracks.length - 1}
                  >
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </div>

                {/* Options menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setInfoTrack(track)}>
                      <Info className="w-4 h-4 mr-2" /> Informações
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => removeTrack(track.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Dialog */}
      <Dialog open={!!infoTrack} onOpenChange={(open) => !open && setInfoTrack(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Informações da Música</DialogTitle>
            <DialogDescription>Detalhes do arquivo de áudio</DialogDescription>
          </DialogHeader>
          {infoTrack && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Nome</span>
                <span className="font-medium text-right max-w-[60%] truncate">{infoTrack.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Caminho</span>
                <span className="font-mono text-xs text-right max-w-[60%] truncate">{infoTrack.path}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Duração</span>
                <span className="font-mono">{formatTime(infoTrack.duration)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Tamanho</span>
                <span className="font-mono">{formatSize(infoTrack.size)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
