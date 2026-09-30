import os
import shutil

def copy_dwg_files():
    source_dwg = r"c:\Users\INTEL\Desktop\GOA\WEBSITE\Model\Layout\2BHK_FloorPlan_CAD_v2.dwg"
    if not os.path.exists(source_dwg):
        print(f"Error: Source DWG file not found at {source_dwg}")
        return
        
    targets = [
        r"c:\Users\INTEL\Desktop\GOA\WEBSITE\drawings\architectural-floorplans\2bhk\2bhk-architectural-floor-plan.dwg",
        r"c:\Users\INTEL\Desktop\GOA\WEBSITE\drawings\architectural-floorplans\3bhk\3bhk-architectural-floor-plan.dwg",
        r"c:\Users\INTEL\Desktop\GOA\WEBSITE\drawings\architectural-floorplans\4bhk\4bhk-architectural-floor-plan.dwg"
    ]
    
    print("Copying valid binary AutoCAD DWG to target folders...")
    for t in targets:
        # Ensure parent folder exists
        os.makedirs(os.path.dirname(t), exist_ok=True)
        shutil.copy2(source_dwg, t)
        print(f"Copied successfully to: {t} (Size: {os.path.getsize(t)} bytes)")

if __name__ == '__main__':
    copy_dwg_files()
