import Link from "next/link";

export const SiteFooter = () => (
  <footer className="border-t bg-white">
    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-slate-600 md:flex-row">
      <span>© {new Date().getFullYear()} AI Address Parsing Platform</span>
      <div className="flex items-center gap-4">
        <Link href="/terms" className="hover:text-slate-900">Terms & Conditions</Link>
        <Link href="/privacy" className="hover:text-slate-900">Privacy Policy</Link>
      </div>
    </div>
  </footer>
);
