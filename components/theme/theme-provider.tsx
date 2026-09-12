"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "ephatha-theme";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const themeSubscribers = new Set<() => void>();

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const resolvedTheme =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;

  root.classList.toggle("dark", resolvedTheme === "dark");
  root.style.colorScheme = resolvedTheme;
}

function readStoredTheme(): Theme {
  try {
    const storedTheme = localStorage.getItem(STORAGE_KEY);
    return storedTheme === "light" || storedTheme === "dark" || storedTheme === "system"
      ? storedTheme
      : "system";
  } catch {
    return "system";
  }
}

function subscribeToThemeStore(callback: () => void) {
  themeSubscribers.add(callback);
  return () => themeSubscribers.delete(callback);
}

function getThemeSnapshot() {
  return readStoredTheme();
}

function getThemeServerSnapshot(): Theme {
  return "system";
}

function notifyThemeSubscribers() {
  themeSubscribers.forEach((callback) => callback());
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeToThemeStore,
    getThemeSnapshot,
    getThemeServerSnapshot,
  );

  const setTheme = useCallback((nextTheme: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      // Theme still applies for the current session if storage is unavailable.
    }
    notifyThemeSubscribers();
    applyTheme(nextTheme);
  }, []);

  useEffect(() => {
    applyTheme(theme);

    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme("system");
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
