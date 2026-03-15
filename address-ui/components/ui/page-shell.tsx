import type { PropsWithChildren } from "react";

export const PageShell = ({ children }: PropsWithChildren) => (
  <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
);
