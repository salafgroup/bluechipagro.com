/**
 * GIS Utility to load and parse SURVEY NO 109 KML boundary data.
 * Exposes loadSurvey109Kml() for Next.js / React integration.
 */

export interface Coordinate {
  lng: number;
  lat: number;
  alt?: number;
}

export interface BoundingBox {
  minLng: number;
  maxLng: number;
  minLat: number;
  maxLat: number;
}

export interface KmlAnalysis {
  boundary: Coordinate[];
  center: Coordinate;
  bounds: BoundingBox;
  aspectRatio: number;
  markers: {
    goa3400?: Coordinate;
    neturlim?: Coordinate;
  };
  error?: string;
}

/**
 * Fetches and parses SURVEY NO 109 KML file.
 * Returns coordinates, bounding box, center, and markers.
 */
export async function loadSurvey109Kml(
  primaryUrl: string = '/data/survey-no-109.kml',
  fallbackUrl: string = '/kml/project-boundary.kml'
): Promise<KmlAnalysis> {
  try {
    // SSR Safe Check
    if (typeof window === 'undefined') {
      return getKmlLocalStaticFallback();
    }

    let response = await fetch(primaryUrl);
    if (!response.ok) {
      console.warn(`Primary KML fetch failed (${primaryUrl}), trying fallback (${fallbackUrl})...`);
      response = await fetch(fallbackUrl);
    }
    
    if (!response.ok) {
      throw new Error(`Failed to load KML boundary from either primary or fallback paths.`);
    }

    const text = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'text/xml');
    
    // Check for parsing errors
    const parseError = xml.querySelector('parsererror');
    if (parseError) {
      throw new Error('XML parsing failed for the KML file.');
    }

    const placemarks = xml.getElementsByTagName('Placemark');
    const candidatePlacemarks: { name: string; pts: Coordinate[]; priority: number; count: number }[] = [];
    let goa3400: Coordinate | undefined;
    let neturlim: Coordinate | undefined;

    for (let i = 0; i < placemarks.length; i++) {
      const pm = placemarks[i];
      
      const nameNode = pm.getElementsByTagName('name')[0];
      const name = nameNode ? nameNode.textContent?.trim() || '' : '';

      const coordNodes = pm.getElementsByTagName('coordinates');
      let allPts: Coordinate[] = [];
      for (let j = 0; j < coordNodes.length; j++) {
        const pts = parseCoordsText(coordNodes[j].textContent || '');
        allPts = allPts.concat(pts);
      }

      if (allPts.length > 0) {
        if (name.includes('GOA 3400 PROPERTY')) {
          goa3400 = allPts[0];
        } else if (name.includes('Neturlim')) {
          neturlim = allPts[0];
        } else {
          let priority = 3;
          if (name.includes('Plot 109/0 Boundary')) {
            priority = 1;
          } else if (name.includes('109')) {
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
    }

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

    return calculateKmlMetrics(boundary, goa3400, neturlim);
  } catch (error: any) {
    console.error('loadSurvey109Kml parser error, running static boundary fallback:', error.message);
    const fallback = getKmlLocalStaticFallback();
    fallback.error = `Survey 109 KML boundary could not be loaded. (${error.message})`;
    return fallback;
  }
}

/**
 * Helper to split KML coords text into Coordinate objects
 */
function parseCoordsText(text: string): Coordinate[] {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((pt): Coordinate | null => {
      const parts = pt.split(',');
      if (parts.length < 2) return null;
      return {
        lng: parseFloat(parts[0]),
        lat: parseFloat(parts[1]),
        alt: parts.length > 2 ? parseFloat(parts[2]) : undefined
      };
    })
    .filter((x): x is Coordinate => x !== null);
}

/**
 * Calculates center point, bounding box, and aspect ratio of KML boundary polygon
 */
function calculateKmlMetrics(
  boundary: Coordinate[],
  goa3400?: Coordinate,
  neturlim?: Coordinate
): KmlAnalysis {
  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  boundary.forEach(pt => {
    if (pt.lng < minLng) minLng = pt.lng;
    if (pt.lng > maxLng) maxLng = pt.lng;
    if (pt.lat < minLat) minLat = pt.lat;
    if (pt.lat > maxLat) maxLat = pt.lat;
  });

  const bounds: BoundingBox = { minLng, maxLng, minLat, maxLat };
  
  // Calculate center coordinate
  const center: Coordinate = {
    lng: (minLng + maxLng) / 2,
    lat: (minLat + maxLat) / 2
  };

  // Aspect ratio calculation (with latitude scaling factor to prevent distortion)
  const latScale = Math.cos((center.lat * Math.PI) / 180);
  const widthDeg = (maxLng - minLng) * latScale;
  const heightDeg = maxLat - minLat;
  const aspectRatio = heightDeg !== 0 ? widthDeg / heightDeg : 1.6;

  return {
    boundary,
    center,
    bounds,
    aspectRatio,
    markers: {
      goa3400,
      neturlim
    }
  };
}

/**
 * Robust georeferenced fallback coordinating with the real SURVEY NO 109 KML coordinates.
 */
export function getKmlLocalStaticFallback(): KmlAnalysis {
  const boundary: Coordinate[] = [
    { lng: 74.2456919, lat: 15.0599875 },
    { lng: 74.2449282, lat: 15.0601173 },
    { lng: 74.2441409, lat: 15.0598978 },
    { lng: 74.2433579, lat: 15.0593980 },
    { lng: 74.2429345, lat: 15.0592911 },
    { lng: 74.2422204, lat: 15.0592049 },
    { lng: 74.2415162, lat: 15.0590483 },
    { lng: 74.2407519, lat: 15.0587289 },
    { lng: 74.2403668, lat: 15.0584742 },
    { lng: 74.2400305, lat: 15.0583488 },
    { lng: 74.2396112, lat: 15.0582236 },
    { lng: 74.2391060, lat: 15.0582377 },
    { lng: 74.2384737, lat: 15.0585141 },
    { lng: 74.2380313, lat: 15.0588667 },
    { lng: 74.2374665, lat: 15.0593683 },
    { lng: 74.2370701, lat: 15.0598129 },
    { lng: 74.2366898, lat: 15.0601736 },
    { lng: 74.2363714, lat: 15.0604107 },
    { lng: 74.2359400, lat: 15.0608035 },
    { lng: 74.2356133, lat: 15.0611843 },
    { lng: 74.2352843, lat: 15.0615967 },
    { lng: 74.2349781, lat: 15.0619946 },
    { lng: 74.2344799, lat: 15.0624021 },
    { lng: 74.2340328, lat: 15.0628224 },
    { lng: 74.2335805, lat: 15.0632688 },
    { lng: 74.2330752, lat: 15.0637130 },
    { lng: 74.2327042, lat: 15.0640954 },
    { lng: 74.2323049, lat: 15.0643764 },
    { lng: 74.2319349, lat: 15.0646197 },
    { lng: 74.2315664, lat: 15.0647895 },
    { lng: 74.2310153, lat: 15.0649774 },
    { lng: 74.2304523, lat: 15.0652077 },
    { lng: 74.2299298, lat: 15.0653695 },
    { lng: 74.2292723, lat: 15.0655860 },
    { lng: 74.2285888, lat: 15.0657989 },
    { lng: 74.2280261, lat: 15.0660424 },
    { lng: 74.2274488, lat: 15.0664656 },
    { lng: 74.2270919, lat: 15.0669228 },
    { lng: 74.2269279, lat: 15.0673412 },
    { lng: 74.2267860, lat: 15.0678972 },
    { lng: 74.2267860, lat: 15.0684110 },
    { lng: 74.2269201, lat: 15.0689437 },
    { lng: 74.2271871, lat: 15.0694119 },
    { lng: 74.2276707, lat: 15.0700057 },
    { lng: 74.2281987, lat: 15.0706240 },
    { lng: 74.2285556, lat: 15.0711904 },
    { lng: 74.2288078, lat: 15.0716893 },
    { lng: 74.2290748, lat: 15.0722137 },
    { lng: 74.2293270, lat: 15.0727125 },
    { lng: 74.2295940, lat: 15.0732367 },
    { lng: 74.2298754, lat: 15.0737482 },
    { lng: 74.2301938, lat: 15.0742468 },
    { lng: 74.2305862, lat: 15.0747447 },
    { lng: 74.2310153, lat: 15.0752554 },
    { lng: 74.2314594, lat: 15.0757277 },
    { lng: 74.2318883, lat: 15.0762261 },
    { lng: 74.2323472, lat: 15.0767375 },
    { lng: 74.2327759, lat: 15.0772359 },
    { lng: 74.2331526, lat: 15.0777995 },
    { lng: 74.2335967, lat: 15.0782717 },
    { lng: 74.2340552, lat: 15.0787830 },
    { lng: 74.2344837, lat: 15.0792813 },
    { lng: 74.2349277, lat: 15.0797534 },
    { lng: 74.2358145, lat: 15.0807627 },
    { lng: 74.2366869, lat: 15.0817329 },
    { lng: 74.2384460, lat: 15.0837123 },
    { lng: 74.2402052, lat: 15.0856917 },
    { lng: 74.2428512, lat: 15.0886803 },
    { lng: 74.2450688, lat: 15.0911710 },
    { lng: 74.2476901, lat: 15.0941320 },
    { lng: 74.2493393, lat: 15.0953603 },
    { lng: 74.2505504, lat: 15.0955562 },
    { lng: 74.2512638, lat: 15.0943900 },
    { lng: 74.2503254, lat: 15.0929221 },
    { lng: 74.2485483, lat: 15.0923612 },
    { lng: 74.2464471, lat: 15.0943743 },
    { lng: 74.2464720, lat: 15.0949439 },
    { lng: 74.2475685, lat: 15.0959825 },
    { lng: 74.2492131, lat: 15.0950125 },
    { lng: 74.2481167, lat: 15.0934917 },
    { lng: 74.2465224, lat: 15.0944792 },
    { lng: 74.2471338, lat: 15.0957609 },
    { lng: 74.2486737, lat: 15.0957694 },
    { lng: 74.2467383, lat: 15.0954578 },
    { lng: 74.2465380, lat: 15.0943742 },
    { lng: 74.2456924, lat: 15.0599945 }
  ];

  return calculateKmlMetrics(
    boundary,
    { lng: 74.247396, lat: 15.085859, alt: 429.13 },
    { lng: 74.237802, lat: 15.081329 }
  );
}
