"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BookmarkIcon, CompassIcon, HomeIcon, PlusIcon, UserIcon } from "../icons";

const items = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/explore", label: "Explore", Icon: CompassIcon },
  { href: "/studio", label: "", Icon: PlusIcon, create: true },
  { href: "/profile?tab=saved", label: "Saved", Icon: BookmarkIcon },
  { href: "/profile", label: "Me", Icon: UserIcon },
];

export default function BottomNav() {
  const path = usePathname();
  // Read the query string after mount (useSearchParams in the root layout would force a Suspense boundary).
  const [tab, setTab] = useState<string | null>(null);
  useEffect(() => {
    setTab(new URLSearchParams(window.location.search).get("tab"));
  }, [path]);
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex h-[var(--nav-h)] items-start justify-around border-t border-white/[0.08] bg-black/90 pt-1.5 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {items.map(({ href, label, Icon, create }) => {
        const base = href.split("?")[0];
        const onProfile = path.startsWith("/profile");
        const active =
          label === "Saved" ? onProfile && tab === "saved" : label === "Me" ? onProfile && tab !== "saved" : base === "/" ? path === "/" : path.startsWith(base);
        if (create) {
          return (
            <Link key={href} href={href} aria-label="Create with AI Studio" className="relative mt-0.5 flex h-8 w-12 items-center justify-center">
              <span className="relative flex h-8 w-11 items-center justify-center rounded-[10px] bg-white text-black shadow-[0_0_0_1px_rgba(255,255,255,0.15)]">
                <PlusIcon width={20} height={20} strokeWidth={3} />
              </span>
            </Link>
          );
        }
        return (
          <Link key={href} href={href} onClick={() => setTab(new URL(href, "http://x").searchParams.get("tab"))} className={`flex w-14 flex-col items-center gap-0.5 text-[10px] font-medium ${active ? "text-white" : "text-white/45"}`}>
            <Icon filled={active} width={24} height={24} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
