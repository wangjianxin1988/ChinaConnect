import {
  type EmergencyNumber,
  getNationalEmergencyNumbers,
} from "@/data/emergency/global-contacts";
import React from "react";
import { CityMap } from "./CityMap";
import { EmergencyCard, type EmergencyContact } from "./EmergencyCard";
import { QuickDialGrid } from "./EmergencyCard";

interface EmergencySectionProps {
  contacts: EmergencyContact[];
  city?: any;
}

/**
 * Render a single national-level emergency number as a card.
 * Uses tel: scheme (already sanitized in EmergencyCard.getPhoneHref).
 */
function NationalEmergencyCard({ item }: { item: EmergencyNumber }) {
  const telHref = `tel:${item.phone.replace(/[^\d+]/g, "")}`;
  return (
    <a
      href={telHref}
      className="flex items-start gap-3 p-4 bg-white border border-blue-100 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all"
      aria-label={`Call ${item.name} at ${item.phone}`}
    >
      <span className="text-2xl shrink-0" aria-hidden>
        {item.icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-semibold text-gray-900">{item.name}</h4>
          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
            International
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-0.5">{item.description}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg font-bold text-blue-700">{item.phone}</span>
          {item.shortCode && (
            <span className="text-xs text-gray-500">({item.shortCode} in CN)</span>
          )}
        </div>
      </div>
      <span className="shrink-0 inline-flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
        <span>📞</span>
        <span>Call</span>
      </span>
    </a>
  );
}

export function EmergencySection({ contacts, city }: EmergencySectionProps) {
  const nationalNumbers = getNationalEmergencyNumbers();

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
          ⚠️ In case of emergency, call the appropriate number immediately. English operators may be
          available.
        </p>
        <p className="text-red-700 text-sm mt-2">
          💡 Foreign visitors in China should also save{" "}
          <a href="tel:+861012308" className="font-bold underline">
            +86-10-12308
          </a>{" "}
          (Consular Protection Hotline) — the 24/7 English-speaking line of the Chinese Ministry of
          Foreign Affairs.
        </p>
      </div>

      {/* Quick Dial Grid — domestic 110/120/119 */}
      <div className="mb-8">
        <h3 className="text-base font-bold text-gray-800 mb-4">Quick Dial (Inside China)</h3>
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border border-red-100 mb-4">
          <p className="text-sm text-red-800">
            <span className="font-bold">Note:</span> The{" "}
            <span className="font-semibold text-red-600">SOS button</span> in the bottom-right
            corner of any page provides instant access to emergency services with translation and
            GPS location sharing.
          </p>
        </div>
        <QuickDialGrid showAmbulance={true} showPolice={true} showFire={true} showTraffic={false} />
      </div>

      {/* National numbers for foreigners — 12308, 12301, 12345 etc. */}
      <div className="mb-8">
        <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>🌐</span> For Foreign Visitors (Reachable Internationally)
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          These numbers work from outside mainland China. They are the right first-call for tourists
          who lose their passport, are arrested, need medical help with a foreign card, or face any
          other emergency.
        </p>
        <div className="space-y-3">
          {nationalNumbers.map((item) => (
            <NationalEmergencyCard key={item.phone} item={item} />
          ))}
        </div>
      </div>

      {/* Per-city contacts grouped by type */}
      <div className="space-y-6">
        {(() => {
          const hospitals = contacts.filter((c) => c.type === "hospital");
          const embassies = contacts.filter((c) => c.type === "embassy");
          const others = contacts.filter((c) => c.type !== "hospital" && c.type !== "embassy");

          return (
            <>
              {hospitals.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span>🏥</span> Hospitals
                  </h3>
                  <div className="space-y-3">
                    {hospitals.map((h) => (
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
                    {embassies.map((e) => (
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
                    {others.map((o) => (
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
