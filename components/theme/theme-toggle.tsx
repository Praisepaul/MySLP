"use client";

import { Monitor, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme, type Theme } from "./theme-provider";
import { Button } from "@/components/ui/button";

const nextTheme: Record<Theme, Theme> = {
  system: "light",
  light: "dark",
  dark: "system",
};

const labels: Record<Theme, string> = {
  system: "System theme",
  light: "Light theme",
  dark: "Dark theme",
};

const THEME_HINT_STORAGE_KEY = "ephatha-theme-hint-seen";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    try {
      setShowHint(window.localStorage.getItem(THEME_HINT_STORAGE_KEY) !== "true");
    } catch {
      setShowHint(true);
    }
  }, []);

  const dismissHint = () => {
    setShowHint(false);

    try {
      window.localStorage.setItem(THEME_HINT_STORAGE_KEY, "true");
    } catch {
      // Theme switching should remain available even if localStorage is unavailable.
    }
  };

  const handleThemeChange = () => {
    dismissHint();
    setTheme(nextTheme[theme]);
  };

  const Icon = theme === "system" ? Monitor : theme === "dark" ? Moon : Sun;

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11"
        onClick={handleThemeChange}
        aria-label={`Theme: ${labels[theme]}. Switch to ${labels[nextTheme[theme]].toLowerCase()}.`}
        title={`Theme: ${labels[theme]}`}
      >
        <Icon aria-hidden="true" className="size-5" />
      </Button>

      {showHint ? (
        <div
          role="status"
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border bg-popover p-3 text-sm text-popover-foreground shadow-lg"
        >
          <div className="flex items-start gap-2">
            <p className="flex-1 leading-5">
              <span className="font-medium">Theme available.</span> Switch between Light, Dark, and System.
            </p>
            <button
              type="button"
              onClick={dismissHint}
              className="-mr-1 -mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Dismiss theme hint"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
