import React from "react";

export interface EmergencyContact {
  type: "ambulance" | "police" | "fire" | "hospital" | "embassy";
  name: string;
  nameEn: string;
  phone: string;
  address?: string;
  coordinates?: { lat: number; lng: number };
  notes?: string;
}

interface EmergencyCardProps {
  contact: EmergencyContact;
  compact?: boolean;
}

function getTypeIcon(type: EmergencyContact["type"]) {
  switch (type) {
    case "ambulance":
      return "🚑";
    case "police":
      return "👮";
    case "fire":
      return "🔥";
    case "hospital":
      return "🏥";
    case "embassy":
      return "🏛️";
  }
}

function getTypeBg(type: EmergencyContact["type"]) {
  switch (type) {
    case "ambulance":
      return "bg-red-100 text-red-600";
    case "police":
      return "bg-blue-100 text-blue-600";
    case "fire":
      return "bg-orange-100 text-orange-600";
    case "hospital":
      return "bg-red-100 text-red-600";
    case "embassy":
      return "bg-purple-100 text-purple-600";
  }
}

function getPhoneHref(phone: string) {
  // strip spaces and non-digit characters except + for tel link
  const digits = phone.replace(/[^\d+]/g, "");
  return `tel:${digits}`;
}

export function EmergencyCard({ contact, compact = false }: EmergencyCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 mt-0.5 ${getTypeBg(contact.type)}`}
          >
            {getTypeIcon(contact.type)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">{contact.nameEn}</h3>
            <p className="text-gray-500 text-xs">{contact.name}</p>
            {contact.address && !compact && (
              <p className="text-gray-500 text-xs mt-1 leading-relaxed">{contact.address}</p>
            )}
            {contact.notes && !compact && (
              <p className="text-gray-400 text-xs mt-1">{contact.notes}</p>
            )}
          </div>
        </div>

        <a
          href={getPhoneHref(contact.phone)}
          className="shrink-0 flex flex-col items-center gap-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-sm group"
          aria-label={`Call ${contact.nameEn} at ${contact.phone}`}
        >
          <span className="text-base group-hover:scale-110 transition-transform">📞</span>
          <span className="text-sm leading-tight text-center">{contact.phone}</span>
        </a>
      </div>
    </div>
  );
}

interface QuickDialProps {
  showAmbulance?: boolean;
  showPolice?: boolean;
  showFire?: boolean;
  showTraffic?: boolean;
}

export function QuickDialGrid({
  showAmbulance = true,
  showPolice = true,
  showFire = true,
  showTraffic = false,
}: QuickDialProps) {
  const items = [
    ...(showAmbulance
      ? [{ phone: "120", label: "Ambulance", icon: "🚑", bg: "bg-red-600 hover:bg-red-700" }]
      : []),
    ...(showPolice
      ? [{ phone: "110", label: "Police", icon: "👮", bg: "bg-blue-600 hover:bg-blue-700" }]
      : []),
    ...(showFire
      ? [{ phone: "119", label: "Fire", icon: "🔥", bg: "bg-orange-600 hover:bg-orange-700" }]
      : []),
    ...(showTraffic
      ? [{ phone: "122", label: "Traffic", icon: "🚗", bg: "bg-green-600 hover:bg-green-700" }]
      : []),
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((item) => (
        <a
          key={item.phone}
          href={`tel:${item.phone}`}
          className={`${item.bg} text-white p-4 rounded-xl text-center transition-colors flex flex-col items-center gap-1.5`}
        >
          <span className="text-2xl">{item.icon}</span>
          <div className="font-semibold text-sm">{item.label}</div>
          <div className="text-sm opacity-80 font-bold">{item.phone}</div>
        </a>
      ))}
    </div>
  );
}

export default EmergencyCard;
