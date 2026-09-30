"use client";

import React, { useState } from "react";
import MapLayerTabs from "./MapLayerTabs";

export interface MapLayer {
  id: string;
  title: string;
  image: string;
  description: string;
}

export interface TerrainMapViewerProps {
  className?: string;
  layers?: MapLayer[];
}

export const defaultMapLayers: MapLayer[] = [
  {
    id: "terrain",
    title: "Satellite Terrain Context",
    image: "/images/location/google-earth-satellite.png",
    description: "A cinematic high-resolution Google Earth satellite terrain perspective depicting Sanguem Taluka's Neturlim valley contours. Outlines the raw topography, verdant jungle cover, and high ridges that protect this proposed forest-valley retreat zone. Preliminary map reference only. Final verification required."
  },
  {
    id: "boundary",
    title: "Project Boundary Overlay",
    image: "/images/location/red-boundary-map.png",
    description: "Preliminary boundary overlay based on uploaded KML and Google Earth references. Highlights the proposed 1000-acre private estate boundary near Neturlim village. Subject to final survey and demarcation by licensed surveyors. Preliminary map reference only. Final verification required."
  },
  {
    id: "elevation",
    title: "Elevation & Ridge Interpretation",
    image: "/images/location/terrain-elevations.png",
    description: "High-resolution elevation contour-map depicting high ridges, valleys, and buildable slopes. Crucial for estate orientation, natural water drainage mapping, and forest canopy sightlines. Preliminary map reference only. Final verification required."
  },
  {
    id: "waterfalls",
    title: "Waterfall & Nature Belt Map",
    image: "/images/location/red-boundary-map.png",
    description: "Nature reference map showing nearby waterfall belts (Mainapi, Babu, Savri), natural bubbling lake, and Netravali sanctuary edges. Strengthens destination eco-tourism appeal without encroaching on protected land. Preliminary map reference only. Final verification required."
  },
  {
    id: "access",
    title: "Access & Regional Connectivity",
    image: "/images/location/neturlim-map-view-03.svg",
    description: "Infrastructure routes mapping key access roads linking the Neturlim valley to Sanguem town, Salaulim Reservoir, Canacona coastal highway, and wider Goan networks. Preliminary map reference only. Final verification required."
  },
  {
    id: "clusters",
    title: "Estate Cluster Conceptual Layout",
    image: "/images/location/neturlim-map-view-01.svg",
    description: "Zoning proposal representing private 1-acre modular estate clusters, managed cashew/teak plantations, eco-sanitation zones, and nature corridors. Subject to contours and approvals. Preliminary map reference only. Final verification required."
  }
];

export const TerrainMapViewer: React.FC<TerrainMapViewerProps> = ({
  className = "",
  layers = defaultMapLayers,
}) => {
  const [activeTab, setActiveTab] = useState(layers[0]?.id || "terrain");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const activeLayer = layers.find((layer) => layer.id === activeTab) || layers[0];

  const handleTabChange = (tabId: string) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab(tabId);
      setIsTransitioning(false);
    }, 250);
  };

  const tabs = layers.map((layer) => ({ id: layer.id, title: layer.title }));

  return (
    <section className={`py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-emerald-950/20 border border-amber-500/20 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-[280px_1fr] shadow-2xl backdrop-blur-sm">
          
          {/* Left Tabs Panel */}
          <MapLayerTabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={handleTabChange}
            className="border-0 border-r border-amber-500/10 rounded-none bg-stone-950/45 p-6"
          />

          {/* Right Display Panel */}
          <div className="p-8 md:p-12 flex flex-col gap-8 bg-emerald-950/5">
            <div className="relative w-full aspect-video bg-stone-950 border border-amber-500/15 rounded-xl overflow-hidden shadow-inner">
              <span className="absolute bottom-4 right-4 bg-stone-950/80 border border-amber-500/35 text-amber-200 text-[9px] uppercase font-semibold tracking-widest px-3 py-1.5 rounded z-10 backdrop-blur-md">
                Preliminary map reference only. Final verification required.
              </span>
              
              <img
                src={activeLayer.image}
                alt={activeLayer.title}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  isTransitioning ? "opacity-0" : "opacity-100"
                }`}
              />
            </div>

            <div className="border-t border-amber-500/10 pt-6">
              <h4 className="font-serif text-2xl text-amber-200 font-light mb-3">
                {activeLayer.title}
              </h4>
              <p className="text-stone-300/80 text-sm font-light leading-relaxed">
                {activeLayer.description}
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default TerrainMapViewer;
