/**
 * Survey 109 Leaflet Map Layers & Style Definitions
 */

export interface MapLayerMeta {
  id: string;
  title: string;
  description: string;
  planningValue: string;
  investorRelevance: string;
  verification: string;
}

export const SURVEY_MAP_LAYERS: MapLayerMeta[] = [
  {
    id: "satellite",
    title: "Satellite Terrain Context",
    description: "Explore the real georeferenced Survey No. 109 forested valley terrain of Reserva Varde Goa, shaped by ridges, slopes, and dense green cover. Fully linked to actual Google Earth satellite tiles.",
    planningValue: "Contours and visual buffers determine private boundary protection and acoustic isolation.",
    investorRelevance: "Ensures visual confidentiality, massive canopy buffers, and scenic integration for high-end resort or agricultural development.",
    verification: "Live georeferenced satellite survey map."
  },
  {
    id: "boundary",
    title: "Plot 109/0 Project Boundary",
    description: "Boundary imported directly from the Google Earth KML file. Outlines the 1000-acre valley estate limits around Plot 109/0 with 253 georeferenced coordinates.",
    planningValue: "Defines the exact coordinates of Plot 109/0, featuring 253 vertices for professional demarcation planning.",
    investorRelevance: "Secures title visibility, planning clarity, and clear buffer zones matching legal survey records.",
    verification: "Plot 109/0 KML boundary; DSLR official demarcation and physical survey required."
  },
  {
    id: "elevation",
    title: "Elevation & Ridge Analysis",
    description: "Live topographic contour base mapping detailing Sanguem Taluka's high ridges, valley drainage flows, steep slopes, and developable pockets. Connected to public topographic datasets.",
    planningValue: "Topographic contour maps identify high points for view deck structures and gentle slopes for low-impact modular housings.",
    investorRelevance: "Maximizes panoramic valley viewpoints while protecting critical soil, ridge lines, and hydrology buffers.",
    verification: "Elevation interpretation is conceptual unless DEM/QGIS contour data is connected."
  },
  {
    id: "waterfalls",
    title: "Waterfall & Nature Belt Map",
    description: "GIS nature mapping indicating nearby Surrounding eco-attractions including Mainapi, Savri, and Babu waterfalls, Bubbling Lake, and protected sanctuary landscapes.",
    planningValue: "Highlights regional connectivity to pristine waterfalls and fresh headwater streams.",
    investorRelevance: "Unrivaled premium positioning near eco-tourism landmarks without encroaching on protected forest zones.",
    verification: "Approximate reference — field verification required."
  },
  {
    id: "access",
    title: "Access & Connectivity Routes",
    description: "Ingress routes following natural contours to avoid heavy road-cutting or water runoffs. Mapped over actual South Goa geographic road alignments.",
    planningValue: "Maintains natural terrain without concrete intrusion. Minimizes soil erosion and preserves natural canopy cover.",
    investorRelevance: "Ensures premium, organic, secure ingress/egress roads matching green resort protocols.",
    verification: "Conceptual access route. Final alignment requires DSLR survey and TCP road-access verification."
  },
  {
    id: "clusters",
    title: "Estate Clusters Conceptual Layout",
    description: "Zoning proposal representing private 1-acre modular estate clusters, wellness villa clusters, cashew/teak plantations, and visual conservation buffer zones.",
    planningValue: "Low-density 1-acre eco-estate clusters are planned around privacy, terrain suitability, wellness, and conservation.",
    investorRelevance: "Strict caps on layout density assure long-term asset rarity, HNI value appreciation, and true natural luxury.",
    verification: "Conceptual cluster placement strictly inside KML boundary limits. approvals required."
  }
];

export interface TileLayerConfig {
  url: string;
  attribution: string;
  maxZoom: number;
}

export const BASE_TILE_LAYERS: Record<"satellite" | "topo" | "osm", TileLayerConfig> = {
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP",
    maxZoom: 18
  },
  topo: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: "Map data: © OpenStreetMap contributors, SRTM | Style: © OpenTopoMap",
    maxZoom: 17
  },
  osm: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors",
    maxZoom: 19
  }
};

/**
 * Gets exact Leaflet polygon style depending on which tab is active
 */
export function getPolygonStyleForTab(tabIndex: number) {
  switch (tabIndex) {
    case 1: // PROJECT BOUNDARY (Highlight strongly!)
      return {
        color: "#ff4d5a", // Strong red neon border highlight
        weight: 3.5,
        opacity: 0.95,
        fillColor: "#ff4d5a",
        fillOpacity: 0.12
      };
    case 2: // ELEVATION / RIDGE
      return {
        color: "#4a90e2",
        weight: 2,
        opacity: 0.8,
        fillColor: "#4a90e2",
        fillOpacity: 0.05
      };
    case 5: // ESTATE CLUSTERS
      return {
        color: "#81c784",
        weight: 1.8,
        opacity: 0.8,
        fillColor: "#81c784",
        fillOpacity: 0.08
      };
    default:
      return {
        color: "#c2a878", // premium gold
        weight: 1.5,
        opacity: 0.65,
        fillColor: "#10291F",
        fillOpacity: 0.05
      };
  }
}
