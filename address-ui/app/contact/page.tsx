import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/ui/page-shell";

export default function ContactPage() {
  return (
    <PageShell>
      <Card>
        <h1 className="text-2xl font-semibold">Contact</h1>
        <p className="mt-3 text-slate-600">For enterprise onboarding or SLA inquiries, contact engineering-support@address-intelligence.io.</p>
      </Card>
    </PageShell>
  );
}
