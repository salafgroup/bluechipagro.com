# Survey No. 109 GIS Data Pipeline Documentation

This document describes the QGIS / GIS data pipeline, georeferenced coordinate transformation workflow, and static data integration process for **Reserva Varde Goa** (Plot 109/0, Neturlim, South Goa).

---

## 1. Source of Truth
* **Survey Boundary File:** `public/data/survey-no-109.kml`
* **Boundary Layer Name:** `Plot 109/0 Boundary`
* **Verified Coordinates:** `253 georeferenced coordinates (252 distinct vertices)`
* **Markers:** 
  * `GOA 3400 PROPERTY` (Project Site Center)
  * `Neturlim` (Village Reference Marker)

---

## 2. QGIS Workflow & Export Pipeline
To update or add new layers to the location intelligence platform, follow this rigorous QGIS pipeline:

### Step 1: Import the Survey KML
1. Open **QGIS** (v3.22+ recommended).
2. Go to **Layer > Add Layer > Add Vector Layer**.
3. Select `public/data/survey-no-109.kml`.
4. Import both the boundary polygon and point vector markers.

### Step 2: Coordinate Reference System (CRS) Verification
* All data loaded on Vercel must use standard geodetic coordinates (**WGS 84 / EPSG:4326**).
* If your survey source uses a local projection (e.g., UTM Zone 43N / EPSG:32643):
  1. Right-click the layer in the QGIS Layers Panel.
  2. Select **Export > Save Features As...**
  3. Set **Format** to `GeoJSON`.
  4. Set **CRS** to `EPSG:4326 - WGS 84`.
  5. Select **Coordinate Precision** as `7` decimal places.

### Step 3: Topographic Contour & DEM Processing
To generate topography and contour lines from Digital Elevation Models (DEM):
1. Download a DEM source for South Goa (e.g., SRTM 30m or ALOS PALSAR 12.5m).
2. Load the DEM raster in QGIS.
3. Go to **Raster > Extraction > Contour**.
4. Set **Interval between contour lines** (e.g., `5` meters or `10` meters).
5. Run the tool to generate contour line features.
6. Clip the contours layer using the `Plot 109/0 Boundary` polygon to isolate project contours.
7. Export the clipped contours to:
   `public/data/survey109-contours.geojson`
   Make sure the geometry fields include `elevation`.

### Step 4: Hydrology, Streams & Slope Zones
* **Watercourses/Streams:** Clip regional river shapefiles or trace stream runoffs using QGIS Hydrology flow direction tools. Export to:
  `public/data/survey109-streams.geojson`
* **Waterfalls:** Add waterfall points with precise GPS coordinates. Export to:
  `public/data/survey109-waterfalls.geojson`
* **Slope Zones:** Run **Raster Terrain Analysis > Slope** on your DEM raster, classify into green/orange/red developability zones, convert to vector polygons, and export to:
  `public/data/survey109-slope-zones.geojson`

### Step 5: Access Routes & Estate Layouts
* **Access Roads:** Trace organic ingress routes following terrain contours. Export to:
  `public/data/survey109-access-routes.geojson`
* **Estate Clusters:** Digitise planned 1-acre agro-plantation estate plots. Export to:
  `public/data/survey109-estate-clusters.geojson`
* **Developable Pockets:** Demarcate gentle slope zones suitable for modular eco-villages. Export to:
  `public/data/survey109-developable-pockets.geojson`
* **Forest & ESZ Zones:** Import legal eco-sensitive forest buffer files. Export to:
  `public/data/survey109-forest-esz-zones.geojson`

---

## 3. Web Platform Integration & Silent Pipeline
The frontend features an automated, silent loading pipeline to ingest your QGIS exports.

### Auto-Ingestion Architecture
1. Save the exported `.geojson` files directly inside `public/data/`.
2. When the user switches tabs on the **Location Intelligence Panel**:
   * The system attempts to load the corresponding files via `fetch()`.
   * If a file is **found**, it is parsed and rendered immediately on top of the Leaflet satellite view.
   * If a file is **missing**, the system swallows the 404 response gracefully (swallowing JS errors to prevent site disruption) and mounts a premium **Provisional Status card** in the top-right corner indicating that the verified QGIS export is pending.

### Dynamic Base Layers Map
Depending on the active tab context, the viewer switches the base tile layer:
* **Satellite Context (Tabs 0, 1, 5):** Esri World Imagery Satellite Tiles.
* **Topography Context (Tabs 2, 3):** OpenTopoMap Contour and Relief Tiles.
* **Roads/Access Context (Tab 4):** OpenStreetMap Standard Map Tiles.
