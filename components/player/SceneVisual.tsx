import type { Visual } from "@/lib/types";

// Each visual animates in when its scene starts (the parent re-keys on scene change).
export default function SceneVisual({ visual, accent }: { visual: Visual; accent: string }) {
  switch (visual.kind) {
    case "title":
      return (
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className="anim-pop flex h-28 w-28 items-center justify-center rounded-[32px] text-6xl shadow-2xl"
            style={{ background: `linear-gradient(145deg, ${accent}, #111)`, boxShadow: `0 20px 60px -15px ${accent}` }}
          >
            <span className="anim-float">{visual.emoji}</span>
          </div>
          {visual.kicker && (
            <span className="anim-rise rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur" style={{ animationDelay: "0.2s" }}>
              {visual.kicker}
            </span>
          )}
        </div>
      );

    case "bullets":
      return (
        <ul className="flex w-full max-w-[320px] flex-col gap-2.5">
          {visual.items.map((item, i) => (
            <li
              key={i}
              className="anim-rise flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-[15px] font-semibold backdrop-blur"
              style={{ animationDelay: `${0.15 + i * 0.35}s` }}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black text-black" style={{ background: accent }}>
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ul>
      );

    case "flow":
      return (
        <div className="flex w-full max-w-[320px] flex-col items-center">
          {visual.nodes.map((n, i) => (
            <div key={i} className="flex w-full flex-col items-center">
              <div
                className="anim-pop w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-center text-[15px] font-bold backdrop-blur"
                style={{ animationDelay: `${0.1 + i * 0.45}s`, boxShadow: i === visual.nodes.length - 1 ? `0 0 0 2px ${accent}` : undefined }}
              >
                {n}
              </div>
              {i < visual.nodes.length - 1 && (
                <svg width="24" height="26" viewBox="0 0 24 26" className="my-0.5">
                  <path
                    d="M12 2v18m-6-6 6 6 6-6"
                    stroke="white"
                    strokeOpacity={0.7}
                    strokeWidth={2.5}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={60}
                    style={{ animation: `draw 0.5s ${0.35 + i * 0.45}s both` }}
                  />
                </svg>
              )}
            </div>
          ))}
        </div>
      );

    case "stat":
      return (
        <div className="flex flex-col items-center text-center">
          <span className="anim-pop bg-gradient-to-b from-white to-white/60 bg-clip-text text-[64px] font-black leading-none tracking-tight text-transparent sm:text-[76px]">
            {visual.value}
          </span>
          <span className="anim-rise mt-3 max-w-[260px] text-base font-semibold text-white/75" style={{ animationDelay: "0.3s" }}>
            {visual.label}
          </span>
        </div>
      );

    case "compare":
      return (
        <div className="grid w-full max-w-[340px] grid-cols-2 gap-2.5">
          {[visual.left, visual.right].map((side, s) => (
            <div
              key={s}
              className="anim-rise rounded-2xl border bg-black/40 p-3 backdrop-blur"
              style={{ animationDelay: `${0.15 + s * 0.5}s`, borderColor: s === 1 ? accent : "rgba(255,255,255,0.12)" }}
            >
              <p className="mb-2 text-xs font-black uppercase tracking-wider text-white/60">{side.title}</p>
              <ul className="flex flex-col gap-1.5">
                {side.items.map((it, i) => (
                  <li key={i} className="text-[13.5px] font-semibold leading-snug">
                    {s === 1 ? "✓ " : "· "}
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );

    case "code":
      return (
        <div className="anim-rise w-full max-w-[340px] overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d12]/90 shadow-2xl">
          <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-2 font-mono text-[11px] text-white/40">{visual.lang}</span>
          </div>
          <pre className="whitespace-pre-wrap break-words p-3 font-mono text-[12.5px] leading-relaxed text-lime">
            {visual.code.split("\n").map((line, i) => (
              <span key={i} className="anim-rise block" style={{ animationDelay: `${0.2 + i * 0.18}s` }}>
                {line || " "}
              </span>
            ))}
          </pre>
        </div>
      );

    case "grid": {
      const cols = visual.cells.length <= 3 ? 1 : visual.cells.length <= 6 ? 2 : visual.cells.length <= 9 ? 3 : 4;
      return (
        <div className="grid w-full max-w-[320px] gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {visual.cells.map((c, i) => {
            const hot = visual.highlight?.includes(i);
            return (
              <div
                key={i}
                className="anim-pop flex min-h-[44px] items-center justify-center rounded-xl border px-2 py-2 text-center text-[13px] font-bold"
                style={{
                  animationDelay: `${0.05 + i * 0.07}s`,
                  background: hot ? accent : "rgba(0,0,0,0.38)",
                  color: hot ? "#0b0b0f" : "white",
                  borderColor: hot ? "transparent" : "rgba(255,255,255,0.12)",
                  animationName: hot ? "pop, pulse-ring" : "pop",
                  animationDuration: hot ? "0.5s, 1.6s" : "0.5s",
                  animationIterationCount: hot ? "1, infinite" : "1",
                }}
              >
                {c}
              </div>
            );
          })}
        </div>
      );
    }
  }
}
