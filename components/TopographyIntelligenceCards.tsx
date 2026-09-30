"use client";

import React from "react";

export interface BenefitCard {
  num: string;
  title: string;
  description: string;
  tagline: string;
}

export interface TopographyIntelligenceCardsProps {
  className?: string;
  cards?: BenefitCard[];
}

export const defaultBenefitCards: BenefitCard[] = [
  {
    num: "01",
    title: "Forest-Valley Setting",
    description: "The land is visually positioned within a green hill and valley landscape, supporting a premium jungle estate identity. Preliminary map reference only. Final verification required.",
    tagline: "Contour Anchored",
  },
  {
    num: "02",
    title: "Ridge & View Potential",
    description: "The surrounding terrain creates potential for scenic view corridors, elevated estate positioning, and forest-facing layouts, subject to final site survey. Preliminary map reference only. Final verification required.",
    tagline: "Visual Corridors",
  },
  {
    num: "03",
    title: "Natural Water Systems",
    description: "The map presentation highlights nearby waterfall belts and water-sensitive planning, while clearly stating that final hydrology must be verified. Preliminary map reference only. Final verification required.",
    tagline: "Hydrology Protection",
  },
  {
    num: "04",
    title: "Low-Density Suitability",
    description: "The 1-acre-per-estate model supports maximum privacy, substantial green buffers, and lower built-up intensity across the topography.",
    tagline: "Low-Impact Zoning",
  },
  {
    num: "05",
    title: "Plantation-Led Land Use",
    description: "The terrain and estate model support plantation planning such as cashew, coconut, mango, teak, pepper, spices, herbal gardens, and food forest concepts.",
    tagline: "Agro-Forestry Layer",
  },
  {
    num: "06",
    title: "Eco-Retreat Positioning",
    description: "The forest-valley setting supports wellness retreats, nature stays, farm-stays, and slow-living experiences, subject to permissions.",
    tagline: "Eco-Tourism Fit",
  },
  {
    num: "07",
    title: "Regional Nature Identity",
    description: "Nearby references such as Neturlim, Netravali, waterfalls, bubbling lake, and South Goa’s inland belt strengthen the destination character. Preliminary map reference only. Final verification required.",
    tagline: "Nature Sanctuary Belt",
  },
  {
    num: "08",
    title: "Masterplan Storytelling",
    description: "3D terrain helps buyers understand the emotional value of the land: privacy, nature, elevation, views, water, forest, and long-term placemaking. Preliminary map reference only. Final verification required.",
    tagline: "Strategic Placemaking",
  },
];

export const TopographyIntelligenceCards: React.FC<TopographyIntelligenceCardsProps> = ({
  className = "",
  cards = defaultBenefitCards,
}) => {
  return (
    <section className={`py-16 text-stone-100 ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-12">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-500 mb-4">
            <span className="w-8 h-px bg-amber-500"></span>
            Landscape Valuation
          </span>
          <h3 className="font-serif text-3xl md:text-4xl font-normal leading-tight">
            Topography Intelligence
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="group relative bg-emerald-950/10 hover:bg-emerald-950/20 border border-amber-500/15 hover:border-amber-500/40 rounded-xl p-8 flex flex-col justify-between min-h-[300px] shadow-lg transition-all duration-500 hover:-translate-y-1.5"
            >
              {/* Gold Top line highlight */}
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-amber-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

              <div>
                <div className="font-serif text-amber-500 text-lg italic mb-6">
                  {card.num}
                </div>
                <h4 className="font-serif text-xl font-medium mb-3 text-stone-100 group-hover:text-amber-200 transition-colors duration-300">
                  {card.title}
                </h4>
                <p className="text-stone-300/70 text-xs leading-relaxed font-light">
                  {card.description}
                </p>
              </div>

              <span className="text-[10px] uppercase tracking-wider text-amber-500/80 font-medium mt-6">
                {card.tagline}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopographyIntelligenceCards;
