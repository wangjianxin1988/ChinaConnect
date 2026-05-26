// SEO and GEO types for ChinaConnect

export interface SEOPageMeta {
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  keywords?: string[];
  canonicalUrl?: string;
  alternateUrls?: HreflangUrl[];
  ogImage?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}

export interface HreflangUrl {
  hreflang: string;
  href: string;
}

export interface CityInfo {
  slug: string;
  name: string;
  nameEn: string;
  lat: number;
  lng: number;
  country: string;
  countryCode: string;
}

export interface RestaurantSEOData {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
  cuisine: string;
  city: string;
  district?: string;
  address: string;
  addressEn?: string;
  lat: number;
  lng: number;
  avgPrice: number;
  rating?: number;
  phone?: string;
  website?: string;
  imageUrl?: string;
  openingHours?: string[];
  type: "michelin" | "blackpearl" | "local";
  star?: 1 | 2 | 3;
  diamond?: 1 | 2 | 3;
  bloggerName?: string;
  bloggerPlatform?: string;
}

export interface FAQItem {
  question: string;
  questionEn?: string;
  answer: string;
  answerEn?: string;
}

export interface EventSEOData {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
  location: string;
  lat: number;
  lng: number;
  startDate: string;
  endDate: string;
  organizer?: string;
  imageUrl?: string;
}
