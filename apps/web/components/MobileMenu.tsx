/**
 * @file MobileMenu.tsx
 * @description Mobile-first navigation menu with touch-friendly interactions
 *
 * Features:
 * - Touch targets >= 48px (WCAG AAA compliant)
 * - Smooth animations optimized for mobile
 * - Safe area insets for notched devices
 * - Accessible with ARIA labels
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Home, Search, Heart, MessageCircle, User, LogIn } from "lucide-react";

interface MobileMenuProps {
  isAuthenticated?: boolean;
  userName?: string;
}

export default function MobileMenu({ isAuthenticated = false, userName }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Hamburger Button - Touch-friendly 48px */}
      <button
        onClick={toggleMenu}
        className="relative z-50 flex h-touch-sm w-touch-sm items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-100 active:bg-gray-200 dark:text-slate-300 dark:hover:bg-slate-800 dark:active:bg-slate-700 lg:hidden"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 animate-fade-in bg-black/50 backdrop-blur-sm dark:bg-black/60 lg:hidden"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Panel */}
      <nav
        className={`
          fixed right-0 top-0 z-40 h-full w-80 max-w-[85vw] 
          transform bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-slate-900 dark:shadow-slate-950/50
          lg:hidden
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
        aria-label="Mobile navigation"
      >
        {/* Safe area for notched devices */}
        <div className="flex h-full flex-col pb-safe-bottom pt-safe-top">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-lg font-bold text-white">
                P
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">PayEasy</span>
            </div>
            <button
              onClick={closeMenu}
              className="flex h-touch-sm w-touch-sm items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 active:bg-gray-200 dark:text-slate-400 dark:hover:bg-slate-800 dark:active:bg-slate-700"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          {/* User Info (if authenticated) */}
          {isAuthenticated && userName && (
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800">
              <div className="flex items-center gap-3">
                <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-full font-semibold text-white">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{userName}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">View profile</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  onClick={closeMenu}
                  className="flex min-h-touch-sm items-center gap-4 rounded-lg px-4 py-3 text-gray-700 transition-colors hover:bg-gray-100 active:bg-gray-200 dark:text-slate-300 dark:hover:bg-slate-800 dark:active:bg-slate-700"
                >
                  <Home size={20} className="text-gray-500 dark:text-slate-400" />
                  <span className="text-base font-medium">Home</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/browse"
                  onClick={closeMenu}
                  className="flex min-h-touch-sm items-center gap-4 rounded-lg px-4 py-3 text-gray-700 transition-colors hover:bg-gray-100 active:bg-gray-200 dark:text-slate-300 dark:hover:bg-slate-800 dark:active:bg-slate-700"
                >
                  <Search size={20} className="text-gray-500 dark:text-slate-400" />
                  <span className="text-base font-medium">Browse Listings</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/favorites"
                  onClick={closeMenu}
                  className="flex min-h-touch-sm items-center gap-4 rounded-lg px-4 py-3 text-gray-700 transition-colors hover:bg-gray-100 active:bg-gray-200 dark:text-slate-300 dark:hover:bg-slate-800 dark:active:bg-slate-700"
                >
                  <Heart size={20} className="text-gray-500 dark:text-slate-400" />
                  <span className="text-base font-medium">Favorites</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/messages"
                  onClick={closeMenu}
                  className="flex min-h-touch-sm items-center gap-4 rounded-lg px-4 py-3 text-gray-700 transition-colors hover:bg-gray-100 active:bg-gray-200 dark:text-slate-300 dark:hover:bg-slate-800 dark:active:bg-slate-700"
                >
                  <MessageCircle size={20} className="text-gray-500 dark:text-slate-400" />
                  <span className="text-base font-medium">Messages</span>
                </Link>
              </li>
            </ul>

            <hr className="my-6 border-gray-200 dark:border-slate-800" />

            <ul className="space-y-2">
              {isAuthenticated ? (
                <li>
                  <Link
                    href="/profile"
                    onClick={closeMenu}
                    className="flex min-h-touch-sm items-center gap-4 rounded-lg px-4 py-3 text-gray-700 transition-colors hover:bg-gray-100 active:bg-gray-200 dark:text-slate-300 dark:hover:bg-slate-800 dark:active:bg-slate-700"
                  >
                    <User size={20} className="text-gray-500 dark:text-slate-400" />
                    <span className="text-base font-medium">Profile</span>
                  </Link>
                </li>
              ) : (
                <>
                  <li>
                    <Link
                      href="/auth/login"
                      onClick={closeMenu}
                      className="flex min-h-touch-sm items-center gap-4 rounded-lg px-4 py-3 text-gray-700 transition-colors hover:bg-gray-100 active:bg-gray-200 dark:text-slate-300 dark:hover:bg-slate-800 dark:active:bg-slate-700"
                    >
                      <LogIn size={20} className="text-gray-500 dark:text-slate-400" />
                      <span className="text-base font-medium">Login</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/auth/register"
                      onClick={closeMenu}
                      className="bg-primary hover:bg-primary/90 active:bg-primary/80 shadow-primary/20 flex min-h-touch-sm items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium text-white shadow-sm transition-colors"
                    >
                      Get Started
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 text-center dark:border-slate-800 dark:bg-slate-800/50">
            <p className="text-xs text-gray-500 dark:text-slate-400">
              © 2026 PayEasy. Powered by Stellar.
            </p>
          </div>
        </div>
      </nav>
    </>
  );
}
