import React from "react";
import { VILLA_MODELS, EXPERIENCE_CATEGORIES, PRICING_MATRIX } from "../../lib/reserva-verde/pricing-data";
import { formatINR } from "../../lib/reserva-verde/pricing-utils";

interface PublicPricingTableProps {
  onSelectProduct: (modelId: string, price: number) => void;
}

export const PublicPricingTable: React.FC<PublicPricingTableProps> = ({ onSelectProduct }) => {
  return (
    <section id="public-pricing" className="py-20 bg-stone-950 text-stone-100 px-6 scroll-mt-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[10px] uppercase tracking-widest text-amber-500 font-semibold mb-3 block">
            [ Institutional Matrix ]
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-light text-stone-100 mb-6">
            Public Pricing Matrix
          </h2>
          <p className="text-stone-400 text-sm md:text-base font-light">
            All prices are base villa package pricing and strictly capped below ₹3.00 Cr. Taxes, registration, optional upgrades, and furnishings are kept completely separate.
          </p>
        </div>

        {/* Desktop Table view */}
        <div className="hidden md:block overflow-x-auto border border-stone-850 rounded-md bg-stone-900/20 backdrop-blur-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-850 bg-stone-900/60">
                <th className="p-6 font-serif text-stone-400 text-sm tracking-wider font-light">
                  Villa Size Model
                </th>
                {EXPERIENCE_CATEGORIES.map((cat) => (
                  <th key={cat.id} className="p-6 font-serif font-light text-sm text-stone-100">
                    <div>{cat.name}</div>
                    <div className="text-[10px] text-amber-500 font-mono mt-0.5 tracking-wider font-light">
                      {cat.subtitle}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {VILLA_MODELS.map((model) => (
                <tr key={model.id} className="border-b border-stone-850/50 hover:bg-[#10291f]/5 transition-colors">
                  <td className="p-6">
                    <div className="font-serif text-lg text-stone-100 font-normal">{model.name}</div>
                    <div className="text-xs text-stone-500 font-light mt-0.5">
                      {model.id === "custom" ? "Flexible built-up area" : `${model.builtUpArea.toLocaleString()} sq.ft built-up`}
                    </div>
                  </td>
                  
                  {EXPERIENCE_CATEGORIES.map((cat) => {
                    // Find pricing entry
                    const entry = PRICING_MATRIX.find(
                      (p) => p.modelId === model.id && p.experienceId === cat.id
                    );
                    if (!entry) return <td key={cat.id} className="p-6 text-stone-500">-</td>;
                    
                    const isRecommended = entry.isHero;
                    const isCap = entry.isPremiumCap;
                    const displayPrice = model.id === "custom" 
                      ? (cat.id === "wellness" ? `${formatINR(entry.price)} cap` : `${formatINR(entry.price)} onwards`)
                      : formatINR(entry.price);

                    return (
                      <td key={cat.id} className={`p-6 relative ${isRecommended ? "bg-[#1f3a2e]/10" : ""}`}>
                        <div className="flex flex-col gap-2">
                          <span className="font-serif text-xl text-stone-100 font-light">
                            {displayPrice}
                          </span>
                          
                          {/* Highlights badges */}
                          {isRecommended && (
                            <span className="self-start text-[8px] bg-amber-500/10 border border-amber-500/50 text-amber-400 font-semibold px-2 py-0.5 rounded-full uppercase tracking-widest">
                              ★ RECOMMENDED HERO
                            </span>
                          )}
                          {isCap && (
                            <span className="self-start text-[8px] bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 font-semibold px-2 py-0.5 rounded-full uppercase tracking-widest">
                              🛡 PREMIUM CAP
                            </span>
                          )}

                          <button
                            onClick={() => onSelectProduct(model.id, entry.price)}
                            className={`self-start mt-2 px-4 py-1.5 text-[9px] uppercase tracking-wider font-semibold rounded-sm transition-all duration-300 ${
                              isRecommended
                                ? "bg-amber-500 text-stone-950 hover:bg-amber-600"
                                : "bg-stone-900 hover:bg-[#1f3a2e] border border-stone-800 text-stone-300 hover:text-stone-100"
                            }`}
                          >
                            Model in Installments
                          </button>
                          <a
                            href="/#proposal"
                            className="self-start text-[9px] text-stone-400 hover:text-amber-400 underline uppercase tracking-wider mt-1 transition-all"
                          >
                            Request Cost Sheet
                          </a>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Grid view */}
        <div className="block md:hidden space-y-6">
          {VILLA_MODELS.map((model) => (
            <div key={model.id} className="bg-stone-900/30 border border-stone-850 p-6 rounded-md">
              <div className="mb-4 pb-4 border-b border-stone-850">
                <div className="font-serif text-xl text-stone-100">{model.name}</div>
                <div className="text-xs text-stone-500">
                  {model.id === "custom" ? "Flexible Area" : `${model.builtUpArea.toLocaleString()} sq.ft`}
                </div>
              </div>

              <div className="space-y-4">
                {EXPERIENCE_CATEGORIES.map((cat) => {
                  const entry = PRICING_MATRIX.find(
                    (p) => p.modelId === model.id && p.experienceId === cat.id
                  );
                  if (!entry) return null;

                  const isRecommended = entry.isHero;
                  const isCap = entry.isPremiumCap;
                  const displayPrice = model.id === "custom" 
                    ? (cat.id === "wellness" ? `${formatINR(entry.price)} cap` : `${formatINR(entry.price)} onwards`)
                    : formatINR(entry.price);

                  return (
                    <div key={cat.id} className={`p-4 rounded-sm border ${isRecommended ? "bg-[#1f3a2e]/10 border-amber-500/40" : "bg-stone-950/30 border-stone-850"}`}>
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <div className="text-xs font-semibold text-stone-300">{cat.name}</div>
                          <div className="text-[9px] text-stone-500 font-mono">{cat.subtitle}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-serif text-lg text-amber-500 font-light">{displayPrice}</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-stone-850/50">
                        <div className="flex gap-1.5">
                          {isRecommended && (
                            <span className="text-[7px] bg-amber-500/10 border border-amber-500/40 text-amber-400 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                              ★ RECOMMENDED
                            </span>
                          )}
                          {isCap && (
                            <span className="text-[7px] bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                              🛡 PREMIUM CAP
                            </span>
                          )}
                        </div>
                        
                        <button
                          onClick={() => onSelectProduct(model.id, entry.price)}
                          className="px-3 py-1 bg-stone-900 hover:bg-[#1f3a2e] text-[8px] uppercase tracking-wider font-semibold border border-stone-800 text-stone-300 hover:text-stone-100 rounded-sm"
                        >
                          Model in Installments
                        </button>
                        <a
                          href="/#proposal"
                          className="text-[8px] text-stone-400 hover:text-amber-400 underline uppercase tracking-wider transition-all"
                        >
                          Request Cost Sheet
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PublicPricingTable;
