'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Link from 'next/link';
import './alt.css';

const services = [
  {
    id: '01',
    name: 'MIXING',
    description: 'Spatial depth, frequency balance, emotional impact — every element in its place.',
    price: 'From $280 USD',
  },
  {
    id: '02',
    name: 'MASTERING',
    description: 'Final polish, loudness optimization, and platform-ready delivery.',
    price: 'From $120 USD',
  },
  {
    id: '03',
    name: 'PRODUCTION',
    description: 'Beat construction, full arrangement, and complete sonic vision execution.',
    price: 'From $500 USD',
  },
  {
    id: '04',
    name: 'DOLBY ATMOS',
    description: 'Immersive 3D audio. Spatial mixing certified for Apple Music & Tidal.',
    price: 'From $400 USD',
  },
];

const stats = [
  { num: '07+', label: 'Years in the game' },
  { num: '200+', label: 'Releases crafted' },
  { num: '∞', label: 'Free revisions' },
  { num: '01', label: 'Standard: the best' },
];

const steps = [
  { num: '01', title: 'BRIEF', body: 'You share your vision, references, and goals. We align before a single fader moves.' },
  { num: '02', title: 'PROCESS', body: 'We work. Deeply. Every frequency, every transient, every spatial decision is intentional.' },
  { num: '03', title: 'REVIEW', body: 'You listen. We refine. Unlimited revisions until the sound is exactly right.' },
  { num: '04', title: 'DELIVERY', body: 'Stems, masters, Atmos mixes — all formats, all platforms, zero compromise.' },
];

const BARS = 56;

export default function AltLanding() {
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [cursorHovering, setCursorHovering] = useState(false);
  const { scrollY } = useScroll();

  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const heroY = useTransform(scrollY, [0, 500], [0, -80]);

  const springX = useSpring(cursorPos.x, { stiffness: 500, damping: 32 });
  const springY = useSpring(cursorPos.y, { stiffness: 500, damping: 32 });

  useEffect(() => {
    const move = (e: MouseEvent) => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  const barHeights = Array.from({ length: BARS }, (_, i) =>
    20 + Math.abs(Math.sin(i * 0.38) * 0.7 + Math.cos(i * 0.15) * 0.3) * 80
  );

  return (
    <div className="alt-root">
      {/* Custom cursor */}
      <motion.div
        className="alt-cursor"
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
          scale: cursorHovering ? 1.8 : 1,
        }}
        transition={{ scale: { duration: 0.2 } }}
      />

      {/* Grain */}
      <div className="alt-grain" />

      {/* Nav */}
      <nav className="alt-nav">
        <span className="alt-logo">BETANCOURT</span>
        <div className="alt-nav-links">
          <a href="#services">SERVICES</a>
          <a href="#philosophy">PROCESS</a>
          <a href="#contact">CONTACT</a>
          <button
            className="alt-nav-cta"
            onMouseEnter={() => setCursorHovering(true)}
            onMouseLeave={() => setCursorHovering(false)}
          >
            START A PROJECT ↗
          </button>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────── */}
      <motion.section className="alt-hero" style={{ opacity: heroOpacity, y: heroY }}>
        <div className="alt-vertical-label">BOGOTÁ · COLOMBIA · DOLBY ATMOS STUDIO</div>

        {/* Waveform background */}
        <div className="alt-waveform">
          {barHeights.map((h, i) => (
            <div
              key={i}
              className="alt-bar"
              style={{
                height: `${h}%`,
                animationDelay: `${(i * 0.055).toFixed(2)}s`,
                animationDuration: `${1.2 + (i % 5) * 0.18}s`,
              }}
            />
          ))}
        </div>

        {/* Big display title */}
        <div className="alt-hero-title">
          <motion.h1
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            SOUND
          </motion.h1>
          <motion.h1
            className="outlined"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            ARCHI-
          </motion.h1>
          <motion.h1
            className="accent"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            TECTURE
          </motion.h1>
        </div>

        {/* Right side description */}
        <motion.div
          className="alt-hero-label"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <p>
            Premium mixing, mastering, and Dolby Atmos production for artists who refuse to compromise.
          </p>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '0.2em', color: 'var(--text-muted)' }}>
            EST. BOGOTÁ, 2017
          </span>
        </motion.div>

        {/* Bottom row */}
        <motion.div
          className="alt-hero-bottom"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7 }}
        >
          <button
            className="alt-cta-btn"
            onMouseEnter={() => setCursorHovering(true)}
            onMouseLeave={() => setCursorHovering(false)}
          >
            START A PROJECT <span className="alt-arrow">→</span>
          </button>
          <div className="alt-badge">
            <span>DOLBY ATMOS CERTIFIED</span>
            <span>ACCEPTING NEW CLIENTS</span>
          </div>
        </motion.div>
      </motion.section>

      {/* ── Ticker ───────────────────────────────── */}
      <div className="alt-ticker">
        <div className="alt-ticker-inner">
          {[...Array(2)].map((_, pass) =>
            ['MIXING · ', 'MASTERING · ', 'DOLBY ATMOS · ', 'PRODUCTION · ', 'BOGOTÁ · ', 'PREMIUM AUDIO · ', 'SPATIAL SOUND · ', 'INDUSTRY STANDARD · '].map(
              (item, i) => <span key={`${pass}-${i}`}>{item}</span>
            )
          )}
        </div>
      </div>

      {/* ── Services ─────────────────────────────── */}
      <section id="services" className="alt-services">
        <div className="alt-services-header">
          <span className="alt-section-label">// WHAT WE DO</span>
          <h2 className="alt-section-title">SERVICES</h2>
        </div>

        {services.map((service, i) => (
          <motion.div
            key={service.id}
            className="alt-service-row"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={() => setCursorHovering(true)}
            onMouseLeave={() => setCursorHovering(false)}
          >
            <span className="alt-service-num">{service.id}</span>
            <div className="alt-service-info">
              <h3>{service.name}</h3>
              <p>{service.description}</p>
            </div>
            <span className="alt-service-price">{service.price}</span>
            <span className="alt-service-arrow">↗</span>
          </motion.div>
        ))}
      </section>

      {/* ── Stats ────────────────────────────────── */}
      <div className="alt-stats">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            className="alt-stat"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
          >
            <span className="alt-stat-num">{stat.num}</span>
            <span className="alt-stat-label">{stat.label}</span>
          </motion.div>
        ))}
      </div>

      {/* ── Philosophy ───────────────────────────── */}
      <section id="philosophy" className="alt-philosophy">
        <div>
          <p className="alt-philosophy-label">// THE PROCESS</p>
          <h2>
            WE DON'T<br />
            PROCESS<br />
            AUDIO.<br />
            <span style={{ color: 'var(--accent)' }}>WE BUILD IT.</span>
          </h2>
          <p>
            Every project that comes through our studio is treated as a unique architectural challenge.
            We study the structure, reinforce what works, and reimagine what doesn't — until every
            frequency, every dynamic, every spatial element serves the music.
          </p>
        </div>

        <div className="alt-philosophy-right">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              className="alt-process-step"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <span className="alt-step-num">{step.num}</span>
              <div className="alt-step-content">
                <h4>{step.title}</h4>
                <p>{step.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────── */}
      <section id="contact" className="alt-cta-section">
        <div>
          <span className="alt-cta-eyebrow">// READY TO ELEVATE?</span>
          <h2 className="alt-cta-title">
            LET'S BUILD<br />YOUR SOUND.
          </h2>
        </div>
        <div className="alt-cta-right">
          <motion.button
            className="alt-cta-btn alt-cta-btn-large"
            onMouseEnter={() => setCursorHovering(true)}
            onMouseLeave={() => setCursorHovering(false)}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
          >
            GET IN TOUCH <span className="alt-arrow">→</span>
          </motion.button>
          <span className="alt-cta-contact">hello@betancourtaudio.com</span>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────── */}
      <footer className="alt-footer">
        <span>© {new Date().getFullYear()} BETANCOURT AUDIO — ALL RIGHTS RESERVED</span>
        <Link href="/">← BACK TO MAIN SITE</Link>
      </footer>
    </div>
  );
}
