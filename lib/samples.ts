export type CountryCode = "PT" | "GB" | "DE" | "ES";

// Demo samples shown on the home page. PDFs live in public/samples and are
// generated from evals/cases.ts by `npm run samples`.
export type Sample = { id: string; title: string; short: string; country: CountryCode; countryName: string };

export const SAMPLES: Sample[] = [
  { id: "uk-employment-contract", title: "UK employment contract", short: "Work contract", country: "GB", countryName: "UK" },
  { id: "pt-property-tax", title: "Portuguese property tax notice", short: "Tax notice", country: "PT", countryName: "Portugal" },
  { id: "uk-parking-pcn", title: "UK parking fine", short: "Parking fine", country: "GB", countryName: "UK" },
  { id: "de-broadcast-fee-reminder", title: "German payment reminder", short: "Reminder", country: "DE", countryName: "Germany" },
];
