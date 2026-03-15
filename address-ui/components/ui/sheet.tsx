"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const Sheet = ({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: ReactNode }) => (
  <>{children}{open ? <div className="fixed inset-0 z-40 bg-black/60" onClick={() => onOpenChange(false)} /> : null}</>
);

export const SheetContent = ({ open, children, className }: { open: boolean; children: ReactNode; className?: string }) => {
  if (!open) return null;
  return <aside className={cn("fixed right-0 top-0 z-50 h-full w-[320px] border-l bg-background p-6 shadow-lg", className)}>{children}</aside>;
};
