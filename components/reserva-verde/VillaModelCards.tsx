import React from "react";
import { VILLA_MODELS, VillaModel } from "../../lib/reserva-verde/pricing-data";
import { formatINR } from "../../lib/reserva-verde/pricing-utils";

interface VillaModelCardsProps {
  onSelectModel: (modelId: string) => void;
}

export const VillaModelCards: React.FC<VillaModelCardsProps> = ({ onSelectModel }) => {
  return (
    <section className="py-16 bg-stone-950 text-stone-100 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[10px] uppercase tracking-widest text-amber-500 font-semibold mb-3 block">
            [ Premium Footprints ]
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-light text-stone-100 mb-6">
            Villa Size Models
          </h2>
          <p className="text-stone-400 text-sm md:text-base font-light">
            Each size model is architecturally designed as a ground-level eco-pavilion, maintaining strict single-storey integration with the natural contours of your private 1-acre plantation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {VILLA_MODELS.map((model: VillaModel) => {
            const isCustom = model.id === "custom";
            return (
              <div
                key={model.id}
                className="group relative flex flex-col justify-between bg-gradient-to-b from-[#16291f]/40 to-[#10291f]/10 border border-stone-850 hover:border-amber-500/40 p-8 rounded-md transition-all duration-300 shadow-xl hover:shadow-2xl"
              >
                {/* Visual Top Highlight Line */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

                <div>
                  {/* Model Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-serif text-2xl font-light text-stone-100 group-hover:text-amber-200 transition-colors duration-300">
                        {model.name}
                      </h3>
                      <p className="text-amber-500 text-xs font-mono mt-1 font-light tracking-wide">
                        {isCustom ? "Flexible Area" : `${model.builtUpArea.toLocaleString()} sq.ft`}
                      </p>
                    </div>
                  </div>

                  {/* Starting Price Tag */}
                  <div className="bg-stone-900/80 border border-stone-800 rounded-sm p-4 mb-6">
                    <span className="text-[10px] text-stone-500 uppercase tracking-widest block mb-1">
                      Starting Package
                    </span>
                    <span className="font-serif text-2xl font-normal text-stone-100">
                      {isCustom ? `${formatINR(model.startingPrice)} onwards` : formatINR(model.startingPrice)}
                    </span>
                    <span className="text-stone-500 text-[10px] block mt-1">
                      Base package cap: {formatINR(2.99)}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-stone-400 text-xs font-light leading-relaxed mb-6">
                    {model.description}
                  </p>

                  {/* Highlights list */}
                  <div className="mb-8">
                    <div className="text-[10px] text-amber-500/80 uppercase tracking-widest font-semibold mb-3">
                      Design Focus
                    </div>
                    <ul className="space-y-2 text-stone-300 text-xs font-light">
                      {model.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-500 font-serif text-[10px]">✦</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-auto">
                  <div className="text-[10px] text-stone-500 uppercase tracking-widest mb-4">
                    Best for: <span className="text-stone-300 block font-sans lowercase mt-0.5">{model.bestSuitedFor}</span>
                  </div>

                  <button
                    onClick={() => onSelectModel(model.id)}
                    className="w-full py-2.5 bg-stone-900 hover:bg-[#1f3a2e] border border-stone-800 hover:border-amber-500/30 text-stone-300 hover:text-stone-100 text-[10px] uppercase tracking-wider rounded-sm transition-all duration-300"
                  >
                    Select Model
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default VillaModelCards;
