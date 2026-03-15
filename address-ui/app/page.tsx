import Link from "next/link";
import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/ui/page-shell";

const features = [
  "Google Gemini-powered parsing for Pakistan and India",
  "English, Roman Urdu, Roman Hindi, and informal abbreviations",
  "Single address and bulk CSV/PDF workflows",
  "Stateless architecture with in-memory processing"
];

export default function HomePage() {
  return (
    <PageShell>
      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <h1 className="text-3xl font-bold">AI Address Parsing Platform</h1>
          <p className="mt-3 text-slate-600">
            Production-ready frontend and backend for real-time address normalization without database dependencies.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/address-parser" className="rounded-md bg-slate-900 px-4 py-2 text-white">Parse Address</Link>
            <Link href="/bulk-upload" className="rounded-md border px-4 py-2">Bulk Upload</Link>
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold">Capabilities</h2>
          <ul className="mt-4 space-y-2 text-slate-700">
            {features.map((feature) => (
              <li key={feature} className="rounded-md bg-slate-100 px-3 py-2">{feature}</li>
            ))}
          </ul>
        </Card>
      </section>
    </PageShell>
  );
}
