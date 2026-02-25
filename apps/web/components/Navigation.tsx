"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = {
  href: string;
  label: string;
};

type NavigationProps = {
  links: NavLink[];
  className?: string;
};

export default function Navigation({ links, className = "" }: NavigationProps) {
  const pathname = usePathname();

  return (
    <nav className={`flex items-center gap-1 ${className}`}>
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(link.href + "/");

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
