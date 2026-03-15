"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type ToastItem = { id: number; title: string; description?: string; variant?: "default" | "destructive" };
type ToastContextValue = { toast: (toast: Omit<ToastItem, "id">) => void; toasts: ToastItem[]; removeToast: (id: number) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const value = useMemo(() => ({
    toasts,
    removeToast: (id: number) => setToasts((state) => state.filter((toast) => toast.id !== id)),
    toast: (toast: Omit<ToastItem, "id">) => {
      const id = Date.now();
      setToasts((state) => [...state, { id, ...toast }]);
      setTimeout(() => setToasts((state) => state.filter((item) => item.id !== id)), 3500);
    }
  }), [toasts]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};
