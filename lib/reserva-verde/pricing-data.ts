export interface VillaModel {
  id: string;
  name: string;
  builtUpArea: number; // in sq.ft
  startingPrice: number; // in Cr
  bestSuitedFor: string;
  recommendedCategory: string;
  description: string;
  highlights: string[];
}

export interface ExperienceCategory {
  id: string;
  name: string;
  subtitle: string;
  positioning: string;
  keyFeatures: string[];
  bestBuyerType: string;
  designFeel: string;
}

export interface PricingMatrixEntry {
  modelId: string;
  experienceId: string;
  price: number; // in Cr
  isHero?: boolean;
  isPremiumCap?: boolean;
  isStarting?: boolean;
}

export interface CostingAssumption {
  id: string;
  name: string;
  constructionRate: number; // per sq.ft
  landAllocation: number; // in Lakhs
  commonInfraAllocation: number; // in Lakhs
  externalWorks: number; // in Lakhs
  softCostPct: number; // e.g. 12 for 12%
}

export interface InstallmentStage {
  stageNumber: number;
  name: string;
  percentage: number;
}

export interface OptionalUpgrade {
  id: string;
  name: string;
  minPrice: number; // in Lakhs
  maxPrice: number; // in Lakhs
  description: string;
}

export const VILLA_MODELS: VillaModel[] = [
  {
    id: "2bhk",
    name: "2BHK Forest Villa",
    builtUpArea: 2500,
    startingPrice: 1.95,
    bestSuitedFor: "Couples, small families, and second-home investors",
    recommendedCategory: "Forest Cottage Villa",
    description: "An intimate, single-level eco-luxury sanctuary engineered to integrate perfectly with the dense forest canopy.",
    highlights: ["Helical screw-pile foundation", "Integrated biophilic courtyard", "Pre-engineered timber cladding"]
  },
  {
    id: "3bhk",
    name: "3BHK Premium Agro Estate",
    builtUpArea: 3500,
    startingPrice: 2.35,
    bestSuitedFor: "HNI families, NRI buyers, and lifestyle seekers",
    recommendedCategory: "Jungle Valley Villa",
    description: "An expansive L-shaped modular forest estate offering stunning valley views and dual-canopy ventilation.",
    highlights: ["Spacious wrap-around verandah", "Teak-wood pool deck ready", "Work-from-estate master study"]
  },
  {
    id: "4bhk",
    name: "4BHK Signature Retreat",
    builtUpArea: 4500,
    startingPrice: 2.65,
    bestSuitedFor: "Multi-generational families and high-end wellness buyers",
    recommendedCategory: "Premium Wellness Villa",
    description: "Our flagship grand-scale ground-level pavilion estate designed for absolute seclusion and panoramic ridge alignments.",
    highlights: ["Three connected container wings", "Dedicated wellness room structure", "Double-glazed custom glass breezeways"]
  },
  {
    id: "custom",
    name: "Customizable Villa Model",
    builtUpArea: 3500, // default working assumption
    startingPrice: 2.50,
    bestSuitedFor: "Bespoke HNIs and custom architectural requests",
    recommendedCategory: "Jungle Valley Villa",
    description: "A highly flexible ground-level footprint that allows custom container configurations up to the base price cap of ₹2.99 Cr.",
    highlights: ["Bespoke internal partition plan", "Customizable deck layouts", "Personalized landscaping plans"]
  }
];

export const EXPERIENCE_CATEGORIES: ExperienceCategory[] = [
  {
    id: "cottage",
    name: "Forest Cottage Villa",
    subtitle: "Intimate · Canopy View",
    positioning: "Premium eco-cottage, forest-facing, warm, intimate, nature-first. Ideal for direct connection to forest flora.",
    keyFeatures: ["Floor-to-ceiling glass corridors", "Bamboo-batten rainscreen cladding", "Low-impact steel pile foundation"],
    bestBuyerType: "Nature purists, creative HNIs, wellness practitioners",
    designFeel: "Earthy tones, exposed natural timber, soft ambient interior lighting"
  },
  {
    id: "valley",
    name: "Jungle Valley Villa",
    subtitle: "Expansive · Ridge Alignment",
    positioning: "Larger premium villa, ridge-top alignment, panoramic views. Strong rental and lifestyle appeal.",
    keyFeatures: ["Cantilevered valley observation deck", "Shou Sugi Ban charred timber features", "Evaporative cooling central water channel"],
    bestBuyerType: "Premium second-home owners, family-focused investors, NRI HNIs",
    designFeel: "Luxurious charcoal and gold finishes, grand timber pergolas, open-plan living"
  },
  {
    id: "wellness",
    name: "Premium Wellness Villa",
    subtitle: "Sanctuary · Integrated Spa",
    positioning: "Wellness-focused sanctuary, spa-ready layouts, integrated therapy decks. Ultra-premium luxury forest retreat.",
    keyFeatures: ["Integrated private yoga and meditation pavilion", "Dedicated home spa treatment structure", "Advanced HEPA biophilic fresh air circulation"],
    bestBuyerType: "Health-focused HNIs, NRIs, premium resort-style living seekers",
    designFeel: "Ivory plaster panels, high-SRI stone floors, warm beige glassmorphic partitions"
  }
];

export const PRICING_MATRIX: PricingMatrixEntry[] = [
  // 2BHK Matrix
  { modelId: "2bhk", experienceId: "cottage", price: 1.95, isStarting: true },
  { modelId: "2bhk", experienceId: "valley", price: 2.25 },
  { modelId: "2bhk", experienceId: "wellness", price: 2.55 },

  // 3BHK Matrix
  { modelId: "3bhk", experienceId: "cottage", price: 2.35 },
  { modelId: "3bhk", experienceId: "valley", price: 2.65, isHero: true }, // Recommended Hero
  { modelId: "3bhk", experienceId: "wellness", price: 2.90 },

  // 4BHK Matrix
  { modelId: "4bhk", experienceId: "cottage", price: 2.65 },
  { modelId: "4bhk", experienceId: "valley", price: 2.90 },
  { modelId: "4bhk", experienceId: "wellness", price: 2.99, isPremiumCap: true }, // Premium Cap

  // Customizable Matrix
  { modelId: "custom", experienceId: "cottage", price: 2.50 },
  { modelId: "custom", experienceId: "valley", price: 2.75 },
  { modelId: "custom", experienceId: "wellness", price: 2.99 } // Cap
];

export const COSTING_ASSUMPTIONS: Record<string, CostingAssumption> = {
  cottage: {
    id: "cottage",
    name: "Forest Cottage Villa",
    constructionRate: 2900,
    landAllocation: 25, // Lakhs
    commonInfraAllocation: 20, // Lakhs
    externalWorks: 22, // Lakhs
    softCostPct: 12 // 12%
  },
  valley: {
    id: "valley",
    name: "Jungle Valley Villa",
    constructionRate: 3250,
    landAllocation: 25,
    commonInfraAllocation: 20,
    externalWorks: 32,
    softCostPct: 12
  },
  wellness: {
    id: "wellness",
    name: "Premium Wellness Villa",
    constructionRate: 3650,
    landAllocation: 25,
    commonInfraAllocation: 20,
    externalWorks: 42,
    softCostPct: 12
  }
};

export const INSTALLMENT_PLAN: InstallmentStage[] = [
  { stageNumber: 1, name: "Booking Amount", percentage: 5 },
  { stageNumber: 2, name: "Agreement Signing", percentage: 15 },
  { stageNumber: 3, name: "Land / Estate Allocation", percentage: 20 },
  { stageNumber: 4, name: "Infrastructure Start", percentage: 15 },
  { stageNumber: 5, name: "Foundation / Plinth", percentage: 15 },
  { stageNumber: 6, name: "Structure Completion", percentage: 10 },
  { stageNumber: 7, name: "Interior / Finishing Stage", percentage: 15 },
  { stageNumber: 8, name: "Handover", percentage: 5 }
];

export const OPTIONAL_UPGRADES: OptionalUpgrade[] = [
  { id: "plunge_pool", name: "Private Plunge Pool", minPrice: 18, maxPrice: 30, description: "Compact skimmer pool built directly into the timber verandah." },
  { id: "full_pool", name: "Full Private Pool", minPrice: 35, maxPrice: 55, description: "Grand infinity edge pool integrated with the estate topography." },
  { id: "jacuzzi", name: "Outdoor Jacuzzi", minPrice: 8, maxPrice: 18, description: "Heated multi-jet hot tub placed on the forest canopy observation deck." },
  { id: "spa_room", name: "Full Spa Room Upgrade", minPrice: 15, maxPrice: 35, description: "A detached container room customized for steam, massage, and cold plunge." },
  { id: "yoga_deck", name: "Yoga / Meditation Deck", minPrice: 8, maxPrice: 20, description: "Elevated, tranquil timber deck positioned in the estate plantation zone." },
  { id: "furniture", name: "Premium Imported Furniture", minPrice: 15, maxPrice: 50, description: "Curated tropical minimalist interior pack with sustainable teak furniture." },
  { id: "smart_home", name: "Smart Home Automation", minPrice: 7, maxPrice: 25, description: "Control climate, solar inventory, greywater pumps, and surveillance from your phone." },
  { id: "solar", name: "Solar Independence Package", minPrice: 8, maxPrice: 18, description: "Upgraded off-grid battery bank (10kWp PV array + storage) for full autonomy." },
  { id: "staff", name: "Staff Room Module", minPrice: 12, maxPrice: 25, description: "Detached ground-level utility capsule with basic bathroom." },
  { id: "extra_area", name: "Extra Built-Up Area", minPrice: 5.5, maxPrice: 7.5, description: "Add modular sections (per 100 sq.ft) at ₹5,500 to ₹7,500/sq.ft rate." }
];
