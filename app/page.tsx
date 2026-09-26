import Decoder from "@/components/Decoder";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:py-16">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Paperwork Decoder</h1>
        <p className="mt-2 max-w-xl text-muted">
          Got a letter from the tax office, your landlord or the council? Snap a photo. You&apos;ll get what it means, what
          you owe, when it&apos;s due, and a reply you can send.
        </p>
      </header>
      <Decoder />
      <footer className="mt-16 border-t border-border pt-6 text-sm text-muted">
        Not legal or financial advice. Always check the original letter. Files are sent to the AI model for analysis
        and aren&apos;t stored by this app.
      </footer>
    </main>
  );
}
