"use client";

import { Mail, Phone } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/ui/page-shell";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  return (
    <PageShell>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
            <CardDescription>For enterprise onboarding or SLA inquiries, send us your requirements.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" />
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Work email" />
            <Textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tell us about your integration needs" className="min-h-32" />
            <Button onClick={() => toast({ title: "Message queued", description: "Our engineering team will respond shortly." })}>Submit</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Direct Channels</CardTitle>
            <CardDescription>Prefer direct communication? Reach us through these channels.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> engineering-support@address-intelligence.io</p>
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> +92 300 0000000</p>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
