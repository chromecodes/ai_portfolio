"use client";

/**
 * Infinite scrolling tech marquee — pure CSS animation, duplicated track,
 * pauses on hover, reverses in RTL.
 */
export default function Marquee({ items }: { items: string[] }) {
    if (!items.length) return null;
    // Duplicate the list enough times for a seamless loop
    const loop = [...items, ...items, ...items, ...items];

    return (
        <div className="marquee-mask relative w-full overflow-hidden py-4" aria-hidden>
            <div className="marquee-track flex w-max items-center">
                {loop.map((item, idx) => (
                    <span
                        key={idx}
                        className="flex items-center gap-2 whitespace-nowrap rounded-full border border-borderColor bg-secondary-background/60 backdrop-blur-sm px-4 py-1.5 mx-2 text-xs font-bold tracking-wide text-muted-foreground"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-color/70" />
                        {item}
                    </span>
                ))}
            </div>
        </div>
    );
}
