"use client";

import React from "react";

export interface MapComplianceDisclaimerProps {
  className?: string;
  projectPositioning?: string;
}

export const MapComplianceDisclaimer: React.FC<MapComplianceDisclaimerProps> = ({
  className = "",
  projectPositioning = "Proposed 1000-acre private jungle forest housing vision near Neturlim / Netravali, South Goa",
}) => {
  return (
    <div
      className={`bg-emerald-950/80 border border-amber-500/25 border-l-4 border-l-amber-500 rounded-lg p-8 text-justify shadow-xl backdrop-blur-md ${className}`}
    >
      <h5 className="font-serif text-lg text-amber-100 font-medium mb-3">
        Eco-Sensitive Demarcation &amp; Planning Disclaimer
      </h5>
      <p className="font-sans text-xs leading-relaxed text-amber-50/70 font-light tracking-wide">
        All map visuals, terrain overlays, red boundary markings, KML references,
        nearby labels, elevation interpretation, and conceptual masterplan overlays
        are for preliminary planning, sales presentation, and internal visualization only.
        Final land extent, ownership, access, zoning, elevation, slope, hydrology,
        forest/wildlife applicability, environmental compliance, and development permissions
        must be verified through official government records, licensed surveyors,
        architects, environmental consultants, and legal advisors.{" "}
        <strong className="text-amber-200 font-medium">
          {projectPositioning}.
        </strong>{" "}
        The project is positioned in the Neturlim region and is not inside the protected
        Netravali Wildlife Sanctuary. No guaranteed eco-tourism rentals, yields, appreciation,
        or municipal developer clearances are implied, guaranteed, or made.{" "}
        <span className="italic text-amber-200">
          Preliminary map reference only. Final verification required.
        </span>
      </p>
    </div>
  );
};

export default MapComplianceDisclaimer;
