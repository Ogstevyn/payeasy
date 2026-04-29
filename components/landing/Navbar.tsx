"use client";

import { useState, useEffect } from "react";
import { Menu, Wallet, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ConnectWalletButton from "@/components/wallet/ConnectWalletButton";
import { useActiveSection } from "@/hooks/useActiveSection";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useStellar } from "@/context/StellarContext";

export default function Navbar() {
  const router = useRouter();
  const { isConnected } = useStellar();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const activeSection = useActiveSection(["features", "how-it-works", "stellar"]);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Stellar", href: "#stellar" },
  ];

  return (
    <nav
      aria-label="Main Navigation"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "glass py-3 shadow-lg shadow-black/20"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center transition-transform group-hover:scale-110">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            Pay<span className="gradient-text">Easy</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.replace("#", "");
            return (
              <a
                key={link.name}
                href={link.href}
                className={`relative text-sm font-medium transition-all duration-300 ${
                  isActive ? "text-white" : "text-dark-400 hover:text-white"
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-brand-500 rounded-full animate-in fade-in slide-in-from-bottom-1 duration-300" />
                )}
              </a>
            );
          })}
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href={isConnected ? "/escrow/create" : "/connect"}
            className="btn-secondary !py-2.5 !px-5 !text-sm !rounded-lg"
          >
            {isConnected ? "Dashboard" : "Sign In"}
          </Link>
          <Link
            href="/connect"
            className="btn-primary !py-2.5 !px-5 !text-sm !rounded-lg"
            onMouseEnter={() => router.prefetch("/connect")}
          >
            <Wallet size={16} />
            Connect Wallet
          </Link>
          <ConnectWalletButton />
          <ThemeToggle />
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-white p-2"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass mt-2 mx-4 rounded-2xl p-6 animate-fade-in">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-dark-300 hover:text-white transition-colors py-2 text-lg font-medium"
              >
                {link.name}
              </a>
            ))}
            <div className="h-px bg-white/10 my-2" />
            <Link
              href={isConnected ? "/escrow/create" : "/connect"}
              className="btn-secondary !justify-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {isConnected ? "Dashboard" : "Sign In"}
            </Link>
            <Link
              href="/connect"
              className="btn-primary !justify-center"
              onMouseEnter={() => router.prefetch("/connect")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Wallet size={16} />
              Connect Wallet
            </Link>
            <div className="flex justify-center gap-3">
              <ConnectWalletButton />
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
