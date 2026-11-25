"use client";

import {
    useEffect,
    useRef,
    useState,
    type MouseEvent as ReactMouseEvent,
} from "react";
import { useReducedMotion } from "framer-motion";

// Electric glyph set — slashes, brackets, blocks: sharp, high-voltage flicker
const ELECTRIC_CHARS = "!<>-_\\/[]{}=+*^?#01░▒▓";

// Decode cascade speed — char i locks in (i + 1) * CHAR_LOCK_MS after start
const CHAR_LOCK_MS = 48;

// Hover micro-scramble — the hovered char locks back first, neighbours follow
const HOVER_LOCK_MS = 260;
const HOVER_NEIGHBOR_LOCK_MS = 420;

// How many neighbours on each side of the hovered char scramble
const SPREAD = 1;

// Hit-test forgiveness (px) around a character
const DEFAULT_RADIUS = 24;

/**
 * Text morph — a sharp, electric decode: characters flicker through electric
 * glyphs and lock in left-to-right. Replays on language switch. Each character
 * is its own span: hovering one scrambles only it and its ±SPREAD neighbours,
 * re-arming when the cursor moves off. Static under prefers-reduced-motion.
 * Screen readers / SEO get the real text via the sr-only copy.
 */
export default function ScrambleText({
    text,
    delayMs = 0,
    radius = DEFAULT_RADIUS,
    className = "",
}: {
    text: string;
    delayMs?: number;
    radius?: number;
    className?: string;
}) {
    const reduced = useReducedMotion();
    const [display, setDisplay] = useState("");
    const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const charsRef = useRef<string[]>([]);
    const displayRef = useRef("");
    const locksRef = useRef<Map<number, number>>(new Map()); // char idx → unlock time
    const rafRef = useRef(0);
    const lastHoverRef = useRef(-1);

    // Shared flicker loop — drives the mount decode and hover micro-scrambles
    const ensureLoop = () => {
        if (rafRef.current) return;
        const step = () => {
            const now = performance.now();
            const locks = locksRef.current;
            if (locks.size === 0) {
                rafRef.current = 0;
                return;
            }
            const target = charsRef.current;
            const base = Array.from(
                displayRef.current.length === target.length ? displayRef.current : target
            );
            locks.forEach((until, idx) => {
                base[idx] =
                    now >= until
                        ? target[idx] // locked back — sharp
                        : ELECTRIC_CHARS[(Math.random() * ELECTRIC_CHARS.length) | 0]; // electric
            });
            const next = base.join("");
            displayRef.current = next;
            setDisplay(next);
            locks.forEach((until, idx) => {
                if (now >= until) locks.delete(idx);
            });
            rafRef.current = requestAnimationFrame(step);
        };
        rafRef.current = requestAnimationFrame(step);
    };

    // Mount / language-change decode — the whole text builds with a cascade
    useEffect(() => {
        if (!text || reduced) return;
        const chars = Array.from(text);
        const locks = locksRef.current; // stable Map instance
        charsRef.current = chars;

        let timer: ReturnType<typeof setTimeout> | undefined;
        const begin = () => {
            const now = performance.now();
            chars.forEach((ch, i) => {
                if (ch !== " ") locks.set(i, now + (i + 1) * CHAR_LOCK_MS);
            });
            ensureLoop();
        };
        if (delayMs > 0) timer = setTimeout(begin, delayMs);
        else begin();

        return () => {
            if (timer) clearTimeout(timer);
            locks.clear();
        };
    }, [text, reduced, delayMs]);

    // Stop the loop on unmount — reset the handle so a remount can restart it
    useEffect(
        () => () => {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = 0;
        },
        []
    );

    // Per-character hover — hovered char + ±SPREAD neighbours scramble
    const handleMove = (e: ReactMouseEvent) => {
        if (reduced) return;
        const chars = charsRef.current;
        if (!chars.length) return;

        // Nearest char to the cursor, within `radius`
        let hovered = -1;
        let best = Infinity;
        charRefs.current.forEach((el, i) => {
            if (!el) return;
            const r = el.getBoundingClientRect();
            const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
            const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
            const d = Math.hypot(dx, dy);
            if (d < best) {
                best = d;
                hovered = i;
            }
        });
        if (hovered === -1 || best > radius) return;
        if (lastHoverRef.current === hovered) return; // still on the same char
        lastHoverRef.current = hovered;

        const now = performance.now();
        for (
            let j = Math.max(0, hovered - SPREAD);
            j <= Math.min(chars.length - 1, hovered + SPREAD);
            j++
        ) {
            if (chars[j] === " ") continue;
            locksRef.current.set(
                j,
                now + (j === hovered ? HOVER_LOCK_MS : HOVER_NEIGHBOR_LOCK_MS)
            );
        }
        ensureLoop();
    };

    const handleLeave = () => {
        lastHoverRef.current = -1; // re-arm
    };

    const chars = Array.from(text);
    const displayChars = reduced ? chars : Array.from(display);

    return (
        <span className={className} onMouseMove={handleMove} onMouseLeave={handleLeave}>
            <span className="sr-only">{text}</span>
            <span aria-hidden="true" className="whitespace-pre-wrap">
                {chars.map((ch, i) => (
                    <span
                        key={i}
                        ref={(el) => {
                            charRefs.current[i] = el;
                        }}
                    >
                        {displayChars[i] ?? "\u00A0"}
                    </span>
                ))}
            </span>
        </span>
    );
}
