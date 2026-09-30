# Reserva Verde Goa — Final Launch & Staging Deployment Checklist

This checklist provides the final quality-gate criteria, post-deployment validation paths, mobile-responsive inspect items, and compliance rules prior to sharing the portal with high-net-worth individual (HNI) buyers and investors.

---

## 1. Pre-Deployment Release Controls

Ensure all checkmarks pass cleanly before pushing the static branch to Vercel production:

- [x] **Type Integrity:** `npm run type-check` executes with zero errors.
- [x] **Build Verification:** `npm run build` runs and completes successfully.
- [x] **Link Protocol Inspection:** Zero hardcoded local links (`file://`) exist in the codebase; all connections utilize relative (`../`) or root-relative (`/`) routes.
- [x] **CRM Isolation Check:** The CRM (`crm.html`) and pro-forma costing model (`/crm/reserva-verde/costing/index.html`) are isolated from public sales navigation.
- [x] **CAD & Site Plan Assets:** All SVG layouts exist in `/images/estates/` and render correctly in both the brochure plan explorers and the public pricing cards.
- [x] **4K Render Sync:** All 32 high-fidelity model renders (8 per model) exist physically inside `/images/renders/` and display in respective interactive brochure galleries.
- [x] **Terrain Layer Assets:** All Google Earth access roads, boundary lines, and satellite overlays are mapped and verified in the terrain sections.

---

## 2. Post-Deployment URL Sweep List

After the staging build finishes, verify the following deployed endpoints using clean, non-cached browser sessions:

1. **Homepage:** `https://<vercel-staging-domain>/index.html` (or `https://<vercel-staging-domain>/`)
2. **Wellness sanctuary Page:** `https://<vercel-staging-domain>/wellness.html`
3. **Public pricing engine:** `https://<vercel-staging-domain>/reserva-verde/pricing/` (verify that root redirects from `pricing.html` resolve cleanly)
4. **CRM Dashboard:** `https://<vercel-staging-domain>/crm.html` (simulate developer login states)
5. **Internal Costing Tool:** `https://<vercel-staging-domain>/crm/reserva-verde/costing/` (test pro-forma sliders and printing functions)
6. **Brochure Pages:**
   - **2BHK:** `https://<vercel-staging-domain>/models/2bhk-compact-forest-estate/`
   - **3BHK:** `https://<vercel-staging-domain>/models/3bhk-premium-forest-estate/`
   - **4BHK:** `https://<vercel-staging-domain>/models/4bhk-signature-forest-estate/`
   - **Customisable:** `https://<vercel-staging-domain>/models/customisable-founder-estate/`
7. **Visual Asset Dashboard:** `https://<vercel-staging-domain>/visual-assets/`

---

## 3. Mobile & Tablet Verification Checklist

Open the deployed site on multiple physical mobile screens (iOS/Android) and inspect:

- [ ] **Interactive Galleries:** Swipe through the 8-render grids. Ensure thumbnails load quickly and tap-to-swap functions smoothly.
- [ ] **Leaflet cadastral Map:** Verify that Survey No. 109 boundary maps pinch-to-zoom correctly and fit within the screen bounds without causing layout overflows.
- [ ] **Pricing slider:** Verify the dynamic installment scheduler outputs clean Indian Rupee (INR) formatting when adjusting custom payment variables.
- [ ] **Typography & Scaling:** Ensure serif headers (`Cormorant Garamond`) and sans-serif labels (`Montserrat`) scale appropriately without clipped elements.
- [ ] **Proposal Submission:** Test the registration form with test inputs. Ensure button text switches gracefully and input elements scale well under viewport heights.

---

## 4. HNI Sharing Checklist

Ensure these presentation standards are verified before forwarding the link to high-value prospects:

1. **Zero Raw Placeholders:** Verify that all Customisable Founder Estate placeholders have been replaced with the approved high-fidelity 4K renders.
2. **Truthful Video Loading:** Confirm the walkthrough videos state is correct:
   - **2BHK Walkthrough:** Operates as a native playing video.
   - **3BHK / 4BHK / Customisable Walkthroughs:** Correctly display the premium poster overlays marked **"Walkthrough Cinematic in Progress"** to manage prospect expectations.
3. **Downloadable Cadastrals:** Verify that downloading Survey No. 109 KML coordinates and GIS datasets routes smoothly.

---

## 5. Known Pending Items

The following visual files are scheduled for future production sweeps and are currently represented by high-end poster placeholders or standard slots:

| Asset Name | Current Status | Pipeline Priority | Expected Release |
|---|---|---|---|
| **3BHK Walkthrough Video** | Poster frame placeholder active | Phase 2H Cinematic | Q3 2026 |
| **4BHK Walkthrough Video** | Poster frame placeholder active | Phase 2H Cinematic | Q3 2026 |
| **Customisable Walkthrough Video** | Masterplan poster placeholder active | Phase 2H Cinematic | Q4 2026 |
| **Full 100-Acre Masterplan Image** | Branded vector placeholder active | Phase 2I GIS Mapping | Q4 2026 |
| **WebGL Panoramic Tours** | Optional concept enhancement | Phase 3 Interactive | Q1 2027 |

---

## 6. Compliance & Legal Reminders

Every public page is guarded with strict real-estate compliance terms. Verify that the following wording remains intact:

- **Indicative Concepts:** *"All layouts, built-up areas, plantation overlays, render visualizations, and tech specifications are indicative concepts only."*
- **Survey Adjustments:** *"Conceptual boundaries are subject to physical topography surveys and statutory approvals."*
- **Regulatory Clearances:** *"All structures are subject to final environmental clearances, zoning, TCP, RERA, and local authority guidelines."*
- **Zero Guarantees:** No wording should promise fixed returns, agricultural profits, appreciation percentages, or rental income guarantees.
