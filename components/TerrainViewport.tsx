import React, { useMemo } from 'react';
import { KmlAnalysis } from '../lib/kmlParser';
import { terrainLayers, TerrainLayer, projectMarkers } from '../data/reservaVardeTerrainData';

interface TerrainViewportProps {
  activeLayer: string;
  kmlData: KmlAnalysis | null;
  loading: boolean;
}

export const TerrainViewport: React.FC<TerrainViewportProps> = ({
  activeLayer,
  kmlData,
  loading
}) => {
  const currentLayer = useMemo(() => {
    return terrainLayers.find(layer => layer.id === activeLayer) || terrainLayers[0];
  }, [activeLayer]);

  // Compute SVG viewBox projections from the real parsed KML coordinates
  const projection = useMemo(() => {
    if (!kmlData || kmlData.boundary.length === 0) return null;

    const coords = kmlData.boundary;
    const { minLng, maxLng, minLat, maxLat } = kmlData.bounds;

    const width = 800;
    const height = 500;

    // Projection converter: Maps lat/lng to 2D SVG space, then applies 3D isometric tilt
    const toSVG = (lng: number, lat: number) => {
      // Scale coordinates into bounding box
      const x = ((lng - minLng) / (maxLng - minLng)) * width;
      const y = (1 - (lat - minLat) / (maxLat - minLat)) * height;

      // Oblique 3D Perspective Tilt: 
      // Moves X slightly left based on Y, and compresses Y height to create tilted depth
      const obliqueX = x + (y - height / 2) * 0.28;
      const obliqueY = (y * 0.65) + 120; // scale height down and push down

      return { x: obliqueX, y: obliqueY };
    };

    // Project all boundary vertices
    const boundaryPoints = coords.map(pt => toSVG(pt.lng, pt.lat));
    const boundaryPath = boundaryPoints.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt.x},${pt.y}`).join(' ') + ' Z';

    // Project point markers
    const projectedMarkers = Object.entries(kmlData.markers).map(([key, marker]) => {
      if (!marker) return null;
      const pt = toSVG(marker.lng, marker.lat);
      const isProject = key === 'goa3400';
      return {
        key,
        x: pt.x,
        y: pt.y,
        label: isProject ? 'GOA 3400 PROPERTY' : 'Neturlim (village reference)',
        type: isProject ? 'project' : 'village',
        alt: marker.alt
      };
    }).filter(Boolean);

    return {
      boundaryPath,
      boundaryPoints,
      markers: projectedMarkers,
      toSVG
    };
  }, [kmlData]);

  // Specific layers coordinates / paths to overlay based on projected points
  const overlays = useMemo(() => {
    if (!projection) return null;
    const { toSVG, boundaryPoints } = projection;

    // 1. ELEVATION / RIDGE: Create multi-level contour elevation lines nested inside boundary
    const contours: string[] = [];
    const developablePockets: { x: number; y: number; r: number }[] = [];
    const ridges: { x1: number; y1: number; x2: number; y2: number }[] = [];

    if (boundaryPoints.length > 5) {
      // Ridge along the upper border of coordinates
      const pt1 = boundaryPoints[15];
      const pt2 = boundaryPoints[45];
      const pt3 = boundaryPoints[120];
      if (pt1 && pt2 && pt3) {
        ridges.push({ x1: pt1.x, y1: pt1.y, x2: pt2.x, y2: pt2.y });
        ridges.push({ x1: pt2.x, y1: pt2.y, x2: pt3.x, y2: pt3.y });
      }

      // Generate 4 contour-shrunk nested polygons to represent elevation contours
      const count = 4;
      for (let c = 1; c <= count; c++) {
        const factor = 1 - (c * 0.18);
        const center = { x: 420, y: 280 }; // approximate visual center of the boundary
        const contourPath = boundaryPoints.map(pt => {
          const cx = center.x + (pt.x - center.x) * factor;
          const cy = center.y + (pt.y - center.y) * factor;
          return `${cx},${cy}`;
        }).join(' L ');
        contours.push(`M ${contourPath} Z`);
      }

      // Developable low-slope pocket inside the lower-right quadrant
      const pocketCenter = boundaryPoints[170];
      if (pocketCenter) {
        developablePockets.push({ x: pocketCenter.x - 30, y: pocketCenter.y + 10, r: 45 });
        developablePockets.push({ x: pocketCenter.x + 35, y: pocketCenter.y - 15, r: 35 });
      }
    }

    // 2. WATERFALLS: Cyan streams flowing from hills to valleys with local waterfall landmarks
    const waterPaths: string[] = [];
    const waterfallLocations: { x: number; y: number; label: string }[] = [];

    if (boundaryPoints.length > 10) {
      // Mainapi waterfall stream
      const topSource = boundaryPoints[30];
      const middleVal = boundaryPoints[90];
      const bottomVal = boundaryPoints[185];
      if (topSource && middleVal && bottomVal) {
        waterPaths.push(`M${topSource.x},${topSource.y} Q${middleVal.x - 40},${middleVal.y - 20} ${bottomVal.x},${bottomVal.y}`);
        waterfallLocations.push({ x: middleVal.x - 20, y: middleVal.y - 10, label: 'Mainapi Waterfall' });
      }

      // Babu waterfall stream
      const bSource = boundaryPoints[10];
      const bValley = boundaryPoints[210];
      if (bSource && bValley) {
        waterPaths.push(`M${bSource.x},${bSource.y} C${bSource.x - 80},${bSource.y + 40} ${bValley.x + 40},${bValley.y - 40} ${bValley.x},${bValley.y}`);
        waterfallLocations.push({ x: bSource.x - 50, y: bSource.y + 30, label: 'Babu Waterfall' });
      }

      // Bubbling Lake location
      const lakePoint = boundaryPoints[150];
      if (lakePoint) {
        waterfallLocations.push({ x: lakePoint.x - 10, y: lakePoint.y + 20, label: 'Netravali Bubbling Lake' });
      }
    }

    // 3. ACCESS ROUTES: Connects Sanguem approach to proposed internal trails
    const roads: { path: string; type: 'main' | 'internal' | 'trail' }[] = [];
    if (boundaryPoints.length > 20) {
      const entryPt = boundaryPoints[180];
      const centerPt = boundaryPoints[110];
      const deepPt = boundaryPoints[50];
      
      if (entryPt && centerPt && deepPt) {
        // Main solid access road from edge of map to project entry
        roads.push({ 
          path: `M ${entryPt.x - 150} ${entryPt.y + 50} Q ${entryPt.x - 60} ${entryPt.y + 20} ${entryPt.x} ${entryPt.y}`,
          type: 'main'
        });

        // Proposed internal eco-sensitive road running through the project valley
        roads.push({
          path: `M ${entryPt.x} ${entryPt.y} Q ${centerPt.x} ${centerPt.y} ${deepPt.x} ${deepPt.y}`,
          type: 'internal'
        });

        // Loop walking buggy trail running to a view point
        const viewPt = boundaryPoints[15];
        if (viewPt) {
          roads.push({
            path: `M ${centerPt.x} ${centerPt.y} T ${viewPt.x} ${viewPt.y}`,
            type: 'trail'
          });
        }
      }
    }

    // 4. ESTATE CLUSTERS: Elegant dots grouped into low-density green buffers
    const clusters: { x: number; y: number; type: 'plantation' | 'wellness' | 'cottage' }[] = [];
    if (boundaryPoints.length > 30) {
      const clusterCenters = [
        boundaryPoints[60],  // Cottage
        boundaryPoints[100], // Wellness
        boundaryPoints[140], // Plantation
        boundaryPoints[195]  // Smart Eco
      ];

      clusterCenters.forEach((center, idx) => {
        if (!center) return;
        const types: ('plantation' | 'wellness' | 'cottage')[] = ['cottage', 'wellness', 'plantation', 'cottage'];
        const type = types[idx % 3];

        // Generate 6 individual estate coordinates around each center
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const dist = 20 + (i * 2);
          clusters.push({
            x: center.x + Math.cos(angle) * dist,
            y: center.y + Math.sin(angle) * dist * 0.65, // tilted Y axis
            type
          });
        }
      });
    }

    return {
      contours,
      developablePockets,
      ridges,
      waterPaths,
      waterfallLocations,
      roads,
      clusters
    };
  }, [projection]);

  return (
    <div className="flex-1 bg-[#0c1611]/60 border border-[#c2a878]/15 rounded-3xl overflow-hidden flex flex-col min-h-[500px] shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative group/viewport">
      
      {/* 3D Visual Viewport Area */}
      <div className="flex-1 relative overflow-hidden bg-black/40 min-h-[360px]">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0c1611]/80 z-20">
            <div className="w-8 h-8 border-2 border-[#c2a878]/30 border-t-[#c2a878] rounded-full animate-spin"></div>
            <span className="text-[0.7rem] uppercase tracking-widest text-[#a9a59c]/60">Parsing SURVEY NO 109 KML...</span>
          </div>
        ) : null}

        {/* Cinematic Oblique Background Layer */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out select-none mix-blend-lighten"
          style={{
            backgroundImage: "url('/images/location/google-earth-3d-satellite-terrain.png')",
            opacity: activeLayer === 'satellite' ? 0.8 : 0.35,
            filter: activeLayer === 'elevation' ? 'brightness(0.2) contrast(1.2)' : 'none',
            transform: 'scale(1.02)'
          }}
        />

        {/* Ambient Oblique Grid Shader Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,41,31,0.25)_0%,rgba(12,22,17,0.85)_100%)] pointer-events-none z-0" />
        
        {/* Interactive SVG Projection Layer */}
        {projection && (
          <svg 
            className="absolute inset-0 w-full h-full z-10 pointer-events-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" 
            viewBox="0 0 800 500"
            style={{ filter: 'drop-shadow(0px 8px 16px rgba(0, 0, 0, 0.4))' }}
          >
            {/* 1. SATELLITE CONTURE SHADING (Ambient topography context) */}
            {activeLayer === 'satellite' && overlays?.contours.map((path, idx) => (
              <path
                key={`sat-contour-${idx}`}
                d={path}
                fill="none"
                stroke="rgba(194,168,120,0.06)"
                strokeWidth={1}
                className="animate-[fadeIn_1.5s_ease-out]"
              />
            ))}

            {/* 2. PROJECT BOUNDARY LAYER (Glow vector matching SURVEY NO 109.kml polygon) */}
            {activeLayer === 'boundary' && (
              <>
                {/* Glowing boundary projection */}
                <path
                  d={projection.boundaryPath}
                  fill="rgba(16,41,31,0.15)"
                  stroke="#ff4d5a"
                  strokeWidth={3.5}
                  strokeDasharray="8 4"
                  strokeLinecap="round"
                  className="animate-[dash_35s_linear_infinite]"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(255,77,90,0.6))' }}
                />
                {/* Outer shadow duplication */}
                <path
                  d={projection.boundaryPath}
                  fill="none"
                  stroke="#c2a878"
                  strokeWidth={1}
                  opacity={0.3}
                />
                {/* Pulsing Vertex Points (selection snippet) */}
                {projection.boundaryPoints.filter((_, idx) => idx % 15 === 0).map((pt, i) => (
                  <circle
                    key={`vertex-${i}`}
                    cx={pt.x}
                    cy={pt.y}
                    r={3}
                    fill="#ff4d5a"
                    className="animate-ping"
                    style={{ animationDuration: `${2 + (i % 3)}s` }}
                  />
                ))}
              </>
            )}

            {/* 3. ELEVATION / RIDGE LAYER (High points, contour steps) */}
            {activeLayer === 'elevation' && overlays && (
              <>
                {/* Low-impact developable zones */}
                {overlays.developablePockets.map((p, i) => (
                  <ellipse
                    key={`pocket-${i}`}
                    cx={p.x}
                    cy={p.y}
                    rx={p.r}
                    ry={p.r * 0.65}
                    fill="rgba(76,175,80,0.12)"
                    stroke="rgba(76,175,80,0.3)"
                    strokeWidth={1.5}
                    strokeDasharray="4 2"
                  />
                ))}

                {/* Ridge Lines */}
                {overlays.ridges.map((r, i) => (
                  <line
                    key={`ridge-${i}`}
                    x1={r.x1}
                    y1={r.y1}
                    x2={r.x2}
                    y2={r.y2}
                    stroke="#c2a878"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    opacity={0.8}
                  />
                ))}

                {/* Contour lines nested inside boundary */}
                {overlays.contours.map((path, idx) => (
                  <path
                    key={`contour-${idx}`}
                    d={path}
                    fill="none"
                    stroke="#c2a878"
                    strokeWidth={1}
                    opacity={0.18 - (idx * 0.03)}
                  />
                ))}

                {/* Ridge labels */}
                {projection.boundaryPoints.length > 50 && (
                  <>
                    <text x={projection.boundaryPoints[35].x} y={projection.boundaryPoints[35].y - 15} fill="#c2a878" fontSize={9} fontWeight="bold" letterSpacing={1} opacity={0.8}>HIGH RIDGE CORRIDOR</text>
                    <text x={projection.boundaryPoints[175].x} y={projection.boundaryPoints[175].y + 15} fill="#4caf50" fontSize={9} fontWeight="bold" letterSpacing={1} opacity={0.8}>GENTLE SLOPE ZONE</text>
                  </>
                )}
              </>
            )}

            {/* 4. WATERFALL BELT LAYER (Cyan water pathways, Mainapi Savri Babu marker points) */}
            {activeLayer === 'waterfalls' && overlays && (
              <>
                {/* Fresh headwater streams */}
                {overlays.waterPaths.map((path, idx) => (
                  <path
                    key={`stream-${idx}`}
                    d={path}
                    fill="none"
                    stroke="#4a90e2"
                    strokeWidth={2.5}
                    opacity={0.85}
                    strokeDasharray="100"
                    strokeDashoffset={idx % 2 === 0 ? "100" : "-100"}
                    className="animate-[dash_10s_linear_infinite]"
                  />
                ))}

                {/* Waterfall Labels & Markers */}
                {overlays.waterfallLocations.map((loc, idx) => (
                  <g key={`waterfall-${idx}`}>
                    <circle cx={loc.x} cy={loc.y} r={6} fill="#4a90e2" opacity={0.4} className="animate-ping" />
                    <circle cx={loc.x} cy={loc.y} r={3} fill="#4a90e2" />
                    
                    <rect x={loc.x + 8} y={loc.y - 12} width={loc.label.length * 5.8} height={16} rx={3} fill="#0c1611" stroke="#4a90e2" strokeWidth={0.5} opacity={0.85} />
                    <text x={loc.x + 12} y={loc.y} fill="#f8f6f0" fontSize={8} fontWeight="bold" letterSpacing={0.5}>{loc.label}</text>
                  </g>
                ))}
              </>
            )}

            {/* 5. ACCESS ROUTES LAYER (Muted gold, buggy trails, emergency access overlays) */}
            {activeLayer === 'access' && overlays && (
              <>
                {overlays.roads.map((road, idx) => {
                  const isMain = road.type === 'main';
                  const isInternal = road.type === 'internal';
                  return (
                    <path
                      key={`road-${idx}`}
                      d={road.path}
                      fill="none"
                      stroke={isMain ? '#c2a878' : (isInternal ? '#ffa726' : '#f8f6f0')}
                      strokeWidth={isMain ? 3 : (isInternal ? 2 : 1)}
                      strokeDasharray={isMain ? 'none' : (isInternal ? '6 3' : '3 3')}
                      opacity={0.9}
                    />
                  );
                })}

                {/* Access Node badges */}
                {projection.boundaryPoints.length > 180 && (
                  <g>
                    <circle cx={projection.boundaryPoints[180].x} cy={projection.boundaryPoints[180].y} r={4} fill="#ffa726" />
                    <rect x={projection.boundaryPoints[180].x + 8} y={projection.boundaryPoints[180].y - 12} width={105} height={16} rx={3} fill="#0c1611" stroke="#ffa726" strokeWidth={0.5} opacity={0.85} />
                    <text x={projection.boundaryPoints[180].x + 12} y={projection.boundaryPoints[180].y} fill="#ffa726" fontSize={8} fontWeight="bold" letterSpacing={0.5}>PROPOSED ESTATE ENTRY</text>
                  </g>
                )}
              </>
            )}

            {/* 6. ESTATE CLUSTERS LAYER (1-acre low-density eco plot visual dots) */}
            {activeLayer === 'clusters' && overlays && (
              <>
                {/* Semi-transparent boundary zone overlay */}
                <path
                  d={projection.boundaryPath}
                  fill="rgba(31,77,56,0.06)"
                  stroke="rgba(129,199,132,0.25)"
                  strokeWidth={1}
                />

                {/* Eco-estate cottage clusters */}
                {overlays.clusters.map((cluster, idx) => {
                  const isPlantation = cluster.type === 'plantation';
                  const isWellness = cluster.type === 'wellness';
                  return (
                    <g key={`cluster-${idx}`}>
                      <circle 
                        cx={cluster.x} 
                        cy={cluster.y} 
                        r={3.5} 
                        fill={isPlantation ? '#81c784' : (isWellness ? '#c2a878' : '#e5c158')} 
                        opacity={0.85} 
                      />
                      <circle 
                        cx={cluster.x} 
                        cy={cluster.y} 
                        r={6} 
                        fill="none"
                        stroke={isPlantation ? '#81c784' : (isWellness ? '#c2a878' : '#e5c158')}
                        strokeWidth={0.5}
                        opacity={0.3}
                      />
                    </g>
                  );
                })}

                {/* Cluster Zones Labels */}
                {projection.boundaryPoints.length > 150 && (
                  <g>
                    <text x={projection.boundaryPoints[60].x - 30} y={projection.boundaryPoints[60].y - 15} fill="#f8f6f0" fontSize={8} fontWeight="bold" opacity={0.7} letterSpacing={0.5}>COTTAGES</text>
                    <text x={projection.boundaryPoints[100].x - 30} y={projection.boundaryPoints[100].y - 15} fill="#c2a878" fontSize={8} fontWeight="bold" opacity={0.7} letterSpacing={0.5}>WELLNESS VILLAS</text>
                    <text x={projection.boundaryPoints[140].x - 30} y={projection.boundaryPoints[140].y - 15} fill="#81c784" fontSize={8} fontWeight="bold" opacity={0.7} letterSpacing={0.5}>AGRO PLANTATION</text>
                  </g>
                )}
              </>
            )}

            {/* 7. KML POINT MARKERS (Always visible coordinates: GOA 3400 PROPERTY and Neturlim Village) */}
            {projection.markers.map((marker: any) => {
              const isProject = marker.type === 'project';
              return (
                <g key={marker.key} className="transition-transform duration-500 hover:scale-110 pointer-events-auto cursor-pointer">
                  {/* Outer pulsing ring for property location */}
                  {isProject && (
                    <circle cx={marker.x} cy={marker.y} r={16} fill="none" stroke="#c2a878" strokeWidth={1} opacity={0.4} className="animate-ping" style={{ animationDuration: '3s' }} />
                  )}
                  
                  {/* Pin anchor marker */}
                  <path 
                    d={`M${marker.x},${marker.y} L${marker.x - 6},${marker.y - 18} A8,8 0 1,1 ${marker.x + 6},${marker.y - 18} Z`}
                    fill={isProject ? '#c2a878' : '#a9a59c'}
                    stroke="#0c1611"
                    strokeWidth={1}
                    style={{ filter: 'drop-shadow(0 4px 5px rgba(0,0,0,0.5))' }}
                  />

                  {/* Inner Pin Dot */}
                  <circle cx={marker.x} cy={marker.y - 18} r={3} fill="#0c1611" />

                  {/* Marker Text Tag */}
                  <rect 
                    x={marker.x - 65} 
                    y={marker.y - 44} 
                    width={130} 
                    height={20} 
                    rx={4} 
                    fill="#0c1611" 
                    stroke={isProject ? '#c2a878' : '#a9a59c'} 
                    strokeWidth={isProject ? 1.5 : 0.5} 
                    opacity={0.92} 
                  />
                  <text 
                    x={marker.x} 
                    y={marker.y - 31} 
                    fill={isProject ? '#f8f6f0' : '#a9a59c'} 
                    fontSize={8} 
                    fontWeight={isProject ? 'bold' : 'normal'} 
                    textAnchor="middle" 
                    letterSpacing={0.5}
                  >
                    {marker.label}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Layer Descriptive Info Box */}
      <div 
        className="p-6 border-t border-[#c2a878]/15 bg-[#0c1611]/95 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300 z-10"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        <div className="flex-1 max-w-[500px]">
          <span 
            className="text-[0.65rem] font-bold tracking-[0.2em] uppercase transition-colors duration-300"
            style={{ color: currentLayer.accentColor }}
          >
            {currentLayer.title}
          </span>
          <h3 className="text-xl font-serif text-[#f8f6f0] mt-1 font-normal tracking-wide">
            {currentLayer.title} Details
          </h3>
          <p className="text-xs text-[#a9a59c] leading-relaxed mt-2">
            {currentLayer.description}
          </p>
        </div>

        <div className="flex flex-col gap-3 min-w-[200px] border-l border-white/5 pl-4">
          <div>
            <span className="text-[0.6rem] text-[#a9a59c]/50 uppercase tracking-wider block">Planning Value</span>
            <span className="text-[0.7rem] text-[#f8f6f0] leading-snug block mt-0.5">{currentLayer.planningValue}</span>
          </div>
          <div>
            <span className="text-[0.6rem] text-[#a9a59c]/50 uppercase tracking-wider block">Investor Relevance</span>
            <span className="text-[0.7rem] text-[#c2a878] leading-snug block mt-0.5">{currentLayer.investorRelevance}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <svg className="w-3.5 h-3.5 text-[#ff4d5a]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-[0.58rem] text-[#ff4d5a]/80 font-semibold tracking-wide uppercase">{currentLayer.verification}</span>
          </div>
        </div>
      </div>

      {/* Styled SVG Keyframes for Neon Border Dashes */}
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -1000;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};
export default TerrainViewport;
