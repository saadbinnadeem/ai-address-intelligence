import Link from "next/link";

export const SiteFooter = () => (
  <footer className="border-t bg-card">
    <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6 lg:px-8">
      <span>© {new Date().getFullYear()} AI Address Intelligence</span>
      <div className="flex items-center gap-4">
        <Link href="/terms" className="hover:text-foreground">Terms</Link>
        <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
      </div>
    </div>
  </footer>
);
