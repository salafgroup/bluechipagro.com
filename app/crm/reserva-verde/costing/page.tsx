"use client";

import React, { useState, useEffect } from "react";
import { VILLA_MODELS, COSTING_ASSUMPTIONS, PRICING_MATRIX, VillaModel } from "../../../../lib/reserva-verde/pricing-data";
import { calculateInternalCost } from "../../../../lib/reserva-verde/pricing-utils";
import InternalCostingCalculator from "../../../../components/crm/reserva-verde/InternalCostingCalculator";
import ProFormaCostSheet from "../../../../components/crm/reserva-verde/ProFormaCostSheet";

export default function CRMCostingPage() {
  const [selectedModel, setSelectedModel] = useState<string>("3bhk");
  const [selectedCategory, setSelectedCategory] = useState<string>("valley");

  const [builtUpArea, setBuiltUpArea] = useState<number>(3500);
  const [constructionRate, setConstructionRate] = useState<number>(3250);
  const [landAllocation, setLandAllocation] = useState<number>(25);
  const [infraAllocation, setInfraAllocation] = useState<number>(20);
  const [externalWorks, setExternalWorks] = useState<number>(32);
  const [softCostPct, setSoftCostPct] = useState<number>(12);
  const [salePrice, setSalePrice] = useState<number>(2.65);

  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  // Sync inputs on model/category change
  useEffect(() => {
    const model = VILLA_MODELS.find((m: VillaModel) => m.id === selectedModel);
    const category = COSTING_ASSUMPTIONS[selectedCategory];

    if (model && category) {
      setBuiltUpArea(model.builtUpArea);
      setConstructionRate(category.constructionRate);
      setLandAllocation(category.landAllocation);
      setInfraAllocation(category.commonInfraAllocation);
      setExternalWorks(category.externalWorks);
      setSoftCostPct(category.softCostPct);

      const pricing = PRICING_MATRIX.find(
        (p: any) => p.modelId === selectedModel && p.experienceId === selectedCategory
      );
      if (pricing) {
        setSalePrice(pricing.price);
      }
    }
  }, [selectedModel, selectedCategory]);

  // Auth Guard Simulation
  useEffect(() => {
    const role = sessionStorage.getItem("rvg_user_role");
    setUserRole(role);
    const allowedRoles = ["admin", "finance", "management", "founder", "sales_head"];
    if (role && allowedRoles.includes(role)) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, []);

  const handleAuthenticate = (role: string) => {
    const allowedRoles = ["admin", "finance", "management", "founder", "sales_head"];
    sessionStorage.setItem("rvg_user_role", role);
    setUserRole(role);
    if (allowedRoles.includes(role)) {
      setIsAuthorized(true);
    } else {
      alert("Unauthorized Access!\nRole '" + role + "' does not have permission to view sensitive costing sheets.");
      window.location.href = "/crm.html";
    }
  };

  const handleResetAssumptions = () => {
    setSelectedModel("3bhk");
    setSelectedCategory("valley");
  };

  const result = calculateInternalCost(
    builtUpArea,
    constructionRate,
    landAllocation,
    infraAllocation,
    externalWorks,
    softCostPct,
    salePrice
  );

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center font-sans p-6">
        <div className="bg-stone-900 border border-amber-500 p-8 max-w-md w-full text-center rounded-sm shadow-2xl">
          <h2 className="font-serif text-2xl text-amber-500 mb-4">CRM Costing Portal Guard</h2>
          <p className="text-xs text-stone-400 leading-relaxed mb-6">
            This Next.js dashboard route contains proprietary construction costs, infrastructure allocations, and gross margin details. Authentication is required.
          </p>
          <div className="space-y-3">
            {["admin", "finance", "management", "founder", "sales_head"].map((role) => (
              <button
                key={role}
                onClick={() => handleAuthenticate(role)}
                className="w-full text-left p-3 bg-stone-950 hover:bg-[#1f3a2e] border border-stone-850 hover:border-amber-500 text-xs font-semibold text-stone-300 uppercase tracking-widest rounded-sm transition-all flex justify-between items-center"
              >
                <span>Simulate {role.replace("_", " ")}</span>
                <span className="text-[10px] text-emerald-400 font-mono">Allowed</span>
              </button>
            ))}
            <div className="border-t border-stone-800 my-4 pt-3"></div>
            {["candidate", "public_user"].map((role) => (
              <button
                key={role}
                onClick={() => handleAuthenticate(role)}
                className="w-full text-left p-3 bg-stone-950 hover:bg-red-950/20 border border-stone-850 hover:border-red-500/40 text-xs font-semibold text-stone-500 uppercase tracking-widest rounded-sm transition-all flex justify-between items-center"
              >
                <span>Simulate {role.replace("_", " ")}</span>
                <span className="text-[10px] text-red-500 font-mono">Restricted</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-stone-850 mb-8 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold block mb-1">
            Reserva Varde Goa — Internal Developer Portal
          </span>
          <h1 className="font-serif text-3xl font-light text-stone-100">
            Internal Villa Costing Dashboard
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Developer-only pro-forma calculator for pricing, cost assumptions, margins, and installment planning.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-stone-400 font-semibold uppercase tracking-widest">
            Role: <span className="text-amber-500">{userRole}</span>
          </span>
          <button
            onClick={() => {
              sessionStorage.removeItem("rvg_user_role");
              setIsAuthorized(false);
            }}
            className="px-4 py-2 bg-stone-900 border border-stone-800 hover:border-red-500/30 text-stone-400 hover:text-red-400 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all"
          >
            Switch Role
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start mb-12">
        <div className="w-full lg:w-5/12">
          <InternalCostingCalculator
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            builtUpArea={builtUpArea}
            setBuiltUpArea={setBuiltUpArea}
            constructionRate={constructionRate}
            setConstructionRate={setConstructionRate}
            landAllocation={landAllocation}
            setLandAllocation={setLandAllocation}
            infraAllocation={infraAllocation}
            setInfraAllocation={setInfraAllocation}
            externalWorks={externalWorks}
            setExternalWorks={setExternalWorks}
            softCostPct={softCostPct}
            setSoftCostPct={setSoftCostPct}
            salePrice={salePrice}
            setSalePrice={setSalePrice}
          />
        </div>
        <div className="w-full lg:w-7/12 space-y-8">
          <ProFormaCostSheet
            builtUpArea={builtUpArea}
            constructionRate={constructionRate}
            result={result}
            softCostPct={softCostPct}
            salePrice={salePrice}
          />
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => window.print()}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all"
            >
              Print Cost Sheet
            </button>
            <button
              onClick={handleResetAssumptions}
              className="px-6 py-3 bg-stone-900 border border-stone-800 hover:border-amber-500/20 text-stone-300 hover:text-stone-100 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all"
            >
              Reset Assumptions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
