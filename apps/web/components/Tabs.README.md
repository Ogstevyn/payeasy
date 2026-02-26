Usage

Import the components and use them like:

```tsx
import Tabs, { TabList, TabPanels, TabPanel } from "@/components/Tabs";
import { TabButton } from "@/components/TabButton";
import { Home, Settings } from "lucide-react"; // example icons

<Tabs defaultValue="home">
  <TabList>
    <TabButton value="home" icon={<Home className="w-4 h-4" />}>Home</TabButton>
    <TabButton value="settings" icon={<Settings className="w-4 h-4" />}>Settings</TabButton>
  </TabList>
  <TabPanels>
    <TabPanel value="home">Welcome home.</TabPanel>
    <TabPanel value="settings">Manage your preferences.</TabPanel>
  </TabPanels>
</Tabs>
```

Notes
- Keyboard: ArrowLeft/ArrowRight/Home/End supported.
- Mobile: Tab list scrolls horizontally when overflowing.
- Accessibility: uses `role=tablist`, `role=tab`, `role=tabpanel`, `aria-selected`, and `aria-hidden`.
- Animations: Uses `framer-motion` for smooth layout transitions of the active indicator and content cross-fades.
