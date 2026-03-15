"use client";

import { createContext, useContext, useState, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type TabsContextType = { value: string; setValue: (value: string) => void };
const TabsContext = createContext<TabsContextType | null>(null);

export const Tabs = ({ defaultValue, children, className }: { defaultValue: string; children: ReactNode; className?: string }) => {
  const [value, setValue] = useState(defaultValue);
  return <TabsContext.Provider value={{ value, setValue }}><div className={className}>{children}</div></TabsContext.Provider>;
};

export const TabsList = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className)} {...props} />
);

export const TabsTrigger = ({ value, className, children }: { value: string; className?: string; children: ReactNode }) => {
  const context = useContext(TabsContext);
  if (!context) return null;
  const active = context.value === value;
  return (
    <button onClick={() => context.setValue(value)} className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all", active && "bg-background text-foreground shadow-sm", className)}>
      {children}
    </button>
  );
};

export const TabsContent = ({ value, className, children }: { value: string; className?: string; children: ReactNode }) => {
  const context = useContext(TabsContext);
  if (!context || context.value !== value) return null;
  return <div className={cn("mt-2", className)}>{children}</div>;
};
