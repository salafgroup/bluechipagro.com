import os
import shutil
import zipfile

def create_dispatch_package():
    base_dir = r"C:\Users\INTEL\Desktop\GOA\WEBSITE"
    dispatch_dir = os.path.join(base_dir, "dispatch")
    package_dir = os.path.join(dispatch_dir, "architect-review-package-reserva-verde")
    
    # 1. Subfolders mapping
    subfolders = {
        "readme": os.path.join(package_dir, "00-Read-Me"),
        "2bhk": os.path.join(package_dir, "01-2BHK"),
        "3bhk": os.path.join(package_dir, "02-3BHK"),
        "4bhk": os.path.join(package_dir, "03-4BHK"),
        "registers": os.path.join(package_dir, "04-Registers"),
        "review_templates": os.path.join(package_dir, "05-Review-Templates"),
        "scripts": os.path.join(package_dir, "06-AutoCAD-Scripts")
    }
    
    # Create all directories
    for path in subfolders.values():
        os.makedirs(path, exist_ok=True)
        print(f"Directory verified/created: {path}")
        
    # 2. Write README.md
    readme_content = """# Reserva Verde Goa — Conceptual Architect Review Package

## Project Overview
* **Project Name:** Reserva Verde Goa (South Goa eco-luxury forest estate)
* **Package Name:** Conceptual Architect Review Package
* **Package Date:** May 30, 2026

## IMPORTANT NOTICE & SAFETY WARNING
> [!WARNING]
> **THIS PACKAGE IS CONCEPTUAL ONLY AND STRICTLY NOT FOR SITE CONSTRUCTION WORK.**
> All designs, CAD exchange files, metric/feet boundaries, and steeled screw-pile alignments are pre-execution guidelines. 
> All dimensions are indicative and subject to actual topography land surveys, soil bearing tests, localized Goa TCP environmental rules, and final statutory authority reviews.

---

## Package Contents & Directory Structure

### `/00-Read-Me/`
* **`README.md`:** This master package manifest, project summary, and review instructions.

### `/01-2BHK/`
* **`2bhk-architectural-floor-plan.dwg`:** Primary native AutoCAD binary drawing sheet.
* **`2bhk-architectural-floor-plan.dxf`:** AutoCAD exchange backup format.
* **`2bhk-architectural-floor-plan.svg`:** standalone plotted high-contrast vector drawing for instant visual preview.
* **`index.html`:** Local technical sheet viewer showing space allocation charts, schedules, and downloads.

### `/02-3BHK/`
* **`3bhk-architectural-floor-plan.dwg`:** Primary native AutoCAD binary drawing sheet.
* **`3bhk-architectural-floor-plan.dxf`:** AutoCAD exchange backup format.
* **`3bhk-architectural-floor-plan.svg`:** standalone plotted high-contrast vector drawing for instant visual preview.
* **`index.html`:** Local technical sheet viewer showing space allocation charts, schedules, and downloads.

### `/03-4BHK/`
* **`4bhk-architectural-floor-plan.dwg`:** Primary native AutoCAD binary drawing sheet.
* **`4bhk-architectural-floor-plan.dxf`:** AutoCAD exchange backup format.
* **`4bhk-architectural-floor-plan.svg`:** standalone plotted high-contrast vector drawing for instant visual preview.
* **`index.html`:** Local technical sheet viewer showing space allocation charts, schedules, and downloads.

### `/04-Registers/`
* **`architectural-floor-plan-register.md`:** Tracks overall structural specs, model classifications, NBC compliance, and static revisions.
* **`dwg-floor-plan-register.md`:** Logs binary conversion status, AutoCAD script versions, and statutory review parameters.

### `/05-Review-Templates/`
* **`architect-review-package-index.md`:** Comprehensive index mapping the exact layout criteria to review.
* **`hni-floor-plan-sharing-note.md`:** Guiding advice for high-net-worth client interaction and design limitations.
* **`architect-review-comments-template.md`:** Standardized table template to log corrections with severity codes (`Minor`, `Major`, `Critical`).
* **`manual-dxf-to-dwg-conversion-guide.md`:** Instructional brief outlining how DXF files are converted to DWG using the scripts.

### `/06-AutoCAD-Scripts/`
* **`convert-2bhk-dxf-to-dwg.scr` / `convert-3bhk-dxf-to-dwg.scr` / `convert-4bhk-dxf-to-dwg.scr`:** Automated batch conversion scripts to run the AUDIT, PURGE, UNITSETS, and SAVEAS commands inside AutoCAD.

---

## Technical Review Guidelines & Instructions

1. **Primary Working Files:** Use the `.dwg` files inside `/01-2BHK/`, `/02-3BHK/`, and `/03-4BHK/` as the primary files for technical engineering, layer extraction, and draft editing.
2. **Exchange Backups:** Use the `.dxf` exchange files as backups to guarantee vector alignment in open-source CAD suites.
3. **Visual Previews:** Refer to `.svg` vector files for instant high-contrast visual reviews on any desktop or tablet device.
4. **Local Technical Sheets:** Open `index.html` files directly in any local browser to access complete space schedules, technical parameters, and built footprint grids offline.
5. **Logging Comments:** Kindly record all corrections, pile structural adjustments, and statutory recommendations inside `/05-Review-Templates/architect-review-comments-template.md` mapping them with explicit severity ratings:
   * **Minor:** Typographical or cosmetic CAD adjustments.
   * **Major:** Internal spatial chamber adjustments or clearance recalculations.
   * **Critical:** Pile alignment conflicts, TCP environmental buffer violations, or NBC safety overrides.

---
*Document compiled by Senior Architectural Documentation Coordinator, May 30, 2026.*
"""
    
    with open(os.path.join(subfolders["readme"], "README.md"), "w", encoding="utf-8") as f:
        f.write(readme_content.strip())
    print("README.md written successfully.")

    # 3. Copy files mapping
    copy_tasks = [
        # 2BHK
        (os.path.join(base_dir, "drawings", "architectural-floorplans", "2bhk", "2bhk-architectural-floor-plan.dwg"), subfolders["2bhk"]),
        (os.path.join(base_dir, "drawings", "architectural-floorplans", "2bhk", "2bhk-architectural-floor-plan.dxf"), subfolders["2bhk"]),
        (os.path.join(base_dir, "drawings", "architectural-floorplans", "2bhk", "2bhk-architectural-floor-plan.svg"), subfolders["2bhk"]),
        (os.path.join(base_dir, "drawings", "architectural-floorplans", "2bhk", "index.html"), subfolders["2bhk"]),
        # 3BHK
        (os.path.join(base_dir, "drawings", "architectural-floorplans", "3bhk", "3bhk-architectural-floor-plan.dwg"), subfolders["3bhk"]),
        (os.path.join(base_dir, "drawings", "architectural-floorplans", "3bhk", "3bhk-architectural-floor-plan.dxf"), subfolders["3bhk"]),
        (os.path.join(base_dir, "drawings", "architectural-floorplans", "3bhk", "3bhk-architectural-floor-plan.svg"), subfolders["3bhk"]),
        (os.path.join(base_dir, "drawings", "architectural-floorplans", "3bhk", "index.html"), subfolders["3bhk"]),
        # 4BHK
        (os.path.join(base_dir, "drawings", "architectural-floorplans", "4bhk", "4bhk-architectural-floor-plan.dwg"), subfolders["4bhk"]),
        (os.path.join(base_dir, "drawings", "architectural-floorplans", "4bhk", "4bhk-architectural-floor-plan.dxf"), subfolders["4bhk"]),
        (os.path.join(base_dir, "drawings", "architectural-floorplans", "4bhk", "4bhk-architectural-floor-plan.svg"), subfolders["4bhk"]),
        (os.path.join(base_dir, "drawings", "architectural-floorplans", "4bhk", "index.html"), subfolders["4bhk"]),
        # Registers
        (os.path.join(base_dir, "docs", "architectural-floor-plan-register.md"), subfolders["registers"]),
        (os.path.join(base_dir, "docs", "dwg-floor-plan-register.md"), subfolders["registers"]),
        # Review Templates
        (os.path.join(base_dir, "docs", "architect-review-package-index.md"), subfolders["review_templates"]),
        (os.path.join(base_dir, "docs", "hni-floor-plan-sharing-note.md"), subfolders["review_templates"]),
        (os.path.join(base_dir, "docs", "architect-review-comments-template.md"), subfolders["review_templates"]),
        (os.path.join(base_dir, "docs", "manual-dxf-to-dwg-conversion-guide.md"), subfolders["review_templates"]),
        # Scripts
        (os.path.join(base_dir, "scripts", "autocad", "convert-2bhk-dxf-to-dwg.scr"), subfolders["scripts"]),
        (os.path.join(base_dir, "scripts", "autocad", "convert-3bhk-dxf-to-dwg.scr"), subfolders["scripts"]),
        (os.path.join(base_dir, "scripts", "autocad", "convert-4bhk-dxf-to-dwg.scr"), subfolders["scripts"]),
    ]

    for src, dst_dir in copy_tasks:
        if not os.path.exists(src):
            print(f"Error: Source file not found: {src}")
            return
        dst = os.path.join(dst_dir, os.path.basename(src))
        shutil.copy2(src, dst)
        print(f"Copied successfully: {src} -> {dst}")

    # 4. Generate ZIP
    zip_path = os.path.join(dispatch_dir, "Reserva-Verde-Goa-Architect-Review-Package.zip")
    print(f"Starting ZIP archive compression: {zip_path}")
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for root, dirs, files in os.walk(package_dir):
            for file in files:
                file_path = os.path.join(root, file)
                # Compute inside-zip relative archive path
                archive_name = os.path.relpath(file_path, package_dir)
                zip_file.write(file_path, archive_name)
                print(f"Added to archive: {archive_name}")

    zip_size = os.path.getsize(zip_path)
    print(f"ZIP compression finished. Path: {zip_path} (Size: {zip_size} bytes / {zip_size/1024:.2f} KB)")

if __name__ == '__main__':
    create_dispatch_package()
