"use client";

import type { CountryCode } from "@/lib/samples";
import Flag from "./Flag";

// A fanned pile of small made-up letters. The one at the front matches the
// row being looked at, and its key facts are underlined in marker as it
// arrives. Purely illustrative, so it's hidden from assistive tech; the list
// beside it carries the same information as text.

type Ink = "money" | "date" | "ref" | "risk";
export type Segment = string | { text: string; ink: Ink };
export type Paper = {
  head: string;
  place: string;
  subject: string;
  lines: Segment[][];
  country: CountryCode;
  language: string;
};

// Fixed tilt per paper, so the pile looks hand-dropped but never jitters.
const TILT = [-4.5, 3.6, -2.4, 5, -3.4, 2.2, -5.5];
const NUDGE_X = [9, -8, 11, -10, 8, -9, 10];

export default function LetterStack({ papers, active }: { papers: Paper[]; active: number }) {
  const n = papers.length;
  return (
    // --fan scales the spread of the papers behind; hovering the pile opens it up.
    <div aria-hidden className="relative mx-auto h-[22rem] w-full max-w-[24rem] select-none [--fan:1] lg:mx-0 pointer-fine:hover:[--fan:1.5]">
      {papers.map((p, i) => {
        const depth = (i - active + n) % n;
        const front = depth === 0;
        const d = Math.min(depth, 3);
        // The front paper rests square so its text renders sharp; the tilt
        // lives in the papers behind and in the move to the front.
        const transform = front
          ? "translate(0px, 0px) rotate(0deg) scale(1)"
          : `translate(calc(var(--fan) * ${NUDGE_X[i % NUDGE_X.length] * d * 0.9}px), calc(var(--fan) * ${-d * 11}px)) rotate(calc(var(--fan) * ${TILT[i % TILT.length]}deg)) scale(${1 - d * 0.025})`;
        let ink = 0;
        return (
          <div
            key={p.subject}
            data-front={front || undefined}
            className={`absolute inset-0 flex flex-col overflow-hidden rounded-[3px] border bg-surface px-6 pt-6 pb-5 font-serif transition-[transform,opacity,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              front ? "border-border shadow-paper" : "border-border/80 shadow-[0_1px_2px_rgb(0_0_0/0.06)]"
            }`}
            style={{ transform, zIndex: n - depth, opacity: depth > 3 ? 0 : 1 }}
          >
            <p className="font-sans text-[11px] font-semibold tracking-[0.12em] text-foreground uppercase">{p.head}</p>
            <p className="mt-1 text-[13px] text-muted">{p.place}</p>
            <p className="mt-4 text-[18px] leading-snug font-semibold text-foreground text-balance">{p.subject}</p>
            <div className="mt-3 space-y-1.5 text-[15px] leading-[1.55] text-foreground">
              {p.lines.map((line, j) => (
                <p key={j}>
                  {line.map((seg, k) =>
                    typeof seg === "string" ? (
                      seg
                    ) : (
                      <span key={k} className={`ink ink-${seg.ink} text-foreground`} style={{ transitionDelay: `${260 + ink++ * 170}ms` }}>
                        {seg.text}
                      </span>
                    ),
                  )}
                </p>
              ))}
            </div>
            <div className="mt-4 space-y-2.5">
              <span className="block h-1.5 w-[88%] rounded-full bg-border" />
              <span className="block h-1.5 w-[66%] rounded-full bg-border" />
            </div>
            <p className="mt-auto flex items-center gap-2 pt-3 font-sans text-[13px] text-muted">
              <Flag country={p.country} className="h-[11px] w-4" />
              {p.language}
            </p>
          </div>
        );
      })}
    </div>
  );
}
