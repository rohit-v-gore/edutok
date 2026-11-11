/* eslint-disable @next/next/no-img-element */
export default function Avatar({
  emoji,
  image,
  name,
  color = "#26262f",
  size = 40,
  ring = false,
}: {
  emoji?: string;
  image?: string | null;
  name?: string | null;
  color?: string;
  size?: number;
  ring?: boolean;
}) {
  const style = { width: size, height: size, fontSize: size * 0.5 };
  const cls = `inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ${ring ? "ring-2 ring-white" : ""}`;
  if (image) return <img src={image} alt={name ?? ""} referrerPolicy="no-referrer" className={cls} style={style} />;
  return (
    <span className={`${cls} border border-white/15`} style={{ ...style, background: "radial-gradient(circle at 30% 25%, #3a3a3a, #0a0a0a 110%)" }} data-color={color}>
      {emoji ? <span className="grayscale">{emoji}</span> : <span className="font-semibold text-white" style={{ fontSize: size * 0.42 }}>{(name ?? "?").slice(0, 1).toUpperCase()}</span>}
    </span>
  );
}
