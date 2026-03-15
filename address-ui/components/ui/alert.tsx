import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Alert = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("relative w-full rounded-lg border p-4", className)} role="alert" {...props} />
);

export const AlertTitle = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h5 className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props} />
);

export const AlertDescription = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("text-sm text-muted-foreground", className)} {...props} />
);
