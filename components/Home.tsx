"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/locales";
import { type CountryCode, SAMPLES, type Sample } from "@/lib/samples";
import { MAX_UPLOAD_MB } from "@/lib/schema";
import Flag from "./Flag";
import LanguagePicker from "./LanguagePicker";
import LetterStack, { type Paper } from "./LetterStack";
import { CalendarIcon, CameraIcon, CheckIcon, ChevronIcon, LockIcon, UploadIcon } from "./icons";
import { button, card, PickButtons, useFilePicker } from "./ui";

export const HOME_LINKS = [
  { href: "#letters", label: "What it reads" },
  { href: "#how", label: "How it works" },
  { href: "#privacy", label: "Privacy" },
];

type UploadProps = {
  busy: boolean;
  language: Locale;
  onLanguage: (language: Locale) => void;
  onFile: (file: File) => void;
  onSample: (sample: Sample) => void;
};

export function Hero() {
  return (
    <div className="max-w-xl">
      <h1 className="text-[2.125rem] leading-[1.06] font-semibold tracking-[-0.03em] text-balance sm:text-[2.75rem] lg:text-[3.5rem]">
        Make sense of an official letter.
      </h1>
      <p className="mt-5 text-[17px] leading-relaxed text-muted text-pretty lg:text-[18px]">
        Work contracts, tax notices, fines, letters from your landlord. Take a photo and see what it means, what you owe
        or earn, when it&apos;s due, and a reply you can send.
      </p>
    </div>
  );
}

export function UploadPanel({ busy, language, onLanguage, onFile, onSample }: UploadProps) {
  const [dragging, setDragging] = useState(false);
  const { openCamera, openFiles, inputs } = useFilePicker(onFile);

  return (
    <div className="space-y-8">
      <div
        className={`${card} p-4 transition-colors sm:p-5 ${dragging ? "border-accent bg-accent-soft" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          if (!busy) setDragging(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file && !busy) onFile(file);
        }}
      >
        {/* Asked first, so the choice is made before the upload starts. */}
        <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
          <div className="min-w-0 flex-1">
            <p id="explain-in-label" className="text-[15px] font-medium">
              Explain it in
            </p>
            <p className="text-sm text-muted">The letter itself can be in any language.</p>
          </div>
          <LanguagePicker value={language} onChange={onLanguage} labelledBy="explain-in-label" />
        </div>

        {/* Touch screens: the camera is the main way in. */}
        <div className="hidden flex-col gap-3 pointer-coarse:flex">
          <button type="button" disabled={busy} onClick={openCamera} className={`${button.primary} min-h-16 text-[17px]`}>
            <CameraIcon size={22} />
            Take a photo
          </button>
          <button type="button" disabled={busy} onClick={openFiles} className={button.secondary}>
            <UploadIcon size={20} />
            Upload a file
          </button>
          <p className="text-center text-sm text-muted">JPG, PNG or PDF, up to {MAX_UPLOAD_MB}MB</p>
        </div>

        {/* Mouse and trackpad: drop a file or choose one. */}
        <div
          className={`flex flex-col items-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors pointer-coarse:hidden ${
            dragging ? "border-accent" : "border-border"
          }`}
        >
          <p className="text-lg font-medium">Drop a letter here</p>
          <p className="mt-1 text-sm text-muted">A photo or scan: JPG, PNG or PDF, up to {MAX_UPLOAD_MB}MB</p>
          <button type="button" disabled={busy} onClick={openFiles} className={`${button.primary} mt-5`}>
            <UploadIcon size={20} />
            Choose a file
          </button>
        </div>

        <p className="mt-4 flex items-start justify-center gap-2 text-sm text-muted">
          <LockIcon size={16} className="mt-0.5 shrink-0" />
          <span>Your letter isn&apos;t stored. Always check the original.</span>
        </p>
        {inputs}

      </div>

      <div>
        <h2 className="text-[15px] font-medium">No letter to hand? Try a sample</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {SAMPLES.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                disabled={busy}
                onClick={() => onSample(s)}
                className="group flex min-h-14 w-full items-center gap-3 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-left transition-colors hover:border-accent disabled:opacity-50"
              >
                <Flag country={s.country} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium group-hover:text-accent">{s.short}</span>
                  <span className="block text-sm text-muted">{s.countryName}</span>
                </span>
                <ChevronIcon size={18} className="-rotate-90 text-muted transition-transform group-hover:translate-x-0.5" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// "What you get": a real excerpt of a (made-up) Portuguese tax letter, with the
// parts that matter picked out in highlighter, and the plain-English reading
// laid over it in the same colours.
export function LetterPreview() {
  // The letter lands tilted and squares up once it's on screen: the tilt is
  // the motion, and the resting sheet is square so its text renders sharp.
  const ref = useRef<HTMLElement>(null);
  const [landed, setLanded] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLanded(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <figure ref={ref} data-landed={landed || undefined} className="group/pile mx-auto w-full max-w-md lg:mx-0 lg:mt-3 lg:max-w-none">
      <div className="relative">
        {/* Blank sheets fanned behind carry the tilt at rest, and spread a
            little further when the pile is hovered. */}
        <div
          aria-hidden
          className="absolute inset-x-1 top-3 bottom-16 translate-x-4 rotate-[5deg] rounded-[3px] border border-border bg-surface shadow-paper transition-[rotate,translate] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-fine:group-hover/pile:translate-x-6 pointer-fine:group-hover/pile:rotate-[7deg]"
        />
        <div
          aria-hidden
          className="absolute inset-x-1 top-5 bottom-14 -translate-x-3.5 -rotate-[4deg] rounded-[3px] border border-border bg-surface shadow-paper transition-[rotate,translate] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-fine:group-hover/pile:-translate-x-5 pointer-fine:group-hover/pile:-rotate-[6deg]"
        />
        <div
          aria-hidden
          className="settle relative rounded-[3px] border border-border bg-surface px-5 pt-5 pb-24 font-serif text-[13.5px] leading-[1.6] text-foreground/85 shadow-paper sm:px-7 sm:pt-7 lg:text-[14.5px] pointer-fine:group-hover/pile:-translate-y-1 pointer-fine:group-hover/pile:-rotate-[1.2deg]"
        >
          <p className="font-sans text-[11px] font-semibold tracking-[0.12em] text-foreground uppercase">Northgate Analytics Ltd</p>
          <p className="text-[12px] text-muted">12 Example Street · Exampleford</p>
          <p className="mt-3 text-right text-[12px] text-muted">3 November 2026</p>
          <p className="mt-3 text-[15px] font-semibold text-foreground lg:text-[16px]">Statement of main terms of employment</p>
          <p className="mt-2">
            2. Start date: your employment begins on <span className="mark mark-date text-foreground">1 December 2026</span>.
          </p>
          <p className="mt-1.5">
            4. Salary: <span className="mark mark-money font-semibold text-foreground">£38,500 per year</span>, paid monthly in arrears.
          </p>
          <p className="mt-1.5">
            5. Hours: 37.5 per week. You may be required to work additional hours{" "}
            <span className="mark mark-risk text-foreground">without further pay</span>.
          </p>
          <p className="mt-1.5">
            8. Restrictions: for 6 months after you leave, <span className="mark mark-risk text-foreground">no competitor within 25 miles</span>.
          </p>
          <p className="mt-1.5">
            Please sign and return one copy by <span className="mark mark-date text-foreground">20 November 2026</span>.
          </p>
        </div>

        <div className={`${card} settle-card relative z-10 -mt-20 ml-4 p-4 shadow-paper sm:ml-10 sm:p-5`}>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
            <span className="rounded-full bg-medium-soft px-2 py-0.5 font-medium text-medium">Needs attention</span>
            <span className="text-muted">Work contract · English</span>
          </p>
          <p className="mt-2.5 text-[16px] leading-snug font-semibold text-balance lg:text-[17px]">
            A job offer from Northgate Analytics. Sign and return it by 20 November.
          </p>
          <ul className="mt-3 space-y-2 text-[14px] leading-snug">
            <PreviewRow mark="bg-mark-money">
              You&apos;d earn <strong className="font-semibold">£38,500 a year</strong>, paid monthly
            </PreviewRow>
            <PreviewRow mark="bg-mark-date">
              Sign by <strong className="font-semibold">Fri 20 Nov</strong>, start <strong className="font-semibold">Tue 1 Dec 2026</strong>
            </PreviewRow>
            <PreviewRow mark="bg-mark-risk">
              Check before you sign: unpaid extra hours, and a 6-month ban on working for a competitor nearby.
            </PreviewRow>
          </ul>
        </div>
      </div>
      <figcaption className="mt-4 text-center text-sm text-muted lg:ml-10 lg:text-left">
        Example: a made-up UK employment contract, decoded.
      </figcaption>
    </figure>
  );
}

function PreviewRow({ mark, children }: { mark: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span aria-hidden className={`mt-1 h-3.5 w-1.5 shrink-0 rounded-full ${mark}`} />
      <span>{children}</span>
    </li>
  );
}

/* ----------------------------------------------------------------------------
   Below the fold
---------------------------------------------------------------------------- */

const LETTER_TYPES: {
  type: string;
  phrase: string;
  country: CountryCode;
  language: string;
  gives: string;
  isNew?: boolean;
  paper: Pick<Paper, "head" | "place" | "lines">;
}[] = [
  {
    type: "Work contracts",
    phrase: "Statement of main terms of employment",
    country: "GB",
    language: "English",
    gives: "Start date, pay, probation and notice period, and the clauses to check before you sign, like unpaid overtime or a non-compete.",
    isNew: true,
    paper: {
      head: "Northgate Analytics Ltd",
      place: "Exampleford · 3 November 2026",
      lines: [
        ["Start date: ", { text: "1 December 2026", ink: "date" }],
        ["Salary: ", { text: "£38,500 per year", ink: "money" }],
        ["For 6 months after: ", { text: "no competitor within 25 miles", ink: "risk" }],
      ],
    },
  },
  {
    type: "Tax notices",
    phrase: "Nota de cobrança — IMI",
    country: "PT",
    language: "Portuguese",
    gives: "What you owe, the payment references to use, and the date it's due.",
    paper: {
      head: "Serviço Municipal de Finanças",
      place: "Vila Nova do Mar · 15 de setembro de 2026",
      lines: [
        ["Valor a pagar: ", { text: "312,40 €", ink: "money" }],
        ["Pagamento até ", { text: "31 de outubro de 2026", ink: "date" }],
        ["Entidade ", { text: "21312", ink: "ref" }, " · Ref. ", { text: "481 293 776", ink: "ref" }],
      ],
    },
  },
  {
    type: "Fines and penalties",
    phrase: "Penalty Charge Notice",
    country: "GB",
    language: "English",
    gives: "The reduced amount and how long it lasts, the full charge, and how to pay or challenge it.",
    paper: {
      head: "Borough of Exampleford",
      place: "Parking Services · 22 September 2026",
      lines: [
        ["A charge of ", { text: "£70.00", ink: "money" }, " is now payable."],
        ["£35.00 if paid by ", { text: "6 October 2026", ink: "date" }],
        ["After 28 days it may rise to ", { text: "£105.00", ink: "risk" }],
      ],
    },
  },
  {
    type: "Landlords and tenancy",
    phrase: "Notice of rent increase",
    country: "GB",
    language: "English",
    gives: "The new rent, the date it starts, and what you can do if you disagree.",
    paper: {
      head: "Oakbridge Lettings",
      place: "Exampleford · 1 September 2026",
      lines: [
        ["Current rent: £1,150.00 per month"],
        ["From ", { text: "1 December 2026", ink: "date" }, ": ", { text: "£1,240.00", ink: "money" }],
        ["You may challenge it ", { text: "at a tribunal", ink: "ref" }],
      ],
    },
  },
  {
    type: "Payment reminders",
    phrase: "Zahlungserinnerung",
    country: "DE",
    language: "German",
    gives: "What's unpaid, any late fee, and the account and reference to pay with.",
    paper: {
      head: "Beitragsservice Musterstadt",
      place: "Musterstadt · 18. September 2026",
      lines: [
        ["Offener Betrag: ", { text: "55,08 Euro", ink: "money" }],
        ["Bitte überweisen bis zum ", { text: "15.10.2026", ink: "date" }],
        ["Sonst: ", { text: "Säumniszuschlag 8,00 Euro", ink: "risk" }],
      ],
    },
  },
  {
    type: "Residence and appointments",
    phrase: "Convocatória — autorização de residência",
    country: "PT",
    language: "Portuguese",
    gives: "When and where to go, and the documents to bring with you.",
    paper: {
      head: "Agência de Migração",
      place: "Vila Nova do Mar · 20 de setembro de 2026",
      lines: [
        ["Data: ", { text: "14 de outubro de 2026, 10h30", ink: "date" }],
        ["Local: ", { text: "Balcão 3, Praça da Amostra", ink: "ref" }],
        ["Taxa: ", { text: "90,00 €", ink: "money" }],
      ],
    },
  },
  {
    type: "Utility bills",
    phrase: "Factura del agua",
    country: "ES",
    language: "Spanish",
    gives: "What the charges are for, the total, and when it's due.",
    paper: {
      head: "Aguas de Villaejemplo",
      place: "Villaejemplo · 10 de septiembre de 2026",
      lines: [
        ["Consumo: 14 m³, julio y agosto"],
        ["Importe total: ", { text: "48,73 €", ink: "money" }],
        ["Se cargará el ", { text: "25/09/2026", ink: "date" }],
      ],
    },
  },
];

const PAPERS: Paper[] = LETTER_TYPES.map((l) => ({ ...l.paper, subject: l.phrase, country: l.country, language: l.language }));

function SectionHeading({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 id={id} className="text-[1.75rem] leading-tight font-semibold tracking-[-0.025em] text-balance lg:text-[2.125rem]">
        {title}
      </h2>
      <p className="mt-3 max-w-sm text-[17px] leading-relaxed text-muted text-pretty">{children}</p>
    </div>
  );
}

export function LettersSection() {
  const [active, setActive] = useState(0);
  const touched = useRef(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Leaf through the pile on its own while the section is on screen, until
  // the visitor points at a row. Never with reduced motion.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        clearInterval(timer);
        if (entry.isIntersecting && !touched.current) {
          timer = setInterval(() => {
            if (touched.current) clearInterval(timer);
            else setActive((a) => (a + 1) % LETTER_TYPES.length);
          }, 3200);
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(section);
    return () => {
      observer.disconnect();
      clearInterval(timer);
    };
  }, []);

  const pick = (i: number) => {
    touched.current = true;
    setActive(i);
  };

  return (
    <section ref={sectionRef} id="letters" aria-labelledby="letters-title" className="scroll-mt-4 overflow-x-clip border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-16 lg:py-24">
        <div className="lg:sticky lg:top-8 lg:self-start">
          <SectionHeading id="letters-title" title="The letters people bring">
            Official paperwork in the language it was written in, explained in the one you choose.
          </SectionHeading>
          <div className="mt-10 px-3 pt-6 lg:mt-12 lg:px-0">
            <LetterStack papers={PAPERS} active={active} />
          </div>
        </div>
        <ul className="border-t border-border">
          {LETTER_TYPES.map((l, i) => (
            <li
              key={l.type}
              onMouseEnter={() => pick(i)}
              onClick={() => pick(i)}
              className="grid gap-x-8 gap-y-3 border-b border-border py-5 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] sm:py-6"
            >
              <div>
                <p
                  className={`font-serif text-[17px] leading-snug text-pretty transition-colors duration-300 ${
                    active === i ? "text-foreground" : "text-muted"
                  }`}
                >
                  &ldquo;{l.phrase}&rdquo;
                </p>
                <p className="mt-1.5 flex items-center gap-2 text-[13px] text-muted">
                  <Flag country={l.country} className="h-[11px] w-4" />
                  {l.language}
                </p>
              </div>
              <div>
                <h3 className="flex flex-wrap items-center gap-2 text-[17px] font-semibold">
                  {l.type}
                  {l.isNew && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[12px] font-medium text-accent">New</span>}
                </h3>
                <p className="mt-1 text-[15px] leading-relaxed text-muted">{l.gives}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function HowSection() {
  const steps = [
    {
      title: "Take a photo of the letter",
      body: "Lay it flat in good light, with all four corners in the frame. A PDF or a scan works too.",
      fragment: <PhotoFragment />,
    },
    {
      title: "Read it in plain words",
      body: "What it means, how urgent it is, what you owe and by when, and what happens if you ignore it.",
      fragment: <StripFragment />,
    },
    {
      title: "Deal with it",
      body: "Tick off the steps, copy any payment references, add the deadline to your calendar, and draft a reply in the letter's language.",
      fragment: <ActFragment />,
    },
  ];
  return (
    <section id="how" aria-labelledby="how-title" className="scroll-mt-4 border-y border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <h2 id="how-title" className="text-[1.75rem] leading-tight font-semibold tracking-[-0.025em] lg:text-[2.125rem]">
            How it works
          </h2>
          <p className="max-w-md text-[17px] leading-relaxed text-muted">
            From a photo on your phone to knowing exactly what to do next. Reading takes 10 to 30 seconds.
          </p>
        </div>
        <ol className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-3 lg:gap-0">
          {steps.map((s, i) => (
            <li key={s.title} className="flex flex-col border-t border-border pt-6 lg:border-t-0 lg:border-l lg:px-8 lg:pt-0 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0">
              <span
                aria-hidden
                className="flex size-8 items-center justify-center rounded-full border-[1.5px] border-accent text-[15px] font-semibold text-accent tabular-nums"
              >
                {i + 1}
              </span>
              <h3 className="mt-4 text-[19px] font-semibold tracking-[-0.01em]">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.body}</p>
              <div aria-hidden className="mt-6 flex flex-1 flex-col justify-end">
                <div className="rounded-2xl border border-border bg-background p-4 select-none">{s.fragment}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// Inert copies of real UI, so each step shows the thing you'll actually see.
function PhotoFragment() {
  return (
    <div className="space-y-2">
      <div className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent text-[15px] font-medium text-on-accent">
        <CameraIcon size={20} />
        Take a photo
      </div>
      <div className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border-strong bg-surface text-[14px] font-medium">
        <UploadIcon size={18} />
        Upload a file
      </div>
    </div>
  );
}

function StripFragment() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex items-center gap-2 bg-medium-soft px-3 py-2.5 text-[14px] font-semibold text-medium">
        <span className="size-2 rounded-full bg-medium" />
        Needs attention
      </div>
      <div className="grid grid-cols-2 divide-x divide-border">
        <div className="px-3 py-2.5">
          <p className="text-[12px] text-muted">Salary</p>
          <p className="text-[17px] font-semibold tabular-nums">£38,500</p>
          <p className="text-[12px] text-muted">a year</p>
        </div>
        <div className="px-3 py-2.5">
          <p className="text-[12px] text-muted">Sign by</p>
          <p className="text-[15px] font-semibold">Fri 20 Nov</p>
          <p className="text-[12px] text-muted">starts 1 Dec</p>
        </div>
      </div>
    </div>
  );
}

function ActFragment() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3.5 py-3">
        <span className="flex size-5 items-center justify-center rounded-md bg-accent text-on-accent">
          <CheckIcon size={14} />
        </span>
        <span className="text-[14px] font-semibold text-muted line-through">Read the non-compete clause</span>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3.5 py-3">
        <span className="size-5 rounded-md border-[1.5px] border-border-strong" />
        <span className="text-[14px] font-semibold">Sign and return by 20 Nov</span>
      </div>
      <div className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border-strong bg-surface text-[13px] font-medium">
        <CalendarIcon size={16} />
        Add to calendar
      </div>
    </div>
  );
}

const PRIVACY = [
  {
    title: "Your letter isn't stored",
    body: "It's sent to the AI model to be read, and this app doesn't keep a copy. There are no accounts.",
  },
  {
    title: "Bank details stay hidden",
    body: "Account numbers such as IBANs show only their last four digits until you tap Show.",
  },
  {
    title: "It says when it isn't sure",
    body: "Blurry or ambiguous parts are flagged, so you know exactly what to check against the paper.",
  },
  {
    title: "It isn't a lawyer",
    body: "It explains; it doesn't advise. For large sums, court or immigration matters, the steps include checking with a professional.",
  },
];

export function PrivacySection() {
  return (
    <section id="privacy" aria-labelledby="privacy-title" className="scroll-mt-4">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-16 lg:py-24">
        <div className="lg:sticky lg:top-8 lg:self-start">
          <SectionHeading id="privacy-title" title="Careful with your paperwork">
            Official letters carry names, addresses and account numbers. Here is what happens to yours.
          </SectionHeading>
        </div>
        <dl className="grid gap-x-10 sm:grid-cols-2">
          {PRIVACY.map((p) => (
            <div key={p.title} className="border-t border-border pt-5 pb-8">
              <dt className="text-[17px] font-semibold">{p.title}</dt>
              <dd className="mt-1.5 text-[15px] leading-relaxed text-muted">{p.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function ClosingBand({ onFile }: { onFile: (file: File) => void }) {
  return (
    <section aria-labelledby="closing-title" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:pb-24">
      <div className="flex flex-col gap-8 rounded-3xl bg-accent-soft px-6 py-10 sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-14 lg:py-14">
        <div>
          <h2 id="closing-title" className="text-[1.75rem] leading-tight font-semibold tracking-[-0.025em] text-balance lg:text-[2.25rem]">
            Got a letter on the table?
          </h2>
          <p className="mt-2 text-[17px] leading-relaxed text-muted">Take a photo or upload a PDF. You&apos;ll know what it says, and what to do about it, in under a minute.</p>
        </div>
        <PickButtons onFile={onFile} className="shrink-0" />
      </div>
    </section>
  );
}
