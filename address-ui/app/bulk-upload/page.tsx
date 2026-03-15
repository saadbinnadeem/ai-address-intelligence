"use client";

import { useMemo, useState } from "react";
import { parseBulkAddressFile } from "@/lib/api";
import type { BulkResponse } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/ui/page-shell";

const isValidFile = (file: File) => ["text/csv", "application/pdf"].includes(file.type);

const createCsv = (rows: BulkResponse) => {
  const header = ["original", "city", "area", "normalized_address"];
  const body = rows.map((item) => [item.original, item.structured.city ?? "", item.structured.area ?? "", item.structured.normalized_address ?? ""]);
  return [header, ...body]
    .map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
};

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<BulkResponse>([]);

  const csvContent = useMemo(() => createCsv(results), [results]);

  const onUpload = async () => {
    if (!file) {
      return;
    }
    setError(null);
    setLoading(true);
    setResults([]);
    setUploadProgress(0);
    try {
      const data = await parseBulkAddressFile(file, setUploadProgress);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "parsed-addresses.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <PageShell>
      <div className="space-y-6">
        <Card>
          <h1 className="text-2xl font-semibold">Bulk Address Upload</h1>
          <p className="mt-2 text-sm text-slate-600">Upload CSV or PDF files to parse addresses in-memory with Gemini.</p>
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
            <input
              type="file"
              accept=".csv,.pdf"
              onChange={(event) => {
                const selected = event.target.files?.[0] ?? null;
                setFile(selected);
                setError(selected && !isValidFile(selected) ? "Only CSV and PDF files are allowed." : null);
              }}
              className="w-full rounded-md border p-2 text-sm"
            />
            <button
              onClick={onUpload}
              disabled={!file || !!(file && !isValidFile(file)) || loading}
              className="rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
            >
              {loading ? "Processing..." : "Upload and Parse"}
            </button>
          </div>
          <div className="mt-4 h-2 w-full rounded-full bg-slate-200">
            <div className="h-2 rounded-full bg-violet-600 transition-all" style={{ width: `${uploadProgress}%` }} />
          </div>
          {error ? <p className="mt-3 rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p> : null}
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Results</h2>
            <button onClick={download} disabled={!results.length} className="rounded-md border px-4 py-2 text-sm disabled:opacity-50">
              Download CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left">
                  <th className="px-3 py-2">Original Address</th>
                  <th className="px-3 py-2">City</th>
                  <th className="px-3 py-2">Area</th>
                  <th className="px-3 py-2">Normalized Address</th>
                </tr>
              </thead>
              <tbody>
                {results.map((item) => (
                  <tr key={`${item.original}-${item.structured.normalized_address}`} className="border-b last:border-none">
                    <td className="px-3 py-2">{item.original}</td>
                    <td className="px-3 py-2">{item.structured.city ?? "-"}</td>
                    <td className="px-3 py-2">{item.structured.area ?? "-"}</td>
                    <td className="px-3 py-2">{item.structured.normalized_address || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
