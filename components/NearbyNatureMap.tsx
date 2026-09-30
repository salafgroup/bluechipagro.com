"use client";

import React, { useEffect, useState } from "react";

export interface NearbyLandmark {
  name: string;
  lat: number;
  lng: number;
  primary?: boolean;
  note: string;
}

export interface NearbyNatureMapProps {
  className?: string;
  kmlPath?: string;
  landmarks?: NearbyLandmark[];
}

export const defaultLandmarks: NearbyLandmark[] = [
  { name: "Project Site (preliminary)", lat: 15.0812, lng: 74.2378, primary: true,
    note: "Plot 109/0 — Neturlim. Preliminary boundary as per KML reference. Preliminary map reference only." },
  { name: "Neturlim Village Reference", lat: 15.0625, lng: 74.2260,
    note: "Nearest village reference. Preliminary map reference only." },
  { name: "Netravali Wildlife Sanctuary Region", lat: 15.0580, lng: 74.2220,
    note: "Protected forest edge. The project is near, NOT inside sanctuary land. Preliminary map reference only." },
  { name: "Mainapi Waterfall Reference", lat: 15.0410, lng: 74.2320,
    note: "Lush waterfall nature attraction in surrounding region. Preliminary map reference only." },
  { name: "Neturlem Waterfall / Savri", lat: 15.0540, lng: 74.2130,
    note: "Scenic nature-tourism landmark near Neturlim. Preliminary map reference only." },
  { name: "Babu Waterfall Reference", lat: 15.1030, lng: 74.2300,
    note: "Nearby waterfall belt. Preliminary map reference only." },
  { name: "Netravali Bubbling Lake", lat: 15.0890, lng: 74.2130,
    note: "Unique local water body in Netravali region. Preliminary map reference only." },
  { name: "Salaulim Dam", lat: 15.1800, lng: 74.1300,
    note: "Major regional reservoir reference. Preliminary map reference only." }
];

export const NearbyNatureMap: React.FC<NearbyNatureMapProps> = ({
  className = "",
  kmlPath = "/kml/project-boundary.kml",
  landmarks = defaultLandmarks,
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load Leaflet and setup map inside client-side effect
    import("leaflet").then((L) => {
      // Setup styles dynamically if they aren't pre-loaded
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);

      const mountPoint = document.getElementById("leaflet-react-mount");
      if (!mountPoint) return;

      const map = L.map(mountPoint, {
        center: [15.0812, 74.2378],
        zoom: 13,
        scrollWheelZoom: false,
        attributionControl: true
      });

      // Esri Satellite imagery
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { attribution: "Tiles © Esri — World Imagery", maxZoom: 18 }
      ).addTo(map);

      // Place labels
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        { attribution: "", maxZoom: 18, opacity: 0.8 }
      ).addTo(map);

      // KML Boundary loading
      fetch(kmlPath)
        .then((res) => res.text())
        .then((text) => {
          const xml = new DOMParser().parseFromString(text, "text/xml");
          const coordinatesNode = xml.querySelector("Polygon coordinates");
          if (!coordinatesNode) return;
          
          const rawCoords = coordinatesNode.textContent?.trim() || "";
          const coordinates = rawCoords.split(/\s+/).map((pt) => {
            const parts = pt.split(",");
            if (parts.length < 2) return null;
            return [parseFloat(parts[1]), parseFloat(parts[0])] as [number, number];
          }).filter((pt): pt is [number, number] => pt !== null);

          const polygon = L.polygon(coordinates, {
            color: "#B08A3E",
            weight: 3,
            opacity: 0.95,
            fillColor: "#10291F",
            fillOpacity: 0.22
          }).addTo(map);

          polygon.bindPopup(`
            <div style="font-family:sans-serif;font-size:13px;color:#242424;line-height:1.6;">
              <strong style="font-family:serif;font-size:15px;color:#10291F;display:block;margin-bottom:4px;border-bottom:1px solid rgba(176,138,62,0.2);padding-bottom:3px;">
                Preliminary Boundary Overlay
              </strong>
              Plot 109/0 — Neturlim Valley<br>
              <em style="font-size:11px;color:#6B6B6B;">KML Project reference only. Subject to official survey. Preliminary map reference only.</em>
            </div>
          `);
          map.fitBounds(polygon.getBounds(), { padding: [40, 40] });
        })
        .catch((err) => console.warn("React Leaflet KML overlay load skipped:", err));

      // Custom markers
      const goldDot = L.divIcon({
        className: "leaflet-lux-marker",
        html: '<div style="background:#B08A3E;color:#FBF8F1;border:2px solid #10291F;border-radius:50%;width:18px;height:18px;box-shadow:0 0 10px rgba(176,138,62,0.6);"></div>',
        iconSize: [20, 20], iconAnchor: [10, 10]
      });

      const primaryStar = L.divIcon({
        className: "leaflet-lux-primary",
        html: '<div style="background:#10291F;color:#D4B66A;border:2.5px solid #B08A3E;border-radius:50%;width:26px;height:26px;box-shadow:0 0 15px rgba(176,138,62,0.8);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;">★</div>',
        iconSize: [30, 30], iconAnchor: [15, 15]
      });

      landmarks.forEach((ref) => {
        const marker = L.marker([ref.lat, ref.lng], { icon: ref.primary ? primaryStar : goldDot }).addTo(map);
        marker.bindPopup(`
          <div style="font-family:sans-serif;font-size:13px;color:#242424;line-height:1.6;">
            <strong style="font-family:serif;font-size:15px;color:#10291F;display:block;margin-bottom:4px;border-bottom:1px solid rgba(176,138,62,0.2);padding-bottom:3px;">
              ${ref.name}
            </strong>
            ${ref.note}
          </div>
        `);
      });

      map.on("click", () => map.scrollWheelZoom.enable());
      map.on("mouseout", () => map.scrollWheelZoom.disable());

      setMapLoaded(true);
    });
  }, [kmlPath, landmarks]);

  return (
    <section className={`py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-emerald-950/25 border border-amber-500/25 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="p-8 md:p-12 border-b border-amber-500/15 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="inline-block text-[10px] uppercase tracking-widest text-amber-500 font-semibold mb-2">
                GIS Regional Reference Map
              </span>
              <h4 className="font-serif text-3xl text-stone-100 font-light leading-tight">
                Regional Coordinates &amp; KML Boundary
              </h4>
              <p className="text-stone-300/70 text-sm font-light mt-3 max-w-3xl leading-relaxed">
                Interactive satellite view rendering the preliminary KML project boundary overlay and core nature references. Surrounding region reference only. The project is near but <strong className="text-amber-300 font-medium">NOT</strong> inside the Netravali Wildlife Sanctuary. Preliminary map reference only. Final verification required.
              </p>
            </div>
            <a
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-stone-100 text-emerald-950 hover:text-emerald-950 border border-amber-500 hover:border-stone-100 px-6 py-3.5 text-xs font-semibold uppercase tracking-widest rounded transition-all duration-300"
              href={kmlPath}
              download
            >
              ↓ Download KML
            </a>
          </div>

          <div
            id="leaflet-react-mount"
            className="w-full h-[580px] bg-emerald-950/10"
            role="img"
            aria-label="Leaflet interactive satellite map showing the Reserva Varde Goa project boundary"
          >
            {!mapLoaded && (
              <div className="w-full h-full flex items-center justify-center text-amber-500/60 font-light text-sm tracking-wider">
                Loading Interactive GIS Engine...
              </div>
            )}
          </div>
          
          <div className="p-6 md:px-12 bg-emerald-950/30 border-t border-amber-500/15 text-xs leading-relaxed text-stone-400/80 font-light italic">
            Preliminary map reference only. Map boundary coordinates, waterfall positions, and village pathways are approximate and for visual reference. Final legal boundaries, zoning, and forest statuses must be independently verified by certified government surveys.
          </div>
        </div>
      </div>
    </section>
  );
};

export default NearbyNatureMap;
