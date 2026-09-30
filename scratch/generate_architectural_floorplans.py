import os
from datetime import datetime

def main():
    print("Starting Traditional 2D B&W Architectural Floor Plans Package generation...")
    current_date = datetime.now().strftime("%B %d, %Y")
    
    # 1. Setup Directories
    base_dir = r"c:\Users\INTEL\Desktop\GOA\WEBSITE\drawings\architectural-floorplans"
    models_list = ["2bhk", "3bhk", "4bhk"]
    dirs = {}
    for m in models_list:
        d = os.path.join(base_dir, m)
        os.makedirs(d, exist_ok=True)
        dirs[m] = d
        print(f"Directory verified/created: {d}")
        
    # Standard DXF elements
    dxf_header = """  0
SECTION
  2
HEADER
  9
$ACADVER
  1
AC1009
  0
ENDSEC
  0
SECTION
  2
TABLES
  0
TABLE
  2
LAYER
 70
16
"""

    # For B&W technical architectural drawings, let's define professional standard color mappings:
    # 7 = White/Black (AutoCAD automatically plots White on dark screen, Black on white sheet)
    # 8 = Dark Grey, 9 = Light Grey, 5 = Blue, 1 = Red, 4 = Cyan
    dxf_layers = [
        ("A-WALL-EXT", 7),    # Black/White (thick boundary)
        ("A-WALL-INT", 8),    # Dark Grey (partitions)
        ("A-STILT", 1),       # Red (stilt pilings)
        ("A-DOOR", 9),        # Light Grey (doors)
        ("A-WINDOW", 4),      # Cyan (windows)
        ("A-FURN", 9),        # Light Grey (furniture)
        ("A-TEXT", 7),        # Black/White (text labels)
        ("A-DIMS", 5),        # Blue (dimension chains)
        ("A-DECK", 8),        # Dark Grey (timber decks)
        ("A-WET", 4),         # Cyan/Blue (plunge pool)
        ("A-KITCHEN", 8),    # Dark Grey (kitchen counters)
        ("A-UTILITY", 8),     # Dark Grey (solar/utility)
        ("A-LANDSCAPE", 9),   # Light Grey (court/plantations)
        ("A-PATH", 8),        # Dark Grey (driveway/bridge)
        ("A-NORTH", 7),       # Black/White (North indicator)
        ("A-DISCLAIMER", 8)   # Dark Grey (legal disclaimer)
    ]

    dxf_tables = ""
    for name, color in dxf_layers:
        dxf_tables += f"""  0
LAYER
  2
{name}
 70
0
 62
{color}
  6
CONTINUOUS
"""

    dxf_tables_end = """  0
ENDTAB
  0
ENDSEC
  0
SECTION
  2
ENTITIES
"""

    dxf_footer = """  0
ENDSEC
  0
EOF
"""

    # Helper function to format a DXF Line
    def dxf_line(x1, y1, x2, y2, layer):
        return f"""  0
LINE
  8
{layer}
 10
{x1:.3f}
 20
{y1:.3f}
 30
0.0
 11
{x2:.3f}
 21
{y2:.3f}
 31
0.0
"""

    # Helper function to format a DXF Circle
    def dxf_circle(cx, cy, r, layer):
        return f"""  0
CIRCLE
  8
{layer}
 10
{cx:.3f}
 20
{cy:.3f}
 30
0.0
 40
{r:.3f}
"""

    # Helper function to format a DXF Text
    def dxf_text(x, y, text, height, layer, rotation=0.0):
        return f"""  0
TEXT
  8
{layer}
 10
{x:.3f}
 20
{y:.3f}
 30
0.0
 40
{height:.3f}
  1
{text}
 50
{rotation:.1f}
"""

    # ----------------- 2BHK DETAILS -----------------
    # SVG Origin 2BHK: Centered with scale factor 55
    # Width = 12.0m, Height = 16.5m (including Y = -4.5 to 12.0)
    # svg_x = 295.0 + dxf_x * 55.0
    # svg_y = 150.0 + (12.0 - dxf_y) * 55.0
    def to_svg_2bhk(dxf_x, dxf_y):
        x = 295.0 + dxf_x * 55.0
        y = 150.0 + (12.0 - dxf_y) * 55.0
        return x, y

    # Define 2BHK geometries directly in DXF meters coordinates
    # Outer boundaries: 12.0m x 12.0m rectangle
    b2_wall_ext = [
        ((0.0, 12.0), (12.0, 12.0)),
        ((12.0, 12.0), (12.0, 0.0)),
        ((12.0, 0.0), (0.0, 0.0)),
        ((0.0, 0.0), (0.0, 12.0)),
        # Inner offset boundary (0.20m wall thickness)
        ((0.20, 11.8), (11.8, 11.8)),
        ((11.8, 11.8), (11.8, 0.20)),
        ((11.8, 0.20), (0.20, 0.20)),
        ((0.20, 0.20), (0.20, 11.8))
    ]

    # Internal partitions (0.10m thickness)
    b2_wall_int = [
        # Dividing wall: Social Zone (Left) and Private Zone (Right) at X = 5.5m
        ((5.5, 0.20), (5.5, 11.8)),
        # Master Bed / Bath divide at X = 9.5m, Y: 7.5 to 11.8m
        ((9.5, 7.5), (9.5, 11.8)),
        # Master Bath / Closet divide at Y = 9.0m, X: 9.5 to 11.8m
        ((9.5, 9.0), (11.8, 9.0)),
        # Master Suite / Guest Suite divide at Y = 7.5m, X: 5.5 to 11.8m
        ((5.5, 7.5), (11.8, 7.5)),
        # Guest Bed / Bath divide at X = 8.0m, Y: 3.5 to 7.5m
        ((8.0, 3.5), (8.0, 7.5)),
        # Guest Bath / Closet divide at Y = 5.5m, X: 5.5 to 8.0m
        ((5.5, 5.5), (8.0, 5.5)),
        # Guest Suite / Utility divide at Y = 3.5m, X: 5.5 to 11.8m
        ((5.5, 3.5), (11.8, 3.5)),
        # Powder Toilet / Utility divide at Y = 2.0m, X: 5.5 to 8.0m
        ((5.5, 2.0), (8.0, 2.0)),
        # Solar / Service bay dividing wall at X = 8.0m, Y: 0.20 to 3.5m
        ((8.0, 0.20), (8.0, 3.5))
    ]

    # Elevated Timber Decks Y: -2.5 to 0.0m, X: 0.0 to 12.0m and Y: -4.5 to -2.5m, X: 0.0 to 7.0m
    b2_decks = [
        ((0.0, 0.0), (0.0, -2.5)),
        ((0.0, -2.5), (12.0, -2.5)),
        ((12.0, -2.5), (12.0, 0.0)),
        # Dining deck extension
        ((0.0, -2.5), (0.0, -4.5)),
        ((0.0, -4.5), (7.0, -4.5)),
        ((7.0, -4.5), (7.0, -2.5))
    ]

    # Plunge Pool Y: -4.5 to -2.5m, X: 7.0 to 12.0m
    b2_wet = [
        ((7.0, -2.5), (7.0, -4.5)),
        ((7.0, -4.5), (12.0, -4.5)),
        ((12.0, -4.5), (12.0, -2.5))
    ]

    # Plantation borders / biophilic details
    b2_landscape = [
        ((0.0, 12.2), (12.0, 12.2)),
        ((12.2, 0.0), (12.2, 12.0))
    ]

    # Kitchen Countertop outline along X: 0.20 to 4.5m, Y: 0.20 to 2.5m
    b2_kitchen = [
        ((0.20, 2.5), (4.5, 2.5)),
        ((4.5, 2.5), (4.5, 0.20))
    ]

    # Stilt coordinates
    b2_stilts = [
        (0.0, 0.0), (0.0, 3.5), (0.0, 7.5), (0.0, 12.0),
        (5.5, 0.0), (5.5, 3.5), (5.5, 7.5), (5.5, 12.0),
        (8.0, 3.5), (8.0, 7.5),
        (12.0, 0.0), (12.0, 3.5), (12.0, 7.5), (12.0, 12.0),
        # Decks and Pool stilts
        (0.0, -2.5), (5.5, -2.5), (12.0, -2.5),
        (0.0, -4.5), (7.0, -4.5), (12.0, -4.5)
    ]

    # Windows (cyan, layer A-WINDOW)
    b2_windows = [
        ((1.5, 12.0), (4.0, 12.0)),   # Living Window
        ((0.0, 4.0), (0.0, 6.0)),     # Dining Window
        ((1.5, 0.0), (3.5, 0.0)),     # Kitchen Window
        ((6.5, 12.0), (8.5, 12.0)),   # Master Bedroom Window
        ((12.0, 4.5), (12.0, 6.5)),   # Guest Bedroom Window
        ((10.5, 12.0), (11.5, 12.0))  # Master Bathroom Window
    ]

    # Doors
    b2_doors = [
        # Entrance sliding door
        ((0.0, 10.0), (0.0, 11.5), "sliding"),
        # Living to Deck sliding
        ((2.0, 0.0), (5.0, 0.0), "sliding"),
        # Hinged doors
        ((5.5, 7.8), (5.5, 8.6), "hinged"),   # Master Bedroom
        ((9.5, 9.8), (9.5, 10.6), "hinged"),  # Master Bathroom
        ((8.0, 6.5), (8.0, 7.3), "hinged"),   # Guest Bedroom
        ((5.8, 5.5), (6.6, 5.5), "hinged"),   # Guest Bathroom
        ((5.8, 2.0), (6.6, 2.0), "hinged"),   # Powder Toilet
        ((8.0, 2.2), (8.0, 3.0), "hinged")    # Utility Room
    ]

    # Furniture Outlines (simplified for AutoCAD layout representation)
    b2_furn = [
        # Master Bedroom Bed: 1.8m x 2.0m (center X: 7.5m, Y: 10.0m)
        ((6.6, 9.0), (8.4, 9.0)),
        ((8.4, 9.0), (8.4, 11.0)),
        ((8.4, 11.0), (6.6, 11.0)),
        ((6.6, 11.0), (6.6, 9.0)),
        # Pillows
        ((6.8, 10.5), (7.4, 10.5)), ((6.8, 10.8), (7.4, 10.8)),
        ((7.6, 10.5), (8.2, 10.5)), ((7.6, 10.8), (8.2, 10.8)),
        
        # Guest Bedroom Bed: 1.6m x 2.0m (center X: 10.0m, Y: 5.5m)
        ((9.0, 4.7), (11.0, 4.7)),
        ((11.0, 4.7), (11.0, 6.3)),
        ((11.0, 6.3), (9.0, 6.3)),
        ((9.0, 6.3), (9.0, 4.7)),
        
        # Living Room L-Shape Sofa
        ((1.5, 9.0), (4.5, 9.0)),
        ((4.5, 9.0), (4.5, 11.0)),
        ((4.0, 9.5), (4.0, 11.0)),
        ((1.5, 9.5), (4.0, 9.5)),
        
        # Dining Table and Chairs: X: 2.0 to 3.5m, Y: 4.5 to 6.0m
        ((2.0, 4.8), (3.5, 4.8)),
        ((3.5, 4.8), (3.5, 5.8)),
        ((3.5, 5.8), (2.0, 5.8)),
        ((2.0, 5.8), (2.0, 4.8)),
        # Chairs
        ((2.2, 4.5), (2.5, 4.5)), ((3.0, 4.5), (3.3, 4.5)),
        ((2.2, 6.1), (2.5, 6.1)), ((3.0, 6.1), (3.3, 6.1)),
        
        # Outdoor dining table on deck
        ((2.0, -3.8), (4.0, -3.8)),
        ((4.0, -3.8), (4.0, -3.0)),
        ((4.0, -3.0), (2.0, -3.0)),
        ((2.0, -3.0), (2.0, -3.8))
    ]

    # Room Area Text and Chamber Coordinates
    b2_rooms = [
        ("ENTRY FOYER", "100 sq.ft (9.3 sq.m)", (2.0, 11.5)),
        ("LIVING LOUNGE", "250 sq.ft (23.2 sq.m)", (2.8, 9.8)),
        ("FAMILY DINING", "180 sq.ft (16.7 sq.m)", (2.8, 5.3)),
        ("OPEN KITCHEN", "150 sq.ft (13.9 sq.m)", (2.8, 1.8)),
        ("MASTER BEDROOM", "240 sq.ft (22.3 sq.m)", (7.5, 9.8)),
        ("MASTER BATH", "80 sq.ft (7.4 sq.m)", (10.8, 10.5)),
        ("MASTER CLOSET", "40 sq.ft (3.7 sq.m)", (10.8, 8.3)),
        ("BEDROOM 2 (GUEST)", "220 sq.ft (20.4 sq.m)", (10.0, 5.5)),
        ("GUEST BATH", "70 sq.ft (6.5 sq.m)", (6.8, 6.5)),
        ("POWDER TOILET", "50 sq.ft (4.6 sq.m)", (6.8, 1.0)),
        ("UTILITY / SOLAR", "120 sq.ft (11.1 sq.m)", (10.0, 1.8)),
        ("FOREST DECK", "240 sq.ft (22.3 sq.m)", (6.0, -1.3)),
        ("PLUNGE POOL", "120 sq.ft (11.1 sq.m)", (9.5, -3.4)),
        ("OUTDOOR DINING", "100 sq.ft (9.3 sq.m)", (3.5, -3.4))
    ]

    # External Dimension Chains
    b2_ext_dims = [
        # Horizontal top overall width
        ((0.0, 13.2), (12.0, 13.2), "12.00m (39' 4\") OVERALL WIDTH"),
        # Horizontal top core divides
        ((0.0, 12.6), (5.5, 12.6), "5.50m (18' 0\") SOCIAL ZONE"),
        ((5.5, 12.6), (12.0, 12.6), "6.50m (21' 4\") PRIVATE ZONE"),
        # Vertical left overall length
        ((-1.5, -4.5), (-1.5, 12.0), "16.50m (54' 2\") OVERALL LENGTH", 90.0),
        # Deck & Pool horizontal horizontal divides
        ((0.0, -5.5), (7.0, -5.5), "7.00m (23' 0\") DINING DECK"),
        ((7.0, -5.5), (12.0, -5.5), "5.00m (16' 5\") PLUNGE POOL")
    ]

    # ----------------- 3BHK DETAILS -----------------
    # SVG Origin 3BHK: Centered with scale factor 50
    # Width = 14.0m, Height = 17.5m (including Y = -5.5 to 12.0)
    # svg_x = 275.0 + dxf_x * 50.0
    # svg_y = 160.0 + (12.0 - dxf_y) * 50.0
    def to_svg_3bhk(dxf_x, dxf_y):
        x = 275.0 + dxf_x * 50.0
        y = 160.0 + (12.0 - dxf_y) * 50.0
        return x, y

    # DXF metrics for 3BHK (14.0m wide by 12.0m long core)
    b3_wall_ext = [
        ((0.0, 12.0), (14.0, 12.0)),
        ((14.0, 12.0), (14.0, 0.0)),
        ((14.0, 0.0), (0.0, 0.0)),
        ((0.0, 0.0), (0.0, 12.0)),
        # Inner offset boundary (0.20m wall thickness)
        ((0.20, 11.8), (13.8, 11.8)),
        ((13.8, 11.8), (13.8, 0.20)),
        ((13.8, 0.20), (0.20, 0.20)),
        ((0.20, 0.20), (0.20, 11.8))
    ]

    # Internal partitions (0.10m thickness)
    b3_wall_int = [
        # Dividing wall: Social Zone (Left) and Private Zone (Right) at X = 6.5m
        ((6.5, 0.20), (6.5, 11.8)),
        # Private core dividing wall at X = 9.5m
        ((9.5, 0.20), (9.5, 11.8)),
        # Master Bed / Bath divide Y = 7.5m, X: 6.5 to 13.8m
        ((6.5, 7.5), (13.8, 7.5)),
        # Master Closet / Bath divide Y = 9.5m, X: 6.5 to 9.5m
        ((6.5, 9.5), (9.5, 9.5)),
        # Guest Bed / Children Bed partition Y = 3.5m, X: 6.5 to 13.8m
        ((6.5, 3.5), (13.8, 3.5)),
        # Guest Bath partition Y = 5.0m, X: 6.5 to 9.5m
        ((6.5, 5.0), (9.5, 5.0)),
        # Children Bath partition Y = 2.0m, X: 6.5 to 9.5m
        ((6.5, 2.0), (9.5, 2.0)),
        # Powder Toilet / Solar Utility divide X = 8.0m, Y: 0.20 to 2.0m
        ((8.0, 0.20), (8.0, 2.0))
    ]

    # Covered Decks Y: -3.0 to 0.0m, X: 0.0 to 14.0m and Y: -5.5 to -3.0m, X: 0.0 to 8.0m
    b3_decks = [
        ((0.0, 0.0), (0.0, -3.0)),
        ((0.0, -3.0), (14.0, -3.0)),
        ((14.0, -3.0), (14.0, 0.0)),
        # Outdoor dining deck extension
        ((0.0, -3.0), (0.0, -5.5)),
        ((0.0, -5.5), (8.0, -5.5)),
        ((8.0, -5.5), (8.0, -3.0))
    ]

    # Plunge Pool Y: -5.5 to -3.0m, X: 8.0 to 14.0m
    b3_wet = [
        ((8.0, -3.0), (8.0, -5.5)),
        ((8.0, -5.5), (14.0, -5.5)),
        ((14.0, -5.5), (14.0, -3.0))
    ]

    # Landscape planting boundaries
    b3_landscape = [
        ((0.0, 12.2), (14.0, 12.2)),
        ((14.2, 0.0), (14.2, 12.0))
    ]

    # Kitchen Countertop along X: 0.20 to 5.5m, Y: 0.20 to 3.0m
    b3_kitchen = [
        ((0.20, 3.0), (5.5, 3.0)),
        ((5.5, 3.0), (5.5, 0.20))
    ]

    # Stilt coordinates
    b3_stilts = [
        (0.0, 0.0), (0.0, 3.5), (0.0, 7.5), (0.0, 12.0),
        (6.5, 0.0), (6.5, 3.5), (6.5, 7.5), (6.5, 12.0),
        (9.5, 0.0), (9.5, 3.5), (9.5, 7.5), (9.5, 12.0),
        (14.0, 0.0), (14.0, 3.5), (14.0, 7.5), (14.0, 12.0),
        # Decks and Pool stilts
        (0.0, -3.0), (6.5, -3.0), (14.0, -3.0),
        (0.0, -5.5), (8.0, -5.5), (14.0, -5.5)
    ]

    # Windows (cyan, layer A-WINDOW)
    b3_windows = [
        ((1.5, 12.0), (4.5, 12.0)),   # Living Window
        ((0.0, 4.5), (0.0, 6.5)),     # Dining Window
        ((1.5, 0.0), (4.0, 0.0)),     # Kitchen Window
        ((7.0, 12.0), (9.0, 12.0)),   # Master Bed Window
        ((14.0, 4.5), (14.0, 6.5)),   # Guest Bedroom Window
        ((14.0, 1.0), (14.0, 2.5)),   # Bedroom 3 Window
        ((10.5, 12.0), (12.0, 12.0))  # Master Bath Window
    ]

    # Doors
    b3_doors = [
        # Entrance sliding door
        ((0.0, 10.0), (0.0, 11.5), "sliding"),
        # Living to Deck sliding
        ((2.0, 0.0), (5.0, 0.0), "sliding"),
        # Hinged doors
        ((6.5, 7.8), (6.5, 8.6), "hinged"),   # Master Bed
        ((9.5, 9.8), (9.5, 10.6), "hinged"),  # Master Bath
        ((9.5, 6.5), (9.5, 7.3), "hinged"),   # Bedroom 2
        ((6.8, 5.0), (7.6, 5.0), "hinged"),   # Guest Bath
        ((9.5, 2.2), (9.5, 3.0), "hinged"),   # Bedroom 3
        ((6.8, 2.0), (7.6, 2.0), "hinged"),   # Children Bath
        ((6.5, 1.0), (6.5, 1.8), "hinged"),   # Powder Toilet
        ((8.0, 1.0), (8.0, 1.8), "hinged")    # Utility Room
    ]

    # Furniture Outlines (simplified for AutoCAD layout representation)
    b3_furn = [
        # Master Bed: 1.8m wide x 2.0m long (X: 10.75 to 12.55, Y: 8.8 to 10.8)
        ((10.75, 8.8), (12.55, 8.8)),
        ((12.55, 8.8), (12.55, 10.8)),
        ((12.55, 10.8), (10.75, 10.8)),
        ((10.75, 10.8), (10.75, 8.8)),
        
        # Bed 2: 1.6m x 2.0m (X: 10.85 to 12.45, Y: 4.7 to 6.7)
        ((10.85, 4.7), (12.45, 4.7)),
        ((12.45, 4.7), (12.45, 6.7)),
        ((12.45, 6.7), (10.85, 6.7)),
        ((10.85, 6.7), (10.85, 4.7)),
        
        # Bed 3: 1.6m x 2.0m (X: 10.85 to 12.45, Y: 1.0 to 3.0)
        ((10.85, 1.0), (12.45, 1.0)),
        ((12.45, 1.0), (12.45, 3.0)),
        ((12.45, 3.0), (10.85, 3.0)),
        ((10.85, 3.0), (10.85, 1.0)),
        
        # Living Room L-Shape Sofa
        ((1.5, 9.0), (5.0, 9.0)),
        ((5.0, 9.0), (5.0, 11.0)),
        ((4.5, 9.5), (4.5, 11.0)),
        ((1.5, 9.5), (4.5, 9.5)),
        
        # Dining Table and Chairs
        ((2.0, 4.8), (4.0, 4.8)),
        ((4.0, 4.8), (4.0, 5.8)),
        ((4.0, 5.8), (2.0, 5.8)),
        ((2.0, 5.8), (2.0, 4.8)),
        
        # Outdoor deck dining table
        ((2.5, -4.8), (5.0, -4.8)),
        ((5.0, -4.8), (5.0, -3.8)),
        ((5.0, -3.8), (2.5, -3.8)),
        ((2.5, -3.8), (2.5, -4.8))
    ]

    # Room Area Text and Chamber Coordinates
    b3_rooms = [
        ("ENTRY FOYER", "110 sq.ft (10.2 sq.m)", (0.5, 10.5)),
        ("FAMILY LIVING LOUNGE", "320 sq.ft (29.7 sq.m)", (2.8, 8.5)),
        ("DINING & SOCIAL ZONE", "170 sq.ft (15.8 sq.m)", (1.5, 5.0)),
        ("OPEN CHEF KITCHEN", "140 sq.ft (13.0 sq.m)", (2.0, 1.8)),
        ("MASTER BEDROOM", "220 sq.ft (20.4 sq.m)", (10.0, 8.5)),
        ("MASTER BATH", "80 sq.ft (7.4 sq.m)", (8.0, 10.65)),
        ("MASTER CLOSET", "60 sq.ft (5.6 sq.m)", (8.0, 8.5)),
        ("BEDROOM 2 (GUEST)", "190 sq.ft (17.7 sq.m)", (10.0, 4.2)),
        ("GUEST BATH", "80 sq.ft (7.4 sq.m)", (8.0, 6.25)),
        ("BEDROOM 3", "165 sq.ft (15.3 sq.m)", (10.0, 3.0)),
        ("CHILDREN BATH", "95 sq.ft (8.8 sq.m)", (8.0, 3.5)),
        ("POWDER TOILET", "30 sq.ft (2.8 sq.m)", (6.7, 1.4)),
        ("SOLAR & UTILITY", "30 sq.ft (2.8 sq.m)", (8.15, 0.65)),
        ("COVERED FOREST DECK", "380 sq.ft (35.3 sq.m)", (7.0, -1.5)),
        ("STILTED PLUNGE POOL", "160 sq.ft (14.9 sq.m)", (11.0, -4.25)),
        ("OUTDOOR DINING", "215 sq.ft (20.0 sq.m)", (4.0, -4.25))
    ]

    # External Dimension Chains
    b3_ext_dims = [
        # Horizontal top overall width
        ((0.0, 13.2), (14.0, 13.2), "14.00m (45' 11\") OVERALL WIDTH"),
        # Horizontal top core divides
        ((0.0, 12.6), (6.5, 12.6), "6.50m (21' 4\") SOCIAL WING"),
        ((6.5, 12.6), (14.0, 12.6), "7.50m (24' 7\") PRIVATE WING"),
        # Vertical left overall length
        ((-1.5, -5.5), (-1.5, 12.0), "17.50m (57' 5\") OVERALL LENGTH", 90.0),
        # Deck & Pool horizontal horizontal divides
        ((0.0, -6.5), (8.0, -6.5), "8.00m (26' 3\") DINING DECK"),
        ((8.0, -6.5), (14.0, -6.5), "6.00m (19' 8\") PLUNGE POOL")
    ]

    # ----------------- 4BHK DETAILS -----------------
    # SVG Origin 4BHK: (120, 1020)
    # Scale: 70
    # SVG_X = 120.0 + dxf_x * 70.0
    # SVG_Y = 1020.0 - dxf_y * 70.0
    def to_svg_4bhk(dxf_x, dxf_y):
        x = 120.0 + dxf_x * 70.0
        y = 1020.0 - dxf_y * 70.0
        return x, y

    # DXF metrics for 4BHK
    b4_wall_ext = [
        ((0.0, 12.571), (15.143, 12.571)),
        ((15.143, 12.571), (15.143, 7.714)),
        ((15.143, 7.714), (10.286, 7.714)),
        ((10.286, 7.714), (10.286, 0.0)),
        ((10.286, 0.0), (0.0, 0.0)),
        ((0.0, 0.0), (0.0, 12.571)),
        # Inner offset boundary
        ((0.143, 12.429), (15.000, 12.429)),
        ((15.000, 12.429), (15.000, 7.857)),
        ((15.000, 7.857), (10.429, 7.857)),
        ((10.429, 7.857), (10.429, 0.143)),
        ((10.429, 0.143), (0.143, 0.143)),
        ((0.143, 0.143), (0.143, 12.429))
    ]

    b4_wall_int = [
        ((11.286, 12.571), (11.286, 10.143)),
        ((11.286, 10.143), (15.143, 10.143)),
        ((7.143, 7.714), (10.286, 7.714)),
        ((0.0, 3.857), (7.143, 3.857)),
        ((3.429, 0.0), (3.429, 3.857)),
        ((7.143, 0.0), (7.143, 7.714)),
        ((7.143, 5.143), (10.286, 5.143))
    ]

    b4_decks = [
        ((-0.857, 0.0), (10.286, 0.0)),
        ((10.286, 0.0), (10.286, 7.714)),
        ((10.286, 7.714), (15.143, 7.714)),
        ((15.143, 7.714), (15.143, 12.571)),
        ((15.143, 12.571), (16.571, 12.571)),
        ((16.571, 12.571), (16.571, 6.000)),
        ((16.571, 6.000), (12.000, 6.000)),
        ((12.000, 6.000), (12.000, -1.714)),
        ((12.000, -1.714), (-0.857, -1.714)),
        ((-0.857, -1.714), (-0.857, 0.0))
    ]

    b4_wet = [
        ((12.714, 5.286), (16.000, 5.286)),
        ((16.000, 5.286), (16.000, 2.714)),
        ((16.000, 2.714), (12.714, 2.714)),
        ((12.714, 2.714), (12.714, 5.286))
    ]

    b4_landscape = [
        ((0.0, 10.143), (7.143, 10.143)),
        ((7.143, 10.143), (7.143, 7.714)),
        ((7.143, 7.714), (0.0, 7.714)),
        ((0.0, 7.714), (0.0, 10.143))
    ]

    b4_kitchen = [
        ((11.571, 10.857), (14.857, 10.857)),
        ((11.571, 10.857), (11.571, 10.571))
    ]

    # Stilt coordinates
    b4_stilts = [
        (0.0, 12.571), (3.714, 12.571), (7.429, 12.571), (11.286, 12.571), (15.143, 12.571),
        (0.0, 10.143), (3.714, 10.143), (7.429, 10.143), (11.286, 10.143), (15.143, 10.143),
        (11.286, 4.857), (15.143, 4.857), (7.143, 4.857), (10.286, 4.857), (0.0, 4.857),
        (7.143, 6.571), (10.286, 6.571), (0.0, 3.857), (3.429, 3.857), (6.857, 3.857),
        (7.143, 8.571), (10.286, 8.571), (0.0, 0.0), (3.429, 0.0), (6.857, 0.0), (10.286, 0.0)
    ]

    b4_windows = [
        ((4.000, 12.571), (11.000, 12.571)),
        ((4.000, 10.143), (11.000, 10.143)),
        ((0.0, 11.429), (0.0, 10.857)),
        ((7.286, 7.714), (9.857, 7.714))
    ]

    b4_doors = [
        ((0.0, 11.429), (0.0, 12.0), "sliding"),
        ((7.143, 6.0), (8.143, 6.0), "sliding")
    ]

    b4_furn = [
        # Master Bedroom Bed
        ((6.8, 5.1), (8.6, 5.1)),
        ((8.6, 5.1), (8.6, 7.1)),
        ((8.6, 7.1), (6.8, 7.1)),
        ((6.8, 7.1), (6.8, 5.1)),
        
        # Bed outline Bedroom 2
        ((1.8, 5.1), (3.6, 5.1)),
        ((3.6, 5.1), (3.6, 7.1)),
        ((3.6, 7.1), (1.8, 7.1)),
        ((1.8, 7.1), (1.8, 5.1)),
        
        # Bed outline Bedroom 3
        ((1.8, 1.1), (3.6, 1.1)),
        ((3.6, 1.1), (3.6, 3.1)),
        ((3.6, 3.1), (1.8, 3.1)),
        ((1.8, 3.1), (1.8, 1.1)),

        # Bed outline Bedroom 4
        ((5.0, 1.1), (6.8, 1.1)),
        ((6.8, 1.1), (6.8, 3.1)),
        ((6.8, 3.1), (5.0, 3.1)),
        ((5.0, 3.1), (5.0, 1.1))
    ]

    b4_rooms = [
        ("ENTRANCE FOYER", "160 sq.ft (14.9 sq.m)", (1.857, 11.429)),
        ("GRAND LIVING PAVILION", "580 sq.ft (53.9 sq.m)", (7.500, 11.500)),
        ("CHEF KITCHEN & DINING", "420 sq.ft (39.0 sq.m)", (13.214, 11.500)),
        ("FLAGSHIP MASTER SUITE", "380 sq.ft (35.3 sq.m)", (8.714, 6.571)),
        ("SIGNATURE ENSUITE", "220 sq.ft (20.4 sq.m)", (8.714, 4.000)),
        ("BEDROOM 2 (GUEST)", "380 sq.ft (35.3 sq.m)", (3.571, 6.000)),
        ("BEDROOM 3", "240 sq.ft (22.3 sq.m)", (1.857, 2.143)),
        ("BEDROOM 4", "240 sq.ft (22.3 sq.m)", (5.286, 2.143)),
        ("UTILITY & SOLAR HUB", "180 sq.ft (16.7 sq.m)", (13.214, 9.143)),
        ("WELLNESS COURT", "420 sq.ft (39.0 sq.m)", (3.571, 9.000)),
        ("STILTED PLUNGE POOL", "220 sq.ft (20.4 sq.m)", (14.357, 4.143))
    ]

    b4_ext_dims = [
        ((0.0, 13.8), (15.143, 13.8), "15.14m (49' 8\") OVERALL WIDTH"),
        ((-1.0, 0.0), (-1.0, 12.571), "12.57m (41' 3\") OVERALL LENGTH", 90.0)
    ]

    # Combine everything to process
    packages = {
        "2bhk": {
            "title": "2BHK Compact Forest Estate Architectural Floor Plan",
            "dxf_name": "2bhk-architectural-floor-plan.dxf",
            "svg_name": "2bhk-architectural-floor-plan.svg",
            "id": "RV-ARCH-2BHK-01",
            "scale_str": "1:100 @ A3",
            "specs": {
                "Model": "2BHK Compact Forest Estate",
                "Gross Built Footprint": "1,550 sq.ft",
                "Composite Timber Decks": "Over 340 sq.ft",
                "Optional Plunge Pool": "120 sq.ft",
                "Zoning Buffer Allotment": "63% Forest Conservation Buffer",
                "Foundation Structure": "Eco-friendly Galvanized Screw Piles",
                "Technical Standard": "IS 12556 / NBC India Compliant"
            },
            "back_url": "../../models/2bhk-compact-forest-estate/index.html",
            "outer_walls": b2_wall_ext,
            "inner_walls": b2_wall_int,
            "decks": b2_decks,
            "wet": b2_wet,
            "landscape": b2_landscape,
            "stilts": b2_stilts,
            "windows": b2_windows,
            "doors": b2_doors,
            "furn": b2_furn,
            "kitchen": b2_kitchen,
            "rooms": b2_rooms,
            "ext_dims": b2_ext_dims,
            "to_svg": to_svg_2bhk,
            "schedule": [
                ("1. Entry Foyer & Entrance", "100 sq.ft / 9.3 sq.m", "2.00m x 4.65m"),
                ("2. Living Lounge", "250 sq.ft / 23.2 sq.m", "5.50m x 4.50m"),
                ("3. Family Dining", "180 sq.ft / 16.7 sq.m", "5.50m x 3.50m"),
                ("4. Open Chef's Kitchen", "150 sq.ft / 13.9 sq.m", "4.50m x 2.50m"),
                ("5. Master Bedroom Suite", "240 sq.ft / 22.3 sq.m", "4.00m x 4.50m"),
                ("6. Master Bath Wetroom", "80 sq.ft / 7.4 sq.m", "2.50m x 3.00m"),
                ("7. Master Walk-in Closet", "40 sq.ft / 3.7 sq.m", "2.50m x 1.50m"),
                ("8. Bedroom 2 (Guest Suite)", "220 sq.ft / 20.4 sq.m", "4.00m x 4.00m"),
                ("9. Guest Bath", "70 sq.ft / 6.5 sq.m", "2.50m x 2.00m"),
                ("10. Guest Closet/Foyer", "40 sq.ft / 3.7 sq.m", "2.50m x 1.50m"),
                ("11. Guest Powder Toilet", "50 sq.ft / 4.6 sq.m", "2.50m x 2.00m"),
                ("12. Off-Grid Solar & Utility", "120 sq.ft / 11.1 sq.m", "4.00m x 3.50m"),
                ("13. Covered Forest Deck", "240 sq.ft / 22.3 sq.m", "12.00m x 2.50m"),
                ("14. Galvanized Plunge Pool", "120 sq.ft / 11.1 sq.m", "5.00m x 2.00m"),
                ("15. Outdoor Dining Deck", "100 sq.ft / 9.3 sq.m", "7.00m x 2.00m")
            ]
        },
        "3bhk": {
            "title": "3BHK Premium Forest Estate Architectural Floor Plan",
            "dxf_name": "3bhk-architectural-floor-plan.dxf",
            "svg_name": "3bhk-architectural-floor-plan.svg",
            "id": "RV-ARCH-3BHK-01",
            "scale_str": "1:100 @ A3",
            "specs": {
                "Model": "3BHK Premium Forest Estate",
                "Gross Built Footprint": "1,800 sq.ft (Built Footprint)",
                "Composite Timber Decks": "380 sq.ft",
                "Optional Plunge Pool": "180 sq.ft",
                "Zoning Buffer Allotment": "65% Forest Conservation Buffer",
                "Foundation Structure": "Eco-friendly Galvanized Screw Piles",
                "Technical Standard": "IS 12556 / NBC India Compliant"
            },
            "back_url": "../../models/3bhk-premium-forest-estate/index.html",
            "outer_walls": b3_wall_ext,
            "inner_walls": b3_wall_int,
            "decks": b3_decks,
            "wet": b3_wet,
            "landscape": b3_landscape,
            "stilts": b3_stilts,
            "windows": b3_windows,
            "doors": b3_doors,
            "furn": b3_furn,
            "kitchen": b3_kitchen,
            "rooms": b3_rooms,
            "ext_dims": b3_ext_dims,
            "to_svg": to_svg_3bhk,
            "schedule": [
                ("1. Arrival Foyer", "110 sq.ft / 10.2 sq.m", "2.20m x 4.65m"),
                ("2. Family Living Lounge", "320 sq.ft / 29.7 sq.m", "5.50m x 5.40m"),
                ("3. Dining & Social Zone", "170 sq.ft / 15.8 sq.m", "4.50m x 3.50m"),
                ("4. Open Chef Kitchen", "140 sq.ft / 13.0 sq.m", "4.50m x 2.90m"),
                ("5. Master Bed Suite", "220 sq.ft / 20.4 sq.m", "4.50m x 4.50m"),
                ("6. Master Ensuite Bath", "80 sq.ft / 7.4 sq.m", "3.00m x 2.45m"),
                ("7. Master Walk-in Closet", "60 sq.ft / 5.6 sq.m", "3.00m x 1.85m"),
                ("8. Bedroom 2 (Guest Suite)", "190 sq.ft / 17.7 sq.m", "4.50m x 3.90m"),
                ("9. Guest Bath (Bed 2 Ensuite)", "80 sq.ft / 7.4 sq.m", "3.00m x 2.45m"),
                ("10. Bedroom 3", "165 sq.ft / 15.3 sq.m", "4.50m x 3.40m"),
                ("11. Children Bath (Bed 3 Ensuite)", "95 sq.ft / 8.8 sq.m", "3.00m x 2.95m"),
                ("12. Powder Toilet", "30 sq.ft / 2.8 sq.m", "1.50m x 1.85m"),
                ("13. Off-Grid Solar & Utility", "30 sq.ft / 2.8 sq.m", "1.50m x 1.85m"),
                ("14. Covered Forest Deck", "380 sq.ft / 35.3 sq.m", "14.00m x 2.50m"),
                ("15. Stilted Plunge Pool", "160 sq.ft / 14.9 sq.m", "6.00m x 2.50m"),
                ("16. Outdoor Dining Deck", "215 sq.ft / 20.0 sq.m", "8.00m x 2.50m")
            ]
        },
        "4bhk": {
            "title": "4BHK Signature Forest Estate Architectural Floor Plan",
            "dxf_name": "4bhk-architectural-floor-plan.dxf",
            "svg_name": "4bhk-architectural-floor-plan.svg",
            "id": "RV-ARCH-4BHK-01",
            "scale_str": "1:100 @ A3",
            "specs": {
                "Model": "4BHK Signature Forest Estate",
                "Gross Built Footprint": "4,500 sq.ft",
                "Composite Timber Decks": "Over 1,100 sq.ft",
                "Optional Plunge Pool": "220 sq.ft",
                "Zoning Buffer Allotment": "68% Forest Conservation Buffer",
                "Foundation Structure": "Eco-friendly Galvanized Screw Piles",
                "Technical Standard": "IS 12556 / NBC India Compliant"
            },
            "back_url": "../../models/4bhk-signature-forest-estate/index.html",
            "outer_walls": b4_wall_ext,
            "inner_walls": b4_wall_int,
            "decks": b4_decks,
            "wet": b4_wet,
            "landscape": b4_landscape,
            "stilts": b4_stilts,
            "windows": b4_windows,
            "doors": b4_doors,
            "furn": b4_furn,
            "kitchen": b4_kitchen,
            "rooms": b4_rooms,
            "ext_dims": b4_ext_dims,
            "to_svg": to_svg_4bhk,
            "schedule": [
                ("1. Entrance Foyer", "160 sq.ft / 14.9 sq.m", "2.40m x 6.20m"),
                ("2. Grand Family Pavilion", "580 sq.ft / 53.9 sq.m", "6.00m x 9.00m"),
                ("3. Chef Kitchen & Dining", "420 sq.ft / 39.0 sq.m", "4.86m x 8.00m"),
                ("4. Flagship Master Bed Suite", "380 sq.ft / 35.3 sq.m", "4.50m x 7.84m"),
                ("5. Signature Ensuite Bath", "220 sq.ft / 20.4 sq.m", "3.14m x 6.50m"),
                ("6. Bedroom 2 (Guest Suite)", "380 sq.ft / 35.3 sq.m", "4.50m x 7.84m"),
                ("7. Bedroom 3 Suite", "240 sq.ft / 22.3 sq.m", "3.42m x 6.50m"),
                ("8. Bedroom 4 Suite", "240 sq.ft / 22.3 sq.m", "3.42m x 6.50m"),
                ("9. Off-Grid Solar & Utility", "180 sq.ft / 16.7 sq.m", "2.40m x 7.00m"),
                ("10. Wellness Court Garden", "420 sq.ft / 39.0 sq.m", "7.14m x 5.45m"),
                ("11. Active Plunge Pool", "220 sq.ft / 20.4 sq.m", "5.00m x 4.10m"),
                ("12. Deck & Verandahs", "1,100 sq.ft / 102.2 sq.m", "Various modular widths")
            ]
        }
    }

    for key, p in packages.items():
        if key not in models_list:
            continue
        print(f"\nProcessing model: {p['title']} ({p['id']})")
        out_dir = dirs[key]
        
        # 2. GENERATE DXF FILE
        dxf_entities = ""
        
        # Write outer walls
        for line in p["outer_walls"]:
            (x1, y1), (x2, y2) = line
            dxf_entities += dxf_line(x1, y1, x2, y2, "A-WALL-EXT")
            
        # Write inner walls
        for line in p["inner_walls"]:
            (x1, y1), (x2, y2) = line
            dxf_entities += dxf_line(x1, y1, x2, y2, "A-WALL-INT")
            
        # Write decks
        for line in p["decks"]:
            (x1, y1), (x2, y2) = line
            dxf_entities += dxf_line(x1, y1, x2, y2, "A-DECK")
            
        # Write wet plunge pool
        for line in p["wet"]:
            (x1, y1), (x2, y2) = line
            dxf_entities += dxf_line(x1, y1, x2, y2, "A-WET")
            
        # Write landscape courts
        for line in p["landscape"]:
            (x1, y1), (x2, y2) = line
            dxf_entities += dxf_line(x1, y1, x2, y2, "A-LANDSCAPE")

        # Write kitchen countertops
        for line in p["kitchen"]:
            (x1, y1), (x2, y2) = line
            dxf_entities += dxf_line(x1, y1, x2, y2, "A-KITCHEN")

        # Write furniture blocks
        for line in p["furn"]:
            (x1, y1), (x2, y2) = line
            dxf_entities += dxf_line(x1, y1, x2, y2, "A-FURN")
            
        # Write windows
        for line in p["windows"]:
            (x1, y1), (x2, y2) = line
            # Windows are drawn in cyan (color 4) on layer A-WINDOW
            dxf_entities += dxf_line(x1, y1, x2, y2, "A-WINDOW")
            
        # Write doors (hinged or sliding)
        for line in p["doors"]:
            x1, y1 = line[0]
            x2, y2 = line[1]
            # Doors are drawn in color 9 (light grey) on layer A-DOOR
            dxf_entities += dxf_line(x1, y1, x2, y2, "A-DOOR")
            
        # Write stilts screw piles
        for sx, sy in p["stilts"]:
            # Stilt pile: small red circle of radius 0.15m + crosshairs
            dxf_entities += dxf_circle(sx, sy, 0.15, "A-STILT")
            dxf_entities += dxf_line(sx - 0.25, sy, sx + 0.25, sy, "A-STILT")
            dxf_entities += dxf_line(sx, sy - 0.25, sx, sy + 0.25, "A-STILT")
            
        # Write room chamber labels
        for label, area_str, (cx, cy) in p["rooms"]:
            # Main label: standard height 0.25m
            dxf_entities += dxf_text(cx, cy, label, 0.25, "A-TEXT")
            # Subtext (area): height 0.18m, offset by 0.35m vertically downwards
            dxf_entities += dxf_text(cx, cy - 0.35, area_str, 0.18, "A-TEXT")
            
        # Write external dimensions
        for line in p["ext_dims"]:
            (x1, y1), (x2, y2) = line[0], line[1]
            txt = line[2]
            rot = line[3] if len(line) > 3 else 0.0
            dxf_entities += dxf_line(x1, y1, x2, y2, "A-DIMS")
            # Ticks at endpoints
            dxf_entities += dxf_circle(x1, y1, 0.05, "A-DIMS")
            dxf_entities += dxf_circle(x2, y2, 0.05, "A-DIMS")
            # Centered text label
            mx, my = (x1 + x2) / 2.0, (y1 + y2) / 2.0
            if rot == 90.0:
                dxf_entities += dxf_text(mx - 0.3, my, txt, 0.20, "A-DIMS", rotation=90.0)
            else:
                dxf_entities += dxf_text(mx, my + 0.25, txt, 0.20, "A-DIMS")
                
        # Drawing disclaimers
        disclaimer_lines = [
            "TECHNICAL COVENANT NOTICE:",
            "ALL DIMENSIONS AND COORDINATES SHOWN ARE CONCEPTUAL ONLY AND INDICATIVE OF PROPOSED PROGRAM.",
            "THIS IS NOT AN EXECUTION DRAWING AND IS STRICTLY NOT FOR SITE CONSTRUCTION WORK.",
            "FINAL DIMENSIONS ARE SUBJECT TO ACTUAL LICENSED LAND SURVEYS, STRUCTURAL Borehole CHECKS,",
            "AND LOCAL ENVIRONMENT BUFFER / TCP / RERA AUTHORITY STAMPS."
        ]
        disclaimer_y_start = -5.8 if key == "2bhk" else (-6.8 if key == "3bhk" else -2.5)
        for idx, d_line in enumerate(disclaimer_lines):
            dxf_entities += dxf_text(1.0, disclaimer_y_start - (idx * 0.25), d_line, 0.16, "A-DISCLAIMER")
            
        # Draw true North indicator arrow
        north_x = -3.0 if key in ["2bhk", "3bhk"] else 2.0
        north_y = 10.0
        dxf_entities += dxf_circle(north_x, north_y, 0.4, "A-NORTH")
        dxf_entities += dxf_line(north_x, north_y - 0.4, north_x, north_y + 0.5, "A-NORTH")
        dxf_entities += dxf_line(north_x, north_y + 0.5, north_x - 0.2, north_y + 0.1, "A-NORTH")
        dxf_entities += dxf_line(north_x, north_y + 0.5, north_x + 0.2, north_y + 0.1, "A-NORTH")
        dxf_entities += dxf_text(north_x, north_y + 0.7, "N", 0.24, "A-NORTH")
        
        # Draw a clean Title Block border box
        # bx1, by1 to bx2, by2 in meters
        if key == "2bhk":
            bx1, by1 = 13.0, -4.5
            bx2, by2 = 18.0, -0.5
        elif key == "3bhk":
            bx1, by1 = 15.0, -5.5
            bx2, by2 = 20.0, -1.5
        else: # 4bhk
            bx1, by1 = 16.5, 0.5
            bx2, by2 = 21.5, 4.5
            
        dxf_entities += dxf_line(bx1, by1, bx2, by1, "A-TEXT")
        dxf_entities += dxf_line(bx2, by1, bx2, by2, "A-TEXT")
        dxf_entities += dxf_line(bx2, by2, bx1, by2, "A-TEXT")
        dxf_entities += dxf_line(bx1, by2, bx1, by1, "A-TEXT")
        dxf_entities += dxf_line(bx1, by2 - 0.6, bx2, by2 - 0.6, "A-TEXT")
        
        dxf_entities += dxf_text(bx1 + 0.3, by2 - 0.45, "RESERVA VERDE GOA", 0.26, "A-TEXT")
        dxf_entities += dxf_text(bx1 + 0.3, by2 - 1.0, f"Model: {key.upper()} Forest Estate", 0.18, "A-TEXT")
        dxf_entities += dxf_text(bx1 + 0.3, by2 - 1.3, "Drawing: Architectural Plan", 0.16, "A-TEXT")
        dxf_entities += dxf_text(bx1 + 0.3, by2 - 1.6, f"ID: {p['id']}", 0.15, "A-TEXT")
        dxf_entities += dxf_text(bx1 + 0.3, by2 - 1.9, "Scale: Indicative / 1:100 @ A3", 0.14, "A-TEXT")
        dxf_entities += dxf_text(bx1 + 0.3, by2 - 2.2, f"Revision: R1" if key == "3bhk" else "Revision: R0", 0.14, "A-TEXT")
        dxf_entities += dxf_text(bx1 + 0.3, by2 - 2.5, f"Date: {current_date}", 0.14, "A-TEXT")
        dxf_entities += dxf_text(bx1 + 0.3, by2 - 2.8, "Status: HNI + Architect Review", 0.14, "A-TEXT")
        dxf_entities += dxf_text(bx1 + 0.3, by2 - 3.2, "ALL DIMENSIONS IN METERS", 0.12, "A-TEXT")

        # Compile and save DXF
        dxf_content = dxf_header + dxf_tables + dxf_tables_end + dxf_entities + dxf_footer
        dxf_path = os.path.join(out_dir, p["dxf_name"])
        with open(dxf_path, "w", encoding="utf-8") as f:
            f.write(dxf_content)
        print(f"DXF file generated successfully: {dxf_path}")
        
        # 3. GENERATE Standalone B&W Plotted SVG FILE
        svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1700 1200" width="1700" height="1200" font-family="'Montserrat', 'Arial', sans-serif">
<defs>
  <style>
    .bg {{ fill: #ffffff; }}
    .border-thick {{ stroke: #000000; stroke-width: 2.0; fill: none; }}
    .border-thin {{ stroke: #555555; stroke-width: 0.5; stroke-dasharray: 3,3; fill: none; }}
    .wall-ext {{ stroke: #000000; stroke-width: 3.2; fill: #f2f2f2; }}
    .wall-int {{ stroke: #444444; stroke-width: 1.8; fill: #f2f2f2; }}
    .door {{ stroke: #888888; stroke-width: 1.0; fill: none; }}
    .door-swing {{ stroke: #b0b0b0; stroke-width: 0.8; stroke-dasharray: 2,2; fill: none; }}
    .window {{ stroke: #0088aa; stroke-width: 1.2; fill: none; }}
    .stilt {{ stroke: #cc3333; stroke-width: 1.2; fill: none; }}
    .stilt-cross {{ stroke: #cc3333; stroke-width: 0.8; fill: none; }}
    .furn {{ stroke: #aaaaaa; stroke-width: 0.8; fill: none; }}
    .text-title {{ fill: #000000; font-family: 'Cormorant Garamond', 'Georgia', serif; font-size: 26px; font-weight: 500; letter-spacing: 5px; }}
    .text-subtitle {{ fill: #555555; font-size: 11px; font-weight: 600; letter-spacing: 3px; }}
    .text-room {{ fill: #000000; font-size: 11px; font-weight: bold; letter-spacing: 1px; }}
    .text-details {{ fill: #555555; font-size: 8px; font-weight: 400; }}
    .text-dim {{ fill: #1f4e79; font-size: 8px; font-weight: bold; }}
    .dim-line {{ stroke: #1f4e79; stroke-width: 0.6; fill: none; }}
    .dim-ext {{ stroke: #7f99b2; stroke-width: 0.4; stroke-dasharray: 2,2; fill: none; }}
    .deck {{ fill: #fafafa; stroke: #666666; stroke-width: 0.8; }}
    .pool {{ fill: #eef8ff; stroke: #1f4e79; stroke-width: 1.0; }}
  </style>
  
  <!-- hatches -->
  <pattern id="tileHatch" patternUnits="userSpaceOnUse" width="20" height="20">
    <path d="M 0 20 L 20 0 M 0 0 L 20 20" stroke="rgba(0, 0, 0, 0.05)" stroke-width="0.3"/>
  </pattern>
  <pattern id="deckHatch" patternUnits="userSpaceOnUse" width="16" height="16">
    <line x1="0" y1="8" x2="16" y2="8" stroke="rgba(102, 102, 102, 0.15)" stroke-width="0.4"/>
    <line x1="0" y1="16" x2="16" y2="16" stroke="rgba(102, 102, 102, 0.15)" stroke-width="0.4"/>
  </pattern>
  <pattern id="waterHatch" patternUnits="userSpaceOnUse" width="14" height="14">
    <path d="M 0 4 Q 3.5 2 7 4 T 14 4" stroke="rgba(31, 78, 121, 0.15)" stroke-width="0.4" fill="none"/>
    <path d="M 0 9 Q 3.5 7 7 9 T 14 9" stroke="rgba(31, 78, 121, 0.15)" stroke-width="0.4" fill="none"/>
  </pattern>
</defs>

<!-- Background -->
<rect width="1700" height="1200" class="bg"/>
<rect x="15" y="15" width="1670" height="1170" class="border-thick"/>
<rect x="22" y="22" width="1656" height="1156" class="border-thin"/>

<!-- Header Titles -->
<text x="850" y="55" text-anchor="middle" class="text-title">RESERVA VERDE GOA · {key.upper()} COMPACT FOREST ESTATE</text>
<text x="850" y="78" text-anchor="middle" class="text-subtitle">TRADITIONAL 2D ARCHITECTURAL FLOOR PLAN SHEET · SCALE {p['scale_str']} · conceptual review</text>
<line x1="60" y1="92" x2="1640" y2="92" stroke="#000000" stroke-width="0.8"/>
"""

        # Draw Decks with hatch
        for line in p["decks"]:
            (dx1, dy1), (dx2, dy2) = line
            sx1, sy1 = p["to_svg"](dx1, dy1)
            sx2, sy2 = p["to_svg"](dx2, dy2)
            svg_content += f'<line x1="{sx1:.1f}" y1="{sy1:.1f}" x2="{sx2:.1f}" y2="{sy2:.1f}" class="deck" stroke-dasharray="16, 0" style="fill: url(#deckHatch);"/>\n'
            
        # Draw plunge pool
        for line in p["wet"]:
            (wx1, wy1), (wx2, wy2) = line
            sx1, sy1 = p["to_svg"](wx1, wy1)
            sx2, sy2 = p["to_svg"](wx2, wy2)
            svg_content += f'<line x1="{sx1:.1f}" y1="{sy1:.1f}" x2="{sx2:.1f}" y2="{sy2:.1f}" class="pool" style="fill: url(#waterHatch);"/>\n'

        # Special poly-fills for Decks & Pool in SVG so hatches rendered beautifully
        if key == "2bhk":
            svg_content += '<!-- Decks polygons -->\n'
            svg_content += '<polygon points="295.0,810.0 955.0,810.0 955.0,947.5 295.0,947.5" class="deck" style="fill: url(#deckHatch); fill-opacity: 0.8;"/>\n'
            svg_content += '<polygon points="295.0,947.5 680.0,947.5 680.0,1057.5 295.0,1057.5" class="deck" style="fill: url(#deckHatch); fill-opacity: 0.8;"/>\n'
            svg_content += '<!-- Pool polygon -->\n'
            svg_content += '<polygon points="680.0,947.5 955.0,947.5 955.0,1057.5 680.0,1057.5" class="pool" style="fill: url(#waterHatch);"/>\n'
            svg_content += '<!-- Wet area polygons (Bathrooms & Powder) -->\n'
            svg_content += '<polygon points="817.5,150.0 955.0,150.0 955.0,315.0 817.5,315.0" class="deck" style="fill: url(#tileHatch);"/>\n'
            svg_content += '<polygon points="597.5,397.5 735.0,397.5 735.0,507.5 597.5,507.5" class="deck" style="fill: url(#tileHatch);"/>\n'
            svg_content += '<polygon points="597.5,700.0 735.0,700.0 735.0,810.0 597.5,810.0" class="deck" style="fill: url(#tileHatch);"/>\n'
        elif key == "3bhk":
            svg_content += '<!-- Decks polygons -->\n'
            svg_content += '<polygon points="275.0,760.0 975.0,760.0 975.0,910.0 275.0,910.0" class="deck" style="fill: url(#deckHatch); fill-opacity: 0.8;"/>\n'
            svg_content += '<polygon points="275.0,910.0 675.0,910.0 675.0,1035.0 275.0,1035.0" class="deck" style="fill: url(#deckHatch); fill-opacity: 0.8;"/>\n'
            svg_content += '<!-- Pool polygon -->\n'
            svg_content += '<polygon points="675.0,910.0 975.0,910.0 975.0,1035.0 675.0,1035.0" class="pool" style="fill: url(#waterHatch);"/>\n'
            svg_content += '<!-- Wet area polygons (Bathrooms & Powder) -->\n'
            svg_content += '<polygon points="600.0,160.0 750.0,160.0 750.0,285.0 600.0,285.0" class="deck" style="fill: url(#tileHatch);"/>\n'
            svg_content += '<polygon points="600.0,385.0 750.0,385.0 750.0,510.0 600.0,510.0" class="deck" style="fill: url(#tileHatch);"/>\n'
            svg_content += '<polygon points="600.0,535.0 750.0,535.0 750.0,660.0 600.0,660.0" class="deck" style="fill: url(#tileHatch);"/>\n'
            svg_content += '<polygon points="600.0,660.0 675.0,660.0 675.0,760.0 600.0,760.0" class="deck" style="fill: url(#tileHatch);"/>\n'
        elif key == "4bhk":
            svg_content += '<!-- Decks polygons -->\n'
            svg_content += '<polygon points="60,1020 840,1020 840,480 1180,480 1180,140 1280,140 1280,600 960,600 960,1140 60,1140" class="deck" style="fill: url(#deckHatch); fill-opacity: 0.8;"/>\n'
            svg_content += '<!-- Pool polygon -->\n'
            svg_content += '<polygon points="1010,650 1240,650 1240,830 1010,830" class="pool" style="fill: url(#waterHatch);"/>\n'
            svg_content += '<!-- Court polygon -->\n'
            svg_content += '<polygon points="120,310 620,310 620,480 120,480" class="deck" style="fill: url(#tileHatch);"/>\n'

        # Draw External Walls
        svg_content += '<!-- External Wall Outlines -->\n'
        for line in p["outer_walls"]:
            (ex1, ey1), (ex2, ey2) = line
            sx1, sy1 = p["to_svg"](ex1, ey1)
            sx2, sy2 = p["to_svg"](ex2, ey2)
            svg_content += f'<line x1="{sx1:.1f}" y1="{sy1:.1f}" x2="{sx2:.1f}" y2="{sy2:.1f}" class="wall-ext"/>\n'

        # Draw Internal Partitions
        svg_content += '<!-- Internal partition lines -->\n'
        for line in p["inner_walls"]:
            (ix1, iy1), (ix2, iy2) = line
            sx1, sy1 = p["to_svg"](ix1, iy1)
            sx2, sy2 = p["to_svg"](ix2, iy2)
            svg_content += f'<line x1="{sx1:.1f}" y1="{sy1:.1f}" x2="{sx2:.1f}" y2="{sy2:.1f}" class="wall-int"/>\n'

        # Draw Windows as breaks
        svg_content += '<!-- Glazed window framework breaks -->\n'
        for line in p["windows"]:
            (wx1, wy1), (wx2, wy2) = line
            sx1, sy1 = p["to_svg"](wx1, wy1)
            sx2, sy2 = p["to_svg"](wx2, wy2)
            # Offset double line representation
            dx = sx2 - sx1
            dy = sy2 - sy1
            length = (dx*dx + dy*dy)**0.5
            if length > 0:
                ux = -dy / length * 3.5
                uy = dx / length * 3.5
                svg_content += f'<line x1="{sx1 + ux:.1f}" y1="{sy1 + uy:.1f}" x2="{sx2 + ux:.1f}" y2="{sy2 + uy:.1f}" class="window"/>\n'
                svg_content += f'<line x1="{sx1 - ux:.1f}" y1="{sy1 - uy:.1f}" x2="{sx2 - ux:.1f}" y2="{sy2 - uy:.1f}" class="window"/>\n'
                svg_content += f'<line x1="{sx1:.1f}" y1="{sy1:.1f}" x2="{sx2:.1f}" y2="{sy2:.1f}" stroke="#ccffff" stroke-width="1.0" style="opacity: 0.5;"/>\n'

        # Draw Doors & swing chords
        svg_content += '<!-- Hinged/Sliding door swings -->\n'
        for line in p["doors"]:
            (dx1, dy1), (dx2, dy2) = line[0], line[1]
            dtype = line[2]
            sx1, sy1 = p["to_svg"](dx1, dy1)
            sx2, sy2 = p["to_svg"](dx2, dy2)
            
            if dtype == "sliding":
                # sliding double track
                svg_content += f'<line x1="{sx1:.1f}" y1="{sy1:.1f}" x2="{sx2:.1f}" y2="{sy2:.1f}" class="door" stroke-width="1.8"/>\n'
                svg_content += f'<line x1="{sx1 + 2:.1f}" y1="{sy1 + 2:.1f}" x2="{sx2 + 2:.1f}" y2="{sy2 + 2:.1f}" stroke="#b0b0b0" stroke-width="0.5"/>\n'
            else:
                # standard hinged: draw door leaf and a nice 90-degree swing arc!
                svg_content += f'<line x1="{sx1:.1f}" y1="{sy1:.1f}" x2="{sx1:.1f}" y2="{sy1 - 40:.1f}" class="door"/>\n'
                svg_content += f'<path d="M {sx1:.1f} {sy1 - 40:.1f} A 40 40 0 0 1 {sx2:.1f} {sy2:.1f}" class="door-swing"/>\n'

        # Draw Furniture Outlines
        svg_content += '<!-- Furniture blocks -->\n'
        for line in p["furn"]:
            (fx1, fy1), (fx2, fy2) = line
            sx1, sy1 = p["to_svg"](fx1, fy1)
            sx2, sy2 = p["to_svg"](fx2, fy2)
            svg_content += f'<line x1="{sx1:.1f}" y1="{sy1:.1f}" x2="{sx2:.1f}" y2="{sy2:.1f}" class="furn"/>\n'

        # Draw kitchen counter outline
        for line in p["kitchen"]:
            (kx1, ky1), (kx2, ky2) = line
            sx1, sy1 = p["to_svg"](kx1, ky1)
            sx2, sy2 = p["to_svg"](kx2, ky2)
            svg_content += f'<line x1="{sx1:.1f}" y1="{sy1:.1f}" x2="{sx2:.1f}" y2="{sy2:.1f}" class="furn" stroke-width="1.2"/>\n'

        # Draw Stilts pilings
        svg_content += '<!-- screw-pile stilt foundations -->\n'
        for sx, sy in p["stilts"]:
            sx_svg, sy_svg = p["to_svg"](sx, sy)
            # Circle
            svg_content += f'<circle cx="{sx_svg:.1f}" cy="{sy_svg:.1f}" r="8" class="stilt"/>\n'
            # Crosshairs
            svg_content += f'<line x1="{sx_svg - 14:.1f}" y1="{sy_svg:.1f}" x2="{sx_svg + 14:.1f}" y2="{sy_svg:.1f}" class="stilt-cross"/>\n'
            svg_content += f'<line x1="{sx_svg:.1f}" y1="{sy_svg - 14:.1f}" x2="{sx_svg:.1f}" y2="{sy_svg + 14:.1f}" class="stilt-cross"/>\n'

        # Draw Dimension Chains
        svg_content += '<!-- Blue-Grey Dimension chains -->\n'
        for line in p["ext_dims"]:
            (dx1, dy1), (dx2, dy2) = line[0], line[1]
            txt = line[2]
            rot = line[3] if len(line) > 3 else 0.0
            sx1, sy1 = p["to_svg"](dx1, dy1)
            sx2, sy2 = p["to_svg"](dx2, dy2)
            
            # draw dimension line
            svg_content += f'<line x1="{sx1:.1f}" y1="{sy1:.1f}" x2="{sx2:.1f}" y2="{sy2:.1f}" class="dim-line"/>\n'
            # ticks at intersections (small diagonal architectural ticks)
            if rot == 90.0:
                svg_content += f'<line x1="{sx1 - 6:.1f}" y1="{sy1 - 6:.1f}" x2="{sx1 + 6:.1f}" y2="{sy1 + 6:.1f}" stroke="#1f4e79" stroke-width="1.2"/>\n'
                svg_content += f'<line x1="{sx2 - 6:.1f}" y1="{sy2 - 6:.1f}" x2="{sx2 + 6:.1f}" y2="{sy2 + 6:.1f}" stroke="#1f4e79" stroke-width="1.2"/>\n'
                # centered rotated text
                mx, my = (sx1 + sx2) / 2.0, (sy1 + sy2) / 2.0
                svg_content += f'<text x="{mx - 15:.1f}" y="{my:.1f}" text-anchor="middle" transform="rotate(-90, {mx - 15:.1f}, {my:.1f})" class="text-dim">{txt.upper()}</text>\n'
            else:
                svg_content += f'<line x1="{sx1 - 6:.1f}" y1="{sy1 + 6:.1f}" x2="{sx1 + 6:.1f}" y2="{sy1 - 6:.1f}" stroke="#1f4e79" stroke-width="1.2"/>\n'
                svg_content += f'<line x1="{sx2 - 6:.1f}" y1="{sy2 + 6:.1f}" x2="{sx2 + 6:.1f}" y2="{sy2 - 6:.1f}" stroke="#1f4e79" stroke-width="1.2"/>\n'
                # centered horizontal text
                mx, my = (sx1 + sx2) / 2.0, (sy1 + sy2) / 2.0
                svg_content += f'<text x="{mx:.1f}" y="{my - 12:.1f}" text-anchor="middle" class="text-dim">{txt.upper()}</text>\n'

        # Draw Room Chamber Labels
        svg_content += '<!-- Room Labels -->\n'
        for label, area_str, (cx, cy) in p["rooms"]:
            sx, sy = p["to_svg"](cx, cy)
            svg_content += f'<text x="{sx:.1f}" y="{sy:.1f}" text-anchor="middle" class="text-room">{label}</text>\n'
            svg_content += f'<text x="{sx:.1f}" y="{sy + 18:.1f}" text-anchor="middle" class="text-details" style="font-weight: 500; fill: #444444;">{area_str.upper()}</text>\n'

        # North indicator symbol near top-left: center (120, 190)
        svg_content += """
<!-- AutoCAD Standard North Indicator Arrow -->
<g transform="translate(120, 190)">
  <circle cx="0" cy="0" r="32" stroke="#000000" stroke-width="1.5" fill="none"/>
  <path d="M 0 -44 L 8 -12 L 0 -18 L -8 -12 Z" fill="#000000" stroke="#000000" stroke-width="1.0"/>
  <line x1="0" y1="-18" x2="0" y2="40" stroke="#000000" stroke-width="1.5"/>
  <text x="0" y="-48" text-anchor="middle" style="font-family: 'Montserrat', Arial; font-weight: bold; font-size: 18px; fill: #000000;">N</text>
</g>
"""

        # AutoCAD Plotted Graphic Scale bar (100, 290)
        svg_content += """
<!-- Graphic Scale Bar -->
<g transform="translate(60, 270)">
  <rect x="0" y="0" width="70" height="8" fill="#000000" stroke="#000000" stroke-width="0.5"/>
  <rect x="70" y="0" width="70" height="8" fill="none" stroke="#000000" stroke-width="0.5"/>
  <rect x="140" y="0" width="70" height="8" fill="#000000" stroke="#000000" stroke-width="0.5"/>
  <rect x="210" y="0" width="70" height="8" fill="none" stroke="#000000" stroke-width="0.5"/>
  <text x="0" y="24" class="text-details" style="fill: #000000; font-weight: bold;">0</text>
  <text x="70" y="24" class="text-details" style="fill: #000000; font-weight: bold;">1.0m</text>
  <text x="140" y="24" class="text-details" style="fill: #000000; font-weight: bold;">2.0m</text>
  <text x="210" y="24" class="text-details" style="fill: #000000; font-weight: bold;">3.0m</text>
  <text x="280" y="24" class="text-details" style="fill: #000000; font-weight: bold;">4.0m</text>
  <text x="140" y="-10" text-anchor="middle" class="text-room" style="font-size: 9px; fill: #000000;">SCALE 1:100 @ A3 SHEET</text>
</g>
"""

        # Title Block Border Box (Bottom-Right corner)
        # Size: 390 x 230, translates to (1280, 930)
        svg_content += f"""
<!-- Standard Plotted Title Block (Bottom-Right Corner) -->
<g transform="translate(1280, 930)">
  <rect x="0" y="0" width="390" height="230" style="fill: #ffffff; stroke: #000000; stroke-width: 1.5;"/>
  <text x="195" y="32" text-anchor="middle" class="text-title" style="font-size: 16px; font-weight: bold; letter-spacing: 2px;">RESERVA VERDE GOA</text>
  <line x1="20" y1="44" x2="370" y2="44" stroke="#000000" stroke-width="0.8"/>
  
  <text x="25" y="70" class="text-details" style="font-weight: bold; fill: #000000;">PROJECT:</text>
  <text x="125" y="70" class="text-details" style="font-weight: 600; fill: #333333;">Reserva Verde (South Goa Forest Estate)</text>
  
  <text x="25" y="92" class="text-details" style="font-weight: bold; fill: #000000;">DRAWING:</text>
  <text x="125" y="92" class="text-details" style="font-weight: 600; fill: #333333;">{key.upper()} Architectural Floor Plan</text>
  
  <text x="25" y="114" class="text-details" style="font-weight: bold; fill: #000000;">DRAWING NO:</text>
  <text x="125" y="114" class="text-details" style="font-weight: 600; fill: #333333;">{p['id']}</text>
  
  <text x="25" y="136" class="text-details" style="font-weight: bold; fill: #000000;">INDICATIVE SCALE:</text>
  <text x="125" y="136" class="text-details" style="font-weight: 600; fill: #333333;">{p['scale_str']} (Conceptual exchange sheet)</text>
  
  <text x="25" y="158" class="text-details" style="font-weight: bold; fill: #000000;">REVISION / DATE:</text>
  <text x="125" y="158" class="text-details" style="font-weight: 600; fill: #333333;">{"R1" if key == "3bhk" else "R0"}  /  {current_date}</text>
  
  <text x="25" y="180" class="text-details" style="font-weight: bold; fill: #000000;">STATUS / REQ:</text>
  <text x="125" y="180" class="text-details" style="font-weight: 600; fill: #333333;">Conceptual HNI + Licensed Architect Review</text>
  
  <rect x="20" y="196" width="350" height="24" style="fill: #fff0f0; stroke: #cc3333; stroke-width: 0.5;"/>
  <text x="195" y="211" text-anchor="middle" class="text-details" style="fill: #cc3333; font-weight: bold; font-size: 7.2px; letter-spacing: 0.2px;">ALL DIMENSIONS ARE INDICATIVE AND SUBJECT TO FINAL SURVEY</text>
</g>
"""

        # Embedded space schedule (Top-Right)
        # size: 390 x 340, translate (1280, 110)
        svg_content += f"""
<!-- Space Schedule Box -->
<g transform="translate(1280, 110)">
  <rect x="0" y="0" width="390" height="340" style="fill: #fafafa; stroke: #000000; stroke-width: 0.8;"/>
  <text x="195" y="24" text-anchor="middle" class="text-room" style="font-size: 11px; fill: #000000;">TRADITIONAL WORK-PLAN ROOM SCHEDULE</text>
  <line x1="20" y1="34" x2="370" y2="34" stroke="#000000" stroke-width="0.5"/>
  
  <text x="25" y="52" class="text-details" style="font-weight: bold; fill: #000000;">SPACE ID &amp; ALLOCATION</text>
  <text x="190" y="52" class="text-details" style="font-weight: bold; fill: #000000;">NET BUILT AREA</text>
  <text x="290" y="52" class="text-details" style="font-weight: bold; fill: #000000;">INTERNAL SIZES</text>
  <line x1="20" y1="58" x2="370" y2="58" stroke="#444444" stroke-width="0.4"/>
"""
        
        row_y = 74
        for name, area, dims in p["schedule"][:10]: # show top 10 rows to fit nicely
            svg_content += f"""
  <text x="25" y="{row_y}" class="text-details" style="font-weight: 600; fill: #333333;">{name}</text>
  <text x="190" y="{row_y}" class="text-details">{area}</text>
  <text x="290" y="{row_y}" class="text-details" style="font-weight: bold;">{dims}</text>
  <line x1="20" y1="{row_y + 8}" x2="370" y2="{row_y + 8}" stroke="rgba(0,0,0,0.1)" stroke-width="0.3"/>
"""
            row_y += 24

        svg_content += f"""
  <line x1="20" y1="300" x2="370" y2="300" stroke="#000000" stroke-width="0.6"/>
  <text x="25" y="318" class="text-details" style="font-weight: bold; fill: #000000;">EST. BUILT FOOTPRINT</text>
  <text x="290" y="318" class="text-details" style="font-weight: bold; fill: #1f4e79;">{p['specs']['Gross Built Footprint']}</text>
</g>
"""

        # Embedded Room Area schedule (Middle-Right)
        # size: 390 x 440, translate (1280, 470)
        svg_content += f"""
<!-- Specifications Table (Middle-Right) -->
<g transform="translate(1280, 470)">
  <rect x="0" y="0" width="390" height="440" style="fill: #fafafa; stroke: #000000; stroke-width: 0.8;"/>
  <text x="195" y="24" text-anchor="middle" class="text-room" style="font-size: 11px; fill: #000000;">ESTATE DRAWING SPECIFICATIONS</text>
  <line x1="20" y1="34" x2="370" y2="34" stroke="#000000" stroke-width="0.5"/>
"""
        
        spec_y = 60
        for spec_key, spec_val in p["specs"].items():
            svg_content += f"""
  <text x="25" y="{spec_y}" class="text-details" style="font-weight: bold; fill: #000000;">{spec_key}:</text>
  <text x="175" y="{spec_y}" class="text-details" style="fill: #333333;">{spec_val}</text>
  <line x1="20" y1="{spec_y + 12}" x2="370" y2="{spec_y + 12}" stroke="rgba(0,0,0,0.1)" stroke-width="0.3"/>
"""
            spec_y += 30

        # Technical covenants notes at the bottom of the table
        svg_content += f"""
  <rect x="20" y="310" width="350" height="110" style="fill: #f9f9f9; stroke: #aaaaaa; stroke-width: 0.5;"/>
  <text x="30" y="330" class="text-details" style="font-weight: bold; fill: #000000;">TECHNICAL WORKING COVENANTS:</text>
  <text x="30" y="348" class="text-details" style="fill: #555555; font-size: 7px;">1. NOT FOR CIVIL CONSTRUCTION - STAMPED ARCHITECT REQUIRED.</text>
  <text x="30" y="360" class="text-details" style="fill: #555555; font-size: 7px;">2. ALL DIMENSIONS MUST BE VERIFIED ON SITE BEFORE FOUNDATIONS.</text>
  <text x="30" y="372" class="text-details" style="fill: #555555; font-size: 7px;">3. GALVANIZED STEEL STILT SPACING DECLARED INDICATIVELY.</text>
  <text x="30" y="384" class="text-details" style="fill: #555555; font-size: 7px;">4. ENVIRONMENT ENV-ZONE RESTRICTIONS TO SUPERSEDE PLANS.</text>
  <text x="30" y="396" class="text-details" style="fill: #cc3333; font-size: 7px; font-weight: bold;">5. ALL DIMENSIONS ARE INDICATIVE AND SUBJECT TO FINAL SURVEY.</text>
</g>
"""

        # Technical copyright disclaimer at the absolute bottom
        svg_content += """
<!-- Footer Covenants -->
<text x="60" y="1176" class="text-details" style="fill: #777777; font-size: 7.2px; font-weight: bold; letter-spacing: 0.05px;">
  TECHNICAL NOTICE: RESERVA VERDE COA ARCHITECTURAL WORK-SHEET PACKAGE RV-ARCH-""" + key.upper() + """-01. ALL DESIGN CONSTRAINTS, LAYOUT CHAMBERS, DIMENSIONS, AND SYMBOLS SHOWN 
  CONSTITUTE PRE-EXECUTION DESIGN CONCEPTS. THEY REVEAL ARCHITECTURAL INTENT AND SHALL ONLY BE INTEGRATED INTO EXECUTION DRAWINGS AFTER ENGINEERING Topographic AND SOIL BEARING REVIEW.
</text>
</svg>
"""
        
        svg_path = os.path.join(out_dir, p["svg_name"])
        with open(svg_path, "w", encoding="utf-8") as f:
            f.write(svg_content)
        print(f"SVG file generated successfully: {svg_path}")

        # 4. GENERATE PREVIEW index.html FILE
        html_path = os.path.join(out_dir, "index.html")
        
        # Check if DWG file exists
        dwg_filename = p["dxf_name"].replace(".dxf", ".dwg")
        dwg_filepath = os.path.join(out_dir, dwg_filename)
        if key == "3bhk":
            dwg_button = '<div style="font-size: 0.72rem; color: #8b3a33; text-align: center; border: 1px dashed var(--color-border); padding: 0.8rem; border-radius: 4px; margin-top: 0.8rem; font-weight: bold; background: #fff0f0;">DWG requires regeneration after 3BHK R1 cleanup</div>'
        elif os.path.exists(dwg_filepath):
            dwg_button = f'<a href="{dwg_filename}" download class="download-outline" style="border-color: var(--color-navy); color: var(--color-navy); margin-top: 0.8rem; display: block;">Download AutoCAD DWG</a>'
        else:
            dwg_button = '<div style="font-size: 0.72rem; color: #888888; text-align: center; border: 1px dashed var(--color-border); padding: 0.8rem; border-radius: 4px; margin-top: 0.8rem;">DWG pending AutoCAD conversion</div>'

        # Format specifications table for sidebar
        specs_rows = ""
        for sk, sv in p["specs"].items():
            specs_rows += f"<li><span>{sk}</span> <span>{sv}</span></li>\n"
            
        # Format room schedule table for bottom page
        schedule_rows = ""
        for name, area, dims in p["schedule"]:
            schedule_rows += f"<tr><td><strong>{name}</strong></td><td>{area}</td><td><strong>{dims}</strong></td></tr>\n"

        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{p['title']} — AutoCAD Sheets | Reserva Verde Goa</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Montserrat:wght@200;300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {{
            --color-forest-dark: #090e0c;
            --color-white-sheet: #ffffff;
            --color-light-grey: #f7f9f8;
            --color-dark-ink: #111b15;
            --color-navy: #1f4e79;
            --color-border: #ccd3d0;
            --color-accent-red: #8b3a33;
            
            --font-serif: 'Cormorant Garamond', serif;
            --font-sans: 'Montserrat', sans-serif;
        }}

        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: var(--font-sans);
            background-color: var(--color-light-grey);
            color: var(--color-dark-ink);
            line-height: 1.7;
            padding: 3rem 2rem;
            -webkit-font-smoothing: antialiased;
        }}

        .container {{
            max-width: 1440px;
            margin: 0 auto;
        }}

        header {{
            margin-bottom: 2.5rem;
            border-bottom: 1px solid var(--color-border);
            padding-bottom: 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            flex-wrap: wrap;
            gap: 1.5rem;
        }}

        h1 {{
            font-family: var(--font-serif);
            font-size: clamp(1.8rem, 3.5vw, 2.6rem);
            font-weight: 500;
            color: var(--color-dark-ink);
            line-height: 1.2;
            margin-bottom: 0.4rem;
        }}

        .eyebrow {{
            color: var(--color-navy);
            font-size: 0.72rem;
            letter-spacing: 0.25em;
            font-weight: 700;
            text-transform: uppercase;
        }}

        .btn-back {{
            display: inline-flex;
            align-items: center;
            color: var(--color-dark-ink);
            text-decoration: none;
            font-size: 0.72rem;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            font-weight: 700;
            border: 1.5px solid var(--color-dark-ink);
            padding: 0.75rem 1.5rem;
            border-radius: 4px;
            background: transparent;
            transition: all 0.3s ease;
        }}

        .btn-back:hover {{
            background: var(--color-dark-ink);
            color: var(--color-white-sheet);
        }}

        .grid {{
            display: grid;
            grid-template-columns: 1fr 380px;
            gap: 2.5rem;
            align-items: start;
        }}

        @media (max-width: 1100px) {{
            .grid {{ grid-template-columns: 1fr; }}
        }}

        .viewport {{
            width: 100%;
            background: var(--color-white-sheet);
            border: 2px solid var(--color-dark-ink);
            padding: 1rem;
            border-radius: 6px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.06);
            overflow-x: auto;
        }}

        .viewport svg {{
            width: 100%;
            height: auto;
            display: block;
            min-width: 1000px;
        }}

        .sidebar {{
            display: flex;
            flex-direction: column;
            gap: 2rem;
        }}

        .card {{
            background: var(--color-white-sheet);
            border: 1px solid var(--color-border);
            border-radius: 6px;
            padding: 1.6rem;
            box-shadow: 0 4px 15px rgba(0,0,0,0.02);
        }}

        .card h3 {{
            font-family: var(--font-serif);
            font-size: 1.35rem;
            color: var(--color-navy);
            margin-bottom: 0.8rem;
            font-weight: 600;
            border-bottom: 1.5px solid var(--color-border);
            padding-bottom: 0.4rem;
        }}

        .download-btn {{
            display: block;
            width: 100%;
            text-align: center;
            padding: 0.9rem;
            background: var(--color-navy);
            color: var(--color-white-sheet);
            text-decoration: none;
            font-size: 0.72rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            border-radius: 4px;
            transition: all 0.3s ease;
            margin-bottom: 0.8rem;
            box-shadow: 0 4px 10px rgba(31, 78, 121, 0.2);
        }}

        .download-btn:hover {{
            background: #143552;
            transform: translateY(-1px);
        }}

        .download-outline {{
            display: block;
            width: 100%;
            text-align: center;
            padding: 0.9rem;
            border: 1.5px solid var(--color-dark-ink);
            color: var(--color-dark-ink);
            background: transparent;
            text-decoration: none;
            font-size: 0.72rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            border-radius: 4px;
            transition: all 0.3s ease;
        }}

        .download-outline:hover {{
            background: var(--color-dark-ink);
            color: var(--color-white-sheet);
        }}

        .specs-list {{
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 0.7rem;
        }}

        .specs-list li {{
            display: flex;
            justify-content: space-between;
            font-size: 0.82rem;
            border-bottom: 1px dashed var(--color-border);
            padding-bottom: 0.4rem;
        }}

        .specs-list li span:first-child {{
            color: #555555;
            font-weight: 600;
        }}

        .specs-list li span:last-child {{
            font-weight: 700;
            color: var(--color-dark-ink);
        }}

        .schedule-card {{
            margin-top: 3rem;
        }}

        .schedule-table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
            background: var(--color-white-sheet);
            border: 1px solid var(--color-border);
            font-size: 0.85rem;
        }}

        .schedule-table th, .schedule-table td {{
            padding: 0.8rem 1.2rem;
            text-align: left;
            border: 1px solid var(--color-border);
        }}

        .schedule-table th {{
            background: var(--color-light-grey);
            font-weight: 700;
            color: var(--color-navy);
            text-transform: uppercase;
            font-size: 0.75rem;
            letter-spacing: 0.1em;
        }}

        .schedule-table tr:nth-child(even) {{
            background: #fafafa;
        }}

        .covenants-card {{
            background: #fdfefe;
            border-left: 4px solid var(--color-navy);
            padding: 1.5rem;
            margin-top: 2.5rem;
            border-radius: 4px;
        }}

        .covenants-card h4 {{
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--color-navy);
            margin-bottom: 0.6rem;
            font-weight: 700;
        }}

        .covenants-card ul {{
            padding-left: 1.2rem;
            font-size: 0.8rem;
            color: #555555;
        }}

        .covenants-card li {{
            margin-bottom: 0.4rem;
        }}

        .disclaimer-block {{
            margin-top: 4rem;
            border-top: 2px solid var(--color-border);
            padding-top: 2rem;
            color: #666666;
            font-size: 0.74rem;
            line-height: 1.8;
            font-style: italic;
            text-align: center;
        }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div>
                <span class="eyebrow">[ RV-ARCHITECTURAL-REGISTER ]</span>
                <h1>{p['title']}</h1>
                <p style="color: #555555; font-size: 0.9rem; margin-top: 0.2rem;">Traditional AutoCAD B&amp;W exchange files, blue/grey dimension chains, and stilted piling centers.</p>
            </div>
            <div>
                <a href="{p['back_url']}" class="btn-back">← Back to Estate Page</a>
            </div>
        </header>

        <div class="grid">
            <!-- SVG Architectural sheet Viewport -->
            <div class="viewport">
                {svg_content}
            </div>

            <!-- Sidebar technical panel -->
            <div class="sidebar">
                <!-- Downloads -->
                <div class="card">
                    <h3>CAD Exchange Files</h3>
                    <p style="font-size: 0.8rem; color: #555555; margin-bottom: 1.5rem;">Download traditional plotted B&amp;W vector sheets and exchange DXF layers for statutory, landscape, and contractor reviews.</p>
                    <a href="{p['dxf_name']}" download class="download-btn">Download AutoCAD DXF</a>
                    <a href="{p['svg_name']}" download class="download-outline">Download Plotted SVG</a>
                    {dwg_button}
                </div>

                <!-- Specs -->
                <div class="card">
                    <h3>Drawing Specifications</h3>
                    <ul class="specs-list">
                        <li><span>Drawing ID</span> <span style="color: var(--color-navy);">{p['id']}</span></li>
                        {specs_rows}
                        <li><span>Revision</span> <span>{"R1" if key == "3bhk" else "R0"} (Conceptual)</span></li>
                        <li><span>Date</span> <span>{current_date}</span></li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Room Schedule Card -->
        <div class="card schedule-card">
            <h3>Traditional Room Area Schedule</h3>
            <p style="font-size: 0.82rem; color: #555555; margin-bottom: 1rem;">Official conceptual chamber allocation, built-up sizes, and structural offsets for IS 12556 reviews.</p>
            <table class="schedule-table">
                <thead>
                    <tr>
                        <th>Space / Allocation</th>
                        <th>Net Area</th>
                        <th>Indicative Dimensions</th>
                    </tr>
                </thead>
                <tbody>
                    {schedule_rows}
                </tbody>
            </table>
            
            <div class="covenants-card">
                <h4>Conceptual Working Plan Covenants:</h4>
                <ul>
                    <li>ALL DIMENSIONS ARE INDICATIVE AND SUBJECT TO FINAL TOPOGRAPHICAL SITE SURVEY.</li>
                    <li>This conceptual drawing package is not fit for direct statutory environment, local panchayat, or TCP construction submittals until stamped by a licensed architect and structural engineer.</li>
                    <li>Screw-pile spacing is calculated under conceptual loads and is subject to bearing borehole tests.</li>
                    <li>Zoning buffer values (e.g. {p['specs']['Zoning Buffer Allotment']}) are calculated strictly from project biophilic planning requirements and local authority buffer codes.</li>
                </ul>
            </div>
        </div>

        <div class="disclaimer-block">
            <strong>ALL DIMENSIONS ARE INDICATIVE AND SUBJECT TO FINAL ARCHITECTURAL SURVEY. NOT FOR CIVIL CONSTRUCTION.</strong>
            <br><br>
            All architectural drawings, exchange DXF files, room schedule values, and galvanized piling centers presented in this conceptual sheet package are planning support documents for Reserva Verde Goa. They do not constitute civil, structural, environmental, or panchayat execution blueprints. Final configurations remain subject to topographic surveys, soil bore tests, localized forest buffer rules, and final TCP statutory engineering reviews.
        </div>
    </div>
</body>
</html>
"""
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(html_content)
        print(f"Technical preview sheet HTML generated successfully: {html_path}")
        
    print("\nTraditional Architectural Floor Plans package generation finished!")

if __name__ == '__main__':
    main()
