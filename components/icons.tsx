// One small stroke icon set, drawn at 24px on a 1.75 stroke so every icon in
// the app has the same weight. Decorative by default (aria-hidden).

type IconProps = { className?: string; size?: number };

function Svg({ className, size = 20, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

export const CameraIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.4-2h6.2l1.4 2h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" />
    <circle cx="12" cy="13" r="3.25" />
  </Svg>
);

export const FileIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </Svg>
);

export const UploadIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 15V4M7.5 8.5 12 4l4.5 4.5" />
    <path d="M5 15v3.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V15" />
  </Svg>
);

export const LockIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="1.5" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
  </Svg>
);

export const CalendarIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4" y="5.5" width="16" height="14.5" rx="1.5" />
    <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
  </Svg>
);

export const ReplyIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v9a1.5 1.5 0 0 1-1.5 1.5H10l-4 3.5V17h-.5A1.5 1.5 0 0 1 4 15.5z" />
    <path d="M8 9.5h8M8 12.5h5" />
  </Svg>
);

export const AskIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M9.6 9.6a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.4" />
    <path d="M12 16.8v.2" strokeWidth={2.25} />
  </Svg>
);

export const CopyIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="8.5" y="8.5" width="11" height="11" rx="1.5" />
    <path d="M15.5 8.5V6A1.5 1.5 0 0 0 14 4.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" />
  </Svg>
);

export const CheckIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
);

export const ChevronIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);

export const ArrowLeftIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Svg>
);

export const ArrowUpIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </Svg>
);

export const AlertIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10.3 4.3 3 17a2 2 0 0 0 1.7 3h14.6a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0z" />
    <path d="M12 9.5v4" />
    <path d="M12 16.8v.2" strokeWidth={2.25} />
  </Svg>
);

export const ClockIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
);

export const EyeIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="2.75" />
  </Svg>
);

export const RetryIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4.5 12a7.5 7.5 0 0 1 13-5.1L19.5 9" />
    <path d="M19.5 4.5V9H15" />
    <path d="M19.5 12a7.5 7.5 0 0 1-13 5.1L4.5 15" />
    <path d="M4.5 19.5V15H9" />
  </Svg>
);

// The wordmark's glyph: a folded letter with one line picked out in the
// highlighter colour.
export function LetterMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden width="28" height="28" viewBox="0 0 28 28" className={className}>
      <path d="M7 3.5h10l5 5V23a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 6 23V5A1.5 1.5 0 0 1 7.5 3.5z" fill="var(--surface)" stroke="var(--foreground)" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M17 3.5v5h5" fill="none" stroke="var(--foreground)" strokeWidth="1.6" strokeLinejoin="round" />
      <rect x="9" y="13.2" width="9.5" height="3.6" rx="1" fill="var(--mark-date)" />
      <path d="M9.5 15h8.5M9.5 19.5h6" stroke="var(--foreground)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
