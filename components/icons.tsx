import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { filled?: boolean };
const base = (p: P) => ({ width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, ...p, filled: undefined });

export const HomeIcon = (p: P) => (
  <svg {...base(p)}><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" fill={p.filled ? "currentColor" : "none"} /></svg>
);
export const CompassIcon = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" fill={p.filled ? "currentColor" : "none"} /></svg>
);
export const UsersIcon = (p: P) => (
  <svg {...base(p)}><circle cx="9" cy="8" r="3.5" fill={p.filled ? "currentColor" : "none"} /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18.5 20a6.5 6.5 0 0 0-2.5-5.1" /></svg>
);
export const UserIcon = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="8" r="4" fill={p.filled ? "currentColor" : "none"} /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
);
export const SparkIcon = (p: P) => (
  <svg {...base(p)}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" /></svg>
);
export const PlusIcon = (p: P) => <svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>;
export const SearchIcon = (p: P) => <svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
export const BookmarkIcon = (p: P) => (
  <svg {...base(p)}><path d="M6 3h12v18l-6-4-6 4z" fill={p.filled ? "currentColor" : "none"} /></svg>
);
export const HeartIcon = (p: P) => (
  <svg {...base(p)}><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.4 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" fill={p.filled ? "currentColor" : "none"} /></svg>
);
export const CommentIcon = (p: P) => (
  <svg {...base(p)}><path d="M4 5h16v11H9l-5 4z" fill={p.filled ? "currentColor" : "none"} /></svg>
);
export const ShareIcon = (p: P) => (
  <svg {...base(p)}><path d="M14 4l7 7-7 7v-4c-5 0-8.5 1.5-11 5 1-5.5 4-10 11-11z" fill={p.filled ? "currentColor" : "none"} /></svg>
);
export const VolumeIcon = ({ muted, ...p }: P & { muted?: boolean }) => (
  <svg {...base(p)}>
    <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
    {muted ? <path d="m17 9 5 6M22 9l-5 6" /> : <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />}
  </svg>
);
export const CaptionsIcon = (p: P) => (
  <svg {...base(p)}><rect x="3" y="5" width="18" height="14" rx="2" fill={p.filled ? "currentColor" : "none"} /><path d="M7 11h4M13 11h4M7 15h7" stroke={p.filled ? "#000" : "currentColor"} /></svg>
);
export const ChevronUp = (p: P) => <svg {...base(p)}><path d="m6 15 6-6 6 6" /></svg>;
export const ChevronDown = (p: P) => <svg {...base(p)}><path d="m6 9 6 6 6-6" /></svg>;
export const ChevronLeft = (p: P) => <svg {...base(p)}><path d="m15 6-6 6 6 6" /></svg>;
export const CloseIcon = (p: P) => <svg {...base(p)}><path d="M6 6l12 12M18 6 6 18" /></svg>;
export const LinkIcon = (p: P) => <svg {...base(p)}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>;
export const SendIcon = (p: P) => <svg {...base(p)}><path d="M4 12 20 4l-6 16-3-7z" fill={p.filled ? "currentColor" : "none"} /></svg>;
export const PlayIcon = (p: P) => <svg {...base(p)}><path d="M7 4v16l13-8z" fill="currentColor" /></svg>;
export const BookIcon = (p: P) => <svg {...base(p)}><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M8 7h7" /></svg>;
export const LogoutIcon = (p: P) => <svg {...base(p)}><path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" /></svg>;
export const GridIcon = (p: P) => <svg {...base(p)}><rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" /><rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" /></svg>;

export function Logo({ size = 32 }: { size?: number }) {
  // EduTok mark: a black play glyph on a white rounded tile.
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      <rect x="2" y="2" width="36" height="36" rx="10" fill="#ffffff" />
      <path d="M16 13v14l11-7z" fill="#000000" />
    </svg>
  );
}

export function GoogleG({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
