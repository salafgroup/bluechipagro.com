/**
 * Survey 109 Layer Data Configuration
 * Holds silent GeoJSON paths, verification notices, and fallback data structures
 */

export interface GeoJsonLayerConfig {
  path: string;
  tabIndex: number;
  notice: string;
}

export const GEOJSON_LAYERS_PIPELINE: GeoJsonLayerConfig[] = [
  {
    path: "data/survey109-contours.geojson",
    tabIndex: 2,
    notice: "DEM/QGIS contour layer pending verified GIS export."
  },
  {
    path: "data/survey109-slope-zones.geojson",
    tabIndex: 2,
    notice: "DEM/QGIS contour layer pending verified GIS export."
  },
  {
    path: "data/survey109-waterfalls.geojson",
    tabIndex: 3,
    notice: "Waterfall references require verified coordinates before plotting."
  },
  {
    path: "data/survey109-streams.geojson",
    tabIndex: 3,
    notice: "Waterfall references require verified coordinates before plotting."
  },
  {
    path: "data/survey109-access-routes.geojson",
    tabIndex: 4,
    notice: "Access route alignment pending GPX / field GPS / Google Earth path export."
  },
  {
    path: "data/survey109-estate-clusters.geojson",
    tabIndex: 5,
    notice: "Estate cluster layout pending licensed masterplan, contour survey, TCP/Forest/ESZ verification."
  },
  {
    path: "data/survey109-developable-pockets.geojson",
    tabIndex: 5,
    notice: "Estate cluster layout pending licensed masterplan, contour survey, TCP/Forest/ESZ verification."
  },
  {
    path: "data/survey109-forest-esz-zones.geojson",
    tabIndex: 5,
    notice: "Estate cluster layout pending licensed masterplan, contour survey, TCP/Forest/ESZ verification."
  }
];

export const GIS_DISCLAIMER_TEXT = 
  "This land intelligence viewer is for planning and presentation only. Boundary, area, access, terrain, water features, forest status, ESZ status, developability, zoning, and construction feasibility must be independently verified through official government records, certified survey, licensed planners, Forest Department, TCP, Panchayat, DSLR, and other competent authorities.";

/**
 * Hardcoded verified KML coordinates fallback for offline/static operations.
 * Matches survey-no-109.kml coordinates.
 */
export const SURVEY_NO_109_STATIC_COORDS = [
  [15.0599875, 74.2456919], [15.0601173, 74.2449282], [15.0598978, 74.2441409], [15.0593980, 74.2433579],
  [15.0592911, 74.2429345], [15.0592049, 74.2422204], [15.0590483, 74.2415162], [15.0587289, 74.2407519],
  [15.0584742, 74.2403668], [15.0583488, 74.2400305], [15.0582236, 74.2396112], [15.0582377, 74.2391060],
  [15.0585141, 74.2384737], [15.0588667, 74.2380313], [15.0593683, 74.2374665], [15.0598129, 74.2370701],
  [15.0601736, 74.2366898], [15.0604107, 74.2363714], [15.0608035, 74.2359400], [15.0611843, 74.2356133],
  [15.0615967, 74.2352843], [15.0619946, 74.2349781], [15.0624021, 74.2344799], [15.0628224, 74.2340328],
  [15.0632688, 74.2335805], [15.0637130, 74.2330752], [15.0640954, 74.2327042], [15.0643764, 74.2323049],
  [15.0646197, 74.2319349], [15.0647895, 74.2315664], [15.0649774, 74.2310153], [15.0652077, 74.2304523],
  [15.0653695, 74.2299298], [15.0655860, 74.2292723], [15.0660424, 74.2280261], [15.0664656, 74.2274488],
  [15.0669228, 74.2270919], [15.0673412, 74.2269279], [15.0678972, 74.2267860], [15.0684110, 74.2267860],
  [15.0689437, 74.2269201], [15.0694119, 74.2271871], [15.0700057, 74.2276707], [15.0706240, 74.2281987],
  [15.0711904, 74.2285556], [15.0716893, 74.2288078], [15.0722137, 74.2290748], [15.0727125, 74.2293270],
  [15.0732367, 74.2295940], [15.0737482, 74.2298754], [15.0742468, 74.2301938], [15.0752554, 74.2310153],
  [15.0757277, 74.2314594], [15.0762261, 74.2318883], [15.0767375, 74.2323472], [15.0772359, 74.2327759],
  [15.0777995, 74.2331526], [15.0782717, 74.2335967], [15.0787830, 74.2340552], [15.0792813, 74.2344837],
  [15.0797534, 74.2349277], [15.0802646, 74.2353862], [15.0807627, 74.2358145], [15.0812347, 74.2362585],
  [15.0817329, 74.2366869], [15.0822441, 74.2371452], [15.0827422, 74.2375736], [15.0832142, 74.2380175],
  [15.0837123, 74.2384460], [15.0842235, 74.2389043], [15.0847216, 74.2393327], [15.0851935, 74.2397766],
  [15.0856917, 74.2402052], [15.0862028, 74.2406634], [15.0867010, 74.2410919], [15.0871729, 74.2415359],
  [15.0876711, 74.2419645], [15.0881822, 74.2424227], [15.0886803, 74.2428512], [15.0891916, 74.2433095],
  [15.0896897, 74.2437380], [15.0901616, 74.2441819], [15.0906598, 74.2446105], [15.0911710, 74.2450688],
  [15.0916690, 74.2454972], [15.0921410, 74.2459412], [15.0926391, 74.2463697], [15.0931502, 74.2468280],
  [15.0936483, 74.2472565], [15.0941320, 74.2476901], [15.0945952, 74.2481878], [15.0953603, 74.2493393],
  [15.0955562, 74.2499691], [15.0955562, 74.2505504], [15.0943900, 74.2512638], [15.0929221, 74.2503254],
  [15.0923612, 74.2485483], [15.0943743, 74.2464471], [15.0949439, 74.2464720], [15.0959825, 74.2475685],
  [15.0950125, 74.2492131], [15.0934917, 74.2481167], [15.0944792, 74.2465224], [15.0954578, 74.2467383],
  [15.0599945, 74.2456924]
];
