"use client";

import Link from "next/link";
import { BrainCircuit, FileSpreadsheet, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageShell } from "@/components/ui/page-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const highlights = [
  { icon: BrainCircuit, title: "Gemini-Powered", description: "High-accuracy parsing for noisy South Asian address patterns." },
  { icon: FileSpreadsheet, title: "Bulk Pipeline", description: "CSV/PDF ingestion with downloadable normalized output." },
  { icon: ShieldCheck, title: "Stateless", description: "No data persistence, designed for compliance-sensitive workloads." }
];

export default function HomePage() {
  const [open, setOpen] = useState(false);

  return (
    <PageShell className="space-y-8">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-card">
        <CardHeader className="space-y-4">
          <Badge className="w-fit">Address Intelligence Platform</Badge>
          <CardTitle className="text-3xl md:text-5xl">Modern AI Address Parsing for Pakistan and India</CardTitle>
          <CardDescription className="max-w-3xl text-base">
            Normalize unstructured addresses into production-grade structured output through a clean, fast, and developer-centric SaaS experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/address-parser"><Button>Start Parsing</Button></Link>
          <Link href="/bulk-upload"><Button variant="outline">Bulk Workflow</Button></Link>
          <Button variant="secondary" onClick={() => setOpen(true)}><Sparkles className="h-4 w-4" /> Product Overview</Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="features" className="space-y-4">
        <TabsList>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
        </TabsList>
        <TabsContent value="features">
          <div className="grid gap-4 md:grid-cols-3">
            {highlights.map((item) => (
              <Card key={item.title}>
                <CardHeader>
                  <item.icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="workflow">
          <Card>
            <CardContent className="pt-6">
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li>1. Submit single address text or upload CSV/PDF batches.</li>
                <li>2. AI model extracts structured fields and normalized format.</li>
                <li>3. Review results in interactive tables and export instantly.</li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent open={open}>
          <DialogHeader>
            <DialogTitle>Why this dashboard?</DialogTitle>
            <DialogDescription>
              The frontend is optimized for high-volume operations with responsive controls, modern UX primitives, and reusable ShadCN-style component architecture.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end"><Button onClick={() => setOpen(false)}>Close</Button></div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
