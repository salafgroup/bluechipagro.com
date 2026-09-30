import React, { useState, useEffect } from 'react';
import { TerrainMenu } from './TerrainMenu';
import { TerrainViewport } from './TerrainViewport';
import { loadSurvey109Kml, KmlAnalysis } from '../lib/kmlParser';

export const ReservaVardeTerrainNavigator: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<string>('satellite');
  const [kmlData, setKmlData] = useState<KmlAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch and parse KML on mount
  useEffect(() => {
    async function loadKml() {
      setLoading(true);
      // Fetch the SURVEY NO 109 KML file via the robust parser
      const data = await loadSurvey109Kml('/data/survey-no-109.kml', '/kml/project-boundary.kml');
      setKmlData(data);
      setLoading(false);
    }
    loadKml();
  }, []);

  return (
    <section 
      id="terrain-navigator-block"
      className="w-full bg-[#070e0a] text-[#f8f6f0] py-20 px-6 md:px-12 xl:px-24 flex flex-col items-center relative overflow-hidden"
      style={{
        backgroundImage: "radial-gradient(circle at 50% 30%, rgba(19,41,31,0.3) 0%, rgba(7,14,10,1) 75%)"
      }}
    >
      {/* Decorative Top Ambient Light */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-[#c2a878]/30 to-transparent pointer-events-none" />

      <div className="max-w-7xl w-full flex flex-col gap-12 z-10">
        
        {/* 1. Header Block */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <span 
            className="text-[0.7rem] uppercase font-bold tracking-[0.25em] text-[#c2a878] mb-3"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Location Intelligence
          </span>
          <h2 
            className="text-3xl md:text-5xl font-serif font-light text-[#f8f6f0] tracking-wide leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Explore Reserva Varde Goa in Layers
          </h2>
          <p 
            className="text-xs md:text-sm text-[#a9a59c] mt-4 leading-relaxed tracking-wide"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            A GIS-linked 3D terrain experience importing real Plot 109/0 boundary polygon coordinates directly from the uploaded Google Earth KML file. Interact with elevation bands, waterfall nature belts, access routes, and low-density estate planning layers.
          </p>
          {kmlData?.error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-[#ff4d5a] rounded-lg text-xs tracking-wider uppercase font-semibold">
              Warning: {kmlData.error}
            </div>
          )}
          <div className="w-16 h-[1.5px] bg-[#c2a878]/40 mt-6" />
        </div>

        {/* 2. Interactive Navigation Section (Two Column Layout) */}
        <div className="w-full flex flex-col md:flex-row gap-8 items-stretch">
          
          {/* Left Vertical Menu */}
          <TerrainMenu 
            activeLayer={activeLayer} 
            onLayerChange={(id) => setActiveLayer(id)} 
          />

          {/* Right GIS Viewport */}
          <TerrainViewport 
            activeLayer={activeLayer}
            kmlData={kmlData}
            loading={loading}
          />
        </div>

        {/* 3. Rigorous Professional Disclaimer */}
        <div 
          className="w-full mt-6 p-5 border border-red-500/10 rounded-2xl bg-red-500/[0.02] backdrop-blur-sm max-w-4xl mx-auto"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          <div className="flex gap-3 items-start">
            <svg 
              className="w-5 h-5 text-red-500/60 mt-0.5 flex-shrink-0" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-[0.62rem] text-[#a9a59c]/70 leading-relaxed uppercase tracking-wider">
              <strong>Rigorous Legal Disclaimer:</strong> This 3D terrain experience is a conceptual planning visualization. Boundary, zoning, ESZ status, forest status, access, water features, development permissions, and construction feasibility must be verified through official records, licensed surveyor, Goa TCP, Forest Department, DSLR, Panchayat, and competent authorities. Plot 109/0 is conceptually planned and subject to final survey and approvals.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
export default ReservaVardeTerrainNavigator;
