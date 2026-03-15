import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/ui/page-shell";

export default function TermsPage() {
  return (
    <PageShell>
      <Card>
        <h1 className="text-2xl font-semibold">Terms & Conditions</h1>
        <p className="mt-3 text-slate-600">Service responses are generated in real time by LLMs. Validate mission-critical outputs before production use.</p>
      </Card>
    </PageShell>
  );
}
