# PayEasy Typography System

A set of composable React components that enforce the design system's type hierarchy.

## Font Stack

| Role | Font | Loaded via |
|------|------|-----------|
| Display / brand headings | **Plus Jakarta Sans** | Google Fonts (`<link>` in `layout.tsx`) |
| Body / UI text | **Inter** | `@fontsource-variable/inter` (already installed) |
| Monospace | System mono stack | Tailwind `font-mono` |

## Components

### Display Headings
Use for hero sections and landing pages only.

```tsx
import { DisplayXL, DisplayLG } from "@/components/typography"

<DisplayXL>Rent smarter together</DisplayXL>
<DisplayLG>Split payments on Stellar</DisplayLG>
```

### Semantic Headings (H1–H6)
One `H1` per page. Use the hierarchy strictly.

```tsx
import { H1, H2, H3, H4, H5, H6 } from "@/components/typography"

<H1>Dashboard</H1>
<H2>Your Listings</H2>
<H3>Recent Activity</H3>
```

### Body Text

```tsx
import { Lead, Body, BodySM } from "@/components/typography"

<Lead>Introductory text that sits below a heading.</Lead>
<Body>Standard paragraph copy for descriptions and content.</Body>
<BodySM>Helper text, secondary descriptions, metadata.</BodySM>
```

### UI Text

```tsx
import { Label, Caption, Overline, Code, Mono } from "@/components/typography"

<Label htmlFor="email">Email address</Label>
<Caption>Updated 2 hours ago</Caption>
<Overline>Featured listings</Overline>
<Code>GABC...XYZ</Code>
<Mono>0x1a2b3c4d</Mono>
```

## Polymorphic `as` prop

Every component accepts an `as` prop to change the rendered HTML element without changing the visual style:

```tsx
// Render an H2 visually but as a <div> for semantic reasons
<H2 as="div">Card Title</H2>

// Render Body text inside a <span>
<Body as="span">Inline text</Body>
```

## Size Scale

| Token | Size | Use |
|-------|------|-----|
| `display-xl` | 60px | Hero headlines |
| `display-lg` | 48px | Section heroes |
| `h1` | 36px | Page titles |
| `h2` | 30px | Section headings |
| `h3` | 24px | Card titles |
| `h4` | 20px | Sub-headings |
| `h5` | 18px | List labels |
| `h6` | 16px | Micro headings |
| `body-xl` | 20px | Lead / intro text |
| `body-base` | 16px | Body copy |
| `body-sm` | 14px | Secondary text |
| `body-xs` | 12px | Captions, metadata |

## Weight System

| Class | Weight | Use |
|-------|--------|-----|
| `font-normal` | 400 | Body, captions |
| `font-medium` | 500 | Labels, UI |
| `font-semibold` | 600 | H3–H6, overlines |
| `font-bold` | 700 | H1–H2, display |

## Accessibility

- All components render semantic HTML elements by default
- Line heights are set to WCAG-compliant values (≥1.5 for body text)
- Color contrast meets WCAG AA for all default text colors on the dark background
- Use the `as` prop to maintain semantic HTML when visual style doesn't match the element's role
