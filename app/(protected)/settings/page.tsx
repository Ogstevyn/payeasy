"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  MapPin,
  Bell,
  Shield,
  Bookmark,
  Save,
  Check,
  ChevronRight,
  Wifi,
  Car,
  Dumbbell,
  Coffee,
  ShoppingBag,
  Utensils,
  TreePine,
  WashingMachine,
  X,
  Plus,
  Eye,
  Users,
  Lock,
  Wallet,
} from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SavedSearch {
  id: string;
  label: string;
  filters: Record<string, unknown>;
  createdAt: string;
}

interface UserPreferences {
  // Budget
  budgetMin: number;
  budgetMax: number;

  // Location
  preferredLocations: string[];
  maxCommuteDistance: number;

  // Amenities
  amenities: string[];

  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  paymentReminders: boolean;
  newMatchAlerts: boolean;
  messageNotifications: boolean;

  // Privacy
  profileVisibility: "public" | "matches_only" | "private";
  showBudgetRange: boolean;
  showLocation: boolean;
  allowContactFromStrangers: boolean;

  // Saved searches
  savedSearches: SavedSearch[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "payeasy_user_preferences";

const DEFAULT_PREFERENCES: UserPreferences = {
  budgetMin: 500,
  budgetMax: 2000,
  preferredLocations: [],
  maxCommuteDistance: 30,
  amenities: [],
  emailNotifications: true,
  pushNotifications: false,
  smsNotifications: false,
  paymentReminders: true,
  newMatchAlerts: true,
  messageNotifications: true,
  profileVisibility: "public",
  showBudgetRange: false,
  showLocation: true,
  allowContactFromStrangers: true,
  savedSearches: [],
};

const AMENITY_OPTIONS = [
  { id: "wifi", label: "High-Speed WiFi", Icon: Wifi },
  { id: "gym", label: "Gym / Fitness", Icon: Dumbbell },
  { id: "parking", label: "Parking", Icon: Car },
  { id: "laundry", label: "In-Unit Laundry", Icon: WashingMachine },
  { id: "coffee", label: "Near Coffee Shops", Icon: Coffee },
  { id: "grocery", label: "Near Grocery", Icon: ShoppingBag },
  { id: "restaurants", label: "Near Restaurants", Icon: Utensils },
  { id: "parks", label: "Near Parks", Icon: TreePine },
];

const POPULAR_CITIES = [
  "New York", "Los Angeles", "Chicago", "Houston", "Phoenix",
  "San Francisco", "Seattle", "Austin", "Boston", "Miami",
];

const NAV_SECTIONS = [
  { id: "budget", label: "Budget", Icon: DollarSign },
  { id: "location", label: "Location", Icon: MapPin },
  { id: "amenities", label: "Amenities", Icon: Wallet },
  { id: "notifications", label: "Notifications", Icon: Bell },
  { id: "privacy", label: "Privacy", Icon: Shield },
  { id: "searches", label: "Saved Searches", Icon: Bookmark },
] as const;

type SectionId = (typeof NAV_SECTIONS)[number]["id"];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 pr-4">
        <p className="text-dark-100 text-sm font-medium">{label}</p>
        {description && (
          <p className="text-dark-500 text-xs mt-0.5">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
          checked ? "bg-brand-500" : "bg-white/10"
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function SectionCard({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="glass-card p-6">
      <div className="mb-5">
        <h2 className="text-white font-semibold text-lg">{title}</h2>
        <p className="text-dark-500 text-sm mt-1">{description}</p>
      </div>
      {children}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [activeSection, setActiveSection] = useState<SectionId>("budget");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [locationInput, setLocationInput] = useState("");
  const [hasUnsaved, setHasUnsaved] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setPrefs(JSON.parse(stored));
    } catch {
      // ignore parse errors
    }
  }, []);

  const update = useCallback(
    <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
      setPrefs((prev) => ({ ...prev, [key]: value }));
      setHasUnsaved(true);
    },
    []
  );

  const handleSave = async () => {
    setSaveStatus("saving");
    // Persist to localStorage (replace with API call once backend is ready)
    await new Promise((r) => setTimeout(r, 600));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    setSaveStatus("saved");
    setHasUnsaved(false);
    setTimeout(() => setSaveStatus("idle"), 2500);
  };

  const toggleAmenity = (id: string) => {
    const next = prefs.amenities.includes(id)
      ? prefs.amenities.filter((a) => a !== id)
      : [...prefs.amenities, id];
    update("amenities", next);
  };

  const addLocation = () => {
    const trimmed = locationInput.trim();
    if (!trimmed || prefs.preferredLocations.includes(trimmed)) return;
    update("preferredLocations", [...prefs.preferredLocations, trimmed]);
    setLocationInput("");
  };

  const removeLocation = (loc: string) => {
    update(
      "preferredLocations",
      prefs.preferredLocations.filter((l) => l !== loc)
    );
  };

  const removeSavedSearch = (id: string) => {
    update(
      "savedSearches",
      prefs.savedSearches.filter((s) => s.id !== id)
    );
  };

  // ── Section renderers ──────────────────────────────────────────────────────

  const renderBudget = () => (
    <SectionCard
      title="Budget Range"
      description="Set your monthly budget for rent contributions."
    >
      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-dark-400 text-sm">Minimum</span>
            <span className="text-brand-400 font-semibold">${prefs.budgetMin.toLocaleString()}/mo</span>
          </div>
          <input
            type="range"
            min={100}
            max={prefs.budgetMax - 100}
            step={50}
            value={prefs.budgetMin}
            onChange={(e) => update("budgetMin", Number(e.target.value))}
            className="w-full accent-brand-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-dark-400 text-sm">Maximum</span>
            <span className="text-accent-400 font-semibold">${prefs.budgetMax.toLocaleString()}/mo</span>
          </div>
          <input
            type="range"
            min={prefs.budgetMin + 100}
            max={10000}
            step={50}
            value={prefs.budgetMax}
            onChange={(e) => update("budgetMax", Number(e.target.value))}
            className="w-full accent-accent-500 cursor-pointer"
          />
        </div>

        {/* Visual range bar */}
        <div className="glass rounded-xl p-4 flex items-center gap-4">
          <DollarSign size={18} className="text-brand-400 shrink-0" />
          <div className="flex-1">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full transition-all duration-300"
                style={{
                  marginLeft: `${(prefs.budgetMin / 10000) * 100}%`,
                  width: `${((prefs.budgetMax - prefs.budgetMin) / 10000) * 100}%`,
                }}
              />
            </div>
          </div>
          <span className="text-dark-300 text-sm whitespace-nowrap">
            ${prefs.budgetMin.toLocaleString()} – ${prefs.budgetMax.toLocaleString()}
          </span>
        </div>
      </div>
    </SectionCard>
  );

  const renderLocation = () => (
    <SectionCard
      title="Location Preferences"
      description="Choose cities or neighborhoods you'd like to live in."
    >
      <div className="space-y-5">
        {/* Max commute */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-dark-400 text-sm">Max commute distance</span>
            <span className="text-brand-400 font-semibold">{prefs.maxCommuteDistance} mi</span>
          </div>
          <input
            type="range"
            min={1}
            max={100}
            step={1}
            value={prefs.maxCommuteDistance}
            onChange={(e) => update("maxCommuteDistance", Number(e.target.value))}
            className="w-full accent-brand-500 cursor-pointer"
          />
        </div>

        {/* Add location */}
        <div>
          <label className="block text-dark-400 text-sm mb-2">
            Add preferred cities
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addLocation()}
              placeholder="Type a city name…"
              list="city-suggestions"
              className="flex-1 glass rounded-xl px-4 py-2.5 text-sm text-dark-100 placeholder-dark-600 border-transparent focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
            />
            <datalist id="city-suggestions">
              {POPULAR_CITIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <button
              onClick={addLocation}
              className="btn-primary !py-2.5 !px-4 !text-sm !rounded-xl"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Location tags */}
        {prefs.preferredLocations.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {prefs.preferredLocations.map((loc) => (
              <span
                key={loc}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-brand-500/20 text-brand-300 border border-brand-500/30"
              >
                <MapPin size={12} />
                {loc}
                <button
                  onClick={() => removeLocation(loc)}
                  className="ml-0.5 hover:text-white transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-dark-600 text-sm italic">No locations added yet.</p>
        )}

        {/* Quick-add popular cities */}
        <div>
          <p className="text-dark-500 text-xs mb-2 uppercase tracking-wider">Popular cities</p>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_CITIES.filter((c) => !prefs.preferredLocations.includes(c)).slice(0, 6).map((city) => (
              <button
                key={city}
                onClick={() => update("preferredLocations", [...prefs.preferredLocations, city])}
                className="px-3 py-1 rounded-full text-xs text-dark-400 border border-white/10 hover:border-brand-500/50 hover:text-brand-300 transition-colors"
              >
                + {city}
              </button>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );

  const renderAmenities = () => (
    <SectionCard
      title="Amenity Preferences"
      description="Select the amenities that matter most to you when looking for a place."
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {AMENITY_OPTIONS.map(({ id, label, Icon }) => {
          const active = prefs.amenities.includes(id);
          return (
            <button
              key={id}
              onClick={() => toggleAmenity(id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 text-center ${
                active
                  ? "border-brand-500/60 bg-brand-500/10 text-brand-300"
                  : "border-white/8 bg-white/3 text-dark-500 hover:border-white/20 hover:text-dark-300"
              }`}
            >
              <Icon size={20} />
              <span className="text-xs font-medium leading-tight">{label}</span>
            </button>
          );
        })}
      </div>
      {prefs.amenities.length > 0 && (
        <p className="text-dark-500 text-xs mt-4">
          {prefs.amenities.length} amenit{prefs.amenities.length === 1 ? "y" : "ies"} selected
        </p>
      )}
    </SectionCard>
  );

  const renderNotifications = () => (
    <SectionCard
      title="Notification Settings"
      description="Control how and when PayEasy reaches out to you."
    >
      <div>
        <p className="text-dark-500 text-xs uppercase tracking-wider mb-3">Channels</p>
        <div className="divide-y divide-white/5">
          <Toggle
            checked={prefs.emailNotifications}
            onChange={(v) => update("emailNotifications", v)}
            label="Email notifications"
            description="Receive updates to your registered email address"
          />
          <Toggle
            checked={prefs.pushNotifications}
            onChange={(v) => update("pushNotifications", v)}
            label="Push notifications"
            description="Browser or mobile push alerts"
          />
          <Toggle
            checked={prefs.smsNotifications}
            onChange={(v) => update("smsNotifications", v)}
            label="SMS notifications"
            description="Text messages for important alerts"
          />
        </div>

        <div className="my-5 h-px bg-white/5" />

        <p className="text-dark-500 text-xs uppercase tracking-wider mb-3">Alert types</p>
        <div className="divide-y divide-white/5">
          <Toggle
            checked={prefs.paymentReminders}
            onChange={(v) => update("paymentReminders", v)}
            label="Payment reminders"
            description="Reminders before rent is due"
          />
          <Toggle
            checked={prefs.newMatchAlerts}
            onChange={(v) => update("newMatchAlerts", v)}
            label="New roommate matches"
            description="Get notified when someone matches your criteria"
          />
          <Toggle
            checked={prefs.messageNotifications}
            onChange={(v) => update("messageNotifications", v)}
            label="Message notifications"
            description="Alerts when you receive new messages"
          />
        </div>
      </div>
    </SectionCard>
  );

  const renderPrivacy = () => {
    const visibilityOptions: {
      value: UserPreferences["profileVisibility"];
      label: string;
      desc: string;
      Icon: React.ElementType;
    }[] = [
      { value: "public", label: "Public", desc: "Anyone on PayEasy can view your profile", Icon: Eye },
      { value: "matches_only", label: "Matches only", desc: "Only users matched with you can see your profile", Icon: Users },
      { value: "private", label: "Private", desc: "Your profile is hidden from search results", Icon: Lock },
    ];

    return (
      <SectionCard
        title="Privacy Settings"
        description="Manage who can see your information and how they can contact you."
      >
        <div className="space-y-6">
          {/* Profile visibility */}
          <div>
            <p className="text-dark-400 text-sm mb-3">Profile visibility</p>
            <div className="space-y-2">
              {visibilityOptions.map(({ value, label, desc, Icon }) => (
                <button
                  key={value}
                  onClick={() => update("profileVisibility", value)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all text-left ${
                    prefs.profileVisibility === value
                      ? "border-brand-500/60 bg-brand-500/10"
                      : "border-white/8 hover:border-white/15"
                  }`}
                >
                  <div
                    className={`mt-0.5 p-1.5 rounded-lg ${
                      prefs.profileVisibility === value
                        ? "bg-brand-500/20 text-brand-400"
                        : "bg-white/5 text-dark-500"
                    }`}
                  >
                    <Icon size={14} />
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        prefs.profileVisibility === value ? "text-brand-300" : "text-dark-200"
                      }`}
                    >
                      {label}
                    </p>
                    <p className="text-dark-500 text-xs mt-0.5">{desc}</p>
                  </div>
                  {prefs.profileVisibility === value && (
                    <Check size={14} className="text-brand-400 mt-1 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* Info visibility */}
          <div>
            <p className="text-dark-400 text-sm mb-3">Information visibility</p>
            <div className="divide-y divide-white/5">
              <Toggle
                checked={prefs.showBudgetRange}
                onChange={(v) => update("showBudgetRange", v)}
                label="Show budget range on profile"
                description="Other users can see your monthly budget"
              />
              <Toggle
                checked={prefs.showLocation}
                onChange={(v) => update("showLocation", v)}
                label="Show location preferences"
                description="Display your preferred areas on your profile"
              />
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* Contact */}
          <div>
            <p className="text-dark-400 text-sm mb-3">Contact permissions</p>
            <Toggle
              checked={prefs.allowContactFromStrangers}
              onChange={(v) => update("allowContactFromStrangers", v)}
              label="Allow messages from non-matches"
              description="Anyone can send you a message, not just your matches"
            />
          </div>
        </div>
      </SectionCard>
    );
  };

  const renderSavedSearches = () => (
    <SectionCard
      title="Saved Searches"
      description="Your saved roommate and apartment search filters."
    >
      {prefs.savedSearches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-4">
            <Bookmark size={24} className="text-brand-400" />
          </div>
          <p className="text-dark-300 font-medium">No saved searches yet</p>
          <p className="text-dark-600 text-sm mt-1">
            Save a search from the roommate finder and it will appear here.
          </p>
          <Link href="/" className="btn-secondary !py-2 !px-5 !text-sm !rounded-xl mt-5">
            Browse roommates
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {prefs.savedSearches.map((search) => (
            <div
              key={search.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-white/8 bg-white/3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center shrink-0">
                <Bookmark size={14} className="text-brand-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-dark-100 text-sm font-medium truncate">{search.label}</p>
                <p className="text-dark-600 text-xs">
                  Saved {new Date(search.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => removeSavedSearch(search.id)}
                className="text-dark-600 hover:text-red-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
                aria-label="Remove saved search"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );

  const sectionRenderers: Record<SectionId, () => React.ReactNode> = {
    budget: renderBudget,
    location: renderLocation,
    amenities: renderAmenities,
    notifications: renderNotifications,
    privacy: renderPrivacy,
    searches: renderSavedSearches,
  };

  // ── Layout ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen text-dark-100">
      {/* Top bar */}
      <header className="sticky top-0 z-40 glass border-b border-white/8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-lg font-bold text-white tracking-tight hidden sm:block">
                Pay<span className="gradient-text">Easy</span>
              </span>
            </Link>
            <ChevronRight size={14} className="text-dark-600 hidden sm:block" />
            <span className="text-dark-400 text-sm hidden sm:block">Settings</span>
          </div>

          <button
            onClick={handleSave}
            disabled={saveStatus === "saving" || !hasUnsaved}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
              saveStatus === "saved"
                ? "bg-accent-500/20 text-accent-400 border border-accent-500/30"
                : hasUnsaved
                ? "btn-primary !py-2 !px-4 !text-sm !rounded-xl"
                : "bg-white/5 text-dark-500 border border-white/8 cursor-not-allowed"
            }`}
          >
            {saveStatus === "saving" ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving…
              </>
            ) : saveStatus === "saved" ? (
              <>
                <Check size={15} />
                Saved
              </>
            ) : (
              <>
                <Save size={15} />
                Save changes
              </>
            )}
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Preferences &amp; <span className="gradient-text">Settings</span>
          </h1>
          <p className="text-dark-500 text-sm mt-1">
            Customize your PayEasy experience.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar nav */}
          <aside className="lg:w-56 shrink-0">
            {/* Mobile: horizontal scroll tabs */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {NAV_SECTIONS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                    activeSection === id
                      ? "bg-brand-500/20 text-brand-300 border border-brand-500/40"
                      : "glass text-dark-400 border border-white/8"
                  }`}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>

            {/* Desktop: vertical list */}
            <nav className="hidden lg:flex flex-col gap-1 glass-card p-3">
              {NAV_SECTIONS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                    activeSection === id
                      ? "bg-brand-500/15 text-brand-300"
                      : "text-dark-400 hover:text-dark-100 hover:bg-white/5"
                  }`}
                >
                  <Icon
                    size={16}
                    className={activeSection === id ? "text-brand-400" : "text-dark-600"}
                  />
                  {label}
                  {activeSection === id && (
                    <ChevronRight size={13} className="ml-auto text-brand-500" />
                  )}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {sectionRenderers[activeSection]()}
              </motion.div>
            </AnimatePresence>

            {/* Bottom save */}
            {hasUnsaved && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center justify-between glass rounded-xl px-5 py-3 border border-brand-500/20"
              >
                <p className="text-dark-400 text-sm">You have unsaved changes.</p>
                <button
                  onClick={handleSave}
                  disabled={saveStatus === "saving"}
                  className="btn-primary !py-2 !px-5 !text-sm !rounded-xl"
                >
                  {saveStatus === "saving" ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      Save
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
