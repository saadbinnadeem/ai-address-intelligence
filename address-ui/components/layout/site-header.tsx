"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPinned } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/address-parser", label: "Address Parser" },
  { href: "/bulk-upload", label: "Bulk Upload" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

export const SiteHeader = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <MapPinned className="h-5 w-5 text-violet-600" />
          AI Address Parsing Platform
        </Link>
        <nav className="flex flex-wrap items-center gap-2 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 transition ${pathname === link.href ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};
