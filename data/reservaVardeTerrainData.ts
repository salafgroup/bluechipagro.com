/**
 * Configuration mapping for the georeferenced Reserva Varde Goa Terrain Navigator.
 */

export interface TerrainLayer {
  id: string;
  label: string;
  title: string;
  description: string;
  planningValue: string;
  investorRelevance: string;
  verification: string;
  accentColor: string;
}

export interface MapMarker {
  id: string;
  label: string;
  type: 'project' | 'village' | 'landmark';
  description: string;
  coords: { lng: number; lat: number; alt?: number };
}

export const terrainLayers: TerrainLayer[] = [
  {
    id: "satellite",
    label: "SATELLITE TERRAIN",
    title: "Satellite Terrain",
    description: "Explore the forested valley terrain of Reserva Varde Goa, shaped by ridges, slopes, valleys, and dense green cover. Standard oblique 3D satellite modeling mapping Sanguem's scenic mountain outlines.",
    planningValue: "Contours and visual buffers determine private boundary protection and acoustic isolation.",
    investorRelevance: "Ensures visual confidentiality, massive canopy buffers, and scenic integration for high-end resort or agricultural development.",
    verification: "Preliminary map reference only. Final site verification required.",
    accentColor: "#c2a878"
  },
  {
    id: "boundary",
    label: "PROJECT BOUNDARY",
    title: "Survey 109 Project Boundary",
    description: "Boundary imported from the uploaded Google Earth KML file for planning visualization. Outlines the 1000-acre valley estate limits around Plot 109/0.",
    planningValue: "Defines the exact coordinates of Plot 109/0, featuring 253 vertices for professional demarcation planning.",
    investorRelevance: "Secures title visibility, planning clarity, and clear buffer zones matching legal survey records.",
    verification: "KML/GIS boundary; official demarcation and physical survey by DSLR required.",
    accentColor: "#ff4d5a"
  },
  {
    id: "elevation",
    label: "ELEVATION / RIDGE",
    title: "Elevation & Ridge Analysis",
    description: "3D topography contour mapping detailing high ridges, valley drainage flows, steep slopes, and developable pockets. Key for solar paths and visual sightlines.",
    planningValue: "Contour bands identify high points for view deck structures and gentle slopes for low-impact modular housings.",
    investorRelevance: "Maximizes panoramic valley viewpoints while protecting critical soil, ridge lines, and hydrology buffers.",
    verification: "Conceptual elevation interpretation based on Google Earth/QGIS reference. DEM integration pending.",
    accentColor: "#4a90e2"
  },
  {
    id: "waterfalls",
    label: "WATERFALL BELT",
    title: "Waterfall & Nature Belt Map",
    description: "Nature mapping indicating nearby eco-attractions including Mainapi, Savri, and Babu waterfalls, Bubbling Lake, and protected sanctuary landscapes.",
    planningValue: "Highlights regional connectivity to pristine waterfalls and fresh headwater streams.",
    investorRelevance: "Unrivaled premium positioning near eco-tourism landmarks without encroaching on protected forest zones.",
    verification: "Provisional water-flow interpretation — field verification required.",
    accentColor: "#4caf50"
  },
  {
    id: "access",
    label: "ACCESS ROUTES",
    title: "Access & Connectivity Routes",
    description: "Planning access routes to follow contours, avoiding heavy road-cutting or water runoff streams. Outlines paths for eco-buggies, hiking, and emergency vehicles.",
    planningValue: "Maintains natural terrain without concrete intrusion. Minimizes soil erosion and preserves natural canopy cover.",
    investorRelevance: "Ensures premium, organic, secure ingress/egress roads matching green resort protocols.",
    verification: "Conceptual access route. Final alignment requires ground survey, slope study, forest/TCP, and road-access verification.",
    accentColor: "#ffa726"
  },
  {
    id: "clusters",
    label: "ESTATE CLUSTERS",
    title: "Estate Clusters Conceptual Layout",
    description: "Zoning proposal representing private 1-acre modular estate clusters, managed agro-forestry zones, cashew/teak plantations, and visual buffer belts.",
    planningValue: "Low-density 1-acre eco-estate clusters are planned around privacy, terrain suitability, wellness, and conservation.",
    investorRelevance: "Strict caps on layout density assure long-term asset rarity, HNI value appreciation, and true natural luxury.",
    verification: "Conceptual cluster placement only. Final layout subject to contour survey, legal approval, land-use permission, forest/ESZ verification, and licensed master planning.",
    accentColor: "#81c784"
  }
];

export const projectMarkers: MapMarker[] = [
  {
    id: "goa3400",
    label: "GOA 3400 PROPERTY",
    type: "project",
    description: "Primary project location reference inside Plot 109/0.",
    coords: { lng: 74.247396, lat: 15.085859, alt: 429.13 }
  },
  {
    id: "neturlim",
    label: "Neturlim Village Reference",
    type: "village",
    description: "Nearest regional hub reference for infrastructure connectivity.",
    coords: { lng: 74.237802, lat: 15.081329 }
  }
];
