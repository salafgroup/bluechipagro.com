import React, { useState } from "react";
import { OPTIONAL_UPGRADES, OptionalUpgrade } from "../../lib/reserva-verde/pricing-data";
import { formatINR } from "../../lib/reserva-verde/pricing-utils";

export const OptionalUpgrades: React.FC = () => {
  // Keep track of user checklisted items for interactive sum modeling
  const [selectedUpgrades, setSelectedUpgrades] = useState<string[]>([]);

  const handleToggle = (id: string) => {
    setSelectedUpgrades((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Compute interactive addon price range
  const totalMin = selectedUpgrades.reduce((sum, id) => {
    const item = OPTIONAL_UPGRADES.find((up) => up.id === id);
    return sum + (item ? item.minPrice : 0);
  }, 0);

  const totalMax = selectedUpgrades.reduce((sum, id) => {
    const item = OPTIONAL_UPGRADES.find((up) => up.id === id);
    return sum + (item ? item.maxPrice : 0);
  }, 0);

  return (
    <section className="py-20 bg-stone-900 text-stone-100 px-6 border-b border-stone-850">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[10px] uppercase tracking-widest text-amber-500 font-semibold mb-3 block">
            [ Bespoke Additions ]
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-light text-stone-100 mb-6">
            Optional Upgrades Showcase
          </h2>
          <p className="text-stone-400 text-sm md:text-base font-light">
            Customize your private estate further. These upgrades are completely optional, maintained completely separate, and billed outside the base villa packages. <strong className="text-amber-400">Optional upgrades are billed separately and are not part of the base villa package.</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* Grid of Addons (Left/Middle, 8/12) */}
          <div className="w-full lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {OPTIONAL_UPGRADES.map((upgrade: OptionalUpgrade) => {
              const isChecked = selectedUpgrades.includes(upgrade.id);
              const isExtraArea = upgrade.id === "extra_area";
              const priceDisplay = isExtraArea 
                ? "₹5,500 – ₹7,500/sq.ft"
                : `${formatINR(upgrade.minPrice, "Lakh", "Lakh")} – ${formatINR(upgrade.maxPrice, "Lakh", "Lakh")}`;

              return (
                <div
                  key={upgrade.id}
                  onClick={() => handleToggle(upgrade.id)}
                  className={`group relative p-6 rounded-md border cursor-pointer transition-all duration-300 ${
                    isChecked
                      ? "bg-[#1f3a2e]/10 border-amber-500/80 shadow-md"
                      : "bg-stone-950/40 border-stone-850 hover:border-stone-700"
                  }`}
                >
                  <div className="flex items-start gap-4 justify-between">
                    <div>
                      <h4 className="font-serif text-lg font-light text-stone-100 group-hover:text-amber-200 transition-colors duration-300">
                        {upgrade.name}
                      </h4>
                      <p className="text-stone-400 text-[11px] font-light leading-relaxed mt-2.5 mb-4">
                        {upgrade.description}
                      </p>
                      <span className="font-mono text-xs font-semibold text-amber-500">
                        {priceDisplay}
                      </span>
                    </div>

                    {/* Checkbox indicator */}
                    <div className={`w-5 h-5 rounded-sm border flex items-center justify-center flex-shrink-0 mt-1 transition-all ${
                      isChecked
                        ? "bg-amber-500 border-amber-500 text-stone-950"
                        : "border-stone-700 bg-stone-900"
                    }`}>
                      {isChecked && (
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                          <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Estimator Panel (Right Column, 4/12) */}
          <div className="w-full lg:col-span-1 bg-stone-950 border border-stone-850 p-8 rounded-md shadow-2xl sticky top-8">
            <span className="text-[9px] text-stone-500 uppercase tracking-widest block mb-4 font-semibold">
              Bespoke Cost Modeler
            </span>
            <h4 className="font-serif text-xl font-normal text-stone-100 mb-6">
              Selected Upgrades Estimator
            </h4>

            {selectedUpgrades.length === 0 ? (
              <div className="text-center py-12 text-stone-500 text-xs font-light">
                Click upgrade cards to add custom enhancements and calculate estimated budgets.
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 border-b border-stone-850 pb-6">
                  {selectedUpgrades.map((id) => {
                    const item = OPTIONAL_UPGRADES.find((up) => up.id === id);
                    if (!item) return null;
                    const isExtraArea = item.id === "extra_area";
                    return (
                      <div key={id} className="flex justify-between items-center text-xs font-light">
                        <span className="text-stone-300">{item.name}</span>
                        <span className="font-mono text-stone-400">
                          {isExtraArea ? "Rate" : `₹${item.minPrice}L – ₹${item.maxPrice}L`}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div>
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-[10px] text-stone-500 uppercase tracking-widest">
                      Estimated Addon Range
                    </span>
                    <span className="font-mono text-amber-500 text-sm font-semibold">
                      {selectedUpgrades.includes("extra_area") && "Exclude Area Rate"}
                    </span>
                  </div>
                  
                  <div className="bg-stone-900 border border-stone-800 rounded-sm p-4 text-center">
                    <span className="font-serif text-2xl font-normal text-stone-100">
                      ₹{totalMin} Lakhs – ₹{totalMax} Lakhs
                    </span>
                    <span className="text-stone-500 text-[9px] block mt-1">
                      Indicative additions. Excludes taxes and local contractor site charges.
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedUpgrades([])}
                  className="w-full py-2.5 bg-stone-900 hover:bg-[#10291f] text-stone-400 hover:text-stone-300 border border-stone-800 text-[10px] uppercase tracking-wider rounded-sm transition-all"
                >
                  Clear Selection
                </button>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-stone-850 text-[9px] text-stone-500 leading-normal">
              <strong>Please Note:</strong> All optional enhancements must be confirmed individually during agreement detailing. Materials, finishes, structural specifications, and timelines will be listed separately in the specifications annexure.
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default OptionalUpgrades;
