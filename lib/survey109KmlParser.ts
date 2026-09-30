/**
 * Survey 109 KML Parser
 * Strictly typed georeferenced parser for /data/survey-no-109.kml
 */

export interface Coordinate {
  lat: number;
  lng: number;
  alt?: number;
}

export interface KmlData {
  boundary: Coordinate[];
  bounds: {
    minLng: number;
    maxLng: number;
    minLat: number;
    maxLat: number;
  };
  markers: {
    goa3400?: Coordinate;
    neturlim?: Coordinate;
  };
}

/**
 * Split coordinate string from KML coordinates node using standard whitespace splitter
 */
export function parseKmlCoordinates(coordsStr: string): Coordinate[] {
  if (!coordsStr) return [];
  const pts = coordsStr.trim().split(/\s+/).filter(Boolean);
  const result: Coordinate[] = [];
  pts.forEach(pt => {
    const parts = pt.split(",");
    if (parts.length >= 2) {
      const lng = parseFloat(parts[0]);
      const lat = parseFloat(parts[1]);
      const alt = parts.length > 2 ? parseFloat(parts[2]) : undefined;
      if (!isNaN(lng) && !isNaN(lat)) {
        result.push({ lat, lng, alt });
      }
    }
  });
  return result;
}

/**
 * Parse KML string contents into unified KmlData structure
 */
export function parseKmlDocument(kmlText: string): KmlData {
  const parser = new DOMParser();
  const xml = parser.parseFromString(kmlText, "text/xml");
  
  const parseError = xml.querySelector("parsererror");
  if (parseError) {
    throw new Error("XML parser failed to read KML format.");
  }

  const placemarks = xml.querySelectorAll("Placemark");
  const candidatePlacemarks: { name: string; pts: Coordinate[]; priority: number; count: number }[] = [];
  let goa3400: Coordinate | undefined;
  let neturlim: Coordinate | undefined;

  placemarks.forEach(pm => {
    const nameNode = pm.querySelector("name");
    const name = nameNode ? nameNode.textContent?.trim() || "" : "";
    
    const coordsNodes = pm.querySelectorAll("coordinates");
    let allPts: Coordinate[] = [];
    coordsNodes.forEach(node => {
      if (node.textContent) {
        const pts = parseKmlCoordinates(node.textContent);
        allPts = allPts.concat(pts);
      }
    });

    if (allPts.length > 0) {
      if (name.includes("GOA 3400 PROPERTY")) {
        goa3400 = allPts[0];
      } else if (name.includes("Neturlim")) {
        neturlim = allPts[0];
      } else {
        let priority = 3;
        if (name.includes("Plot 109/0 Boundary")) {
          priority = 1;
        } else if (name.includes("109")) {
          priority = 2;
        }
        candidatePlacemarks.push({
          name,
          pts: allPts,
          priority,
          count: allPts.length
        });
      }
    }
  });

  candidatePlacemarks.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return b.count - a.count;
  });

  const selected = candidatePlacemarks[0];
  
  if (!selected || selected.count < 100) {
    const count = selected ? selected.count : 0;
    throw new Error(`Boundary parser failed: selected geometry has only ${count} coordinates. Expected 200+ boundary vertices.`);
  }

  const boundary = selected.pts;

  let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
  boundary.forEach(pt => {
    if (pt.lng < minLng) minLng = pt.lng;
    if (pt.lng > maxLng) maxLng = pt.lng;
    if (pt.lat < minLat) minLat = pt.lat;
    if (pt.lat > maxLat) maxLat = pt.lat;
  });

  return {
    boundary,
    bounds: { minLng, maxLng, minLat, maxLat },
    markers: { goa3400, neturlim }
  };
}
