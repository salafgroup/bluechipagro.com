import re

with open('c:/Users/INTEL/Desktop/GOA/WEBSITE/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. CSS changes
css_old = r'''        \.rv-card \{
            background: #fff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 36px 70px -42px rgba\(15, 28, 22, 0\.18\);
            display: grid; grid-template-columns: 4fr 6fr; gap: 0;
            border: 1px solid rgba\(199, 185, 122, 0\.25\);
            transition: transform 0\.6s cubic-bezier\(0\.16, 1, 0\.3, 1\), box-shadow 0\.6s cubic-bezier\(0\.16, 1, 0\.3, 1\);
        \}
        \.rv-card:hover \{
            transform: translateY\(-8px\);
            box-shadow: 0 45px 85px -35px rgba\(15, 28, 22, 0\.28\);
        \}
        \.rv-card-media \{
            background: linear-gradient\(135deg, var\(--rv-forest\) 0%, var\(--rv-forest-deep\) 100%\);
            position: relative;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            overflow: hidden;
            padding: 4rem 2\.5rem 2\.5rem;
            border-right: 1px solid rgba\(199, 185, 122, 0\.15\);
        \}
        \.rv-card-media svg \{ 
            width: 100%; height: auto; 
            max-height: 400px; 
            display: block; 
            object-fit: contain; 
        \}
        \.rv-card-media-note \{
            font-size: 0\.65rem;
            color: rgba\(248, 246, 240, 0\.6\);
            margin-top: 1\.5rem;
            text-transform: uppercase;
            letter-spacing: 0\.15em;
            text-align: center;
        \}'''

css_new = r'''        .rv-card {
            background: #fff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(15, 28, 22, 0.12);
            display: grid; grid-template-columns: 4fr 6fr; gap: 0;
            border: 1px solid rgba(199, 185, 122, 0.25);
            transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .rv-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 35px 60px rgba(15, 28, 22, 0.22);
        }
        .rv-card-media {
            background: var(--rv-forest-deep);
            position: relative;
            display: block;
            overflow: hidden;
            padding: 0;
            border-right: 1px solid rgba(199, 185, 122, 0.15);
        }
        .rv-card-media img.estate-render {
            width: 100%;
            height: 100%;
            object-fit: cover;
            aspect-ratio: 4/5;
            display: block;
            filter: brightness(0.92) contrast(1.04) saturate(1.05);
            transition: transform 0.8s ease, filter 0.8s ease;
        }
        .rv-card:hover .rv-card-media img.estate-render {
            transform: scale(1.03);
            filter: brightness(1.02) contrast(1.04) saturate(1.05);
        }
        .rv-card-media-gradient {
            position: absolute;
            bottom: 0; left: 0; right: 0;
            height: 50%;
            background: linear-gradient(to top, rgba(8, 24, 17, 0.78) 0%, rgba(8, 24, 17, 0.35) 38%, rgba(8, 24, 17, 0) 70%);
            z-index: 1;
            pointer-events: none;
        }
        .rv-card-media svg, .rv-card-media .old-schematic { 
            display: none;
        }
        .rv-card-media-note {
            display: none;
        }'''

html = re.sub(css_old, css_new, html, flags=re.M)

# Responsive CSS change
html = html.replace('.rv-card-media { min-height: auto; padding: 4rem 2rem 2rem; border-right: none; border-bottom: 1px solid rgba(199, 185, 122, 0.15); }',
'.rv-card-media { min-height: auto; padding: 0; border-right: none; border-bottom: 1px solid rgba(199, 185, 122, 0.15); }\n            .rv-card-media img.estate-render { aspect-ratio: 16/10; }')

# CSS for inset (add right before rv-foot-note)
inset_css = r'''
        .rv-mini-inset {
            position: absolute;
            bottom: 1.8rem; right: 1.8rem;
            width: 90px;
            background: rgba(16, 41, 31, 0.75);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(199, 185, 122, 0.4);
            border-radius: 8px;
            padding: 8px;
            z-index: 2;
            text-align: center;
        }
        .rv-mini-inset img {
            width: 100%;
            height: auto;
            display: block;
            margin-bottom: 5px;
        }
        .rv-mini-inset-label {
            font-size: 0.45rem;
            color: var(--rv-gold);
            text-transform: uppercase;
            letter-spacing: 0.1em;
            white-space: nowrap;
        }
        @media (max-width: 768px) {
            .rv-mini-inset { display: none; }
        }
'''
html = html.replace('/* footer note */', inset_css + '\n        /* footer note */')

# JavaScript data replacement for 2bhk
html = html.replace('title: "2BHK Compact Luxury Modular Eco Estate",', 'title: "2BHK Compact Forest Estate",')
html = html.replace('assetType: "Ground-Level Modular Container Eco Home + Eco Plantation Estate",', 'assetType: "Intimate · Canopy View · Low-Maintenance Retreat",')
html = html.replace('description: "A precision-engineered ground-level container eco-home set inside a private 1-acre plantation estate – designed for couples, small families, NRIs and wellness buyers seeking a low-maintenance second home in Goa.",', 'description: "A private compact forest villa for couples, NRIs, and weekend living.",')

# JavaScript data replacement for 3bhk
html = html.replace('title: "3BHK Premium Modular Agro Estate",', 'title: "3BHK Premium Forest Estate",')
html = html.replace('description: "A premium ground-level container eco-home in an L-shape pavilion configuration, set inside a private 1-acre plantation estate – designed for HNI families, NRIs and wellness buyers seeking a low-impact luxury second home with optional rental readiness.",', 'description: "A larger family estate with open living, forest decks, and agroforestry value.",')

# JavaScript data replacement for 4bhk
html = html.replace('title: "4BHK Signature Ground-Level Modular Luxury Estate",', 'title: "4BHK Signature Forest Estate",')
html = html.replace('description: "A pavilion-style ground-level container eco-home arranged around a courtyard pool and three connected wings, set inside a private 1-acre plantation estate – designed for HNI families, retreat operators and hospitality-focused owners seeking a flagship Goa second home with rental readiness.",', 'description: "A signature HNI forest residence with larger decks, wellness spaces, and premium privacy.",')

# The assetType replacement above replaced the first occurrence for 2bhk, let's fix 3bhk and 4bhk using Regex or explicit replace since they are identical
html = re.sub(r'assetType: "Ground-Level Modular Container Eco Home \+ Eco Plantation Estate",\n\s*homeType: "Ground-level modular container eco-home",\n\s*placementOptions: \["Centre", "Side", "Rear", "Courtyard-centric"\],',
r'assetType: "Family Pavilion · Ridge View · Indoor-Outdoor Flow",\n                homeType: "Ground-level modular container eco-home",\n                placementOptions: ["Centre", "Side", "Rear", "Courtyard-centric"],', html)

html = re.sub(r'assetType: "Ground-Level Modular Container Eco Home \+ Eco Plantation Estate",\n\s*homeType: "Ground-level modular container eco-home",\n\s*placementOptions: \["Centre", "Rear", "Courtyard-centric"\],',
r'assetType: "Flagship Villa · Wellness Courtyard · Private Retreat",\n                homeType: "Ground-level modular container eco-home",\n                placementOptions: ["Centre", "Rear", "Courtyard-centric"],', html)

# Replace thumbnails dictionary entirely
thumbnails_regex = r'const thumbnails = \{[\s\S]*?\n            \};\n\n            function cardEl\(model\)'
thumbnails_new = r'''const thumbnails = {
              "2bhk": `<img src="images/renders/2bhk/exterior-arrival.jpg" class="estate-render" alt="2BHK Forest Estate"><div class="rv-card-media-gradient"></div><div class="rv-mini-inset"><img src="images/estates/site-plan-2bhk.svg" alt="Site Plan"><div class="rv-mini-inset-label">1-Acre Concept Layout</div></div>`,
              "3bhk": `<img src="images/renders/3bhk/exterior-arrival.jpg" class="estate-render" alt="3BHK Premium Estate"><div class="rv-card-media-gradient"></div><div class="rv-mini-inset"><img src="images/estates/site-plan-3bhk.svg" alt="Site Plan"><div class="rv-mini-inset-label">1-Acre Concept Layout</div></div>`,
              "4bhk": `<img src="images/renders/4bhk/exterior-arrival.jpg" class="estate-render" alt="4BHK Signature Estate"><div class="rv-card-media-gradient"></div><div class="rv-mini-inset"><img src="images/estates/site-plan-4bhk.svg" alt="Site Plan"><div class="rv-mini-inset-label">1-Acre Concept Layout</div></div>`,
              "custom": `<img src="images/estates/custom-modular-eco-estate.jpg" class="estate-render" style="filter: brightness(0.65) sepia(0.2) hue-rotate(90deg);" alt="Custom Estate"><div class="rv-card-media-gradient"></div><div class="rv-mini-inset"><img src="images/estates/site-plan-customisable.svg" alt="Site Plan"><div class="rv-mini-inset-label">1-Acre Concept Layout</div></div>`
            };

            function cardEl(model)'''
html = re.sub(thumbnails_regex, thumbnails_new, html, flags=re.M)

# Update Explore Model Button Text
html = html.replace('View Model Details</button>', 'Explore Model →</button>')


with open('c:/Users/INTEL/Desktop/GOA/WEBSITE/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
