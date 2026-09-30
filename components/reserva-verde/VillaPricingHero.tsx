import React from "react";

interface VillaPricingHeroProps {
  onScrollToSection: (sectionId: string) => void;
}

export const VillaPricingHero: React.FC<VillaPricingHeroProps> = ({ onScrollToSection }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-stone-950 via-[#10291f] to-stone-900 text-stone-100 py-24 md:py-32 px-6 border-b border-amber-500/10">
      {/* Background Graphic Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-950/40 via-stone-950/90 to-stone-950 z-0"></div>
      
      {/* Dynamic line vector art background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#fff" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/40 text-amber-400 text-[10px] font-semibold tracking-widest px-4 py-2 rounded-full uppercase font-sans mb-8 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          Financial Portfolio & Planning Dashboard
        </div>
        
        {/* Title */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-extralight text-stone-100 leading-tight mb-6 tracking-wide">
          Reserva Verde Goa <br />
          <span className="text-amber-500 font-light italic">Villa Collection</span>
        </h1>

        {/* Subtitle */}
        <p className="text-stone-300 max-w-3xl mx-auto text-base md:text-lg font-light leading-relaxed mb-12">
          Premium ground-level forest estates and modular containers from{" "}
          <span className="text-stone-100 font-semibold underline decoration-amber-500/60 decoration-2 underline-offset-4">
            ₹1.95 Cr to ₹2.99 Cr
          </span>
          . Tailored for HNI, NRI, and discerning wellness investors looking for eco-luxury, private plantation buffers, and sustainable architectural design.
        </p>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <button
            onClick={() => onScrollToSection("public-pricing")}
            className="w-full sm:w-auto px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all duration-300 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            View Pricing Matrix
          </button>
          
          <button
            onClick={() => onScrollToSection("installment-calc")}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#1F3A2E] hover:bg-[#2E5944] border border-emerald-800/40 text-stone-100 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all duration-300 shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Cost Sheet & Installments
          </button>

          <button
            onClick={() => onScrollToSection("contact")}
            className="w-full sm:w-auto px-8 py-3.5 bg-stone-900/60 hover:bg-stone-900 border border-stone-700/60 text-stone-300 hover:text-stone-100 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all duration-300 shadow-sm"
          >
            Book Site Visit
          </button>
        </div>
      </div>

      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-10 w-72 h-72 rounded-full bg-emerald-950/20 blur-3xl -z-10"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-amber-950/10 blur-3xl -z-10"></div>
    </div>
  );
};

export default VillaPricingHero;
