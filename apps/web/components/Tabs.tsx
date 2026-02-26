import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type TabsContextType = {
  activeTab: string;
  setActiveTab: (value: string) => void;
};

const TabsContext = createContext<TabsContextType | null>(null);

interface TabsProps {
  children: ReactNode;
  defaultValue: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function Tabs({
  children,
  defaultValue,
  onChange,
  className,
}: TabsProps) {
  const [activeTab, setInternalActiveTab] = useState(defaultValue);

  const setActiveTab = (value: string) => {
    setInternalActiveTab(value);
    onChange?.(value);
  };

  const value = useMemo(() => ({ activeTab, setActiveTab }), [activeTab]);

  return (
    <TabsContext.Provider value={value}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabListProps {
  children: ReactNode;
  className?: string;
}

export function TabList({ children, className }: TabListProps) {
  const listRef = React.useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!listRef.current) return;
    const tabs = Array.from(
      listRef.current.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])')
    );
    const index = tabs.findIndex((t) => t === document.activeElement);
    if (index === -1) return;

    let nextIndex: number;
    switch (e.key) {
      case "ArrowRight":
        nextIndex = (index + 1) % tabs.length;
        break;
      case "ArrowLeft":
        nextIndex = (index - 1 + tabs.length) % tabs.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    tabs[nextIndex]?.focus();
    tabs[nextIndex]?.click();
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      onKeyDown={handleKeyDown}
      className={cn(
        "flex w-full items-center gap-2 border-b border-secondary-200 overflow-x-auto no-scrollbar scroll-smooth",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabPanels({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mt-4 relative min-h-[100px]", className)}>{children}</div>;
}

export function TabPanel({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabPanel must be used within Tabs");

  const isActive = ctx.activeTab === value;

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          role="tabpanel"
          key={value}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={cn("w-full focus-visible:outline-none", className)}
          tabIndex={0}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { TabsContext };
export default Tabs;
