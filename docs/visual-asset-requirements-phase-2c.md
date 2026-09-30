# Reserva Verde Goa — Visual Asset Requirements Specification (Phase 2C)

This document establishes the official technical contract, filename conventions, rendering specifications, and engineering requirements for all digital production assets of the **Reserva Verde Goa** eco-luxury estate.

---

## 1. AutoCAD Presentation Exports
AutoCAD DWGs serve as the single source of truth for physical spatial dimensions, structural alignments, and biophilic zone allocations.

### Presentation Layout Standards
*   **Palette Constraint:** High-contrast luxury presentation style. Background must be deep charcoal/black (`#1A1A1A`) or rich forest green (`#10291F`). Main grid lines in muted ivory/white (`#FBF8F1`), with zoning lines in premium gold (`#B08A3E`).
*   **Layers Configuration:**
    *   `RV-STRUCT-GRID` — High-efficiency stilt pilings and container envelope boundaries.
    *   `RV-LIFE-DECK` — Verandahs, decks, and open biophilic walkways.
    *   `RV-AGRO-ZONE` — Cashew and spice planting alignment arrays.
    *   `RV-UTIL-HUB` — Inverters, battery storage, and rainwater filtration manifolds.
*   **Export Formats:**
    *   **SVG (Primary):** Vector format for high-fidelity interactive site plan zoom. Scale factor: 1:1, paths optimized with clean IDs.
    *   **PNG (Backup):** High-density transparent overlay. Minimum dimension: 2048 x 2048 pixels.

### Filename Mapping & Destinations
| Source Layout | Target Filename | Location in Repository | Target Dimensions |
| :--- | :--- | :--- | :--- |
| `2BHK-PRESENTATION-A1` | `2bhk-floor-plan.svg` | `/images/floorplans/` | Scalable Vector |
| `3BHK-PRESENTATION-A1` | `3bhk-floor-plan.svg` | `/images/floorplans/` | Scalable Vector |
| `4BHK-PRESENTATION-A1` | `4bhk-floor-plan.svg` | `/images/floorplans/` | Scalable Vector |
| `CUSTOM-PRESENTATION-A1`| `customisable-floor-plan.svg` | `/images/floorplans/` | Scalable Vector |

---

## 2. SketchUp 3D Massing & Scene Exports
SketchUp models establish the volumetric spatial configurations, stilt heights, solar pitch orientation, and biophilic deck shading parameters.

### Scene Setup & Camera Parameters
*   **Model Naming Convention:** `RV-ESTATE-MODEL-[MODEL_TYPE]-V2.skp` (e.g. `RV-ESTATE-MODEL-3BHK-V2.skp`).
*   **Scene 1: Exterior Massing Scene**
    *   **Angle:** 3/4 front perspective, slightly lower-third pitch to emphasize the stilted suspension.
    *   **Style:** Clean architectural lines with organic shadows enabled (set to Goa monsoon time profiles: 14:30 PM, UTC+5:30).
*   **Scene 2: Deck Views**
    *   **Angle:** Eye-level 1-point perspective from the entrance bridge facing the primary courtyard and composite wood verandah.
*   **Scene 3: Aerial Estate Overview**
    *   **Angle:** Orthographic top-down axonometric perspective at a 45-degree angle, showing the entire stilted module footprint within its 1-acre agro forestry plot limits.

---

## 3. Lumion / D5 Render / Twinmotion High-Fidelity Exports
These renders present photorealistic luxury marketing visualizations to HNI buyers, capturing the organic integration of Corten steel frames, double-glazed glass, and Shou-Sugi-Ban charred timber within the Netravali jungle.

### Technical Rendering Constraints
*   **Resolution:** 1920x1080 minimum, 3840x2160 (4K UHD) highly recommended for final brochure outputs.
*   **Color Profile:** Warm HSL values, balancing deep forest shadows with soft, atmospheric dawn/sunset gold light overlays.
*   **Vegetation Assets:** Native South Goa forest foliage only. Utilize mature wild cashew tree models, coconut palms, black pepper vines, and valley ferns. Avoid generic European pine or American deciduous assets.

### File Naming & Path Mapping
For each estate type (`2bhk`, `3bhk`, `4bhk`, and `customisable`), Lumion scene exports must align perfectly with the target paths:

| Slot ID | Render Scene Type | Filename | Target Subfolder in `/images/renders/` |
| :---: | :--- | :--- | :--- |
| **1** | Exterior Arrival & Foyer Link | `exterior-arrival.jpg` | `2bhk/`, `3bhk/`, `4bhk/`, `customisable/` |
| **2** | Verandah, Courtyard & Plunge Pool | `deck-view.jpg` | `2bhk/`, `3bhk/`, `4bhk/`, `customisable/` |
| **3** | Double-Glazed Living Lounge | `living-room.jpg` | `2bhk/`, `3bhk/`, `4bhk/`, `customisable/` |
| **4** | Master Bedroom Suite Panorama | `bedroom-view.jpg` | `2bhk/`, `3bhk/`, `4bhk/`, `customisable/` |
| **5** | Luxury Stilted Bathroom Wetroom | `bathroom-view.jpg` | `2bhk/`, `3bhk/`, `4bhk/`, `customisable/` |
| **6** | Island Kitchen & Biophilic Dinette | `kitchen-dining.jpg` | `2bhk/`, `3bhk/`, `4bhk/`, `customisable/` |
| **7** | Night Atmospheric Lighting Setup | `night-view.jpg` | `2bhk/`, `3bhk/`, `4bhk/`, `customisable/` |
| **8** | High-Angle Aerial plot Context | `aerial-estate.jpg` | `2bhk/`, `3bhk/`, `4bhk/`, `customisable/` |

---

## 4. Google Earth Pro & Google Earth Studio Exports
Provide broad regional, topography, and valley context maps to validate the biophilic safety and remote forest privacy stories of Reserva Verde.

### Static Context Visuals
*   **Site Context Image:** Regional overview displaying Netravali wildlife reserve corridors and private access ridge routes.
    *   *Path:* `/images/terrain/google-earth-site-context.jpg`
    *   *Resolution:* 1920x1080 (300 DPI)
*   **Access Road Image:** Zoom-in on the low-impact approach route showing integration along natural contours to avoid soil erosion.
    *   *Path:* `/images/terrain/google-earth-access-road.jpg`
    *   *Resolution:* 1920x1080 (300 DPI)
*   **Valley Context Image:** High-elevation topographic overlay showing valley-bounded isolation.
    *   *Path:* `/images/terrain/google-earth-valley-context.jpg`
    *   *Resolution:* 1920x1080 (300 DPI)
*   **Boundary Overlay Image:** Conceptual perimeter representation highlighting safe setbacks from natural streams and adjoining Survey No. 109 plots.
    *   *Path:* `/images/terrain/survey-boundary-overlay.jpg`
    *   *Resolution:* 1920x1080 (300 DPI)

### Cinematic Flythrough Video
*   **Source:** Google Earth Studio keyframe track.
*   **Sequence Pattern:** Start with a broad fly-in from South Goa's coastal edge, sweeping down through the Sanguem ridge runs, settling slowly into the Reserva Verde Netravali forest valley.
*   **Technical Spec:** 1920x1080 resolution, 30 FPS, H.264 compression in MP4 container format.
    *   *Path:* `/videos/reserva-verde-google-earth-flythrough.mp4`

---

## 5. Walkthrough Videos
Each model page hosts a premium, interactive cinematic walkthrough to showcase the volumetric interiors and structural stilt framing.

### Technical Walkthrough Video Targets
*   **Codec:** H.264 (AAC audio) inside a standard `.mp4` container.
*   **Target Framerate:** 60 FPS for ultra-smooth panning shots.
*   **Length:** 45 to 90 seconds maximum per walk.
*   **File Destinations:**
    *   **2BHK:** `/videos/2bhk-walkthrough.mp4`
    *   **3BHK:** `/videos/3bhk-walkthrough.mp4`
    *   **4BHK:** `/videos/4bhk-walkthrough.mp4`
    *   **Masterplan/Custom:** `/videos/masterplan-flythrough.mp4`

---

## 6. Compliance & Quality Control Notes
> [!WARNING]
> All visual assets, topography overlays, and flythroughs are strictly **conceptual drafts** intended to show spatial planning intent. Every render page must maintain the statutory compliance footer stating: 
> *“All visuals, layouts, dimensions, and specifications are subject to final topographic surveys, environmental clearances, and TCP / RERA approvals.”*

---

## 7. Rendering Quality Benchmark Mandate

To maintain consistency and high-end photorealistic appeal for all future estate models, the visual production pipeline must adhere to the following quality mandates:

### A. Quality Standard Baseline
*   **DO NOT** replicate or publish low-fidelity, flat SketchUp-style model outputs or draft previews for final presentation slots.
*   All future asset generation cycles for **3BHK Premium Forest Estate**, **4BHK Signature Forest Estate**, and **Customisable Founder Estate** must utilize advanced HSL ambient light engines, soft shadow diffusions, high-density wood/stone texture mapping, and organic jungle vegetation overlays.

### B. Mapped Quality Reference Benchmark
Renders must be executed to equal or exceed the premium photorealism established in the following reference files:
*   **Interior Reference:** `/images/renders/2bhk/bedroom-view.jpg` and `/images/renders/2bhk/bathroom-view.jpg` (excellent soft lighting bounces, detailed wood grains, correct slate and granite refractions).
*   **Topographic Reference:** `/images/terrain/google-earth-site-context.jpg` and `/images/terrain/google-earth-access-road.jpg` (high-fidelity contours, dense canopy coverage layers, realistic river boundaries).
*   **Axonometric Reference:** `/images/renders/2bhk/aerial-estate.jpg` (precise 45-degree isometric projection with realistic agroforestry vegetation matrix).

All subsequent 3BHK, 4BHK, and Customisable renders will be audited against this baseline during the QA review cycle. Renders failing to meet this reference photorealism must be re-exported from D5/Lumion/Twinmotion before staging and folder deployment.
