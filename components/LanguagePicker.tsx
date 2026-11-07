"use client";

import { useEffect, useId, useRef, useState } from "react";
import { languageName, type Locale, LOCALES } from "@/lib/locales";
import { CheckIcon, ChevronIcon } from "./icons";

// A greeting in each language, set in the letter serif: a small, warm cue that
// each option is a language you'd be spoken to in.
const GREETING: Record<Locale, string> = {
  en: "Hello",
  pt: "Olá",
  es: "Hola",
  fr: "Bonjour",
  de: "Hallo",
  it: "Ciao",
  uk: "Привіт",
};

// Custom listbox (WAI-ARIA "select-only combobox" pattern): a button that
// opens a floating list. Arrow keys, Home/End, Enter/Space and Escape work;
// a click outside closes it.
export default function LanguagePicker({
  value,
  onChange,
  labelledBy,
  size = "lg",
  align = "end",
}: {
  value: Locale;
  onChange: (locale: Locale) => void;
  labelledBy?: string;
  size?: "lg" | "sm";
  align?: "start" | "end";
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const id = useId();
  const current = LOCALES.find((l) => l.code === value) ?? LOCALES[0];

  function openList() {
    setActive(Math.max(0, LOCALES.findIndex((l) => l.code === value)));
    setOpen(true);
  }

  function close(focusButton = true) {
    setOpen(false);
    if (focusButton) buttonRef.current?.focus();
  }

  function choose(index: number) {
    onChange(LOCALES[index].code);
    close();
  }

  useEffect(() => {
    if (!open) return;
    listRef.current?.focus();
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  useEffect(() => {
    if (open) document.getElementById(`${id}-opt-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, open, id]);

  function onListKey(e: React.KeyboardEvent) {
    const last = LOCALES.length - 1;
    if (e.key === "ArrowDown") setActive((a) => Math.min(last, a + 1));
    else if (e.key === "ArrowUp") setActive((a) => Math.max(0, a - 1));
    else if (e.key === "Home") setActive(0);
    else if (e.key === "End") setActive(last);
    else if (e.key === "Enter" || e.key === " ") choose(active);
    else if (e.key === "Escape") close();
    else if (e.key === "Tab") return setOpen(false);
    else return;
    e.preventDefault();
  }

  const lg = size === "lg";

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={labelledBy ? `${labelledBy} ${id}-value` : undefined}
        onClick={() => (open ? close() : openList())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            openList();
          }
        }}
        className={`group flex items-center gap-2.5 rounded-full border bg-surface text-left transition-[border-color,box-shadow] duration-200 hover:border-accent ${
          open ? "border-accent shadow-[0_0_0_3px_var(--accent-soft)]" : "border-border-strong/70"
        } ${lg ? "min-h-12 py-1.5 pr-3.5 pl-1.5" : "min-h-11 py-1 pr-3 pl-1"}`}
      >
        <TranslateGlyph size={lg ? 34 : 30} />
        <span id={`${id}-value`} lang={current.code} className={`font-semibold whitespace-nowrap ${lg ? "text-[15px]" : "text-[14px]"}`}>
          {current.label}
        </span>
        <ChevronIcon size={16} className={`ml-auto shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={labelledBy}
          aria-activedescendant={`${id}-opt-${active}`}
          onKeyDown={onListKey}
          className={`picker-pop absolute top-[calc(100%+0.5rem)] z-50 max-h-[min(26rem,70vh)] w-[17.5rem] overflow-y-auto rounded-2xl border border-border bg-surface p-1.5 shadow-paper outline-none ${
            align === "end" ? "right-0 origin-top-right" : "left-0 origin-top-left"
          }`}
        >
          {LOCALES.map((l, i) => {
            const selected = l.code === value;
            return (
              <li
                key={l.code}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={selected}
                onPointerEnter={() => setActive(i)}
                onClick={() => choose(i)}
                className={`flex min-h-13 cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-colors ${
                  i === active ? "bg-surface-2" : ""
                }`}
              >
                <span className="flex size-5 shrink-0 items-center justify-center text-accent">{selected && <CheckIcon size={18} />}</span>
                <span className="min-w-0 flex-1">
                  <span lang={l.code} className={`block text-[15px] leading-tight ${selected ? "font-semibold text-accent" : "font-medium"}`}>
                    {l.label}
                  </span>
                  {l.code !== "en" && <span className="block text-[12.5px] leading-tight text-muted">{languageName(l.code, "en")}</span>}
                </span>
                <span lang={l.code} aria-hidden className="font-serif text-[15px] text-muted italic">
                  {GREETING[l.code]}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// "A" beside "文", the familiar translate mark, drawn to match the icon set.
function TranslateGlyph({ size }: { size: number }) {
  return (
    <span aria-hidden className="flex shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent" style={{ width: size, height: size }}>
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.5 5.5h9M8 3.5v2M5.5 5.5c.6 3 2.6 5.6 5.5 7M10.5 5.5c-.7 3.4-3 6.4-6.5 8" />
        <path d="m12.5 20.5 4-9.5 4 9.5M14 17h5" />
      </svg>
    </span>
  );
}
