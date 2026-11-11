"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useUser } from "@/lib/user-state";
import { channels } from "@/content/channels";
import { CompassIcon, HomeIcon, Logo, LogoutIcon, SearchIcon, SparkIcon, UserIcon, UsersIcon } from "../icons";
import Avatar from "../Avatar";

export const NAV = [
  { href: "/", label: "For You", Icon: HomeIcon },
  { href: "/explore", label: "Explore", Icon: CompassIcon },
  { href: "/following", label: "Following", Icon: UsersIcon },
  { href: "/studio", label: "AI Studio", Icon: SparkIcon },
  { href: "/profile", label: "Profile", Icon: UserIcon },
];

export default function Sidebar() {
  const path = usePathname();
  const { data: session } = useSession();
  const { follows } = useUser();
  const followed = channels.filter((c) => follows.includes(c.id));

  return (
    <aside className="hidden h-full w-[72px] shrink-0 flex-col border-r border-white/10 bg-black px-2 py-4 md:flex lg:w-[240px] lg:px-3">
      <Link href="/" className="mb-5 flex items-center gap-2 px-2">
        <Logo size={34} />
        <span className="hidden text-[21px] font-bold tracking-[-0.03em] lg:inline">
          Edu<span className="font-light text-white/55">Tok</span>
        </span>
      </Link>

      <Link
        href="/explore"
        className="mb-3 hidden items-center gap-2 rounded-full bg-white/[0.07] px-4 py-2.5 text-sm text-zinc-400 hover:bg-white/10 lg:flex"
      >
        <SearchIcon width={18} height={18} /> Search concepts
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ href, label, Icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[16px] font-medium tracking-tight transition hover:bg-white/[0.05] ${
                active ? "bg-white/[0.06] text-white" : "text-white/55 hover:text-white"
              }`}
            >
              <Icon filled={active} width={26} height={26} />
              <span className="hidden lg:inline">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="my-4 hidden border-t border-white/10 lg:block" />

      {!session ? (
        <div className="hidden lg:block">
          <p className="mb-3 px-2 text-sm leading-snug text-zinc-400">
            Log in to follow channels, save clips and make your own with the AI studio.
          </p>
          <Link
            href="/login"
            className="block rounded-md border border-lime px-4 py-2.5 text-center font-semibold text-lime hover:bg-lime/10"
          >
            Log in
          </Link>
        </div>
      ) : (
        <div className="hidden lg:block">
          <p className="mb-2 px-2 text-xs font-semibold text-zinc-400">Following</p>
          {followed.length === 0 && <p className="px-2 text-sm text-zinc-500">Channels you follow show up here.</p>}
          {followed.map((c) => (
            <Link key={c.id} href={`/channel/${c.id}`} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/[0.06]">
              <Avatar emoji={c.avatar} color={c.color} size={30} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{c.handle}</p>
                <p className="truncate text-xs text-zinc-500">{c.name}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-auto">
        {session && (
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100"
          >
            <LogoutIcon width={22} height={22} />
            <span className="hidden lg:inline">Log out</span>
          </button>
        )}
        <p className="mt-3 hidden px-2 text-[11px] leading-relaxed text-zinc-600 lg:block">
          EduTok · learn something real every swipe.
        </p>
      </div>
    </aside>
  );
}
