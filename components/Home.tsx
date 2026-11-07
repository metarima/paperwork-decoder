"use client";

import { useState } from "react";
import { type CountryCode, SAMPLES, type Sample } from "@/lib/samples";
import { MAX_UPLOAD_MB } from "@/lib/schema";
import Flag from "./Flag";
import { CameraIcon, CheckIcon, ChevronIcon, CopyIcon, LockIcon, UploadIcon } from "./icons";
import { button, card, PickButtons, useFilePicker } from "./ui";

export const LANGUAGES = ["English", "Português", "Español", "Français", "Deutsch", "Italiano", "Українська"];

export const HOME_LINKS = [
  { href: "#letters", label: "What it reads" },
  { href: "#how", label: "How it works" },
  { href: "#privacy", label: "Privacy" },
];

type UploadProps = {
  busy: boolean;
  language: string;
  onLanguage: (language: string) => void;
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
        Tax notices, fines, work contracts, letters from your landlord. Take a photo and see what it means, what you owe,
        when it&apos;s due, and a reply you can send.
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

        <div className="mt-4 border-t border-border pt-4">
          <label className="flex items-center gap-3">
            <span className="shrink-0 text-[15px] font-medium">Explain in</span>
            <span className="relative flex-1 sm:max-w-56">
              <select
                value={language}
                onChange={(e) => onLanguage(e.target.value)}
                className="min-h-11 w-full appearance-none rounded-xl border border-border-strong bg-surface pr-10 pl-3.5 text-[15px] hover:border-accent"
              >
                {LANGUAGES.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
              <ChevronIcon size={18} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted" />
            </span>
          </label>
        </div>
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
  return (
    <figure className="mx-auto w-full max-w-md lg:mx-0 lg:mt-3 lg:max-w-none">
      <div className="relative">
        <div
          aria-hidden
          className="relative -rotate-1 rounded-sm border border-border bg-surface px-5 pt-5 pb-24 font-serif text-[12.5px] leading-[1.6] text-foreground/80 shadow-paper sm:px-7 sm:pt-7 lg:text-[13.5px]"
        >
          <p className="text-[10.5px] font-bold tracking-[0.12em] text-foreground lg:text-[11.5px]">SERVIÇO MUNICIPAL DE FINANÇAS</p>
          <p className="text-[10.5px] tracking-wide">Vila Nova do Mar</p>
          <p className="mt-3 text-right text-[11px]">Vila Nova do Mar, 15 de setembro de 2026</p>
          <p className="mt-3 font-semibold text-foreground">Assunto: Nota de cobrança — IMI 2025, 2.ª prestação</p>
          <p className="mt-2">
            Valor a pagar: <span className="mark mark-money font-semibold text-foreground">312,40 €</span>
          </p>
          <p className="mt-2">
            O pagamento deverá ser efetuado até <span className="mark mark-date text-foreground">31 de outubro de 2026</span>, em
            qualquer caixa multibanco, homebanking ou balcão dos CTT.
          </p>
          <p className="mt-2">
            Entidade: <span className="mark mark-ref text-foreground">21312</span> &nbsp;Referência:{" "}
            <span className="mark mark-ref text-foreground">481 293 776</span>
          </p>
          <p className="mt-2">
            A falta de pagamento implica a instauração de{" "}
            <span className="mark mark-risk text-foreground">processo de execução fiscal</span> e juros de mora.
          </p>
        </div>

        <div className={`${card} relative z-10 -mt-20 ml-4 p-4 shadow-paper sm:ml-10 sm:p-5`}>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
            <span className="rounded-full bg-medium-soft px-2 py-0.5 font-medium text-medium">Needs attention</span>
            <span className="text-muted">Property tax · Portuguese</span>
          </p>
          <p className="mt-2.5 text-[16px] leading-snug font-semibold text-balance lg:text-[17px]">
            Your second property tax payment for 2025 is due.
          </p>
          <ul className="mt-3 space-y-2 text-[14px] leading-snug">
            <PreviewRow mark="bg-mark-money">
              You owe <strong className="font-semibold">€312.40</strong>
            </PreviewRow>
            <PreviewRow mark="bg-mark-date">
              Pay by <strong className="font-semibold">Sat 31 Oct 2026</strong>
            </PreviewRow>
            <PreviewRow mark="bg-mark-ref">
              At an ATM or in online banking, with Entidade <span className="font-mono">21312</span> and Referência{" "}
              <span className="font-mono whitespace-nowrap">481 293 776</span>
            </PreviewRow>
            <PreviewRow mark="bg-mark-risk">If you don&apos;t pay, the tax office opens an enforcement case and adds interest.</PreviewRow>
          </ul>
        </div>
      </div>
      <figcaption className="mt-4 text-center text-sm text-muted lg:ml-10 lg:text-left">
        Example: a made-up Portuguese tax notice, decoded.
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
  mark: string;
  country: CountryCode;
  language: string;
  gives: string;
  isNew?: boolean;
}[] = [
  {
    type: "Tax notices",
    phrase: "Nota de cobrança — IMI",
    mark: "mark-money",
    country: "PT",
    language: "Portuguese",
    gives: "What you owe, the payment references to use, and the date it's due.",
  },
  {
    type: "Work contracts",
    phrase: "Contrato de trabalho",
    mark: "mark-date",
    country: "PT",
    language: "Portuguese",
    gives: "Start date, pay, probation and notice period, and the clauses to check before you sign.",
    isNew: true,
  },
  {
    type: "Fines and penalties",
    phrase: "Penalty Charge Notice",
    mark: "mark-risk",
    country: "GB",
    language: "English",
    gives: "The reduced amount and how long it lasts, the full charge, and how to pay or challenge it.",
  },
  {
    type: "Landlords and tenancy",
    phrase: "Notice of rent increase",
    mark: "mark-money",
    country: "GB",
    language: "English",
    gives: "The new rent, the date it starts, and what you can do if you disagree.",
  },
  {
    type: "Payment reminders",
    phrase: "Zahlungserinnerung",
    mark: "mark-ref",
    country: "DE",
    language: "German",
    gives: "What's unpaid, any late fee, and the account and reference to pay with.",
  },
  {
    type: "Residence and appointments",
    phrase: "Agendamento — autorização de residência",
    mark: "mark-date",
    country: "PT",
    language: "Portuguese",
    gives: "When and where to go, and the documents to bring with you.",
  },
  {
    type: "Utility bills",
    phrase: "Factura del agua",
    mark: "mark-ref",
    country: "ES",
    language: "Spanish",
    gives: "What the charges are for, the total, and when it's due.",
  },
];

function SectionHeading({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div className="lg:sticky lg:top-8 lg:self-start">
      <h2 id={id} className="text-[1.75rem] leading-tight font-semibold tracking-[-0.025em] text-balance lg:text-[2.125rem]">
        {title}
      </h2>
      <p className="mt-3 max-w-sm text-[17px] leading-relaxed text-muted text-pretty">{children}</p>
    </div>
  );
}

export function LettersSection() {
  return (
    <section id="letters" aria-labelledby="letters-title" className="scroll-mt-4 border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-20 lg:py-24">
        <SectionHeading id="letters-title" title="The letters people bring">
          Official paperwork in the language it was written in, explained in the one you choose.
        </SectionHeading>
        <ul className="border-t border-border">
          {LETTER_TYPES.map((l) => (
            <li
              key={l.type}
              className="grid gap-x-8 gap-y-3 border-b border-border py-5 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] sm:py-6"
            >
              <div>
                <p className="font-serif text-[17px] leading-snug">
                  <span className={`mark ${l.mark}`}>{l.phrase}</span>
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
      body: "Tick off the steps, copy the payment references, add the deadline to your calendar, and draft a reply in the letter's language.",
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
          <p className="text-[12px] text-muted">How much</p>
          <p className="text-[17px] font-semibold tabular-nums">€312.40</p>
        </div>
        <div className="px-3 py-2.5">
          <p className="text-[12px] text-muted">By when</p>
          <p className="text-[15px] font-semibold">Sat 31 Oct</p>
          <p className="text-[12px] text-muted">in 12 days</p>
        </div>
      </div>
    </div>
  );
}

function ActFragment() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 rounded-xl bg-surface-2 py-2 pr-2 pl-3.5">
        <div className="min-w-0 flex-1">
          <p className="text-[12px] text-muted">Referência</p>
          <p className="font-mono text-[15px]">481 293 776</p>
        </div>
        <span className="flex size-10 items-center justify-center rounded-xl border border-border-strong bg-surface">
          <CopyIcon size={17} />
        </span>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3.5 py-3">
        <span className="flex size-5 items-center justify-center rounded-md bg-accent text-on-accent">
          <CheckIcon size={14} />
        </span>
        <span className="text-[14px] font-semibold text-muted line-through">Pay €312.40</span>
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
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-20 lg:py-24">
        <SectionHeading id="privacy-title" title="Careful with your paperwork">
          Official letters carry names, addresses and account numbers. Here is what happens to yours.
        </SectionHeading>
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
