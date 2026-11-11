"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// Per-viewer engagement state. Lives in localStorage until the database pipeline is built;
// the shape mirrors the tables we'll need (likes, saves, follows, comments, watch history).
export interface Comment {
  id: string;
  clipId: string;
  author: string;
  avatar?: string | null;
  text: string;
  at: string;
  ai?: boolean;
}

interface Persisted {
  likes: string[];
  saves: string[];
  follows: string[];
  watched: string[];
  comments: Comment[];
  muted: boolean;
  captions: boolean;
}

const EMPTY: Persisted = { likes: [], saves: [], follows: [], watched: [], comments: [], muted: true, captions: true };
const KEY = "edutok:v1";

function load(): Persisted {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

interface Ctx extends Persisted {
  ready: boolean;
  toggle: (list: "likes" | "saves" | "follows", id: string) => void;
  like: (id: string) => void; // idempotent (double-tap)
  markWatched: (id: string) => void;
  addComment: (c: Omit<Comment, "id" | "at">) => Comment;
  setMuted: (m: boolean) => void;
  setCaptions: (c: boolean) => void;
}

const UserState = createContext<Ctx | null>(null);

export function UserStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Persisted>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(load());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage blocked: keep in memory */
    }
  }, [state, ready]);

  const toggle = useCallback((list: "likes" | "saves" | "follows", id: string) => {
    setState((s) => ({ ...s, [list]: s[list].includes(id) ? s[list].filter((x) => x !== id) : [...s[list], id] }));
  }, []);

  const like = useCallback((id: string) => {
    setState((s) => (s.likes.includes(id) ? s : { ...s, likes: [...s.likes, id] }));
  }, []);

  const markWatched = useCallback((id: string) => {
    setState((s) => (s.watched.includes(id) ? s : { ...s, watched: [...s.watched.slice(-499), id] }));
  }, []);

  const addComment = useCallback((c: Omit<Comment, "id" | "at">) => {
    const full: Comment = { ...c, id: Math.random().toString(36).slice(2), at: new Date().toISOString() };
    setState((s) => ({ ...s, comments: [...s.comments, full] }));
    return full;
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      ...state,
      ready,
      toggle,
      like,
      markWatched,
      addComment,
      setMuted: (muted) => setState((s) => ({ ...s, muted })),
      setCaptions: (captions) => setState((s) => ({ ...s, captions })),
    }),
    [state, ready, toggle, like, markWatched, addComment],
  );

  return <UserState.Provider value={value}>{children}</UserState.Provider>;
}

export function useUser() {
  const ctx = useContext(UserState);
  if (!ctx) throw new Error("useUser must be used inside UserStateProvider");
  return ctx;
}
