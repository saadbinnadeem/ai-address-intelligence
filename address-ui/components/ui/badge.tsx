import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Badge = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("inline-flex items-center rounded-md border border-transparent bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground", className)} {...props} />
);
