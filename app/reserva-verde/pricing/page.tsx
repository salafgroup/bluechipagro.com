"use client";

import React from "react";
import VillaPricingHero from "../../../components/reserva-verde/VillaPricingHero";
import VillaModelCards from "../../../components/reserva-verde/VillaModelCards";
import VillaExperienceCards from "../../../components/reserva-verde/VillaExperienceCards";
import PublicPricingTable from "../../../components/reserva-verde/PublicPricingTable";
import InstallmentCalculator from "../../../components/reserva-verde/InstallmentCalculator";
import OptionalUpgrades from "../../../components/reserva-verde/OptionalUpgrades";
import SalesSummary from "../../../components/reserva-verde/SalesSummary";

export default function PricingPage() {
  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectProduct = (modelId: string, price: number) => {
    // Scroll to the installment planner and let it load the values
    const planner = document.getElementById("installment-planner");
    if (planner) {
      planner.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectModel = (modelId: string) => {
    // Scroll to the public pricing table to compare options
    const table = document.getElementById("public-pricing");
    if (table) {
      table.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950">
      
      {/* 1. Hero Section */}
      <VillaPricingHero onScrollToSection={handleScrollToSection} />

      {/* 2. Villa Model Cards */}
      <VillaModelCards onSelectModel={handleSelectModel} />

      {/* 3. Experience Category Cards */}
      <VillaExperienceCards />

      {/* 4. Public Pricing Table */}
      <PublicPricingTable onSelectProduct={handleSelectProduct} />

      {/* 5. Installment Calculator */}
      <InstallmentCalculator />

      {/* 6. Optional Upgrade Section */}
      <OptionalUpgrades />

      {/* 7. Sales Summary Section */}
      <SalesSummary />

      {/* 8. Contact / Lead Capture Anchor */}
      <section id="contact" className="py-20 bg-stone-900 px-6 text-center border-t border-stone-850">
        <div className="max-w-2xl mx-auto">
          <span className="text-[10px] uppercase tracking-widest text-amber-500 font-semibold mb-3 block">
            [ Secure Your Lot ]
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-light text-stone-100 mb-6">
            Book Site Visit & Request Cost Sheet
          </h2>
          <p className="text-stone-400 text-xs md:text-sm font-light leading-relaxed mb-8 max-w-xl mx-auto">
            Discuss detailed plantation zoning, explore off-grid utility infrastructure, and customize your ground-level eco estate with our Goa design studio consultants.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="/#proposal"
              className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all shadow-lg"
            >
              Request Detailed Cost Sheet
            </a>
            <a
              href="/#proposal"
              className="px-8 py-3.5 bg-stone-950 border border-stone-800 hover:border-amber-500/20 text-stone-300 hover:text-stone-100 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all"
            >
              Speak to Estate Strategist
            </a>
          </div>
        </div>
      </section>

      {/* 9. Important Disclaimer Section */}
      <footer className="py-12 bg-stone-950 px-6 border-t border-stone-900 text-stone-500">
        <div className="max-w-5xl mx-auto">
          <div className="bg-stone-900/20 border border-stone-850 p-6 rounded-md">
            <span className="text-[9px] uppercase tracking-widest font-semibold text-stone-400 block mb-3">
              Regulatory Compliance & Important Disclaimer
            </span>
            <p className="text-[10px] font-light leading-relaxed text-justify">
              Reserva Varde Goa is a conceptual eco-estate model. All development, villa construction, land subdivision, sale, resort operation and eco-tourism activity is subject to title verification, zoning, TCP approval, land conversion, environmental / forest / ESZ verification, Goa RERA applicability and legal due diligence. Nothing on this page constitutes an offer, approval assurance, or guaranteed return. Prices are indicative working figures for buyer presentation. Final pricing, taxes, stamp duty, registration charges, legal documentation, approvals, specifications, and optional upgrades will be confirmed at the time of agreement. Rental income, plantation income, appreciation, or resale value are not guaranteed and are subject to market conditions, legal approvals, operations, and actual usage.
            </p>
          </div>
          
          <div className="text-center text-[9px] mt-8 font-light tracking-wide text-stone-600">
            © {new Date().getFullYear()} Reserva Verde Goa by Bluechip Global Agro. All rights reserved. Preliminary investor-only presentation documents.
          </div>
        </div>
      </footer>

    </div>
  );
}
