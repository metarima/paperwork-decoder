// Demo samples shown on the home page. PDFs live in public/samples and are
// generated from evals/cases.ts by `npm run samples`.
export type Sample = { id: string; title: string; short: string; flag: string };

export const SAMPLES: Sample[] = [
  { id: "pt-property-tax", title: "Portuguese property tax notice", short: "Tax notice", flag: "🇵🇹" },
  { id: "uk-parking-pcn", title: "UK parking fine", short: "Parking fine", flag: "🇬🇧" },
  { id: "de-broadcast-fee-reminder", title: "German payment reminder", short: "Reminder", flag: "🇩🇪" },
];
