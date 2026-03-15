"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const Dialog = ({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: ReactNode }) => (
  <>{children}{open ? <div className="fixed inset-0 z-50 bg-black/60" onClick={() => onOpenChange(false)} /> : null}</>
);

export const DialogContent = ({ open, children, className }: { open: boolean; children: ReactNode; className?: string }) => {
  if (!open) return null;
  return <div className={cn("fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6 shadow-lg", className)}>{children}</div>;
};

export const DialogHeader = ({ children }: { children: ReactNode }) => <div className="space-y-2">{children}</div>;
export const DialogTitle = ({ children }: { children: ReactNode }) => <h2 className="text-lg font-semibold">{children}</h2>;
export const DialogDescription = ({ children }: { children: ReactNode }) => <p className="text-sm text-muted-foreground">{children}</p>;
