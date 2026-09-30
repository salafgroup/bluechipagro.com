"use client";

import React, { useState } from "react";

export interface MasterplanOverlayItem {
  id: string;
  label: string;
  color: string;
}

export interface MasterplanOverlaySectionProps {
  className?: string;
  backgroundImage?: string;
  items?: MasterplanOverlayItem[];
}

export const defaultOverlayItems: MasterplanOverlayItem[] = [
  { id: "boundary", label: "Project Boundary", color: "border-amber-500 bg-amber-500" },
  { id: "roads", label: "Internal Eco Roads", color: "border-stone-100 bg-stone-100" },
  { id: "clusters", label: "Estate Clusters", color: "border-emerald-500 bg-emerald-500" },
  { id: "plantations", label: "Plantation Belts", color: "border-emerald-700 bg-emerald-700" },
  { id: "water", label: "Water / Streams", color: "border-blue-500 bg-blue-500" },
  { id: "wellness", label: "Retreat & View Decks", color: "border-amber-400 bg-amber-400" },
];

export const MasterplanOverlaySection: React.FC<MasterplanOverlaySectionProps> = ({
  className = "",
  backgroundImage = "/images/location/red-boundary-map.png",
  items = defaultOverlayItems,
}) => {
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    boundary: false,
    roads: false,
    clusters: false,
    plantations: false,
    water: false,
    wellness: false,
  });

  const toggleLayer = (layerId: string) => {
    setActiveLayers((prev) => ({
      ...prev,
      [layerId]: !prev[layerId],
    }));
  };

  return (
    <section className={`py-16 text-stone-100 ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-12">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-500 mb-4">
            <span className="w-8 h-px bg-amber-500"></span>
            Zoning &amp; Planning
          </span>
          <h3 className="font-serif text-3xl md:text-4xl font-normal leading-tight">
            Conceptual Masterplan Overlay
          </h3>
          <p className="text-stone-300/80 text-sm leading-relaxed font-light mt-4">
            Interactive CAD-style masterplan layer overlay. Toggle individual layers in the control panel to visualize estate layouts, plantation belts, organic pathways, and conservation zones. Conceptual overlay only, subject to contour survey and final planning clearances.
          </p>
        </div>

        <div className="bg-emerald-950/20 border border-amber-500/20 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr_340px] shadow-2xl backdrop-blur-sm">
          
          {/* Overlay Map Viewport */}
          <div className="relative bg-stone-950 aspect-[16/10] overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src={backgroundImage}
              alt="Conceptual masterplan satellite base view"
            />

            {/* SVG Overlays */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 800 500"
            >
              {/* Layer 1: Boundary (Gold Outline) */}
              <polygon
                className="transition-opacity duration-500 fill-amber-500/10 stroke-amber-500 stroke-[3.5] stroke-dasharray-[10,5]"
                style={{
                  opacity: activeLayers.boundary ? 1 : 0,
                  filter: "drop-shadow(0 0 8px rgba(245,158,11,0.8))",
                }}
                points="240,160 300,100 480,90 560,180 500,340 360,350 250,260"
              />

              {/* Layer 2: Roads (Dashed White Path) */}
              <g
                className="transition-opacity duration-500"
                style={{ opacity: activeLayers.roads ? 1 : 0 }}
              >
                <path
                  className="fill-none stroke-stone-100 stroke-[2.5] stroke-dasharray-[6,6]"
                  style={{ filter: "drop-shadow(0 0 5px rgba(255,255,255,0.5))" }}
                  d="M 250,260 Q 320,240 360,280 T 480,260 Q 510,210 560,180"
                />
                <path
                  className="fill-none stroke-stone-100 stroke-[2.5] stroke-dasharray-[6,6]"
                  style={{ filter: "drop-shadow(0 0 5px rgba(255,255,255,0.5))" }}
                  d="M 300,100 Q 340,190 360,280 Q 380,320 500,340"
                />
              </g>

              {/* Layer 3: Estate Clusters */}
              <g
                className="transition-opacity duration-500"
                style={{ opacity: activeLayers.clusters ? 1 : 0 }}
              >
                <circle cx="320" cy="160" r="28" className="fill-emerald-500/60 stroke-amber-200 stroke-[1.5]" />
                <circle cx="420" cy="140" r="32" className="fill-emerald-500/60 stroke-amber-200 stroke-[1.5]" />
                <circle cx="460" cy="220" r="30" className="fill-emerald-500/60 stroke-amber-200 stroke-[1.5]" />
                <circle cx="380" cy="270" r="26" className="fill-emerald-500/60 stroke-amber-200 stroke-[1.5]" />
                <text x="320" y="163" fill="#F8F6F0" fontSize="8" textAnchor="middle" fontWeight="600" fontFamily="sans-serif">CLUSTER 1</text>
                <text x="420" y="143" fill="#F8F6F0" fontSize="8" textAnchor="middle" fontWeight="600" fontFamily="sans-serif">CLUSTER 2</text>
                <text x="460" y="223" fill="#F8F6F0" fontSize="8" textAnchor="middle" fontWeight="600" fontFamily="sans-serif">CLUSTER 3</text>
                <text x="380" y="273" fill="#F8F6F0" fontSize="8" textAnchor="middle" fontWeight="600" fontFamily="sans-serif">CLUSTER 4</text>
              </g>

              {/* Layer 4: Plantations */}
              <g
                className="transition-opacity duration-500"
                style={{ opacity: activeLayers.plantations ? 1 : 0 }}
              >
                <path d="M 260,120 Q 300,90 350,110 T 450,100 L 430,130 Q 350,140 270,140 Z" className="fill-emerald-800/40 stroke-amber-500/30 stroke-[1]" />
                <path d="M 370,280 Q 400,300 450,290 L 440,310 L 360,315 Z" className="fill-emerald-800/40 stroke-amber-500/30 stroke-[1]" />
                <text x="350" y="125" fill="#D4B66A" fontSize="9" fontStyle="italic" textAnchor="middle">Cashew Agro Forests</text>
                <text x="410" y="303" fill="#D4B66A" fontSize="8" fontStyle="italic" textAnchor="middle">Spice Zones</text>
              </g>

              {/* Layer 5: Hydrology */}
              <g
                className="transition-opacity duration-500"
                style={{ opacity: activeLayers.water ? 1 : 0 }}
              >
                <path d="M 320,80 Q 340,140 370,210 T 420,350" className="fill-none stroke-blue-500 stroke-[3]" style={{ filter: "drop-shadow(0 0 5px rgba(59,130,246,0.6))" }} />
                <path d="M 480,150 Q 420,180 370,210" className="fill-none stroke-blue-500 stroke-[1.5] stroke-dasharray-[4,4]" />
                <text x="335" y="180" fill="#4A90E2" fontSize="8" transform="rotate(70, 335, 180)">Valley Stream</text>
              </g>

              {/* Layer 6: Wellness Retreat */}
              <g
                className="transition-opacity duration-500"
                style={{ opacity: activeLayers.wellness ? 1 : 0 }}
              >
                <circle cx="430" cy="180" r="8" className="fill-amber-500 stroke-stone-100 stroke-2" />
                <text x="430" y="202" fill="#F8F6F0" fontSize="8" fontWeight="600" textAnchor="middle">WELLNESS CENTER</text>
                <polygon points="490,120 495,130 485,130" className="fill-amber-400 stroke-stone-100 stroke-[1]" />
                <text x="490" y="142" fill="#D4B66A" fontSize="8" textAnchor="middle">RIDGE VIEW DECK</text>
              </g>
            </svg>

            <span className="absolute bottom-4 left-4 bg-stone-950/80 border border-amber-500/30 text-amber-200 text-[9px] uppercase tracking-wider px-3 py-1.5 rounded backdrop-blur-md">
              Conceptual masterplan overlay. Final layout subject to survey.
            </span>
          </div>

          {/* Controls Panel */}
          <div className="bg-stone-950/50 border-l border-amber-500/20 p-8 flex flex-col gap-8 justify-center">
            <h4 className="font-serif text-xl text-amber-200 border-bottom border-amber-500/20 pb-3">
              Layer Controls
            </h4>
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 text-xs tracking-wider uppercase cursor-pointer text-stone-300 hover:text-stone-100 transition-colors duration-200"
                >
                  <input
                    type="checkbox"
                    checked={activeLayers[item.id] || false}
                    onChange={() => toggleLayer(item.id)}
                    className="hidden"
                  />
                  <span
                    className={`w-[18px] h-[18px] border border-amber-500 rounded flex items-center justify-center transition-all duration-350 ${
                      activeLayers[item.id]
                        ? "bg-amber-500 border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                        : "bg-transparent"
                    }`}
                  >
                    {activeLayers[item.id] && (
                      <span className="text-[10px] text-emerald-950 font-bold">✓</span>
                    )}
                  </span>
                  {item.label}
                </label>
              ))}
            </div>
            <p className="text-[10px] text-stone-400 leading-normal italic mt-2">
              Preliminary map reference only. Final verification required.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default MasterplanOverlaySection;
