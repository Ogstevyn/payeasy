"use client"

import React, { useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export type MenuItem = {
  id: string
  title: string
  href?: string
  icon?: React.ReactNode
  children?: MenuItem[]
}

function isActive(pathname: string | null, href?: string) {
  if (!pathname || !href) return false
  return pathname === href || pathname.startsWith(href + "/")
}

export default function SidebarMenu({ items, collapsed }: { items: MenuItem[]; collapsed?: boolean }) {
  const pathname = usePathname()

  return (
    <ul role="menu" className="space-y-1 px-1">
      {items.map((it) => (
        <MenuEntry key={it.id} item={it} pathname={pathname} collapsed={Boolean(collapsed)} level={0} />
      ))}
    </ul>
  )
}

function MenuEntry({ item, pathname, collapsed, level }: { item: MenuItem; pathname: string | null; collapsed: boolean; level: number }) {
  const hasChildren = Boolean(item.children && item.children.length)
  const active = isActive(pathname, item.href)
  const [open, setOpen] = useState(active)

  // open parent if any child is active
  const childHasActive = useMemo(() => {
    if (!item.children) return false
    return item.children.some((c) => isActive(pathname, c.href))
  }, [item.children, pathname])

  React.useEffect(() => {
    if (childHasActive) setOpen(true)
  }, [childHasActive])

  return (
    <li>
      <div className="flex flex-col">
        <div className={`flex items-center gap-2 py-2 px-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 ${active ? 'bg-slate-100 dark:bg-slate-800 font-medium' : ''}`}>
          {item.href ? (
            <Link
              href={item.href}
              role="menuitem"
              className={`flex items-center gap-2 w-full ${collapsed ? 'justify-center' : ''}`}
            >
              {item.icon && <span className="text-slate-600 dark:text-slate-400">{item.icon}</span>}
              {!collapsed && <span className="truncate">{item.title}</span>}
            </Link>
          ) : (
            <button
              role="menuitem"
              aria-expanded={hasChildren ? open : undefined}
              onClick={() => hasChildren && setOpen((s) => !s)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  hasChildren && setOpen((s) => !s)
                }
                if (e.key === "ArrowRight") hasChildren && setOpen(true)
                if (e.key === "ArrowLeft") hasChildren && setOpen(false)
              }}
              className={`flex items-center gap-2 w-full text-left ${collapsed ? 'justify-center' : ''} hover:text-slate-900 dark:hover:text-white`}
            >
              {item.icon && <span className="text-slate-600 dark:text-slate-400">{item.icon}</span>}
              {!collapsed && <span className="truncate">{item.title}</span>}
            </button>
          )}

          {/* chevron */}
          {hasChildren && !collapsed && (
            <button
              aria-label={open ? "Collapse" : "Expand"}
              onClick={() => setOpen((s) => !s)}
              className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ml-auto transform transition-transform ${open ? 'rotate-90' : ''}`}
            >
              <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          )}
        </div>

        {/* children */}
        {hasChildren && (
          <div
            className={`overflow-hidden transition-[max-height,opacity] duration-200 ease-in-out ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            style={{ marginLeft: collapsed ? undefined : 8 }}
          >
            <ul role="menu" className="space-y-1 py-1">
              {item.children!.map((c) => (
                <li key={c.id}>
                  <Link
                    href={c.href || '#'}
                    role="menuitem"
                  className={`flex items-center gap-2 py-2 px-4 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 ${isActive(pathname, c.href) ? 'bg-slate-100 dark:bg-slate-800 font-medium' : ''}`}
                  >
                    <span className="w-3" />
                    <span className="truncate">{c.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </li>
  )
}
