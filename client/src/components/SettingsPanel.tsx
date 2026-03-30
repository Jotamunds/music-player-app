/*
 * Design: Vinyl Warmth — Scandinavian Minimalism
 * SettingsPanel: Collapsible panel at bottom with fade-in/out and theme settings.
 */

import { useMusicContext } from "@/contexts/MusicContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Settings, ChevronDown, ChevronUp, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function SettingsPanel() {
  const { fadeIn, fadeOut, setFadeIn, setFadeOut } = useMusicContext();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-t border-border bg-card/80">
      {/* Toggle header */}
      <button
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-secondary/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Configurações</span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Content */}
      {isOpen && (
        <div className="px-4 pb-4 pt-1 space-y-4 animate-in slide-in-from-bottom-2 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Fade In */}
            <div className="space-y-2 p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Fade-in</Label>
                <Switch
                  checked={fadeIn.enabled}
                  onCheckedChange={(checked) => setFadeIn({ enabled: checked })}
                />
              </div>
              {fadeIn.enabled && (
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="500"
                    max="10000"
                    step="500"
                    value={fadeIn.time}
                    onChange={(e) => setFadeIn({ time: parseInt(e.target.value) })}
                    className="flex-1 h-1 volume-bar"
                    style={{ "--volume": `${((fadeIn.time - 500) / 9500) * 100}%` } as React.CSSProperties}
                  />
                  <span className="text-xs font-mono text-muted-foreground w-10 text-right">
                    {(fadeIn.time / 1000).toFixed(1)}s
                  </span>
                </div>
              )}
            </div>

            {/* Fade Out */}
            <div className="space-y-2 p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Fade-out</Label>
                <Switch
                  checked={fadeOut.enabled}
                  onCheckedChange={(checked) => setFadeOut({ enabled: checked })}
                />
              </div>
              {fadeOut.enabled && (
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="500"
                    max="10000"
                    step="500"
                    value={fadeOut.time}
                    onChange={(e) => setFadeOut({ time: parseInt(e.target.value) })}
                    className="flex-1 h-1 volume-bar"
                    style={{ "--volume": `${((fadeOut.time - 500) / 9500) * 100}%` } as React.CSSProperties}
                  />
                  <span className="text-xs font-mono text-muted-foreground w-10 text-right">
                    {(fadeOut.time / 1000).toFixed(1)}s
                  </span>
                </div>
              )}
            </div>

            {/* Theme */}
            <div className="space-y-2 p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Tema</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-2"
                  onClick={() => toggleTheme?.()}
                >
                  {theme === "dark" ? (
                    <>
                      <Moon className="w-4 h-4" /> Escuro
                    </>
                  ) : (
                    <>
                      <Sun className="w-4 h-4" /> Claro
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
