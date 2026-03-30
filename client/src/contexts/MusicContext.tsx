import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { Howl } from "howler";

export interface MusicFile {
  id: string;
  name: string;
  path: string;
  file: File;
  duration: number;
  size: number;
}

export interface FadeConfig {
  enabled: boolean;
  time: number; // in ms
}

interface MusicState {
  tracks: MusicFile[];
  currentTrackIndex: number | null;
  isPlaying: boolean;
  isPaused: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  selectedIds: Set<string>;
  multiSelectMode: boolean;
  fadeIn: FadeConfig;
  fadeOut: FadeConfig;
  queueIds: string[];
  showPanel: boolean;
  shuffleEnabled: boolean;
  repeatMode: "off" | "one" | "all";
}

interface MusicContextType extends MusicState {
  addFiles: (files: FileList) => Promise<void>;
  removeTrack: (id: string) => void;
  play: (index?: number) => void;
  pause: () => void;
  stop: () => void;
  next: () => void;
  previous: () => void;
  seekTo: (time: number) => void;
  skipForward: () => void;
  skipBackward: () => void;
  goToStart: () => void;
  setVolume: (vol: number) => void;
  toggleSelect: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  toggleMultiSelect: () => void;
  playSelected: () => void;
  reorderTracks: (oldIndex: number, newIndex: number) => void;
  moveTrackUp: (index: number) => void;
  moveTrackDown: (index: number) => void;
  setFadeIn: (config: Partial<FadeConfig>) => void;
  setFadeOut: (config: Partial<FadeConfig>) => void;
  setShowPanel: (show: boolean) => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  removeFromQueue: (id: string) => void;
  moveQueueItemUp: (index: number) => void;
  moveQueueItemDown: (index: number) => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

export function useMusicContext() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusicContext must be used within MusicProvider");
  return ctx;
}

function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.addEventListener("loadedmetadata", () => {
      resolve(audio.duration);
      URL.revokeObjectURL(url);
    });
    audio.addEventListener("error", () => {
      resolve(0);
      URL.revokeObjectURL(url);
    });
    audio.src = url;
  });
}

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [tracks, setTracks] = useState<MusicFile[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [volume, setVolumeState] = useState(80);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [fadeIn, setFadeInState] = useState<FadeConfig>({ enabled: false, time: 2000 });
  const [fadeOut, setFadeOutState] = useState<FadeConfig>({ enabled: false, time: 2000 });
  const [queueIds, setQueueIds] = useState<string[]>([]);
  const [showPanel, setShowPanel] = useState(true);
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "one" | "all">("off");

  const howlRef = useRef<Howl | null>(null);
  const timerRef = useRef<number | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const isTransitioningRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    const tick = () => {
      if (howlRef.current && howlRef.current.playing()) {
        setCurrentTime(howlRef.current.seek() as number);
        timerRef.current = requestAnimationFrame(tick);
      }
    };
    timerRef.current = requestAnimationFrame(tick);
  }, [clearTimer]);

  const destroyHowl = useCallback(() => {
    clearTimer();
    if (howlRef.current) {
      howlRef.current.unload();
      howlRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, [clearTimer]);

  const playTrackAtIndex = useCallback(
    (index: number, tracksArr?: MusicFile[]) => {
      const list = tracksArr || tracks;
      if (index < 0 || index >= list.length) return;

      const track = list[index];
      destroyHowl();

      const url = URL.createObjectURL(track.file);
      objectUrlRef.current = url;

      const vol = volume / 100;
      const startVol = fadeIn.enabled ? 0 : vol;

      const howl = new Howl({
        src: [url],
        html5: true,
        volume: startVol,
        onplay: () => {
          setIsPlaying(true);
          setIsPaused(false);
          setDuration(howl.duration());
          startTimer();
          if (fadeIn.enabled) {
            howl.fade(0, vol, fadeIn.time);
          }
        },
        onpause: () => {
          setIsPaused(true);
          setIsPlaying(false);
          clearTimer();
        },
        onstop: () => {
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentTime(0);
          clearTimer();
        },
        onend: () => {
          clearTimer();
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentTime(0);

          // repeat one
          if (repeatMode === "one") {
            setTimeout(() => playTrackAtIndex(index, list), 100);
            return;
          }

          // se tiver fila manual
          if (queueIds.length > 0) {
            const nextId = queueIds[0];
            const nextIdx = list.findIndex((t) => t.id === nextId);

            if (nextIdx !== -1) {
              setQueueIds((prev) => prev.slice(1));
              setTimeout(() => playTrackAtIndex(nextIdx, list), 100);
              return;
            }
          }

          // shuffle
          if (shuffleEnabled && list.length > 1) {
            let randomIdx = index;
            while (randomIdx === index) {
              randomIdx = Math.floor(Math.random() * list.length);
            }
            setTimeout(() => playTrackAtIndex(randomIdx, list), 100);
            return;
          }

          // normal
          const nextIdx = index + 1;
          if (nextIdx < list.length) {
            setTimeout(() => playTrackAtIndex(nextIdx, list), 100);
            return;
          }

          // repeat all
          if (repeatMode === "all" && list.length > 0) {
            setTimeout(() => playTrackAtIndex(0, list), 100);
          }
        },
        onloaderror: () => {
          console.error("Error loading track:", track.name);
        },
      });

      howlRef.current = howl;
      setCurrentTrackIndex(index);
      howl.play();
    },
    [
      tracks,
      volume,
      fadeIn,
      destroyHowl,
      startTimer,
      clearTimer,
      repeatMode,
      queueIds,
      shuffleEnabled,
    ]
  );

  const fadeOutAndDo = useCallback(
    (callback: () => void) => {
      if (howlRef.current && fadeOut.enabled && isPlaying) {
        isTransitioningRef.current = true;
        const currentVol = howlRef.current.volume();
        howlRef.current.fade(currentVol, 0, fadeOut.time);
        setTimeout(() => {
          isTransitioningRef.current = false;
          callback();
        }, fadeOut.time);
      } else {
        callback();
      }
    },
    [fadeOut, isPlaying]
  );

  const addFiles = useCallback(async (files: FileList) => {
    const audioFiles = Array.from(files).filter((f) =>
      f.type.startsWith("audio/") || f.name.match(/\.(mp3|wav|ogg|flac|m4a|aac|wma)$/i)
    );

    const newTracks: MusicFile[] = [];
    for (const file of audioFiles) {
      const dur = await getAudioDuration(file);
      newTracks.push({
        id: crypto.randomUUID(),
        name: file.name.replace(/\.[^/.]+$/, ""),
        path: (file as any).webkitRelativePath || file.name,
        file,
        duration: dur,
        size: file.size,
      });
    }

    setTracks((prev) => [...prev, ...newTracks]);
  }, []);

  const removeTrack = useCallback(
    (id: string) => {
      setTracks((prev) => {
        const idx = prev.findIndex((t) => t.id === id);
        if (idx === -1) return prev;

        if (currentTrackIndex === idx) {
          destroyHowl();
          setCurrentTrackIndex(null);
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentTime(0);
          setDuration(0);
        } else if (currentTrackIndex !== null && idx < currentTrackIndex) {
          setCurrentTrackIndex((ci) => (ci !== null ? ci - 1 : null));
        }

        return prev.filter((t) => t.id !== id);
      });
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    },
    [currentTrackIndex, destroyHowl]
  );

  const play = useCallback(
    (index?: number) => {
      if (index !== undefined) {

        // REMOVE DA FILA SE ESTIVER NELA (coloque aqui)
        setQueueIds((prev) => prev.filter((id) => id !== tracks[index]?.id));

        fadeOutAndDo(() => playTrackAtIndex(index));

      } else if (isPaused && howlRef.current) {
        howlRef.current.play();
      } else if (tracks.length > 0) {
        fadeOutAndDo(() => playTrackAtIndex(currentTrackIndex ?? 0));
      }
    },
    [isPaused, tracks, currentTrackIndex, playTrackAtIndex, fadeOutAndDo]
  );

  const pause = useCallback(() => {
    howlRef.current?.pause();
  }, []);

  const stop = useCallback(() => {
    howlRef.current?.stop();
    setCurrentTime(0);
  }, []);

  const next = useCallback(() => {
    if (currentTrackIndex === null) return;

    // se tiver fila manual
    if (queueIds.length > 0) {
      const nextId = queueIds[0];
      const nextIdx = tracks.findIndex((t) => t.id === nextId);

      if (nextIdx !== -1) {
        setQueueIds((prev) => prev.slice(1));
        fadeOutAndDo(() => playTrackAtIndex(nextIdx));
        return;
      }
    }

    // shuffle
    if (shuffleEnabled && tracks.length > 1) {
      let randomIdx = currentTrackIndex;

      while (randomIdx === currentTrackIndex) {
        randomIdx = Math.floor(Math.random() * tracks.length);
      }

      fadeOutAndDo(() => playTrackAtIndex(randomIdx));
      return;
    }

    // normal
    const nextIdx = currentTrackIndex + 1;

    if (nextIdx < tracks.length) {
      fadeOutAndDo(() => playTrackAtIndex(nextIdx));
      return;
    }

    // repeat all
    if (repeatMode === "all") {
      fadeOutAndDo(() => playTrackAtIndex(0));
    }
  }, [
    currentTrackIndex,
    tracks,
    queueIds,
    shuffleEnabled,
    repeatMode,
    playTrackAtIndex,
    fadeOutAndDo,
  ]);

  const previous = useCallback(() => {
    if (currentTrackIndex === null) return;
    const prevIdx = currentTrackIndex - 1;
    if (prevIdx >= 0) {
      fadeOutAndDo(() => playTrackAtIndex(prevIdx));
    }
  }, [currentTrackIndex, playTrackAtIndex, fadeOutAndDo]);

  const seekTo = useCallback((time: number) => {
    if (howlRef.current) {
      howlRef.current.seek(time);
      setCurrentTime(time);
    }
  }, []);

  const skipForward = useCallback(() => {
    if (howlRef.current) {
      const newTime = Math.min((howlRef.current.seek() as number) + 10, howlRef.current.duration());
      howlRef.current.seek(newTime);
      setCurrentTime(newTime);
    }
  }, []);

  const skipBackward = useCallback(() => {
    if (howlRef.current) {
      const newTime = Math.max((howlRef.current.seek() as number) - 10, 0);
      howlRef.current.seek(newTime);
      setCurrentTime(newTime);
    }
  }, []);

  const goToStart = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.seek(0);
      setCurrentTime(0);
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(100, vol));
    setVolumeState(clamped);
    if (howlRef.current) {
      howlRef.current.volume(clamped / 100);
    }
  }, []);

  const toggleSelect = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (multiSelectMode) {
          if (next.has(id)) next.delete(id);
          else next.add(id);
        } else {
          if (next.has(id) && next.size === 1) {
            next.clear();
          } else {
            next.clear();
            next.add(id);
          }
        }
        return next;
      });
    },
    [multiSelectMode]
  );

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(tracks.map((t) => t.id)));
  }, [tracks]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const toggleMultiSelect = useCallback(() => {
    setMultiSelectMode((prev) => !prev);
    if (multiSelectMode) {
      setSelectedIds(new Set());
    }
  }, [multiSelectMode]);

  const playSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    const selectedTracks = tracks.filter((t) => selectedIds.has(t.id));
    if (selectedTracks.length === 0) return;

    // Reorder tracks so selected ones come first, then play from first selected
    const firstSelectedIdx = tracks.findIndex((t) => selectedIds.has(t.id));
    if (firstSelectedIdx !== -1) {
      fadeOutAndDo(() => playTrackAtIndex(firstSelectedIdx));
    }
  }, [selectedIds, tracks, playTrackAtIndex, fadeOutAndDo]);

  const reorderTracks = useCallback(
    (oldIndex: number, newIndex: number) => {
      setTracks((prev) => {
        const newArr = [...prev];
        const [moved] = newArr.splice(oldIndex, 1);
        newArr.splice(newIndex, 0, moved);

        // Adjust currentTrackIndex
        if (currentTrackIndex !== null) {
          if (currentTrackIndex === oldIndex) {
            setCurrentTrackIndex(newIndex);
          } else if (oldIndex < currentTrackIndex && newIndex >= currentTrackIndex) {
            setCurrentTrackIndex(currentTrackIndex - 1);
          } else if (oldIndex > currentTrackIndex && newIndex <= currentTrackIndex) {
            setCurrentTrackIndex(currentTrackIndex + 1);
          }
        }

        return newArr;
      });
    },
    [currentTrackIndex]
  );

  const moveTrackUp = useCallback(
    (index: number) => {
      if (index <= 0) return;
      reorderTracks(index, index - 1);
    },
    [reorderTracks]
  );

  const moveTrackDown = useCallback(
    (index: number) => {
      if (index >= tracks.length - 1) return;
      reorderTracks(index, index + 1);
    },
    [reorderTracks, tracks.length]
  );

  const setFadeIn = useCallback((config: Partial<FadeConfig>) => {
    setFadeInState((prev) => ({ ...prev, ...config }));
  }, []);

  const setFadeOut = useCallback((config: Partial<FadeConfig>) => {
    setFadeOutState((prev) => ({ ...prev, ...config }));
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffleEnabled((prev) => !prev);
  }, []);

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === "off") return "all";
      if (prev === "all") return "one";
      return "off";
    });
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    setQueueIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const moveQueueItemUp = useCallback((index: number) => {
    setQueueIds((prev) => {
      if (index <= 0 || index >= prev.length) return prev;
      const arr = [...prev];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr;
    });
  }, []);

  const moveQueueItemDown = useCallback((index: number) => {
    setQueueIds((prev) => {
      if (index < 0 || index >= prev.length - 1) return prev;
      const arr = [...prev];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr;
    });
  }, []);

  // Update queue when tracks or current index changes
  useEffect(() => {
    if (currentTrackIndex === null) {
      setQueueIds([]);
      return;
    }

    setQueueIds((prevQueue) => {
      const currentId = tracks[currentTrackIndex]?.id;
      if (!currentId) return [];

      const validTrackIds = new Set(tracks.map((t) => t.id));

      // remove ids que não existem mais
      let cleaned = prevQueue.filter((id) => validTrackIds.has(id));

      // remove o atual da fila se estiver nela
      cleaned = cleaned.filter((id) => id !== currentId);

      // se a fila estiver vazia, cria padrão com as próximas músicas
      if (cleaned.length === 0) {
        return tracks.slice(currentTrackIndex + 1).map((t) => t.id);
      }

      return cleaned;
    });
  }, [currentTrackIndex, tracks]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      destroyHowl();
    };
  }, [destroyHowl]);

  return (
    <MusicContext.Provider
      value={{
        tracks,
        currentTrackIndex,
        isPlaying,
        isPaused,
        volume,
        currentTime,
        duration,
        selectedIds,
        multiSelectMode,
        fadeIn,
        fadeOut,
        queueIds,
        showPanel,
        addFiles,
        removeTrack,
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
        toggleSelect,
        selectAll,
        deselectAll,
        toggleMultiSelect,
        playSelected,
        reorderTracks,
        moveTrackUp,
        moveTrackDown,
        setFadeIn,
        setFadeOut,
        setShowPanel,
        shuffleEnabled,
        repeatMode,
        toggleShuffle,
        cycleRepeatMode,
        removeFromQueue,
        moveQueueItemUp,
        moveQueueItemDown,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}
