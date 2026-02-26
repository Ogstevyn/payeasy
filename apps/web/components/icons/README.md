# PayEasy Icon Library

The app uses a unified icon gateway built on `lucide-react`, with support for custom PayEasy SVG icons.

## Source of truth

- Wrapper component: `components/Icon.tsx`
- Icon registry: `components/icons/index.ts`
- Custom brand icons: `components/icons/custom/`
- Developer showcase: `components/icons/IconShowcase.tsx`

## Usage

```tsx
import { Icon } from "@/components";

<Icon name="search" />
<Icon name="mapPin" size="lg" />
<Icon name="heart" size={20} color="#7D00FF" />
<Icon name="loader" animate animationVariant="spin" title="Loading" />
```

## Props

- `name`: icon name from the `IconName` union (`keyof ICON_REGISTRY`)
- `size`: `"sm" | "md" | "lg" | number` (`16 | 24 | 32 | custom`)
- `color`: defaults to `currentColor`
- `animate`: enables animation variant classes
- `animationVariant`: `"hover" | "pulse" | "spin"` (default `"hover"`)
- `title`: optional accessible title; when provided icon is announced as `role="img"`

## Accessibility

- Decorative icons (no `title`) render with `aria-hidden="true"`
- Semantic icons (`title` set) render with `role="img"` and `aria-label`

## Available Icons

- `arrowLeft`
- `arrowRight`
- `bell`
- `check`
- `chevronDown`
- `chevronLeft`
- `chevronRight`
- `heart`
- `home`
- `loader`
- `mail`
- `mapPin`
- `payeasy` (custom brand icon)
- `search`
- `settings`
- `user`
- `x`
