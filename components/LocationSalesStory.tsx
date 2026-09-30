"use client";

import React, { useState } from "react";

export interface SalesStorySlide {
  id: string;
  num: string;
  eyebrow: string;
  title: string;
  description: string;
  stat: string;
}

export interface LocationSalesStoryProps {
  className?: string;
  slides?: SalesStorySlide[];
}

export const defaultSalesStorySlides: SalesStorySlide[] = [
  {
    id: "scale",
    num: "01",
    eyebrow: "Dimension 01 · Proposed Scale",
    title: "The Grand Scale",
    description: "A proposed 1000-acre private jungle forest housing vision in South Goa. Unparalleled acreage dedicated to deep forest preservation and low-density architecture. Preliminary map reference only. Final verification required.",
    stat: "1,000 Ac",
  },
  {
    id: "privacy",
    num: "02",
    eyebrow: "Dimension 02 · Density Model",
    title: "Absolute Privacy",
    description: "Planned with approximately 900 private 1-acre ground-level modular eco estates. Over 90% of the land is preserved as dense forest and natural buffers, ensuring true acoustic and visual isolation.",
    stat: "1-Acre",
  },
  {
    id: "terrain",
    num: "03",
    eyebrow: "Dimension 03 · Topographic Depth",
    title: "Contoured Terrain",
    description: "The rich forest-valley topography creates a rare natural setting. Distinct elevation profiles protect sightlines and offer elevated forest canopy and ridge-top views. Preliminary map reference only. Final verification required.",
    stat: "3D Valley",
  },
  {
    id: "lifestyle",
    num: "04",
    eyebrow: "Dimension 04 · Eco-Living",
    title: "Luxury Forest Living",
    description: "Modern ground-level container eco-homes, integrated cashew and spice plantations, private yoga decks, and walking trails that redefine nature-centric HNI slow living.",
    stat: "Modular",
  },
  {
    id: "destination",
    num: "05",
    eyebrow: "Dimension 05 · Geography",
    title: "Regional Eco-Tourism",
    description: "Positioned near South Goa's inland waterfall belts, bubbling lake, Netravali sanctuary landscapes, and regional dams—bringing exceptional nature-led discovery value. Preliminary map reference only. Final verification required.",
    stat: "Sanctuary Belt",
  },
  {
    id: "asset",
    num: "06",
    eyebrow: "Dimension 06 · Financial Security",
    title: "Land-Backed Asset",
    description: "A blue-chip combination of private estate living, long-term plantation yield, wellness retreat potential, and physical land scarcity in South Goa's premium inland geography. No guaranteed returns.",
    stat: "Land Scarcity",
  },
];

export const LocationSalesStory: React.FC<LocationSalesStoryProps> = ({
  className = "",
  slides = defaultSalesStorySlides,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className={`py-16 text-stone-100 ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-500 mb-4">
              <span className="w-8 h-px bg-amber-500"></span>
              Strategic Value Thesis
            </span>
            <h3 className="font-serif text-3xl md:text-4xl font-normal leading-tight">
              The Estate Sales Story
            </h3>
          </div>
          <div className="flex gap-3 mt-6 md:mt-0">
            <button
              onClick={prevSlide}
              className="w-12 h-12 rounded-full border border-amber-500/30 flex items-center justify-center text-amber-100 hover:border-amber-500 hover:text-amber-500 transition-all duration-300"
              aria-label="Previous slide"
            >
              ←
            </button>
            <button
              onClick={nextSlide}
              className="w-12 h-12 rounded-full border border-amber-500/30 flex items-center justify-center text-amber-100 hover:border-amber-500 hover:text-amber-500 transition-all duration-300"
              aria-label="Next slide"
            >
              →
            </button>
          </div>
        </div>

        {/* Carousel Slide Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {slides.map((slide, idx) => {
            const isActive = idx === activeSlide;
            return (
              <div
                key={slide.id}
                onClick={() => setActiveSlide(idx)}
                className={`group relative bg-emerald-950/20 border rounded-xl p-8 md:p-10 flex flex-col justify-between min-h-[340px] cursor-pointer transition-all duration-500 ${
                  isActive
                    ? "border-amber-500/80 bg-emerald-950/45 shadow-2xl scale-[1.02]"
                    : "border-stone-800/40 hover:border-amber-500/50 hover:bg-emerald-950/30"
                }`}
              >
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-amber-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-amber-500 font-semibold mb-4 block">
                    {slide.eyebrow}
                  </span>
                  <h4 className="font-serif text-2xl font-light mb-4 text-stone-100 group-hover:text-amber-200 transition-colors duration-300">
                    {slide.title}
                  </h4>
                  <p className="text-stone-300/80 text-sm leading-relaxed font-light mb-8">
                    {slide.description}
                  </p>
                </div>

                <div className="flex justify-between items-end mt-auto">
                  <span className="text-xs font-semibold tracking-wider text-amber-500/80 uppercase font-sans">
                    {slide.stat}
                  </span>
                  <span className="font-serif text-3xl text-amber-500/10 font-bold leading-none select-none">
                    {slide.num}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Indicator dots */}
        <div className="flex justify-center gap-2 mt-8">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === activeSlide ? "w-8 bg-amber-500" : "bg-stone-800"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            ></button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LocationSalesStory;
