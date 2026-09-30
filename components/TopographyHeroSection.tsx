"use client";

import React from "react";

export interface TopographyHeroSectionProps {
  className?: string;
  backgroundImage?: string;
  coordinates?: string;
  title?: string;
  subtitle?: string;
  badges?: string[];
}

export const defaultHeroBadges = [
  "1000-Acre Vision",
  "Forest-Valley Terrain",
  "900 Planned 1-Acre Estates",
  "South Goa Nature Belt",
  "Waterfall Region",
];

export const TopographyHeroSection: React.FC<TopographyHeroSectionProps> = ({
  className = "",
  backgroundImage = "/images/location/google-earth-satellite.png",
  coordinates = "15°04'52.3\"N 74°14'16.1\"E",
  title = "A 1000-Acre Forest-Valley Estate Vision",
  subtitle = "Reserve Varde is positioned around a rare South Goa forest-valley landscape, where hills, natural water systems, plantation zones, and eco-tourism surroundings create the foundation for a low-density private jungle estate destination. Preliminary map reference only. Final verification required.",
  badges = defaultHeroBadges,
}) => {
  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-amber-500/25 shadow-2xl aspect-[21/9] min-h-[380px] flex items-center p-8 md:p-16 ${className}`}
      style={{
        backgroundImage: `url('${backgroundImage}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark Luxury Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-emerald-950/70 to-stone-950/90 z-0"></div>

      <div className="relative z-10 max-w-2xl text-left">
        <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/70 text-amber-300 text-[10px] font-semibold tracking-widest px-4 py-2 rounded-md uppercase font-sans mb-6">
          {coordinates}
        </div>
        <h3 className="font-serif text-3xl md:text-5xl font-light text-stone-100 leading-tight mb-4">
          {title}
        </h3>
        <p className="text-stone-300/80 text-sm md:text-base font-light leading-relaxed mb-8">
          {subtitle}
        </p>
        <div className="flex flex-wrap gap-2.5">
          {badges.map((badge, idx) => (
            <span
              key={idx}
              className="bg-stone-950/40 hover:bg-stone-950/60 border border-stone-800/80 text-stone-300 text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-full font-light transition-all duration-300 cursor-default"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopographyHeroSection;
