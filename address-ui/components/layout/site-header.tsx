"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, MapPinned, Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const links = [
  { href: "/", label: "Home" },
  { href: "/address-parser", label: "Address Parser" },
  { href: "/bulk-upload", label: "Bulk Upload" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

export const SiteHeader = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <MapPinned className="h-5 w-5 text-primary" />
          <span className="hidden sm:inline">AI Address Intelligence</span>
          <Badge className="bg-emerald-600">Beta</Badge>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={cn("rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent", pathname === link.href && "bg-accent text-foreground")}>
              {link.label}
            </Link>
          ))}
          <DropdownMenu
            trigger={<span className="flex items-center rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent">Legal <ChevronDown className="ml-1 h-4 w-4" /></span>}
          >
            <Link href="/terms"><DropdownMenuItem>Terms</DropdownMenuItem></Link>
            <Link href="/privacy"><DropdownMenuItem>Privacy</DropdownMenuItem></Link>
          </DropdownMenu>
          <ThemeToggle />
        </nav>
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent open={open}>
              <div className="mb-5 flex items-center justify-between"><span className="font-semibold">Menu</span><ThemeToggle /></div>
              <div className="space-y-2">
                {links.map((link) => (
                  <Link onClick={() => setOpen(false)} key={link.href} href={link.href} className={cn("block rounded-md px-3 py-2 text-sm", pathname === link.href ? "bg-accent font-medium" : "text-muted-foreground")}>{link.label}</Link>
                ))}
                <Link onClick={() => setOpen(false)} href="/terms" className="block rounded-md px-3 py-2 text-sm text-muted-foreground">Terms</Link>
                <Link onClick={() => setOpen(false)} href="/privacy" className="block rounded-md px-3 py-2 text-sm text-muted-foreground">Privacy</Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
