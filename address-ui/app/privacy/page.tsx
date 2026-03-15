import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/ui/page-shell";

export default function PrivacyPage() {
  return (
    <PageShell>
      <Card>
        <h1 className="text-2xl font-semibold">Privacy Policy</h1>
        <p className="mt-3 text-slate-600">The platform is stateless and does not persist submitted addresses or parsed results after API responses are returned.</p>
      </Card>
    </PageShell>
  );
}
