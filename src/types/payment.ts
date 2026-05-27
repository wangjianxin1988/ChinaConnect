// Payment and Business Guide Types for ChinaConnect

// Payment Method Types
export interface PaymentStep {
  step: number;
  title: string;
  titleCn: string;
  description: string;
  descriptionCn: string;
}

export interface PaymentMethod {
  id: string;
  method: string;
  icon: string;
  colorClass: string;
  description: string;
  descriptionCn: string;
  howToSetup: string[];
  howToSetupCn: string[];
  usage: string[];
  usageCn: string[];
  tips: string[];
  tipsCn: string[];
  pros: string[];
  cons: string[];
  limits?: {
    daily?: string;
    perTransaction?: string;
    notes?: string;
  };
}

export interface ATMInfo {
  bank: string;
  icon: string;
  notes: string;
  notesCn: string;
}

// City Payment Coverage Types
export interface CityPaymentCoverage {
  citySlug: string;
  cityName: string;
  cityNameCn: string;
  coverage: {
    method: string;
    acceptance: number; // percentage 0-100
    reliability: "high" | "medium" | "low";
    notes: string;
    notesCn: string;
  }[];
  specialFeatures?: string[];
  specialFeaturesCn?: string[];
}

// Visa Types
export interface VisaType {
  id: string;
  name: string;
  nameCn: string;
  code: string;
  duration: string;
  entries: "single" | "double" | "multiple";
  eligibleCountries?: string[];
  processingTime: string;
  fee: string;
  feeCurrency: string;
  description: string;
  descriptionCn: string;
  requirements: string[];
  requirementsCn: string[];
  documents: string[];
  documentsCn: string[];
}

export interface VisaStep {
  step: number;
  title: string;
  titleCn: string;
  description: string;
  descriptionCn: string;
  icon: string;
  tips: string[];
  tipsCn: string[];
}

export interface VisaFaq {
  question: string;
  questionCn: string;
  answer: string;
  answerCn: string;
}

// Tax Guide Types
export interface TaxGuide {
  category: "individual" | "business";
  title: string;
  titleCn: string;
  icon: string;
  sections: TaxSection[];
}

export interface TaxSection {
  title: string;
  titleCn: string;
  content: string;
  contentCn: string;
  items?: {
    label: string;
    labelCn: string;
    value: string;
    valueCn: string;
  }[];
}

export interface TaxRate {
  bracket: string;
  bracketCn: string;
  rate: string;
  quickDeduction: string;
  quickDeductionCn: string;
}

// SIM Card Guide Types
export interface SIMCardProvider {
  name: string;
  nameCn: string;
  icon: string;
  coverage: "nationwide" | "major-cities" | "limited";
  coverageText: string;
  coverageTextCn: string;
  dataPackages: SIMDataPackage[];
  requirements: string[];
  requirementsCn: string[];
  tips: string[];
  tipsCn: string[];
  pros: string[];
  cons: string[];
}

export interface SIMDataPackage {
  duration: string;
  durationCn: string;
  data: string;
  price: string;
  priceCurrency: string;
  features: string[];
  featuresCn: string[];
}

export interface SIMFaq {
  question: string;
  questionCn: string;
  answer: string;
  answerCn: string;
}

// Business Visa Types
export interface BusinessVisaType {
  id: string;
  name: string;
  nameCn: string;
  code: string;
  duration: string;
  entries: "single" | "double" | "multiple";
  processingTime: string;
  fee: string;
  description: string;
  descriptionCn: string;
  requirements: string[];
  requirementsCn: string[];
  invitationLetter?: {
    required: boolean;
    template?: string;
    issuer?: string;
  };
}

export interface WorkVisaZ {
  id: string;
  name: string;
  nameCn: string;
  code: string;
  duration: string;
  entries: "single" | "multiple";
  processingTime: string;
  fee: string;
  description: string;
  descriptionCn: string;
  requirements: string[];
  requirementsCn: string[];
  steps: {
    step: number;
    title: string;
    titleCn: string;
    description: string;
    descriptionCn: string;
  }[];
  tips: string[];
  tipsCn: string[];
}

export interface StudentVisaX {
  id: string;
  name: string;
  nameCn: string;
  code: string;
  duration: string;
  entries: "single" | "multiple";
  processingTime: string;
  fee: string;
  description: string;
  descriptionCn: string;
  requirements: string[];
  requirementsCn: string[];
  steps: {
    step: number;
    title: string;
    titleCn: string;
    description: string;
    descriptionCn: string;
  }[];
  tips: string[];
  tipsCn: string[];
}
