import React from "react";
import { InfiniteList } from "@/components/ui/InfiniteList";
import { EmergencyCard, EmergencyContact } from "./EmergencyCard";
import { CityMap } from "./CityMap";
import { QuickDialGrid } from "./EmergencyCard";

interface EmergencySectionProps {
  contacts: EmergencyContact[];
  city?: any;
}

export function EmergencySection({ contacts, city }: EmergencySectionProps) {
  return (
    <div>
      {/* Emergency Map */}
      {city && (
        <div className="mb-6">
          <CityMap city={city} activeTab="emergency" height="350px" />
        </div>
      )}

      <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
        <p className="text-red-800 font-medium">
          ⚠️ In case of emergency, call the appropriate number immediately. English operators may be available.
        </p>
      </div>

      {/* Quick Dial Grid */}
      <div className="mb-8">
        <h3 className="text-base font-bold text-gray-800 mb-4">Quick Dial</h3>
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border border-red-100 mb-4">
          <p className="text-sm text-red-800">
            <span className="font-bold">Note:</span> The <span className="font-semibold text-red-600">SOS button</span> in the bottom-right corner of any page provides instant access to emergency services with translation and GPS location sharing.
          </p>
        </div>
        <QuickDialGrid
          showAmbulance={true}
          showPolice={true}
          showFire={true}
          showTraffic={false}
        />
      </div>

      {/* Grouped Emergency Contacts */}
      <div className="space-y-6">
        {(() => {
          const hospitals = contacts.filter(c => c.type === "hospital");
          const embassies = contacts.filter(c => c.type === "embassy");
          const others = contacts.filter(c => c.type !== "hospital" && c.type !== "embassy");

          return (
            <>
              {hospitals.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span>🏥</span> Hospitals
                  </h3>
                  <div className="space-y-3">
                    {hospitals.map(h => (
                      <EmergencyCard key={h.phone} contact={h} />
                    ))}
                  </div>
                </div>
              )}
              {embassies.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span>🏛️</span> Embassies &amp; Consulates
                  </h3>
                  <div className="space-y-3">
                    {embassies.map(e => (
                      <EmergencyCard key={e.phone} contact={e} />
                    ))}
                  </div>
                </div>
              )}
              {others.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span>📞</span> Other Emergency Numbers
                  </h3>
                  <div className="space-y-3">
                    {others.map(o => (
                      <EmergencyCard key={o.phone} contact={o} />
                    ))}
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
}

export default EmergencySection;
