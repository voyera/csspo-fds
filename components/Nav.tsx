"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Palmarès" },
  { href: "/methodologie", label: "Méthodologie" },
];

export default function Nav() {
  const path = usePathname();
  const isActive = (href: string) => (href === "/" ? path === "/" || path.startsWith("/ecole") : path === href);

  return (
    <nav className="flex items-center gap-5 font-mono text-xs uppercase tracking-widest">
      {LINKS.map((l) => {
        const active = isActive(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "font-semibold text-pen underline decoration-2 underline-offset-[6px]"
                : "text-ink hover:text-pen"
            }
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
