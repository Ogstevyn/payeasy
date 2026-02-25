"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bell, Search, Settings, User, LogOut } from "lucide-react";
import Navigation from "./Navigation";
import MobileMenu from "./MobileMenu";

type HeaderProps = {
  sticky?: boolean;
  className?: string;
  isAuthenticated?: boolean;
  userName?: string;
};

export default function Header({
  sticky = true,
  className = "",
  isAuthenticated = false,
  userName = "User",
}: HeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navLinks = [
    { href: "/browse", label: "Browse" },
    { href: "/messages", label: "Messages" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/listings", label: "Listings" },
  ];

  const userInitial = userName ? userName.charAt(0).toUpperCase() : "U";

  return (
    <header
      className={`${
        sticky ? "sticky top-0 z-40" : ""
      } w-full border-b border-gray-200 bg-white shadow-sm ${className}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo / Branding */}
        <Link href="/" className="flex flex-shrink-0 items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600">
            <span className="text-sm font-bold text-white">P</span>
          </div>
          <span className="hidden text-lg font-semibold text-gray-900 sm:inline">PayEasy</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex">
          <Navigation links={navLinks} />
        </div>

        {/* Center Search Bar - Desktop */}
        <div className="hidden items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 lg:flex">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search listings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-gray-700 placeholder-gray-500 focus:outline-none"
            aria-label="Search"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Mobile Search Icon */}
          <button
            aria-label="Search"
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 md:hidden"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Notification Bell */}
          <button
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100"
          >
            <Bell className="h-5 w-5" />
            <span
              className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"
              aria-hidden="true"
            />
          </button>

          {/* Profile Dropdown - Desktop only */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              aria-label="User menu"
              aria-expanded={profileOpen}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200"
            >
              {userInitial}
            </button>

            {/* Dropdown Menu */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
                <div className="border-b border-gray-200 px-4 py-3">
                  <p className="text-sm font-semibold text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500">user@example.com</p>
                </div>
                <nav className="py-2">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                    onClick={() => setProfileOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <Link
                    href="/profile/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <button
                    className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                    onClick={() => {
                      setProfileOpen(false);
                      // Handle sign out
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </nav>
              </div>
            )}
          </div>

          {/* Mobile Menu - Uses existing MobileMenu component */}
          <div className="md:hidden">
            <MobileMenu isAuthenticated={isAuthenticated} userName={userName} />
          </div>
        </div>
      </div>
    </header>
  );
}
