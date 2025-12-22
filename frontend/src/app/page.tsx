"use client";

import React from "react";
import Image from "next/image";
import { RevealSection } from "@/components/RevealSection";
import { ChevronRight, Waves, Disc, Mic2, Zap, Globe, Play, Volume2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-brand-cream dark:bg-brand-charcoal font-sans selection:bg-brand-olive/30 transition-colors duration-500">

      {/* --- TEXTURA ORGÁNICA (Sutil ruido para el vibe Japandi) --- */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] contrast-150 mix-blend-multiply dark:mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <main className="relative z-10 flex flex-col items-center px-6 lg:px-16">

        {/* --- NAV BAR --- */}
        <nav className="w-full max-w-7xl flex justify-between items-center py-10">
          <RevealSection>
            <div className="flex items-center gap-3">
              {/* Espacio para el isotipo del logo */}
              <div className="w-10 h-10 bg-brand-charcoal dark:bg-brand-sand flex items-center justify-center rounded-sm">
                <span className="text-brand-cream dark:text-brand-charcoal font-bold">B</span>
              </div>
              <div className="text-lg font-bold tracking-tighter text-brand-charcoal dark:text-brand-sand">
                BETANCOURT <span className="text-brand-olive font-medium">AUDIO</span>
              </div>
            </div>
          </RevealSection>

          <RevealSection delay={100}>
            <div className="hidden md:flex gap-10 text-xs uppercase tracking-[0.2em] text-brand-charcoal/60 dark:text-brand-sand/60 font-medium">
              <a href="#" className="hover:text-brand-olive transition-colors">Services</a>
              <a href="#" className="hover:text-brand-olive transition-colors">Works</a>
              <a href="#" className="hover:text-brand-olive transition-colors">Studio</a>
            </div>
          </RevealSection>

          <RevealSection delay={200}>
            <button className="text-xs uppercase tracking-widest px-6 py-3 rounded-full border border-brand-charcoal/10 dark:border-brand-sand/10 text-brand-charcoal dark:text-brand-sand hover:bg-brand-charcoal hover:text-brand-cream dark:hover:bg-brand-sand dark:hover:text-brand-charcoal transition-all">
              Start Project
            </button>
          </RevealSection>
        </nav>

        {/* --- HERO SECTION (Vibe Vanguardista) --- */}
        <section className="flex flex-col items-center text-center mt-24 mb-40 max-w-5xl">
          <RevealSection delay={300}>
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-brand-olive/10 border border-brand-olive/20 text-[10px] uppercase tracking-[0.3em] font-bold text-brand-olive mb-10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-olive opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-olive"></span>
              </span>
              Dolby Atmos Certified Studio
            </div>
          </RevealSection>

          <RevealSection delay={400}>
            <h1 className="text-6xl md:text-9xl font-bold tracking-tighter text-brand-charcoal dark:text-brand-sand mb-10 leading-[0.9]">
              Organic Soul. <br />
              <span className="text-brand-olive">Digital Precision.</span>
            </h1>
          </RevealSection>

          <RevealSection delay={500}>
            <p className="text-lg md:text-xl text-brand-charcoal/70 dark:text-brand-sand/50 max-w-2xl mb-14 font-light leading-relaxed">
              Curating sound environments through a Japandi lens: finding beauty in simplicity, power in clarity, and warmth in technology.
            </p>
          </RevealSection>

          <RevealSection delay={600}>
            <button className="group flex items-center gap-4 bg-brand-charcoal dark:bg-brand-sand text-brand-cream dark:text-brand-charcoal px-10 py-5 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-brand-olive dark:hover:bg-brand-olive dark:hover:text-white transition-all">
              Explore Sound Design <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </RevealSection>
        </section>

        {/* --- BENTO GRID (Estructura Japandi Minimalista) --- */}
        <section className="w-full max-w-7xl mb-40">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[300px]">

            {/* Mixing & Mastering Card */}
            <RevealSection delay={700} className="md:col-span-2 md:row-span-2">
              <div className="h-full p-12 rounded-[2rem] bg-brand-sand/30 dark:bg-white/[0.02] border border-brand-charcoal/5 dark:border-brand-sand/5 flex flex-col justify-end relative overflow-hidden group cursor-pointer">
                <div className="absolute top-12 right-12">
                  <Waves size={100} strokeWidth={0.5} className="text-brand-olive opacity-20 group-hover:scale-110 transition-transform duration-700" />
                </div>
                <span className="text-xs uppercase tracking-widest text-brand-olive font-bold mb-4">Engineering</span>
                <h3 className="text-4xl font-bold text-brand-charcoal dark:text-brand-sand mb-4">Post-Production</h3>
                <p className="text-brand-charcoal/60 dark:text-brand-sand/40 max-w-sm leading-relaxed">
                  Mezcla y masterización con un enfoque en la espacialidad inmersiva y la calidez analógica.
                </p>
              </div>
            </RevealSection>

            {/* Language / Global Card */}
            <RevealSection delay={800} className="md:col-span-2">
              <div className="h-full p-10 rounded-[2rem] bg-brand-olive text-brand-cream flex flex-col items-center justify-center text-center group">
                <Globe size={40} strokeWidth={1} className="mb-6 animate-pulse" />
                <h3 className="text-2xl font-bold uppercase tracking-tighter">Global Service</h3>
                <p className="text-brand-cream/70 text-sm mt-2 max-w-[200px]">Working seamlessly in English & Español from Bogotá to the world.</p>
              </div>
            </RevealSection>

            {/* Audio Insight Card */}
            <RevealSection delay={900}>
              <div className="h-full p-10 rounded-[2rem] bg-white dark:bg-brand-charcoal border border-brand-charcoal/10 dark:border-brand-sand/10 flex flex-col justify-between items-start">
                <div className="w-12 h-12 rounded-full bg-brand-olive/10 flex items-center justify-center text-brand-olive">
                  <Volume2 size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-brand-charcoal dark:text-brand-sand text-lg leading-tight">Sonic <br />Identity</h4>
                </div>
              </div>
            </RevealSection>

            {/* Production Card */}
            <RevealSection delay={1000}>
              <div className="h-full p-10 rounded-[2rem] bg-brand-sand dark:bg-brand-sand/10 border border-brand-charcoal/5 dark:border-brand-sand/5 flex flex-col justify-between items-start group cursor-pointer">
                <Mic2 size={30} className="text-brand-charcoal dark:text-brand-olive" />
                <h4 className="font-bold text-brand-charcoal dark:text-brand-sand">Music <br />Production</h4>
              </div>
            </RevealSection>

          </div>
        </section>

        {/* --- PORTFOLIO PREVIEW (Vanguardia Tecnológica) --- */}
        <section className="w-full max-w-3xl mb-40">
          <RevealSection delay={1100}>
            <div className="group relative p-1 rounded-[2.5rem] bg-gradient-to-br from-brand-olive/20 to-transparent border border-brand-olive/10">
              <div className="bg-brand-cream dark:bg-brand-charcoal rounded-[2.4rem] p-8 flex items-center gap-8">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-brand-charcoal flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                  <Play fill="#8F9B84" className="text-brand-olive translate-x-1" size={40} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-brand-olive font-bold">Featured Track</span>
                      <h3 className="text-2xl font-bold text-brand-charcoal dark:text-brand-sand uppercase tracking-tighter">Atmospheric Sessions</h3>
                    </div>
                    <span className="text-xs font-mono text-brand-olive">02:45 / 04:20</span>
                  </div>
                  {/* Waveform Placeholder */}
                  <div className="flex items-end gap-[3px] h-12">
                    {[...Array(40)].map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-brand-olive/30 rounded-full group-hover:bg-brand-olive transition-all duration-500"
                        style={{ height: `${Math.random() * 100}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </RevealSection>
        </section>

        {/* --- FOOTER (GEO & Branding) --- */}
        <footer className="w-full max-w-7xl py-20 border-t border-brand-charcoal/5 dark:border-brand-sand/5 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="text-sm font-bold tracking-widest text-brand-charcoal dark:text-brand-sand">
              BETANCOURT <span className="text-brand-olive">AUDIO</span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-brand-charcoal/40 dark:text-brand-sand/40">
              Bogotá &bull; London &bull; Tokyo &bull; Global
            </p>
          </div>

          <div className="flex gap-12 text-[10px] uppercase tracking-[0.2em] font-bold text-brand-charcoal/60 dark:text-brand-sand/60">
            <a href="#" className="hover:text-brand-olive">Instagram</a>
            <a href="#" className="hover:text-brand-olive">LinkedIn</a>
            <a href="#" className="hover:text-brand-olive">Email</a>
          </div>

          <div className="text-[10px] text-brand-charcoal/30 dark:text-brand-sand/20 italic">
            &copy; 2025 Architecture of Sound.
          </div>

          {/* GEO Optimization Hidden Text */}
          <div className="sr-only">
            Betancourt Audio is a premier music production and sound engineering studio specializing in Japandi-inspired minimalist design and avant-garde technological solutions. Expert mixing and mastering services in Bogotá, Colombia, with a focus on Dolby Atmos and high-end sonic identity.
          </div>
        </footer>
      </main>
    </div>
  );
}