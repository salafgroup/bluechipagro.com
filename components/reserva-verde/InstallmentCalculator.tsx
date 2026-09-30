import React, { useState } from "react";
import { calculateInstallments, formatINR } from "../../lib/reserva-verde/pricing-utils";

export const InstallmentCalculator: React.FC = () => {
  // Available standard price assumptions
  const PRESET_PRICES = [
    { label: "₹1.95 Cr (Entry)", price: 1.95 },
    { label: "₹2.25 Cr (2BHK)", price: 2.25 },
    { label: "₹2.35 Cr (3BHK)", price: 2.35 },
    { label: "₹2.55 Cr (2BHK)", price: 2.55 },
    { label: "₹2.65 Cr (Hero Product)", price: 2.65 },
    { label: "₹2.90 Cr (Premium)", price: 2.90 },
    { label: "₹2.99 Cr (Luxury Cap)", price: 2.99 }
  ];

  const [selectedPrice, setSelectedPrice] = useState<number>(2.65);
  const [customPrice, setCustomPrice] = useState<string>("2.65");
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  const activePrice = isCustomMode ? (parseFloat(customPrice) || 0) : selectedPrice;

  // Calculate installments
  const installments = calculateInstallments(activePrice);
  const totalAmountFormatted = formatINR(activePrice, "Cr", "Cr");

  return (
    <section id="installment-calc" className="py-20 bg-stone-950 text-stone-100 px-6 scroll-mt-10">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[10px] uppercase tracking-widest text-amber-500 font-semibold mb-3 block">
            [ Financial Planning ]
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-light text-stone-100 mb-6">
            Installment Payment Planner
          </h2>
          <p className="text-stone-400 text-sm md:text-base font-light">
            Select an indicative villa price model to review the buyer-friendly 8-stage cashflow milestone distribution.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Price Selector Block (Left Column, 4/12) */}
          <div className="w-full lg:w-4/12 bg-stone-900/20 border border-stone-850 p-8 rounded-md backdrop-blur-md">
            <span className="text-[9px] text-stone-500 uppercase tracking-widest block mb-4 font-semibold">
              Select Package Value
            </span>
            
            {/* Presets List */}
            <div className="space-y-2 mb-6">
              {PRESET_PRICES.map((preset) => {
                const isActive = !isCustomMode && selectedPrice === preset.price;
                return (
                  <button
                    key={preset.price}
                    onClick={() => {
                      setIsCustomMode(false);
                      setSelectedPrice(preset.price);
                    }}
                    className={`w-full text-left p-3.5 text-xs rounded-sm border transition-all duration-300 flex justify-between items-center ${
                      isActive
                        ? "bg-[#1f3a2e]/30 border-amber-500/80 text-stone-100 font-semibold shadow-md"
                        : "bg-stone-950/40 border-stone-850 text-stone-400 hover:border-stone-700 hover:text-stone-300"
                    }`}
                  >
                    <span>{preset.label}</span>
                    <span className="font-mono text-amber-400">{preset.price.toFixed(2)} Cr</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Mode Toggle */}
            <div className="pt-6 border-t border-stone-850">
              <button
                onClick={() => setIsCustomMode(true)}
                className={`w-full text-center p-3 text-xs uppercase tracking-wider font-semibold rounded-sm border transition-all duration-300 ${
                  isCustomMode
                    ? "bg-[#1f3a2e]/30 border-amber-500/80 text-stone-100"
                    : "bg-stone-950/20 border-stone-850 text-stone-400 hover:border-stone-700"
                }`}
              >
                Custom Price Value
              </button>

              {isCustomMode && (
                <div className="mt-4 animate-fade-in">
                  <div className="relative">
                    <input
                      type="number"
                      min="1.0"
                      max="2.99"
                      step="0.01"
                      value={customPrice}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (parseFloat(val) > 2.99) {
                          setCustomPrice("2.99");
                        } else {
                          setCustomPrice(val);
                        }
                      }}
                      className="w-full bg-stone-950 border border-stone-800 text-stone-100 text-sm p-3 rounded-sm pr-12 focus:border-amber-500 outline-none font-mono"
                      placeholder="Enter price in Crores"
                    />
                    <span className="absolute right-4 top-3 text-stone-500 font-mono text-sm">Cr</span>
                  </div>
                  <span className="text-[9px] text-stone-500 block mt-1.5 leading-normal">
                    Prices are base villa package costs, restricted strictly under ₹2.99 Cr cap.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Installment Breakdown Table (Right Column, 8/12) */}
          <div className="w-full lg:w-8/12">
            <div className="bg-stone-950 border border-stone-850 rounded-md p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-stone-850">
                <div>
                  <h4 className="font-serif text-xl font-normal text-stone-100">
                    Milestone Schedule Breakdown
                  </h4>
                  <p className="text-[10px] text-stone-500 uppercase tracking-widest mt-1">
                    Buyer Cashflow Allocation Sheet
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-stone-500 text-[10px] block uppercase tracking-widest">
                    Total Contract Value
                  </span>
                  <span className="font-serif text-2xl font-light text-amber-500">
                    {totalAmountFormatted}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-light">
                  <thead>
                    <tr className="border-b border-stone-850 text-stone-500 uppercase tracking-widest font-semibold text-[9px]">
                      <th className="py-3 px-2">Stage</th>
                      <th className="py-3 px-2">Payment Milestone Milestone</th>
                      <th className="py-3 px-2 text-center">Ratio %</th>
                      <th className="py-3 px-2 text-right">Calculated Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {installments.map((inst) => {
                      const isHighValue = inst.percentage >= 15;
                      return (
                        <tr
                          key={inst.stageNumber}
                          className="border-b border-stone-850/40 hover:bg-[#10291f]/5 transition-colors"
                        >
                          <td className="py-4 px-2 font-mono text-stone-500">
                            {inst.stageNumber.toString().padStart(2, "0")}
                          </td>
                          <td className="py-4 px-2 text-stone-200 font-normal">
                            {inst.name}
                          </td>
                          <td className="py-4 px-2 text-center font-mono text-amber-500/80">
                            {inst.percentage}%
                          </td>
                          <td className={`py-4 px-2 text-right font-mono text-stone-100 ${isHighValue ? "font-normal text-amber-100" : ""}`}>
                            {inst.amountFormatted}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-stone-900/30 font-semibold border-t border-stone-800 text-[13px] text-stone-100">
                      <td className="py-4 px-2"></td>
                      <td className="py-4 px-2 uppercase tracking-wider text-[10px] font-bold">Total Contract Schedule</td>
                      <td className="py-4 px-2 text-center font-mono text-amber-500">100%</td>
                      <td className="py-4 px-2 text-right font-mono text-amber-500">{totalAmountFormatted}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-8 bg-stone-900/40 border border-stone-850 p-4 rounded-sm">
                <span className="text-[9px] text-stone-400 block leading-relaxed">
                  <strong>Standard Process Rule:</strong> Stage payment milestones are linked strictly to physical development progress. Verification is carried out and certified by architectural project project consultants before milestone invoicing.
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default InstallmentCalculator;
