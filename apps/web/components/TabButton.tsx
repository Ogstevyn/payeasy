import React, { useContext } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TabsContext } from "./Tabs";

interface TabButtonProps {
  value: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function TabButton({
  value,
  children,
  icon,
  disabled = false,
  className,
}: TabButtonProps) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabButton must be used within Tabs");

  const isActive = ctx.activeTab === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-disabled={disabled}
      disabled={disabled}
      tabIndex={isActive ? 0 : -1}
      onClick={() => !disabled && ctx.setActiveTab(value)}
      className={cn(
        "relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors hover:text-secondary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-t-lg",
        isActive ? "text-primary-600" : "text-secondary-500",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
      {isActive && (
        <motion.div
          layoutId="activeTabUnderline"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
          initial={false}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        />
      )}
    </button>
  );
}

export default TabButton;
