import React from "react";

export const SalesSummary: React.FC = () => {
  return (
    <section className="py-20 bg-stone-950 text-stone-100 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[10px] uppercase tracking-widest text-amber-500 font-semibold mb-3 block">
            [ Portfolio Summary ]
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-light text-stone-100 mb-6">
            Investor Sales Summary
          </h2>
          <p className="text-stone-400 text-sm md:text-base font-light">
            Quick reference guide for sales teams and wealth managers outlining core portfolio alignments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Entry Product */}
          <div className="bg-stone-900/30 border border-stone-850 p-6 rounded-md hover:border-amber-500/20 transition-all flex flex-col justify-between">
            <div>
              <span className="text-[8px] bg-stone-800 border border-stone-700 text-stone-300 font-semibold px-2 py-0.5 rounded-full uppercase tracking-widest block w-max mb-4">
                ENTRY POINT
              </span>
              <h4 className="font-serif text-2xl font-light text-stone-100 mb-2">
                2BHK Forest Cottage
              </h4>
              <p className="text-stone-400 text-xs font-light leading-relaxed mb-6">
                Intimate forest-facing eco-cottage planned on a 1-acre private estate. Low-maintenance second home profile.
              </p>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 uppercase tracking-widest block mb-1">Base Price</span>
              <span className="font-serif text-xl font-normal text-amber-500">₹1.95 Cr</span>
            </div>
          </div>

          {/* Hero Product */}
          <div className="bg-[#1f3a2e]/10 border border-amber-500/40 p-6 rounded-md hover:border-amber-500/60 transition-all flex flex-col justify-between relative shadow-xl">
            <div className="absolute top-0 right-6 transform -translate-y-1/2">
              <span className="text-[7px] bg-amber-500 text-stone-950 font-bold px-2 py-1 rounded-full uppercase tracking-widest">
                RECOMMENDED HERO
              </span>
            </div>
            <div>
              <span className="text-[8px] bg-[#1f3a2e] border border-emerald-800 text-emerald-400 font-semibold px-2 py-0.5 rounded-full uppercase tracking-widest block w-max mb-4">
                BEST LIFESTYLE VALUE
              </span>
              <h4 className="font-serif text-2xl font-normal text-stone-100 mb-2">
                3BHK Jungle Valley
              </h4>
              <p className="text-stone-300/80 text-xs font-light leading-relaxed mb-6">
                Expansive L-shape pavilion residence on a 1-acre private estate. High elevation ridge alignment, premium family-friendly lifestyle profile.
              </p>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 uppercase tracking-widest block mb-1">Base Price</span>
              <span className="font-serif text-xl font-semibold text-amber-500">₹2.65 Cr</span>
            </div>
          </div>

          {/* Premium Product */}
          <div className="bg-stone-900/30 border border-stone-850 p-6 rounded-md hover:border-amber-500/20 transition-all flex flex-col justify-between">
            <div>
              <span className="text-[8px] bg-stone-800 border border-stone-700 text-stone-300 font-semibold px-2 py-0.5 rounded-full uppercase tracking-widest block w-max mb-4">
                SIGNATURE PROFILE
              </span>
              <h4 className="font-serif text-2xl font-light text-stone-100 mb-2">
                4BHK Jungle Valley
              </h4>
              <p className="text-stone-400 text-xs font-light leading-relaxed mb-6">
                Flagship spacious 4,500 sq.ft three-wing container layout centered around an open biophilic courtyard. Large family configuration.
              </p>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 uppercase tracking-widest block mb-1">Base Price</span>
              <span className="font-serif text-xl font-normal text-amber-500">₹2.90 Cr</span>
            </div>
          </div>

          {/* Luxury Cap Product */}
          <div className="bg-stone-900/30 border border-stone-850 p-6 rounded-md hover:border-amber-500/20 transition-all flex flex-col justify-between">
            <div>
              <span className="text-[8px] bg-stone-800 border border-stone-700 text-stone-300 font-semibold px-2 py-0.5 rounded-full uppercase tracking-widest block w-max mb-4">
                PREMIUM BOUNDARY
              </span>
              <h4 className="font-serif text-2xl font-light text-stone-100 mb-2">
                Premium Wellness / Customizable
              </h4>
              <p className="text-stone-400 text-xs font-light leading-relaxed mb-6">
                Premium NRI sanctuary villa or fully bespoke layouts. Bounded strictly below the regulatory base price cap.
              </p>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 uppercase tracking-widest block mb-1">Base Price Cap</span>
              <span className="font-serif text-xl font-normal text-amber-500">₹2.99 Cr</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default SalesSummary;
