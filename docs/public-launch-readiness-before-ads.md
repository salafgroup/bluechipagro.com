# Public Launch Readiness — Pre-Campaign Control Checklist

Before launching public ad campaigns, search engine optimization (SEO) sweeps, or public press releases, the release management and engineering teams must execute this readiness audit.

---

## 1. Security & Exposure Protection

Never run public ads while internal manager dashboards are discoverable. Complete this security sweep:

- [ ] **robots.txt Crawler Check:** 
  - *Verify URL:* `https://reserva-varde-goa.vercel.app/robots.txt`
  - *Confirm:* Ensure that `/crm`, `/crm/*`, and `/visual-assets/*` are actively disallowed and that the live search engines are successfully blocked from indexing these paths.
- [ ] **Noindex Tag Injection:** 
  - *Verify Pages:* `/crm.html`, `/crm/reserva-verde/costing/index.html`, and `/visual-assets/index.html`.
  - *Confirm:* Open the HTML source on the live server. Ensure the following tag exists in the `<head>` of each:
    ```html
    <meta name="robots" content="noindex, nofollow">
    ```
- [ ] **Vercel edge Protection:** 
  - *Recommendation:* Log into the Vercel dashboard. Under *Project Settings > Deployment Protection*, enable **Password Protection** for the project, or set up active edge redirects to block direct access to `/crm` and `/visual-assets` paths.

---

## 2. Lead Capture & CTA Verification

- [ ] **Contact Form Submission:** 
  - Go to the homepage proposal form. Enter test variables and submit.
  - Verify that the form submit handler runs cleanly without console exceptions, prompts a clean submission toast, and routes the payload to the local CRM database accurately.
- [ ] **WhatsApp Call-to-Action:** 
  - Go to the public pricing page. Click **WhatsApp Cost Sheet Request**.
  - Verify that the URL maps correctly, containing the pre-filled template message detailing the villa model, cashew agroforestry preference, and cost sheet request parameters.

---

## 3. High-Fidelity Asset Integration

- [ ] **walkthrough Video Posters:** 
  - Verify that the standard walkthrough video sections on the 3BHK, 4BHK, and Customisable brochures display their premium **"Cinematic walkthrough in Progress"** poster overlays.
  - Confirm that the 2BHK walkthrough video plays cleanly on mobile viewports.
- [ ] **SVG site-plans & vectors:** 
  - Confirm that the CAD layouts and site-plans inside `/images/estates/` are rendering cleanly on mobile screens without pixelation.

---

## 4. Mobile & Responsive Layout Audit

- [ ] **Mobile Pricing Matrix:** 
  - Open `/reserva-verde/pricing/` on an iPhone and an Android device.
  - Verify that the price matrix wraps gracefully and that the comparison tables are scrollable.
- [ ] **Leaflet cadastral maps:** 
  - Zoom and pan on the Leaflet Survey No. 109 cadastral map using standard touch screens.
  - Ensure that touch events are handled correctly and that the map container fits inside the mobile layout without causing viewport clipping.
- [ ] **Typography Overflows:** 
  - Verify that no Cormorant Garamond headers or Montserrat badges overflow or clip on narrow (360px) screen viewports.

---

## 5. Compliance & Legal Verification

- [ ] **Conceptual Warnings:** 
  - Ensure all renders, layouts, and agroforestry specifications include visible notes highlighting *conceptual boundaries* and *indicative layout parameters*.
- [ ] **Regulatory Wording:** 
  - Verify that all disclaimers for environment clearances, zoning approvals, Goa RERA, TCP guidelines, and zero-return guarantees remain fully intact at the footer of each page.
- [ ] **No guaranteed returns:** 
  - Review all marketing taglines. Ensure no text implies guaranteed returns, fixed rental payouts, or agricultural profit metrics.
