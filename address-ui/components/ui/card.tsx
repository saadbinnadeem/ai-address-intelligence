import type { PropsWithChildren } from "react";

export const Card = ({ children }: PropsWithChildren) => (
  <div className="rounded-xl border bg-white p-5 shadow-sm">{children}</div>
);
