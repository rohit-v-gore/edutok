"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Scene } from "@/lib/types";
import { sceneMs } from "@/lib/format";

// Drives a clip like a video: advances scenes on a clock (or when narration finishes),
// loops at the end, and exposes progress for the scrubber and karaoke captions.
export function usePlayer(scenes: Scene[], active: boolean, muted: boolean) {
  const [idx, setIdx] = useState(0);
  const [frac, setFrac] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loops, setLoops] = useState(0);
  const elapsed = useRef(0);
  const spokenDone = useRef(false);

  const speechOn = !muted && typeof window !== "undefined" && "speechSynthesis" in window;
  const playing = active && !paused;
  const dur = sceneMs(scenes[idx]?.narration ?? "");

  // Reset when scrolled away.
  useEffect(() => {
    if (!active) {
      setIdx(0);
      setFrac(0);
      setPaused(false);
      elapsed.current = 0;
    }
  }, [active]);

  // Narration for the current scene.
  useEffect(() => {
    if (!playing || !speechOn) return;
    const synth = window.speechSynthesis;
    spokenDone.current = false;
    elapsed.current = 0; // (re)start the scene in sync with the voice
    const u = new SpeechSynthesisUtterance(scenes[idx].narration);
    u.rate = 1.06;
    const voice = synth.getVoices().find((v) => /en[-_](US|GB)/i.test(v.lang) && /natural|samantha|google|daniel/i.test(v.name));
    if (voice) u.voice = voice;
    u.onend = () => (spokenDone.current = true);
    u.onerror = () => (spokenDone.current = true);
    synth.cancel();
    synth.speak(u);
    return () => synth.cancel();
  }, [playing, speechOn, idx, loops, scenes]);

  // Clock.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      elapsed.current += now - last;
      last = now;
      const waitingOnVoice = speechOn && !spokenDone.current;
      setFrac(Math.min(elapsed.current / dur, waitingOnVoice ? 0.97 : 1));
      const done = speechOn
        ? (spokenDone.current && elapsed.current > 1200) || elapsed.current > dur * 2.5
        : elapsed.current >= dur;
      if (done) {
        elapsed.current = 0;
        spokenDone.current = false;
        setFrac(0);
        setIdx((i) => {
          if (i + 1 >= scenes.length) {
            setLoops((l) => l + 1);
            return 0;
          }
          return i + 1;
        });
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, idx, loops, dur, speechOn, scenes.length]);

  const seek = useCallback((i: number) => {
    elapsed.current = 0;
    spokenDone.current = false;
    setFrac(0);
    setIdx(i);
    setLoops((l) => l + 1); // force effects to restart even when i === idx
  }, []);

  return {
    idx,
    frac,
    paused,
    loops,
    setPaused,
    seek,
    progress: (idx + frac) / scenes.length,
  };
}
