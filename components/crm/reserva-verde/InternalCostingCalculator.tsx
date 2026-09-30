"use client";

import React from "react";
import { VILLA_MODELS, EXPERIENCE_CATEGORIES } from "../../../lib/reserva-verde/pricing-data";
import { formatINR } from "../../../lib/reserva-verde/pricing-utils";

interface InternalCostingCalculatorProps {
  selectedModel: string;
  setSelectedModel: (m: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  builtUpArea: number;
  setBuiltUpArea: (a: number) => void;
  constructionRate: number;
  setConstructionRate: (r: number) => void;
  landAllocation: number;
  setLandAllocation: (l: number) => void;
  infraAllocation: number;
  setInfraAllocation: (i: number) => void;
  externalWorks: number;
  setExternalWorks: (w: number) => void;
  softCostPct: number;
  setSoftCostPct: (p: number) => void;
  salePrice: number;
  setSalePrice: (s: number) => void;
}

export const InternalCostingCalculator: React.FC<InternalCostingCalculatorProps> = ({
  selectedModel,
  setSelectedModel,
  selectedCategory,
  setSelectedCategory,
  builtUpArea,
  setBuiltUpArea,
  constructionRate,
  setConstructionRate,
  landAllocation,
  setLandAllocation,
  infraAllocation,
  setInfraAllocation,
  externalWorks,
  setExternalWorks,
  softCostPct,
  setSoftCostPct,
  salePrice,
  setSalePrice
}) => {
  return (
    <div className="w-full bg-stone-900 border border-stone-850 p-8 rounded-md shadow-lg">
      <span className="text-[10px] uppercase tracking-widest text-amber-500 font-semibold mb-3 block">
        [ Developer Modeler ]
      </span>
      <h3 className="font-serif text-3xl font-light text-stone-100 mb-6">
        Internal Costing Calculator
      </h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-[9px] text-stone-500 uppercase tracking-widest block mb-2 font-semibold">
            Villa Size Model
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full bg-stone-950 border border-stone-800 text-stone-300 text-xs p-2.5 rounded-sm outline-none"
          >
            <option value="2bhk">2BHK (2,500 sq.ft)</option>
            <option value="3bhk">3BHK (3,500 sq.ft)</option>
            <option value="4bhk">4BHK (4,500 sq.ft)</option>
            <option value="custom">Customizable (flexible)</option>
          </select>
        </div>

        <div>
          <label className="text-[9px] text-stone-500 uppercase tracking-widest block mb-2 font-semibold">
            Experience Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-stone-950 border border-stone-800 text-stone-300 text-xs p-2.5 rounded-sm outline-none"
          >
            <option value="cottage">Forest Cottage</option>
            <option value="valley">Jungle Valley</option>
            <option value="wellness">Premium Wellness</option>
          </select>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between text-xs font-light text-stone-300 mb-2">
            <span>Built-up Area</span>
            <span className="font-mono text-amber-400 font-semibold">{builtUpArea.toLocaleString()} Sq.Ft</span>
          </div>
          <input
            type="range"
            min="2000"
            max="6000"
            step="100"
            value={builtUpArea}
            onChange={(e) => setBuiltUpArea(parseInt(e.target.value))}
            className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-light text-stone-300 mb-2">
            <span>Construction Rate</span>
            <span className="font-mono text-amber-400 font-semibold">₹{constructionRate}/Sq.Ft</span>
          </div>
          <input
            type="range"
            min="2000"
            max="5000"
            step="50"
            value={constructionRate}
            onChange={(e) => setConstructionRate(parseInt(e.target.value))}
            className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-light text-stone-300 mb-2">
            <span>Land Allocation</span>
            <span className="font-mono text-amber-400 font-semibold">₹{landAllocation} Lakhs</span>
          </div>
          <input
            type="range"
            min="10"
            max="60"
            step="1"
            value={landAllocation}
            onChange={(e) => setLandAllocation(parseInt(e.target.value))}
            className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-light text-stone-300 mb-2">
            <span>External Villa Works</span>
            <span className="font-mono text-amber-400 font-semibold">₹{externalWorks} Lakhs</span>
          </div>
          <input
            type="range"
            min="10"
            max="70"
            step="1"
            value={externalWorks}
            onChange={(e) => setExternalWorks(parseInt(e.target.value))}
            className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-light text-stone-300 mb-2">
            <span>Common Infrastructure</span>
            <span className="font-mono text-amber-400 font-semibold">₹{infraAllocation} Lakhs</span>
          </div>
          <input
            type="range"
            min="5"
            max="40"
            step="1"
            value={infraAllocation}
            onChange={(e) => setInfraAllocation(parseInt(e.target.value))}
            className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-light text-stone-300 mb-2">
            <span>Soft Cost + Contingency</span>
            <span className="font-mono text-amber-400 font-semibold">{softCostPct}%</span>
          </div>
          <input
            type="range"
            min="5"
            max="20"
            step="1"
            value={softCostPct}
            onChange={(e) => setSoftCostPct(parseInt(e.target.value))}
            className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        <div className="pt-4 border-t border-stone-800">
          <div className="flex justify-between text-xs font-light text-stone-300 mb-2">
            <span>Contract Sale Price</span>
            <span className="font-mono text-amber-400 font-semibold">{formatINR(salePrice, "Cr")}</span>
          </div>
          <input
            type="range"
            min="1.50"
            max="2.99"
            step="0.05"
            value={salePrice}
            onChange={(e) => setSalePrice(parseFloat(e.target.value))}
            className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <span className="text-[9px] text-stone-500 block mt-1">
            Note: Capped strictly at ₹2.99 Cr base villa maximum.
          </span>
        </div>
      </div>
    </div>
  );
};

export default InternalCostingCalculator;
