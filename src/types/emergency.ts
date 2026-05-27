/**
 * Emergency System Type Definitions
 *
 * Type definitions for the ChinaConnect SOS emergency system including:
 * - City emergency data
 * - Emergency contact types
 * - Service worker types
 */

/**
 * Emergency contact information
 */
export interface EmergencyContact {
  /** Phone number (e.g., "110", "120") */
  number: string;
  /** English name */
  name: string;
  /** Chinese name */
  nameCn: string;
  /** Latitude coordinate (optional) */
  lat?: number;
  /** Longitude coordinate (optional) */
  lng?: number;
}

/**
 * Emergency types available
 */
export type EmergencyType = "police" | "ambulance" | "fire" | "traffic";

/**
 * City emergency data containing all emergency contacts
 */
export interface CityEmergencyData {
  police: EmergencyContact;
  ambulance: EmergencyContact;
  fire: EmergencyContact;
}

/**
 * Complete city information with emergency contacts
 */
export interface EmergencyCity {
  /** Unique city identifier */
  id: string;
  /** English city name */
  name: string;
  /** Chinese city name */
  nameCn: string;
  /** Province name */
  province: string;
  /** City population */
  population: number;
  /** Geographic area */
  area: string;
  /** All emergency contacts for this city */
  emergencies: CityEmergencyData;
  /** Additional emergency services */
  additionalServices?: {
    /** Traffic emergency number */
    traffic?: string;
    /** Information hotline */
    info?: string;
  };
}

/**
 * National emergency numbers (same across all China)
 */
export interface NationalEmergencyNumbers {
  police: string;
  ambulance: string;
  fire: string;
  traffic: string;
  consumerRights: string;
  forestryFire: string;
}

/**
 * Complete city emergency database
 */
export interface CityEmergencyDatabase {
  description: string;
  lastUpdated: string;
  version: string;
  cities: EmergencyCity[];
  national: NationalEmergencyNumbers;
  notes: string[];
}

/**
 * Emergency call request
 */
export interface EmergencyCallRequest {
  type: EmergencyType;
  cityId?: string;
  phoneNumber?: string;
}

/**
 * User location for emergency services
 */
export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
  cityId?: string;
}

/**
 * Nearby service result
 */
export interface NearbyService {
  name: string;
  nameCn?: string;
  type: "hospital" | "pharmacy" | "police" | "embassy";
  distance?: number;
  address?: string;
  phone?: string;
  lat?: number;
  lng?: number;
}

/**
 * Preset emergency contact (user-saved)
 */
export interface PresetContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

/**
 * SOS button state
 */
export interface SOSButtonState {
  isExpanded: boolean;
  activeTab: SOSMenuTab;
  showFlash: boolean;
}

/**
 * SOS menu tabs
 */
export type SOSMenuTab = "main" | "translation" | "location" | "embassy" | "contacts";

/**
 * Service worker message types
 */
export type SWMessageType =
  | "SKIP_WAITING"
  | "CLIENTS_CLAIM"
  | "GET_EMERGENCY_DATA"
  | "EMERGENCY_DATA_RESPONSE"
  | "CACHE_EMERGENCY_DATA";

/**
 * Service worker message
 */
export interface SWMessage {
  type: SWMessageType;
  payload?: unknown;
}

/**
 * Service worker registration result
 */
export interface SWRegistrationResult {
  success: boolean;
  scope?: string;
  error?: string;
}

/**
 * Cached emergency data entry
 */
export interface CachedEmergencyEntry {
  cityId: string;
  data: EmergencyCity;
  cachedAt: number;
}
