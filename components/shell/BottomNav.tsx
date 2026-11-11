"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex h-[var(--nav-h)] items-start justify-around border-t border-white/10 bg-black pt-1.5 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {items.map(({ href, label, Icon, create }) => {
        const base = href.split("?")[0];
        const active = base === "/" ? path === "/" : path.startsWith(base) && !(label === "Me" && href !== base);
        if (create) {
          return (
            <Link key={href} href={href} aria-label="Create with AI Studio" className="relative mt-0.5 flex h-8 w-12 items-center justify-center">
              <span className="absolute inset-y-0 left-0 w-10 rounded-lg bg-violet" />
              <span className="absolute inset-y-0 right-0 w-10 rounded-lg bg-lime" />
              <span className="relative flex h-8 w-10 items-center justify-center rounded-lg bg-white text-black">
                <PlusIcon width={20} height={20} strokeWidth={3} />
              </span>
            </Link>
          );
        }
        return (
          <Link key={href} href={href} className={`flex w-14 flex-col items-center gap-0.5 text-[10px] font-medium ${active ? "text-white" : "text-zinc-500"}`}>
            <Icon filled={active} width={24} height={24} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
