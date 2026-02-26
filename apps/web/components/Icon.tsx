import { forwardRef, memo } from "react";
import type { SVGProps } from "react";
import { cn } from "@/lib/utils";
import { ICON_REGISTRY, type IconName } from "./icons";

export type IconSize = "sm" | "md" | "lg" | number;
export type IconAnimationVariant = "hover" | "pulse" | "spin";

const SIZE_MAP = {
  sm: 16,
  md: 24,
  lg: 32,
} as const;

export type IconProps = Omit<SVGProps<SVGSVGElement>, "color"> & {
  name: IconName;
  size?: IconSize;
  color?: string;
  animate?: boolean;
  animationVariant?: IconAnimationVariant;
  title?: string;
};

const ANIMATION_MAP: Record<IconAnimationVariant, string> = {
  hover: "transition-transform duration-200 ease-out motion-safe:hover:scale-105",
  pulse: "motion-safe:animate-pulse",
  spin: "motion-safe:animate-spin",
};

const BaseIcon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  {
    name,
    size = "md",
    color = "currentColor",
    animate = false,
    animationVariant = "hover",
    title,
    className,
    ...rest
  },
  ref
) {
  const Component = ICON_REGISTRY[name];
  const resolvedSize = typeof size === "number" ? size : SIZE_MAP[size];
  const isDecorative = !title;
  const animationClass = animate ? ANIMATION_MAP[animationVariant] : undefined;

  return (
    <Component
      ref={ref}
      size={resolvedSize}
      width={resolvedSize}
      height={resolvedSize}
      color={color}
      className={cn(
        "inline-block shrink-0",
        animationClass,
        className
      )}
      aria-hidden={isDecorative}
      role={isDecorative ? undefined : "img"}
      aria-label={isDecorative ? undefined : title}
      focusable={isDecorative ? false : undefined}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
    </Component>
  );
});

export const Icon = memo(BaseIcon);
