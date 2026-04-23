"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  SITE_CONTENT_KEYS,
  SiteContentEntry,
  SiteContentKey,
  SiteContentMap,
} from "@/lib/siteContent";

interface SiteContentContextValue {
  content: SiteContentMap;
  loading: boolean;
  refresh: () => Promise<void>;
  setEntry: (entry: SiteContentEntry) => void;
}

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

export function SiteContentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [content, setContent] = useState<SiteContentMap>({});
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/site-content", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as Record<string, SiteContentEntry>;
      const next: SiteContentMap = {};
      for (const key of Object.keys(SITE_CONTENT_KEYS) as SiteContentKey[]) {
        if (data[key]) next[key] = data[key];
      }
      setContent(next);
    } catch (err) {
      console.error("Failed to load site content:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    void refresh();
  }, [refresh]);

  const setEntry = useCallback((entry: SiteContentEntry) => {
    setContent((prev) => ({ ...prev, [entry.key]: entry }));
  }, []);

  const value = useMemo(
    () => ({ content, loading, refresh, setEntry }),
    [content, loading, refresh, setEntry]
  );

  return (
    <SiteContentContext.Provider value={value}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContentContext(): SiteContentContextValue {
  const ctx = useContext(SiteContentContext);
  if (!ctx) {
    throw new Error(
      "useSiteContentContext must be used within a SiteContentProvider"
    );
  }
  return ctx;
}

export function useSiteContent(key: SiteContentKey) {
  const { content, loading, setEntry, refresh } = useSiteContentContext();
  const entry = content[key];
  return { entry, loading, setEntry, refresh };
}
