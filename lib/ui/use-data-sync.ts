"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseDataSyncOptions = {
  revisionUrl: string;
  onRefresh: () => Promise<void>;
  intervalMs?: number;
};

export function useDataSync({ revisionUrl, onRefresh, intervalMs = 5000 }: UseDataSyncOptions) {
  const [refreshing, setRefreshing] = useState(false);
  const onRefreshRef = useRef(onRefresh);
  const lastRevisionRef = useRef<string | null>(null);
  const checkingRef = useRef(false);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRefreshRef.current();
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      if (cancelled || document.visibilityState !== "visible" || checkingRef.current) return;
      checkingRef.current = true;
      try {
        const response = await fetch(revisionUrl, { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json() as { revision?: string };
        if (!data.revision) return;
        if (lastRevisionRef.current === null) {
          lastRevisionRef.current = data.revision;
          return;
        }
        if (data.revision !== lastRevisionRef.current) {
          lastRevisionRef.current = data.revision;
          await onRefreshRef.current();
        }
      } finally {
        checkingRef.current = false;
      }
    };

    void check();
    const intervalId = window.setInterval(() => void check(), intervalMs);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [intervalMs, revisionUrl]);

  return { refresh, refreshing };
}
