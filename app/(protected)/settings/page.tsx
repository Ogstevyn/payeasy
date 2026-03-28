"use client";

import React, { useState, useEffect } from "react";
import { 
  Bell, 
  Lock, 
  MapPin, 
  DollarSign, 
  Save, 
  Settings as SettingsIcon,
  Shield,
  Search,
  Check
} from "lucide-react";

interface Preferences {
  budget_min: number;
  budget_max: number;
  location_preferences: string[];
  amenity_preferences: string[];
  notifications_enabled: boolean;
  privacy_level: 'public' | 'private' | 'friends';
}

const SettingsPage = () => {
  const [preferences, setPreferences] = useState<Preferences>({
    budget_min: 500,
    budget_max: 2000,
    location_preferences: ["New York", "Brooklyn"],
    amenity_preferences: ["Wifi", "Kitchen", "Laundry"],
    notifications_enabled: true,
    privacy_level: 'private',
  });

  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const toggleAmenity = (amenity: string) => {
    setPreferences(prev => ({
      ...prev,
      amenity_preferences: prev.amenity_preferences.includes(amenity)
        ? prev.amenity_preferences.filter(a => a !== amenity)
        : [...prev.amenity_preferences, amenity]
    }));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <SettingsIcon className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">User Preferences</h1>
              <p className="text-gray-400 text-sm">Customize your roommate search experience</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2 px-6 py-2.5 rounded-xl disabled:opacity-50"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </header>

        {showSuccess && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
            <Check className="w-5 h-5" />
            Settings saved successfully!
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Budget Settings */}
          <section className="glass-card p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-blue-400 font-semibold mb-2">
              <DollarSign className="w-5 h-5" />
              <h2>Budget Range</h2>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 uppercase tracking-wider">Min Budget</label>
                  <input
                    type="number"
                    value={preferences.budget_min}
                    onChange={(e) => setPreferences({ ...preferences, budget_min: parseInt(e.target.value) })}
                    className="w-full bg-[#16161f] border border-white/10 rounded-lg p-3 outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 uppercase tracking-wider">Max Budget</label>
                  <input
                    type="number"
                    value={preferences.budget_max}
                    onChange={(e) => setPreferences({ ...preferences, budget_max: parseInt(e.target.value) })}
                    className="w-full bg-[#16161f] border border-white/10 rounded-lg p-3 outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
              </div>
              <input 
                type="range" 
                min="0" 
                max="5000" 
                step="100"
                value={preferences.budget_max}
                onChange={(e) => setPreferences({ ...preferences, budget_max: parseInt(e.target.value) })}
                className="w-full accent-blue-500"
              />
            </div>
          </section>

          {/* Privacy Settings */}
          <section className="glass-card p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-purple-400 font-semibold mb-2">
              <Lock className="w-5 h-5" />
              <h2>Privacy Settings</h2>
            </div>
            <div className="space-y-3">
              {(['public', 'private', 'friends'] as const).map((level) => (
                <label 
                  key={level}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    preferences.privacy_level === level 
                    ? 'bg-purple-500/10 border-purple-500/50' 
                    : 'bg-[#16161f] border-white/5 hover:border-white/10'
                  }`}
                >
                  <span className="capitalize">{level}</span>
                  <input
                    type="radio"
                    name="privacy"
                    checked={preferences.privacy_level === level}
                    onChange={() => setPreferences({ ...preferences, privacy_level: level })}
                    className="hidden"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    preferences.privacy_level === level ? 'border-purple-500' : 'border-gray-600'
                  }`}>
                    {preferences.privacy_level === level && <div className="w-2.5 h-2.5 bg-purple-500 rounded-full" />}
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Location Preferences */}
          <section className="glass-card p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
              <MapPin className="w-5 h-5" />
              <h2>Preferred Locations</h2>
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {preferences.location_preferences.map((loc, idx) => (
                  <span key={idx} className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-sm border border-emerald-500/20 flex items-center gap-2">
                    {loc}
                    <button 
                      onClick={() => setPreferences(prev => ({
                        ...prev,
                        location_preferences: prev.location_preferences.filter((_, i) => i !== idx)
                      }))}
                      className="hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  placeholder="Add location..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value;
                      if (val) {
                        setPreferences(prev => ({
                          ...prev,
                          location_preferences: [...prev.location_preferences, val]
                        }));
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                  className="w-full bg-[#16161f] border border-white/10 rounded-lg p-2.5 pl-10 outline-none focus:border-emerald-500/50 transition-colors text-sm"
                />
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="glass-card p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-semibold mb-2">
              <Bell className="w-5 h-5" />
              <h2>Notifications</h2>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#16161f] rounded-xl border border-white/5">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-xs text-gray-400">Receive alerts about new matches</p>
              </div>
              <button
                onClick={() => setPreferences(prev => ({ ...prev, notifications_enabled: !prev.notifications_enabled }))}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  preferences.notifications_enabled ? 'bg-amber-500' : 'bg-gray-700'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  preferences.notifications_enabled ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>
          </section>

          {/* Amenities */}
          <section className="glass-card p-6 rounded-2xl md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-sky-400 font-semibold mb-2">
              <Shield className="w-5 h-5" />
              <h2>Amenity Preferences</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {["Wifi", "Kitchen", "Laundry", "Parking", "Gym", "Pool", "Pets Allowed", "Balcony", "AC", "Elevator"].map((amenity) => (
                <button
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  className={`p-3 rounded-xl border text-sm transition-all ${
                    preferences.amenity_preferences.includes(amenity)
                    ? 'bg-sky-500/10 border-sky-500/50 text-sky-400'
                    : 'bg-[#16161f] border-white/5 hover:border-white/10'
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
