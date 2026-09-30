"use client";

import React from "react";
import { formatINR, CostingResult } from "../../../lib/reserva-verde/pricing-utils";

interface ProFormaCostSheetProps {
  builtUpArea: number;
  constructionRate: number;
  result: CostingResult;
  softCostPct: number;
  salePrice: number;
}

export const ProFormaCostSheet: React.FC<ProFormaCostSheetProps> = ({
  builtUpArea,
  constructionRate,
  result,
  softCostPct,
  salePrice
}) => {
  const isMarginHealthy = result.grossMarginPercent >= 20;
  
  // Dynamic margin health status description
  const getMarginHealthLabel = (pct: number) => {
    if (pct < 15) return "Below 15%: Red — Margin Risk";
    if (pct >= 15 && pct < 20) return "15% to 20%: Amber — Tight Margin";
    if (pct >= 20 && pct <= 30) return "20% to 30%: Green — Healthy Margin";
    return "Above 30%: Premium Margin";
  };

  const getMarginHealthBadgeClass = (pct: number) => {
    if (pct < 15) return "bg-red-950/50 border border-red-800/60 text-red-400";
    if (pct >= 15 && pct < 20) return "bg-amber-950/50 border border-amber-800/60 text-amber-400";
    if (pct >= 20 && pct <= 30) return "bg-emerald-950/50 border border-emerald-800/60 text-emerald-400";
    return "bg-blue-950/50 border border-blue-800/60 text-blue-400";
  };

  return (
    <div className="bg-stone-950 border border-stone-850 rounded-md p-8 shadow-2xl">
      <div className="flex justify-between items-center mb-6 pb-6 border-b border-stone-850">
        <div>
          <h4 className="font-serif text-xl font-normal text-stone-100">
            Pro-Forma Cost Breakdown
          </h4>
          <p className="text-[10px] text-stone-500 uppercase tracking-widest mt-1">
            Internal Appraisal Sheet
          </p>
        </div>
        <div className="text-right">
          <span className="text-[9px] bg-[#1f3a2e] border border-emerald-800 text-emerald-400 font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            DEVELOPER VIEW
          </span>
        </div>
      </div>

      <div className="space-y-4 text-xs font-light text-stone-300">
        <div className="flex justify-between py-1">
          <span>Construction Cost ({builtUpArea} sq.ft × ₹{constructionRate})</span>
          <span className="font-mono text-stone-100">{formatINR(result.constructionCostRaw, "raw")}</span>
        </div>

        <div className="flex justify-between py-1">
          <span>External Villa Works (Spa / Pools)</span>
          <span className="font-mono text-stone-100">{formatINR(result.externalWorksRaw, "raw")}</span>
        </div>

        <div className="flex justify-between py-1">
          <span>Land Allocation (1-Acre Private Plot)</span>
          <span className="font-mono text-stone-100">{formatINR(result.landAllocationRaw, "raw")}</span>
        </div>

        <div className="flex justify-between py-1">
          <span>Common Infrastructure (Managed Access)</span>
          <span className="font-mono text-stone-100">{formatINR(result.infrastructureAllocationRaw, "raw")}</span>
        </div>

        <div className="flex justify-between py-2 border-y border-stone-850 text-stone-100 font-normal">
          <span>Subtotal Hard Cost</span>
          <span className="font-mono">{formatINR(result.subtotalRaw, "raw")}</span>
        </div>

        <div className="flex justify-between py-1">
          <span>Soft Costs & Contingency ({softCostPct}% of Construction + Ext. Works)</span>
          <span className="font-mono text-stone-100">{formatINR(result.softCostRaw, "raw")}</span>
        </div>

        <div className="flex justify-between py-3 border-b border-stone-800 bg-stone-900/40 px-4 rounded-sm text-stone-100 font-semibold">
          <span className="uppercase tracking-wide text-[10px] text-amber-500 font-bold">Estimated Internal Cost</span>
          <span className="font-mono text-amber-400">{formatINR(result.estimatedInternalCostRaw, "raw")}</span>
        </div>

        <div className="flex justify-between py-1 pt-6 text-sm">
          <span>Sale Price (Base Villa Package)</span>
          <span className="font-mono font-semibold text-stone-100">{formatINR(result.salePriceRaw, "raw")}</span>
        </div>

        <div className="flex justify-between py-3 border-t border-stone-850 mt-6 items-center">
          <div>
            <span className="text-sm font-normal text-stone-100 block">Gross Profit Margin</span>
            <span className="text-[9px] text-stone-500 uppercase tracking-widest mt-0.5">Sale Price - Total Internal Cost</span>
          </div>
          <div className="text-right">
            <div className="font-mono text-xl font-normal text-stone-100">
              {formatINR(result.grossMarginRaw, "raw")}
            </div>
          </div>
        </div>

        <div className="flex justify-between py-4 border-t border-amber-500/10 items-center">
          <div>
            <span className="text-sm font-normal text-stone-100 block">Gross Margin %</span>
            <span className="text-[9px] text-stone-500 mt-1 block">{getMarginHealthLabel(result.grossMarginPercent)}</span>
          </div>
          <div className="text-right">
            <span
              className={`font-mono text-2xl font-bold px-4 py-1.5 rounded-sm ${getMarginHealthBadgeClass(result.grossMarginPercent)}`}
            >
              {result.grossMarginPercent.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProFormaCostSheet;
