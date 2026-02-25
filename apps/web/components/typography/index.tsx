/**
 * components/typography/index.tsx
 *
 * PayEasy Typography System
 * ─────────────────────────
 * A set of composable, typed React components that enforce the design
 * system's type hierarchy. Every text element in the app should use one
 * of these components instead of raw HTML tags or ad-hoc Tailwind classes.
 *
 * Font stack
 *   Display / brand headings → "Plus Jakarta Sans" (loaded in layout.tsx)
 *   Body / UI text           → "Inter" (already loaded via @fontsource-variable/inter)
 *
 * Usage
 *   import { H1, H2, Body, Lead, Caption, Label, Code } from "@/components/typography"
 */

import React from "react";
import { cn } from "@/lib/utils";

// ── Shared prop types ─────────────────────────────────────────────────────────

type As = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div" | "label" | "legend" | "figcaption" | "code" | "pre";

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  /** Override the rendered HTML element while keeping the visual style. */
  as?: As;
  children: React.ReactNode;
  className?: string;
}

// ── Display headings (brand font — Plus Jakarta Sans) ─────────────────────────

/**
 * Display XL — Hero headlines, landing pages only.
 * 60px / tight / extrabold
 */
export function DisplayXL({ as: Tag = "h1", className, children, ...props }: TypographyProps) {
  return (
    <Tag
      className={cn(
        "font-display text-display-xl font-bold tracking-tight text-white leading-[1.1]",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

/**
 * Display LG — Section heroes, feature titles.
 * 48px / tight / bold
 */
export function DisplayLG({ as: Tag = "h1", className, children, ...props }: TypographyProps) {
  return (
    <Tag
      className={cn(
        "font-display text-display-lg font-bold tracking-tight text-white leading-[1.2]",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

// ── Semantic headings ─────────────────────────────────────────────────────────

/**
 * H1 — Page title, one per page.
 * 36px / -0.01em / bold
 */
export function H1({ as: Tag = "h1", className, children, ...props }: TypographyProps) {
  return (
    <Tag
      className={cn(
        "font-display text-h1 font-bold tracking-tight text-white",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

/**
 * H2 — Major section headings.
 * 30px / -0.01em / bold
 */
export function H2({ as: Tag = "h2", className, children, ...props }: TypographyProps) {
  return (
    <Tag
      className={cn(
        "font-display text-h2 font-bold tracking-tight text-white",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

/**
 * H3 — Sub-section headings, card titles.
 * 24px / normal / semibold
 */
export function H3({ as: Tag = "h3", className, children, ...props }: TypographyProps) {
  return (
    <Tag
      className={cn(
        "font-display text-h3 font-semibold text-white",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

/**
 * H4 — Smaller card headings, sidebar titles.
 * 20px / normal / semibold
 */
export function H4({ as: Tag = "h4", className, children, ...props }: TypographyProps) {
  return (
    <Tag
      className={cn(
        "font-display text-h4 font-semibold text-white",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

/**
 * H5 — Compact headings, list group labels.
 * 18px / normal / semibold
 */
export function H5({ as: Tag = "h5", className, children, ...props }: TypographyProps) {
  return (
    <Tag
      className={cn(
        "font-sans text-h5 font-semibold text-white",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

/**
 * H6 — Micro headings, overline labels.
 * 16px / normal / semibold
 */
export function H6({ as: Tag = "h6", className, children, ...props }: TypographyProps) {
  return (
    <Tag
      className={cn(
        "font-sans text-h6 font-semibold text-white",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

// ── Body text ─────────────────────────────────────────────────────────────────

/**
 * Lead — Introductory paragraph, subtitle under a heading.
 * 20px / relaxed / normal / muted
 */
export function Lead({ as: Tag = "p", className, children, ...props }: TypographyProps) {
  return (
    <Tag
      className={cn(
        "font-sans text-body-xl font-normal leading-relaxed text-gray-300",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

/**
 * Body — Standard paragraph text.
 * 16px / relaxed / normal
 */
export function Body({ as: Tag = "p", className, children, ...props }: TypographyProps) {
  return (
    <Tag
      className={cn(
        "font-sans text-body-base font-normal leading-relaxed text-gray-200",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

/**
 * BodySM — Secondary body text, helper copy.
 * 14px / normal / normal / muted
 */
export function BodySM({ as: Tag = "p", className, children, ...props }: TypographyProps) {
  return (
    <Tag
      className={cn(
        "font-sans text-body-sm font-normal leading-normal text-gray-400",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

// ── UI text ───────────────────────────────────────────────────────────────────

/**
 * Label — Form labels, field names.
 * 14px / normal / medium
 */
export function Label({ as: Tag = "label", className, children, ...props }: TypographyProps) {
  return (
    <Tag
      className={cn(
        "font-sans text-body-sm font-medium leading-normal text-gray-200",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

/**
 * Caption — Image captions, footnotes, timestamps.
 * 12px / normal / normal / muted
 */
export function Caption({ as: Tag = "span", className, children, ...props }: TypographyProps) {
  return (
    <Tag
      className={cn(
        "font-sans text-body-xs font-normal leading-normal text-gray-500 tracking-wide",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

/**
 * Overline — Category labels, eyebrows above headings.
 * 12px / wider tracking / semibold / uppercase / brand color
 */
export function Overline({ as: Tag = "span", className, children, ...props }: TypographyProps) {
  return (
    <Tag
      className={cn(
        "font-sans text-body-xs font-semibold uppercase tracking-widest text-primary-400",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

/**
 * Code — Inline code snippets.
 */
export function Code({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <code
      className={cn(
        "font-mono text-sm font-medium bg-slate-800 text-primary-300 px-1.5 py-0.5 rounded-md",
        className
      )}
      {...props}
    >
      {children}
    </code>
  );
}

/**
 * Mono — Monospaced text for addresses, hashes, IDs.
 */
export function Mono({ as: Tag = "span", className, children, ...props }: TypographyProps) {
  return (
    <Tag
      className={cn(
        "font-mono text-body-sm tabular-nums text-gray-300",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

// ── Re-exports ────────────────────────────────────────────────────────────────

export type { TypographyProps };
