# AutoCAD DXF to DWG Manual Conversion Guide

This guide provides step-by-step instructions for converting the conceptual black-and-white 2D AutoCAD-style exchange floor plans (`.dxf`) into native AutoCAD drawing sheets (`.dwg`). 

Because `.dwg` is a proprietary binary format owned by Autodesk, a true, non-corrupted `.dwg` file must be generated using AutoCAD or a licensed Autodesk-compatible engine. **Do not simply rename `.dxf` to `.dwg`**, as this will result in a corrupted file that cannot be opened by AutoCAD or other BIM tools.

---

## Method 1: Automated Script-Based Conversion (Recommended)

We have created pre-configured AutoCAD Script files (`.scr`) that completely automate the opening, auditing, purging, scale calibration, and saving sequence.

### Pre-requisites
Ensure the following files are located in your workspace:
1.  **AutoCAD Scripts:**
    *   `c:\Users\INTEL\Desktop\GOA\WEBSITE\scripts\autocad\convert-2bhk-dxf-to-dwg.scr`
    *   `c:\Users\INTEL\Desktop\GOA\WEBSITE\scripts\autocad\convert-3bhk-dxf-to-dwg.scr`
    *   `c:\Users\INTEL\Desktop\GOA\WEBSITE\scripts\autocad\convert-4bhk-dxf-to-dwg.scr`
2.  **Source DXF Files:**
    *   `c:\Users\INTEL\Desktop\GOA\WEBSITE\drawings\architectural-floorplans\2bhk\2bhk-architectural-floor-plan.dxf`
    *   `c:\Users\INTEL\Desktop\GOA\WEBSITE\drawings\architectural-floorplans\3bhk\3bhk-architectural-floor-plan.dxf`
    *   `c:\Users\INTEL\Desktop\GOA\WEBSITE\drawings\architectural-floorplans\4bhk\4bhk-architectural-floor-plan.dxf`

### Script Execution Steps
1.  Launch **AutoCAD** (Release 2018 or newer).
2.  Open a blank template or model view.
3.  Type `SCRIPT` on the command line and press `Enter`.
4.  In the file selection dialog box, navigate to:
    `c:\Users\INTEL\Desktop\GOA\WEBSITE\scripts\autocad\`
5.  Select **`convert-2bhk-dxf-to-dwg.scr`** and click **Open**.
6.  The script will immediately disable file dialogs, open the 2BHK DXF, run audit/purge routines, configure insertion units to meters, zoom to the model extents, save as a native AutoCAD 2018/2022 `.dwg` drawing to the output folder, re-enable file dialogs, and close the file.
7.  Repeat this process for **`convert-3bhk-dxf-to-dwg.scr`** and **`convert-4bhk-dxf-to-dwg.scr`**.

---

## Method 2: Manual GUI-Based Conversion Steps

If you prefer to perform the conversion manually in the AutoCAD User Interface, follow these steps:

1.  Launch **AutoCAD** (Release 2018 or newer).
2.  Click **File** &rarr; **Open** &rarr; **Drawing** (or type `OPEN` on the command line).
3.  In the *Files of Type* dropdown, select **AutoCAD DXF (*.dxf)**.
4.  Navigate to the source folder and open the desired DXF:
    `c:\Users\INTEL\Desktop\GOA\WEBSITE\drawings\architectural-floorplans\{2bhk, 3bhk, 4bhk}\`
5.  **Audit Drawing:**
    *   Type **`AUDIT`** on the command line and press `Enter`.
    *   When prompted: *Fix any errors detected? [Yes/No] <N>:* type **`Y`** and press `Enter` to fix any vector integrity warnings.
6.  **Purge Unused Blocks/Layers:**
    *   Type **`PURGE`** on the command line and press `Enter`.
    *   Click **Purge All** to clear any redundant geometry, definitions, or empty styles to optimize file size.
7.  **Verify Scale Units:**
    *   Type **`INSUNITS`** on the command line and press `Enter`.
    *   Verify or change the value to **`6`** (representing **Meters**) and press `Enter` to match our biophilic drawing scale.
8.  **Fit Extents:**
    *   Type **`ZOOM`** on the command line and press `Enter`.
    *   Type **`E`** (for **Extents**) and press `Enter` to center the plotted sheet frame in Model Space.
9.  **Save Native DWG File:**
    *   Click **File** &rarr; **Save As** (or type `SAVEAS` on the command line).
    *   In the *Files of Type* dropdown, select **AutoCAD 2018 Drawing (*.dwg)** or **AutoCAD 2022 Drawing (*.dwg)**.
    *   Name the target file exactly:
        *   For 2BHK: **`2bhk-architectural-floor-plan.dwg`**
        *   For 3BHK: **`3bhk-architectural-floor-plan.dwg`**
        *   For 4BHK: **`4bhk-architectural-floor-plan.dwg`**
    *   Save the file directly in the corresponding folder:
        `c:\Users\INTEL\Desktop\GOA\WEBSITE\drawings\architectural-floorplans\{2bhk, 3bhk, 4bhk}\`
10. Close the drawing.

---

## Method 3: Command Line Batch Script (Accurate CLI Mode)

If you are running AutoCAD via a batch script or a command-line terminal, you can run the conversions directly from your shell:

```powershell
# Convert 2BHK
& "C:\Program Files\Autodesk\AutoCAD 2022\accoreconsole.exe" /i "c:\Users\INTEL\Desktop\GOA\WEBSITE\drawings\architectural-floorplans\2bhk\2bhk-architectural-floor-plan.dxf" /s "c:\Users\INTEL\Desktop\GOA\WEBSITE\scripts\autocad\convert-2bhk-dxf-to-dwg.scr"

# Convert 3BHK
& "C:\Program Files\Autodesk\AutoCAD 2022\accoreconsole.exe" /i "c:\Users\INTEL\Desktop\GOA\WEBSITE\drawings\architectural-floorplans\3bhk\3bhk-architectural-floor-plan.dxf" /s "c:\Users\INTEL\Desktop\GOA\WEBSITE\scripts\autocad\convert-3bhk-dxf-to-dwg.scr"

# Convert 4BHK
& "C:\Program Files\Autodesk\AutoCAD 2022\accoreconsole.exe" /i "c:\Users\INTEL\Desktop\GOA\WEBSITE\drawings\architectural-floorplans\4bhk\4bhk-architectural-floor-plan.dxf" /s "c:\Users\INTEL\Desktop\GOA\WEBSITE\scripts\autocad\convert-4bhk-dxf-to-dwg.scr"
```

---

## Technical Auditing & Verification Checklist
Upon saving, ensure the structural engineering draft matches these benchmarks:
- [ ] File size is larger than 25KB (renamed DXFs usually carry identical text bytes, whereas a binary DWG carries binary indices).
- [ ] Mapped layers (`A-WALL-EXT`, `A-WALL-INT`, `A-STILT`, `A-DIMS`) are preserved.
- [ ] No missing external reference dependencies (XREFs).
- [ ] High-contrast black outer outlines and grey internal partitions plot cleanly on white physical layouts.
