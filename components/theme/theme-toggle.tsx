"use client";

import { Monitor, Moon, Sun } from "lucide-react";
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

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const Icon = theme === "system" ? Monitor : theme === "dark" ? Moon : Sun;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-11"
      onClick={() => setTheme(nextTheme[theme])}
      aria-label={`Theme: ${labels[theme]}. Switch to ${labels[nextTheme[theme]].toLowerCase()}.`}
      title={`Theme: ${labels[theme]}`}
    >
      <Icon aria-hidden="true" className="size-5" />
    </Button>
  );
}
