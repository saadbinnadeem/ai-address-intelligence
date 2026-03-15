"use client";

import { useState } from "react";
import { parseAddress } from "@/lib/api";
import type { ParseResponse } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/ui/page-shell";

const rows = [
  "house_number",
  "plot_number",
  "street",
  "block",
  "phase",
  "area",
  "city",
  "state",
  "country",
  "landmark",
  "normalized_address"
] as const;

export default function AddressParserPage() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ParseResponse | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const data = await parseAddress(address);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <Card>
          <h1 className="text-2xl font-semibold">Address Parser</h1>
          <p className="mt-2 text-sm text-slate-600">Paste any Pakistan or India address and parse it with Gemini in real time.</p>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <textarea
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="plot 15 phase 6 dha lahore"
              className="h-36 w-full rounded-md border p-3 text-sm outline-none ring-slate-900 focus:ring"
              required
            />
            <button disabled={loading} className="rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-60">
              {loading ? "Parsing..." : "Parse Address"}
            </button>
          </form>
          {error ? <p className="mt-3 rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p> : null}
        </Card>

        <Card>
          <h2 className="text-xl font-semibold">Structured Output</h2>
          {!result ? <p className="mt-4 text-sm text-slate-500">No result yet.</p> : null}
          {result ? (
            <div className="mt-4 overflow-hidden rounded-md border">
              <table className="w-full text-sm">
                <tbody>
                  {rows.map((field) => (
                    <tr key={field} className="border-b last:border-none">
                      <td className="bg-slate-50 px-3 py-2 font-medium capitalize">{field.replace("_", " ")}</td>
                      <td className="px-3 py-2">{result.structured[field] || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </Card>
      </div>
    </PageShell>
  );
}
