"use client";

import React, { useEffect, useRef, useState } from "react";
import SidebarMenu, { MenuItem } from "./SidebarMenu";

const STORAGE_KEY = "payeasy:sidebar:collapsed";

const defaultItems: MenuItem[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M3 13h8V3H3v10zM3 21h8v-6H3v6zM13 21h8V11h-8v10zM13 3v6h8V3h-8z" />
      </svg>
    ),
  },
  {
    id: "listings",
    title: "Listings",
    href: "/listings",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M3 7h18M3 12h18M3 17h18" />
      </svg>
    ),
    children: [
      { id: "active", title: "Active", href: "/listings/active" },
      { id: "drafts", title: "Drafts", href: "/listings/drafts" },
    ],
  },
  {
    id: "admin",
    title: "Admin",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M12 2l2 4 4 .5-3 3 .7 4L12 13l-3.7 1.5.7-4-3-3L10 6 12 2z" />
      </svg>
    ),
    children: [
      { id: "users", title: "Users", href: "/admin/users" },
      { id: "settings", title: "Settings", href: "/admin/settings" },
    ],
  },
];

export default function Sidebar({ items = defaultItems }: { items?: MenuItem[] }) {
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  // Load persisted state after initial mount to avoid hydration mismatch
  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      setCollapsed(v === "true");
    } catch (e) {
      // ignore
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch (e) {
      // ignore
    }
  }, [collapsed]);

  // Sidebar is overlaying content (no layout shift). Keep collapsed state internal.

  // focus management for mobile drawer
  useEffect(() => {
    if (mobileOpen) {
      setTimeout(() => {
        const el = drawerRef.current?.querySelector("a,button") as HTMLElement | null;
        el?.focus();
      }, 50);
    }
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile open button */}
      <div className="md:hidden">
        <button
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
          className="m-2 rounded-md p-2 hover:bg-slate-100"
        >
          <svg
            className="h-6 w-6 text-slate-700"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Desktop / md+ sidebar */}
      <aside
        className={`z-50 hidden border-r border-slate-200 bg-white/95 text-slate-900 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95 dark:text-white md:fixed md:inset-y-0 md:flex md:flex-col md:transition-all md:duration-300 ${
          collapsed ? "md:w-20" : "md:w-64"
        }`}
        aria-label="Sidebar"
      >
        <div className="flex h-14 items-center justify-between border-b border-slate-200 px-3 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="rounded bg-slate-100 p-1 dark:bg-slate-800">
              <svg
                className="h-8 w-8 text-indigo-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="12" cy="12" r="8" />
              </svg>
            </div>
            {!collapsed && (
              <span className="font-semibold text-slate-900 dark:text-white">
                {mounted ? "PayEasy" : ""}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              aria-pressed={collapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setCollapsed((s) => !s)}
              className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {collapsed ? (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M4 12h16" />
                </svg>
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M6 6l12 12M6 18L18 6" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <SidebarMenu items={items} collapsed={collapsed} />
        </nav>

        <div className="border-t border-slate-200 px-3 py-2 dark:border-slate-800">
          <button className="w-full text-left text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
            Help & docs
          </button>
        </div>
      </aside>

      {/* Mobile drawer - only render after mount to avoid hydration mismatch */}
      {mounted && mobileOpen && (
        <div className="z-60 fixed inset-0 flex md:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside
            ref={drawerRef as any}
            className="relative h-full w-80 bg-white text-slate-900 shadow-xl dark:bg-slate-950 dark:text-white"
          >
            <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <svg
                  className="h-8 w-8 text-indigo-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="8" />
                </svg>
                <span className="font-semibold text-slate-900 dark:text-white">PayEasy</span>
              </div>
              <button aria-label="Close menu" onClick={() => setMobileOpen(false)} className="p-2">
                <svg
                  className="h-6 w-6 text-slate-700"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
            </div>

            <nav className="py-4">
              <SidebarMenu items={items} collapsed={false} />
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
