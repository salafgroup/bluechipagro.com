import React from "react";
import { EXPERIENCE_CATEGORIES, ExperienceCategory } from "../../lib/reserva-verde/pricing-data";

export const VillaExperienceCards: React.FC = () => {
  return (
    <section className="py-16 bg-stone-900 text-stone-100 px-6 border-y border-stone-850">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[10px] uppercase tracking-widest text-amber-500 font-semibold mb-3 block">
            [ Curated Typologies ]
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-light text-stone-100 mb-6">
            Villa Experience Categories
          </h2>
          <p className="text-stone-400 text-sm md:text-base font-light">
            Every size model can be customized into three distinct biophilic orientations, optimized to harmonize with specific plantation microclimates and typography alignments.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {EXPERIENCE_CATEGORIES.map((cat: ExperienceCategory) => {
            return (
              <div
                key={cat.id}
                className="group relative bg-[#10291f]/20 border border-stone-800 hover:border-amber-500/30 p-8 md:p-10 rounded-md transition-all duration-300 flex flex-col justify-between"
              >
                {/* Visual indicator bar */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

                <div>
                  <div className="mb-6">
                    <span className="text-amber-500 text-[10px] font-mono block tracking-widest uppercase mb-1">
                      {cat.subtitle}
                    </span>
                    <h3 className="font-serif text-2xl font-light text-stone-100 group-hover:text-amber-200 transition-colors duration-300">
                      {cat.name}
                    </h3>
                  </div>

                  <p className="text-stone-300/80 text-xs font-light leading-relaxed mb-6">
                    {cat.positioning}
                  </p>

                  {/* Key Features */}
                  <div className="mb-6">
                    <div className="text-[10px] text-stone-500 uppercase tracking-widest font-semibold mb-3">
                      Architectural Highlights
                    </div>
                    <ul className="space-y-2">
                      {cat.keyFeatures.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs font-light text-stone-400">
                          <span className="text-amber-500/80 text-[8px] mt-1">■</span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-stone-850">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[9px] text-stone-500 uppercase tracking-widest block">
                        Buyer Profile
                      </span>
                      <span className="text-[11px] text-stone-300 font-light block mt-0.5 leading-tight">
                        {cat.bestBuyerType}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-stone-500 uppercase tracking-widest block">
                        Design Character
                      </span>
                      <span className="text-[11px] text-stone-300 font-light block mt-0.5 leading-tight">
                        {cat.designFeel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default VillaExperienceCards;
