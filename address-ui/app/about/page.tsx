import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/ui/page-shell";

export default function AboutPage() {
  return (
    <PageShell>
      <Card>
        <h1 className="text-2xl font-semibold">About Us</h1>
        <p className="mt-3 text-slate-600">We build stateless AI infrastructure that converts unstructured South Asian addresses into clean, normalized, machine-readable output.</p>
      </Card>
    </PageShell>
  );
}
