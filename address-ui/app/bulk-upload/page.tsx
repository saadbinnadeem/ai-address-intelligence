"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { parseBulkAddressFile } from "@/lib/api";
import type { BulkResponse } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/ui/page-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

const isValidFile = (file: File) => ["text/csv", "application/pdf"].includes(file.type);

const createCsv = (rows: BulkResponse) => {
  const header = ["original", "city", "area", "normalized_address"];
  const body = rows.map((item) => [item.original, item.structured.city ?? "", item.structured.area ?? "", item.structured.normalized_address ?? ""]);
  return [header, ...body].map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
};

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<BulkResponse>([]);
  const { toast } = useToast();

  const csvContent = useMemo(() => createCsv(results), [results]);

  const onUpload = async () => {
    if (!file) return;
    setError(null);
    setLoading(true);
    setResults([]);
    setUploadProgress(0);
    try {
      const data = await parseBulkAddressFile(file, setUploadProgress);
      setResults(data);
      toast({ title: "Bulk parsing complete", description: `${data.length} addresses processed.` });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      toast({ title: "Upload failed", description: message, variant: "destructive" });
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
    <PageShell className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bulk Address Upload</CardTitle>
          <CardDescription>Upload CSV or PDF files and parse addresses in-memory with full progress tracking.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <Input
              type="file"
              accept=".csv,.pdf"
              onChange={(event) => {
                const selected = event.target.files?.[0] ?? null;
                setFile(selected);
                setError(selected && !isValidFile(selected) ? "Only CSV and PDF files are allowed." : null);
              }}
            />
            <Button onClick={onUpload} disabled={!file || !!(file && !isValidFile(file)) || loading}>{loading ? "Processing..." : "Upload and Parse"}</Button>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-all" style={{ width: `${uploadProgress}%` }} /></div>
          <div className="flex items-center justify-between text-sm text-muted-foreground"><span>{file?.name ?? "No file selected"}</span><Badge className="bg-secondary text-secondary-foreground">{uploadProgress}%</Badge></div>
          {error ? <Alert className="border-destructive/40"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Results Table</CardTitle>
            <CardDescription>Review parsed output and export directly as CSV.</CardDescription>
          </div>
          <Button variant="outline" onClick={download} disabled={!results.length}><Download className="h-4 w-4" /> Download CSV</Button>
        </CardHeader>
        <CardContent>
          {loading ? <div className="space-y-2">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />)}</div> : null}
          {!loading && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Original Address</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Normalized Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((item) => (
                  <TableRow key={`${item.original}-${item.structured.normalized_address}`}>
                    <TableCell>{item.original}</TableCell>
                    <TableCell>{item.structured.city ?? "-"}</TableCell>
                    <TableCell>{item.structured.area ?? "-"}</TableCell>
                    <TableCell className="font-medium">{item.structured.normalized_address || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}
