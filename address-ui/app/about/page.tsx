import { Building2, Rocket, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageShell } from "@/components/ui/page-shell";

const values = [
  { icon: Rocket, title: "Execution", description: "Low-latency parsing pipelines designed for production throughput." },
  { icon: Shield, title: "Privacy", description: "Stateless architecture keeps sensitive addresses out of persistent storage." },
  { icon: Building2, title: "Reliability", description: "Predictable structured schemas for downstream enterprise systems." }
];

export default function AboutPage() {
  return (
    <PageShell className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>About Us</CardTitle>
          <CardDescription>We build AI infrastructure that turns unstructured South Asian addresses into normalized, machine-readable intelligence.</CardDescription>
        </CardHeader>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        {values.map((value) => (
          <Card key={value.title}>
            <CardHeader>
              <value.icon className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">{value.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{value.description}</CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
