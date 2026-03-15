import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

export const PageShell = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
  <main className={cn("mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-6 lg:px-8", className)}>{children}</main>
);
