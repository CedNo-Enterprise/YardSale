"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`border-b-2 pb-0.5 text-sm font-semibold transition-colors ${
        active ? "border-flag text-ink" : "border-transparent text-ink-soft hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}
