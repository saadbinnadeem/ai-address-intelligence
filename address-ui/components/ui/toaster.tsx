"use client";

import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export const Toaster = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div key={toast.id} className={cn("rounded-lg border bg-background p-4 shadow-lg", toast.variant === "destructive" && "border-destructive/50")}> 
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium">{toast.title}</p>
              {toast.description ? <p className="text-sm text-muted-foreground">{toast.description}</p> : null}
            </div>
            <button className="text-xs text-muted-foreground" onClick={() => removeToast(toast.id)}>Close</button>
          </div>
        </div>
      ))}
    </div>
  );
};
