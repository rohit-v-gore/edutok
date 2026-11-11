"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { GoogleG, Logo } from "../icons";

export default function LoginCard({ google, callbackUrl, error }: { google: boolean; callbackUrl: string; error?: string }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState<"google" | "guest" | null>(null);

  return (
    <div className="anim-rise w-full max-w-[400px] rounded-3xl border border-white/10 bg-ink-2/90 p-7 shadow-2xl backdrop-blur">
      <div className="flex flex-col items-center text-center">
        <Logo size={56} />
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Log in to EduTok</h1>
        <p className="mt-1.5 text-sm text-white/60">Swap the doom-scroll for a learn-scroll. Follow channels, save clips and make your own with AI.</p>
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-center text-sm text-red-300">Sign-in failed. Please try again.</p>}

      <div className="mt-6 flex flex-col gap-3">
        <button
          disabled={!google || busy !== null}
          onClick={() => {
            setBusy("google");
            signIn("google", { callbackUrl });
          }}
          className="flex h-12 items-center justify-center gap-3 rounded-xl bg-white font-semibold text-[#1f1f1f] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <GoogleG size={20} />
          {busy === "google" ? "Redirecting…" : "Continue with Google"}
        </button>
        {!google && (
          <p className="-mt-1 text-center text-[11px] leading-snug text-white/40">
            Google sign-in needs GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local (see README).
          </p>
        )}

        <div className="my-1 flex items-center gap-3 text-xs text-white/35">
          <span className="h-px flex-1 bg-white/10" /> or <span className="h-px flex-1 bg-white/10" />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setBusy("guest");
            signIn("guest", { name, callbackUrl });
          }}
          className="flex flex-col gap-2"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your first name (optional)"
            maxLength={40}
            className="h-12 rounded-xl bg-white/[0.07] px-4 text-[15px] outline-none placeholder:text-white/35 focus:ring-1 focus:ring-lime/60"
          />
          <button disabled={busy !== null} className="h-12 rounded-xl bg-lime font-semibold text-black transition hover:bg-lime-dim disabled:opacity-50">
            {busy === "guest" ? "Starting…" : "Continue as guest"}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-[11px] leading-relaxed text-white/35">
        Guest progress is stored in this browser only. By continuing you agree to learn something today.
      </p>
    </div>
  );
}
