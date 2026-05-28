import { useCallback, useEffect, useState } from "react";

export type EmergencyType = "police" | "ambulance" | "fire" | "traffic";

interface EmergencyContact {
  id: EmergencyType;
  name: string;
  nameCn: string;
  number: string;
  icon: string;
  color: string;
  description: string;
}

interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
}

interface UseEmergencyReturn {
  // SOS State
  isExpanded: boolean;
  showCard: boolean;
  showLocation: boolean;
  toggleExpanded: () => void;
  toggleCard: () => void;
  toggleLocation: () => void;
  triggerSOS: (type?: EmergencyType) => void;

  // Phone calls
  callEmergency: (number: string) => void;
  emergencyContacts: EmergencyContact[];

  // Location
  userLocation: UserLocation | null;
  locationError: string | null;
  isLoadingLocation: boolean;
  getCurrentLocation: () => Promise<UserLocation | null>;

  // Nearby services
  nearbyServices: NearbyService[];
  isSearchingServices: boolean;
  searchNearbyServices: () => Promise<void>;

  // Emergency contact preset
  emergencyContacts_preset: PresetContact[];
  addPresetContact: (contact: PresetContact) => void;
  removePresetContact: (id: string) => void;
  loadPresetContacts: () => void;
  savePresetContacts: () => void;
}

interface NearbyService {
  name: string;
  nameCn?: string;
  type: "hospital" | "pharmacy" | "police" | "embassy";
  distance?: number;
  address?: string;
  phone?: string;
  lat?: number;
  lng?: number;
}

interface PresetContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: "police",
    name: "Police",
    nameCn: "警察",
    number: "110",
    icon: "🚔",
    color: "bg-blue-600",
    description: "Police emergency",
  },
  {
    id: "ambulance",
    name: "Ambulance",
    nameCn: "救护车",
    number: "120",
    icon: "🚑",
    color: "bg-red-600",
    description: "Medical emergency",
  },
  {
    id: "fire",
    name: "Fire",
    nameCn: "消防",
    number: "119",
    icon: "🚒",
    color: "bg-orange-500",
    description: "Fire emergency",
  },
  {
    id: "traffic",
    name: "Traffic",
    nameCn: "交通事故",
    number: "122",
    icon: "🚗",
    color: "bg-green-600",
    description: "Traffic accident",
  },
];

const PRESET_STORAGE_KEY = "chinaconnect-emergency-contacts";
const LOCATION_TIMEOUT = 10000;

export function useEmergency(): UseEmergencyReturn {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [nearbyServices, setNearbyServices] = useState<NearbyService[]>([]);
  const [isSearchingServices, setIsSearchingServices] = useState(false);
  const [presetContacts, setPresetContacts] = useState<PresetContact[]>([]);

  // Toggle functions
  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
    if (showCard) setShowCard(false);
  }, [showCard]);

  const toggleCard = useCallback(() => {
    setShowCard((prev) => !prev);
    if (isExpanded) setIsExpanded(false);
  }, [isExpanded]);

  const toggleLocation = useCallback(() => {
    setShowLocation((prev) => !prev);
    if (!showLocation && !userLocation) {
      getCurrentLocation();
    }
  }, [showLocation, userLocation]);

  // Call emergency number
  const callEmergency = useCallback((number: string) => {
    window.location.href = `tel:${number}`;
  }, []);

  // Trigger SOS - defaults to police
  const triggerSOS = useCallback(
    (type: EmergencyType = "police") => {
      const contact = EMERGENCY_CONTACTS.find((c) => c.id === type);
      if (contact) {
        callEmergency(contact.number);
      }
    },
    [callEmergency],
  );

  // Get current location
  const getCurrentLocation = useCallback(async (): Promise<UserLocation | null> => {
    if (!("geolocation" in navigator)) {
      setLocationError("Geolocation is not supported by your browser");
      return null;
    }

    setIsLoadingLocation(true);
    setLocationError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: UserLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          setUserLocation(location);
          setIsLoadingLocation(false);
          resolve(location);
        },
        (error) => {
          let errorMessage: string;
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied. Please enable location access.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
            default:
              errorMessage = "An unknown error occurred.";
          }
          setLocationError(errorMessage);
          setIsLoadingLocation(false);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: LOCATION_TIMEOUT,
          maximumAge: 60000,
        },
      );
    });
  }, []);

  // Search nearby services using OpenStreetMap Nominatim
  const searchNearbyServices = useCallback(async () => {
    if (!userLocation) {
      await getCurrentLocation();
    }
    if (!userLocation) return;

    setIsSearchingServices(true);
    setNearbyServices([]);

    try {
      const services: NearbyService[] = [];
      const queries = [
        { type: "hospital" as const, query: "hospital" },
        { type: "pharmacy" as const, query: "pharmacy" },
        { type: "police" as const, query: "police" },
      ];

      for (const { type, query } of queries) {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&lat=${userLocation.lat}&lon=${userLocation.lng}&radius=5000&format=json&limit=5`,
          {
            headers: {
              "Accept-Language": "en,zh",
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          for (const item of data.slice(0, 3)) {
            const distance = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              Number.parseFloat(item.lat),
              Number.parseFloat(item.lon),
            );
            services.push({
              name: item.display_name.split(",")[0],
              type,
              distance,
              address: item.display_name,
              lat: Number.parseFloat(item.lat),
              lng: Number.parseFloat(item.lon),
            });
          }
        }
      }

      // Sort by distance
      services.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      setNearbyServices(services.slice(0, 10));
    } catch (error) {
      console.error("Failed to search nearby services:", error);
    } finally {
      setIsSearchingServices(false);
    }
  }, [userLocation, getCurrentLocation]);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
  };

  const toRad = (deg: number): number => (deg * Math.PI) / 180;

  // Load preset contacts from localStorage
  const loadPresetContacts = useCallback(() => {
    try {
      const saved = localStorage.getItem(PRESET_STORAGE_KEY);
      if (saved) {
        setPresetContacts(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to load preset contacts:", error);
    }
  }, []);

  // Save preset contacts to localStorage
  const savePresetContacts = useCallback(() => {
    try {
      localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presetContacts));
    } catch (error) {
      console.error("Failed to save preset contacts:", error);
    }
  }, [presetContacts]);

  // Add preset contact
  const addPresetContact = useCallback((contact: PresetContact) => {
    setPresetContacts((prev) => {
      const updated = [...prev, contact];
      localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Remove preset contact
  const removePresetContact = useCallback((id: string) => {
    setPresetContacts((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Load preset contacts on mount
  useEffect(() => {
    loadPresetContacts();
  }, [loadPresetContacts]);

  return {
    isExpanded,
    showCard,
    showLocation,
    toggleExpanded,
    toggleCard,
    toggleLocation,
    triggerSOS,
    callEmergency,
    emergencyContacts: EMERGENCY_CONTACTS,
    userLocation,
    locationError,
    isLoadingLocation,
    getCurrentLocation,
    nearbyServices,
    isSearchingServices,
    searchNearbyServices,
    emergencyContacts_preset: presetContacts,
    addPresetContact,
    removePresetContact,
    loadPresetContacts,
    savePresetContacts,
  };
}

export type { NearbyService, PresetContact, EmergencyContact, UserLocation };
