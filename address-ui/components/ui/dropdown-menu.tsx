"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export const DropdownMenu = ({ trigger, children }: { trigger: ReactNode; children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button onClick={() => setOpen((value) => !value)}>{trigger}</button>
      {open ? <div className="absolute right-0 z-50 mt-2 w-48 rounded-md border bg-popover p-1 shadow-md">{children}</div> : null}
    </div>
  );
};

export const DropdownMenuItem = ({ children, onClick }: { children: ReactNode; onClick?: () => void }) => (
  <button onClick={onClick} className={cn("flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent")}>{children}</button>
);
