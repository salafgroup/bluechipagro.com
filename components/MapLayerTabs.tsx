"use client";

import React from "react";

export interface MapLayerTab {
  id: string;
  title: string;
}

export interface MapLayerTabsProps {
  tabs: MapLayerTab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const MapLayerTabs: React.FC<MapLayerTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = "",
}) => {
  return (
    <div
      className={`bg-emerald-950/60 border border-amber-500/25 rounded-xl p-6 flex flex-col gap-3 shadow-lg backdrop-blur-md ${className}`}
      role="tablist"
      aria-label="Map Visualizer Layers"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`w-full text-left font-sans text-xs tracking-widest uppercase font-medium px-5 py-4 rounded-md border border-transparent transition-all duration-300 flex justify-between items-center cursor-pointer ${
              isActive
                ? "bg-amber-500/15 border-amber-500/60 text-amber-300 font-semibold shadow-[inset_3px_0_0_#B08A3E]"
                : "text-stone-300/70 hover:text-stone-100 hover:bg-stone-800/20"
            }`}
          >
            {tab.title}
            <span className={`text-[10px] transition-transform duration-300 ${isActive ? "translate-x-1" : ""}`}>
              →
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default MapLayerTabs;
