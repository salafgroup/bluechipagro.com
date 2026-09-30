import React from 'react';
import { terrainLayers, TerrainLayer } from '../data/reservaVardeTerrainData';

interface TerrainMenuProps {
  activeLayer: string;
  onLayerChange: (id: string) => void;
}

export const TerrainMenu: React.FC<TerrainMenuProps> = ({
  activeLayer,
  onLayerChange
}) => {
  return (
    <div 
      className="w-full md:w-[320px] bg-[#0c1611]/90 backdrop-blur-md border border-[#c2a878]/30 rounded-3xl p-6 flex flex-col gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      style={{
        fontFamily: "'Montserrat', sans-serif"
      }}
    >
      <div className="mb-4">
        <h4 className="text-[0.65rem] tracking-[0.25em] text-[#c2a878] uppercase font-bold">
          Navigator Layers
        </h4>
        <div className="w-12 h-[1px] bg-[#c2a878]/40 mt-1"></div>
      </div>

      <div className="flex flex-col gap-3">
        {terrainLayers.map((layer: TerrainLayer) => {
          const isActive = layer.id === activeLayer;
          return (
            <button
              key={layer.id}
              onClick={() => onLayerChange(layer.id)}
              className={`
                group relative w-full text-left px-5 py-4 rounded-xl text-[0.8rem] font-semibold uppercase tracking-[0.18em]
                transition-all duration-300 ease-out flex items-center justify-between overflow-hidden
                ${isActive 
                  ? 'text-[#c2a878] bg-[#c2a878]/5 border border-[#c2a878]/60 shadow-[0_0_15px_rgba(194,168,120,0.15)]' 
                  : 'text-[#a9a59c]/70 hover:text-[#f8f6f0] border border-transparent hover:bg-white/5 hover:translate-x-1'
                }
              `}
            >
              {/* Gold Left Border Glow for active */}
              {isActive && (
                <span className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-[#c2a878] rounded-r-md"></span>
              )}

              {/* Text */}
              <span className="z-10">{layer.label}</span>

              {/* Gold Arrow */}
              <svg 
                className={`w-3 h-3 transition-all duration-300 z-10
                  ${isActive 
                    ? 'text-[#c2a878] translate-x-0' 
                    : 'text-[#a9a59c]/40 group-hover:text-[#c2a878] group-hover:translate-x-1'
                  }
                `}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>

              {/* Hover highlight background */}
              <span className="absolute inset-0 bg-gradient-to-r from-[#c2a878]/0 to-[#c2a878]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d5a] animate-pulse"></span>
          <span className="text-[0.65rem] text-[#a9a59c]/50 tracking-wider">KML LINK ACTIVE</span>
        </div>
        <p className="text-[0.58rem] text-[#a9a59c]/40 leading-relaxed">
          KML Boundary: survey-no-109.kml<br />
          Placemark Nodes: 3 Active Layer Keys
        </p>
      </div>
    </div>
  );
};
export default TerrainMenu;
