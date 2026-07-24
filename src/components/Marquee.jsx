export default function Marquee({ items }) {
  return (
    <div className="group relative overflow-hidden border-y border-white/10 bg-[#0a0a0a] py-5">
      <div className="flex w-max animate-[marquee_28s_linear_infinite] gap-16 group-hover:[animation-play-state:paused]">
        {[...items, ...items].map((item, i) => (
          <div key={i} className="mono flex items-center gap-3 whitespace-nowrap text-sm uppercase tracking-widest text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500" aria-hidden="true" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}