import type { ComponentType, SVGProps } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Home,
  Loader2,
  Mail,
  MapPin,
  Search,
  Settings,
  User,
  X,
} from "lucide-react";
import { PayEasyMark } from "./custom/PayEasyMark";

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export const ICON_REGISTRY = {
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  bell: Bell,
  check: Check,
  chevronDown: ChevronDown,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  heart: Heart,
  home: Home,
  loader: Loader2,
  mail: Mail,
  mapPin: MapPin,
  payeasy: PayEasyMark,
  search: Search,
  settings: Settings,
  user: User,
  x: X,
} satisfies Record<string, IconComponent>;

export type IconName = keyof typeof ICON_REGISTRY;
export const ICON_NAMES = Object.keys(ICON_REGISTRY) as IconName[];
