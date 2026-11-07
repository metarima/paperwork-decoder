// Small SVG flags. Flag emoji render as plain letters ("PT", "GB") on Windows,
// so the sample buttons draw their own.

import type { CountryCode } from "@/lib/samples";

export default function Flag({ country, className }: { country: CountryCode; className?: string }) {
  return (
    <svg aria-hidden width="22" height="15" viewBox="0 0 30 20" className={`shrink-0 overflow-hidden rounded-[3px] ${className ?? ""}`}>
      {FLAGS[country]}
      <rect x="0.5" y="0.5" width="29" height="19" rx="2.5" fill="none" stroke="rgb(0 0 0 / 0.12)" />
    </svg>
  );
}

const FLAGS: Record<CountryCode, React.ReactNode> = {
  PT: (
    <>
      <rect width="30" height="20" fill="#da291c" />
      <rect width="12" height="20" fill="#046a38" />
      <circle cx="12" cy="10" r="4" fill="#ffe900" />
      <path d="M10.4 8h3.2v3.3a1.6 1.6 0 0 1-3.2 0z" fill="#da291c" stroke="#fff" strokeWidth="0.6" />
    </>
  ),
  GB: (
    <>
      <rect width="30" height="20" fill="#012169" />
      <path d="M0 0l30 20M30 0L0 20" stroke="#fff" strokeWidth="4" />
      <path d="M0 0l30 20M30 0L0 20" stroke="#c8102e" strokeWidth="1.6" />
      <path d="M15 0v20M0 10h30" stroke="#fff" strokeWidth="6" />
      <path d="M15 0v20M0 10h30" stroke="#c8102e" strokeWidth="3.4" />
    </>
  ),
  ES: (
    <>
      <rect width="30" height="20" fill="#aa151b" />
      <rect y="5" width="30" height="10" fill="#f1bf00" />
    </>
  ),
  DE: (
    <>
      <rect width="30" height="7" fill="#000" />
      <rect y="6.67" width="30" height="6.67" fill="#dd0000" />
      <rect y="13.33" width="30" height="6.67" fill="#ffce00" />
    </>
  ),
};
