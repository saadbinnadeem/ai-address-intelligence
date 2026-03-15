"use client";

import { useState } from "react";
import { parseAddress } from "@/lib/api";
import type { ParseResponse } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageShell } from "@/components/ui/page-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const rows = ["house_number", "plot_number", "street", "block", "phase", "area", "city", "state", "country", "landmark", "normalized_address"] as const;

export default function AddressParserPage() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ParseResponse | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const data = await parseAddress(address);
      setResult(data);
      toast({ title: "Address parsed", description: "Structured output generated successfully." });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      toast({ title: "Parsing failed", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        <Card>
          <CardHeader>
            <CardTitle>Address Parser</CardTitle>
            <CardDescription>Paste any address from Pakistan or India and parse it in real-time.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea value={address} onChange={(event) => setAddress(event.target.value)} placeholder="plot 15 phase 6 dha lahore" className="min-h-40" required />
              <Button disabled={loading}>{loading ? "Parsing..." : "Parse Address"}</Button>
            </form>
            {error ? <Alert className="mt-4 border-destructive/40"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Structured Output</CardTitle>
            <CardDescription>Live parsed fields in machine-readable format.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 7 }).map((_, index) => <Skeleton key={index} className="h-10 w-full" />)}
              </div>
            ) : null}
            {!loading && result ? (
              <Table>
                <TableHeader><TableRow><TableHead>Field</TableHead><TableHead>Value</TableHead></TableRow></TableHeader>
                <TableBody>
                  {rows.map((field) => (
                    <TableRow key={field}><TableCell className="font-medium capitalize">{field.replaceAll("_", " ")}</TableCell><TableCell>{result.structured[field] || "-"}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null}
            {!loading && !result ? <p className="text-sm text-muted-foreground">No result yet.</p> : null}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
