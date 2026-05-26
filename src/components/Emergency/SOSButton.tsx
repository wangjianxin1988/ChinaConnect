import { useEmergency } from "@/hooks/useEmergency";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { EmbassyLocator } from "./EmbassyLocator";
import { EmergencyCard } from "./EmergencyCard";
import { GPSLocator } from "./GPSLocator";
import { PresetContacts } from "./PresetContacts";
import { QuickDial } from "./QuickDial";

interface SOSButtonProps {
  className?: string;
}

type MenuTab = "main" | "translation" | "location" | "embassy" | "contacts";

export function SOSButton({ className = "" }: SOSButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<MenuTab>("main");
  const [showFlash, setShowFlash] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const tooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    triggerSOS,
    callEmergency,
    userLocation,
    locationError,
    isLoadingLocation,
    getCurrentLocation,
    nearbyServices,
    isSearchingServices,
    searchNearbyServices,
    emergencyContacts_preset,
    addPresetContact,
    removePresetContact,
  } = useEmergency();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
        setActiveTab("main");
      }
    };

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isExpanded]);

  const handleTriggerSOS = useCallback(() => {
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 500);
    triggerSOS("police");
  }, [triggerSOS]);

  const handleToggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
    if (!isExpanded) {
      setActiveTab("main");
    }
  }, [isExpanded]);

  const handleTabChange = useCallback((tab: MenuTab) => {
    setActiveTab(tab);
  }, []);

  const handleCallPresetContact = useCallback(
    (phone: string) => {
      callEmergency(phone);
    },
    [callEmergency],
  );

  return (
    <div
      ref={menuRef}
      className={`fixed bottom-6 right-6 z-[9999] ${className}`}
      onMouseEnter={() => {
        tooltipTimeoutRef.current = setTimeout(() => setShowTooltip(true), 500);
      }}
      onMouseLeave={() => {
        if (tooltipTimeoutRef.current) {
          clearTimeout(tooltipTimeoutRef.current);
        }
        setShowTooltip(false);
      }}
    >
      {/* Expanded Menu */}
      <div
        className={`absolute bottom-20 right-0 mb-2 transition-all duration-300 origin-bottom-right ${
          isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="bg-white rounded-2xl shadow-2xl w-[340px] overflow-hidden border border-gray-100">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-100 overflow-x-auto">
            <button
              onClick={() => handleTabChange("main")}
              className={`flex-1 px-3 py-3 text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === "main"
                  ? "bg-red-50 text-red-600 border-b-2 border-red-600"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="block">🚨</span>
              <span className="hidden sm:inline">SOS</span>
            </button>
            <button
              onClick={() => handleTabChange("translation")}
              className={`flex-1 px-3 py-3 text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === "translation"
                  ? "bg-purple-50 text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="block">📋</span>
              <span className="hidden sm:inline">Translate</span>
            </button>
            <button
              onClick={() => handleTabChange("location")}
              className={`flex-1 px-3 py-3 text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === "location"
                  ? "bg-green-50 text-green-600 border-b-2 border-green-600"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="block">📍</span>
              <span className="hidden sm:inline">GPS</span>
            </button>
            <button
              onClick={() => handleTabChange("embassy")}
              className={`flex-1 px-3 py-3 text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === "embassy"
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="block">🏛️</span>
              <span className="hidden sm:inline">Embassy</span>
            </button>
            <button
              onClick={() => handleTabChange("contacts")}
              className={`flex-1 px-3 py-3 text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === "contacts"
                  ? "bg-pink-50 text-pink-600 border-b-2 border-pink-600"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="block">👥</span>
              <span className="hidden sm:inline">Contacts</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="max-h-[400px] overflow-y-auto">
            {activeTab === "main" && (
              <div className="p-4 space-y-4">
                {/* Quick Dial */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Emergency Numbers</h3>
                  <div className="space-y-2">
                    <QuickDial compact onCall={callEmergency} />
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleTabChange("translation")}
                    className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm hover:bg-purple-100 transition-colors"
                  >
                    <span>📋</span>
                    <span>Translation</span>
                  </button>
                  <button
                    onClick={() => handleTabChange("location")}
                    className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm hover:bg-green-100 transition-colors"
                  >
                    <span>📍</span>
                    <span>My Location</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === "translation" && (
              <div className="p-3">
                <EmergencyCard compact />
              </div>
            )}

            {activeTab === "location" && (
              <div className="p-3">
                <GPSLocator />
              </div>
            )}

            {activeTab === "embassy" && (
              <div className="p-3">
                <EmbassyLocator />
              </div>
            )}

            {activeTab === "contacts" && (
              <div className="p-3">
                <PresetContacts
                  contacts={emergencyContacts_preset}
                  onAdd={addPresetContact}
                  onRemove={removePresetContact}
                  onCall={handleCallPresetContact}
                />
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="p-2 border-t border-gray-100 bg-gray-50">
            <button
              onClick={() => setIsExpanded(false)}
              className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Main SOS Button */}
      <div className="flex flex-col items-end gap-3">
        {/* Expand/Menu Button */}
        <button
          onClick={handleToggleExpanded}
          onContextMenu={(e) => {
            e.preventDefault();
            handleToggleExpanded();
          }}
          className={`
            w-12 h-12 rounded-full shadow-xl
            bg-gradient-to-br from-gray-600 to-gray-800 text-white
            hover:scale-110 active:scale-95 transition-all duration-200
            flex items-center justify-center text-xl
            ${isExpanded ? "rotate-90" : ""}
          `}
          aria-label={isExpanded ? "Close emergency menu" : "Open emergency menu"}
        >
          {isExpanded ? "✕" : "☰"}
        </button>

        {/* SOS Button */}
        <button
          onClick={handleTriggerSOS}
          className={`
            relative w-16 h-16 rounded-full shadow-2xl
            bg-gradient-to-br from-red-500 to-red-700 text-white font-bold
            hover:scale-110 active:scale-95 transition-all duration-200
            flex items-center justify-center
            ${showFlash ? "ring-8 ring-red-300" : ""}
          `}
          aria-label="SOS Emergency - Tap to call police"
        >
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30" />

          {/* Icon */}
          <div className="relative z-10 flex items-center justify-center">
            <span className="text-3xl">🆘</span>
          </div>
        </button>
      </div>

      {/* Tooltip */}
      <div
        className={`absolute bottom-full mb-3 right-0 transition-all duration-200 ${
          showTooltip && !isExpanded
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        <div className="bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg max-w-[240px]">
          <div className="font-semibold text-red-400 mb-1">🆘 Emergency SOS</div>
          <div className="text-gray-300 text-xs space-y-1">
            <div>• Tap: Call Police (110)</div>
            <div>• Menu: Translation, GPS, Embassy</div>
            <div className="pt-1 text-gray-400">Works offline</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SOSButton;
