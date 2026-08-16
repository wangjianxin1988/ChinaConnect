import React from "react";
import { SOSButton } from "./SOSButton";

interface EmergencyWrapperProps {
  className?: string;
  lang?: string;
}

/**
 * EmergencyWrapper - Main container for all emergency features
 * This component includes the SOS floating button that is fixed on every page
 */
export function EmergencyWrapper({ className = "", lang = "en" }: EmergencyWrapperProps) {
  return (
    <div className={className}>
      {/* Main SOS Button with all emergency features */}
      <SOSButton lang={lang} />

      {/* Note: The SOSButton includes:
       * - SOS Emergency Call (110 Police)
       * - Quick Dial Menu (110, 120, 119, 122)
       * - Translation Card (20+ emergency phrases)
       * - GPS Location sharing
       * - Embassy locator
       * - Preset emergency contacts
       */}
    </div>
  );
}

export default EmergencyWrapper;
