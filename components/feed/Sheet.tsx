"use client";

import { useEffect } from "react";
import { CloseIcon } from "../icons";

// Bottom sheet on mobile, right-side drawer on desktop.
export default function Sheet({ title, onClose, children, footer }: { title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-stretch md:justify-end" role="dialog" aria-modal aria-label={title}>
      <button aria-label="Close" onClick={onClose} className="anim-fade absolute inset-0 bg-black/50" />
      <div className="anim-sheet relative flex max-h-[75dvh] w-full flex-col rounded-t-2xl bg-ink-2 md:max-h-none md:w-[420px] md:rounded-none md:border-l md:border-white/10">
        <header className="relative flex items-center justify-center border-b border-white/10 px-4 py-3.5">
          <h3 className="text-sm font-bold">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="absolute right-3 rounded-full p-1 hover:bg-white/10">
            <CloseIcon width={20} height={20} />
          </button>
        </header>
        <div className="no-scrollbar min-h-[200px] flex-1 overflow-y-auto">{children}</div>
        {footer}
      </div>
    </div>
  );
}
