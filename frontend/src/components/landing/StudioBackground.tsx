"use client";

import { useScroll, useTransform, motion } from 'framer-motion';

export const StudioBackground = () => {
  const { scrollY } = useScroll();

  // Parallax effect for the background image: moves slightly down and scales up as user scrolls
  const yBg = useTransform(scrollY, [0, 1000], [0, 150]);
  const scaleBg = useTransform(scrollY, [0, 1000], [1.05, 1.15]);

  return (
    <div className="fixed inset-0 z-0 w-full h-full overflow-hidden pointer-events-none">
      {/*
        Base Studio Image
        Vanishing point perspective with plants and acoustic treatments.
      */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2000&auto=format&fit=crop')`,
          y: yBg,
          scale: scaleBg
        }}
      />

      {/*
        ORGANIC TEXTURE LAYER (Wood Grain)
        Adds a tactile, natural feel to the entire scene, blending with the image.
      */}
      <div className="absolute inset-0 bg-grain opacity-10 dark:opacity-20 mix-blend-overlay" />

      {/*
        DYNAMIC WOOD REFLECTION
        Simulates light slowly traveling across the wooden surfaces.
        Visible mostly in dark mode to create "life" in the texture.
      */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent z-10 opacity-0 dark:opacity-30 mix-blend-soft-light"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
          opacity: [0.1, 0.3, 0.1]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
        style={{ backgroundSize: '200% 200%' }}
      />

      {/*
        LIGHT MODE LAYER
        A warm cream wash that allows the studio details to show through subtly,
        creating a bright, airy Japandi feel.
      */}
      <div className="absolute inset-0 bg-j-light-bg/85 dark:opacity-0 transition-opacity duration-1000 mix-blend-overlay" />
      <div className="absolute inset-0 bg-j-light-bg/80 dark:opacity-0 transition-opacity duration-1000" />

      {/*
        DARK MODE LAYER (The "Green Lamp")
        Heavily darkened background with a radial gradient mask to simulate
        a lamp illuminating the center of the studio in Green.
      */}
      <div className="absolute inset-0 bg-[#0a0c0b] opacity-0 dark:opacity-95 transition-opacity duration-1000" />

      {/* The Lamp Glow (Green) - Visible only in Dark Mode */}
      <div className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-1000">
         {/* Radial gradient that reveals the studio image behind it with a green tint */}
         <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 40%, rgba(123, 158, 135, 0.15) 0%, rgba(18, 20, 19, 0.95) 60%, rgba(18, 20, 19, 1) 100%)`,
            }}
         />

         {/* Primary Light Source - Pulsing */}
         <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.5, 0.6, 0.5],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-warm-glow/20 rounded-full blur-[120px] mix-blend-screen"
         />

         {/* Secondary Ambient Blob - Floating Left */}
         <motion.div
            animate={{
              x: [0, 30, 0],
              y: [0, -30, 0],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-[30%] left-[35%] w-[400px] h-[400px] bg-warm-glow/10 rounded-full blur-[100px] mix-blend-screen"
         />
      </div>

      {/*
        ORGANIC SHADOW PLAY (Virtual Plants)
        Abstract blurred shapes that sway gently, simulating plant shadows cast by the studio light.
        This provides the organic feel without needing literal images.
      */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Shadow Left */}
        <motion.div
          className="absolute -bottom-20 -left-20 w-[40rem] h-[40rem] bg-black/40 dark:bg-black/80 blur-3xl rounded-full mix-blend-multiply dark:mix-blend-normal opacity-50"
          style={{ transformOrigin: 'bottom left' }}
          animate={{
            rotate: [0, 5, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Shadow Right - Slightly offset timing */}
        <motion.div
          className="absolute top-1/2 -right-40 w-[30rem] h-[50rem] bg-warm-dim/10 dark:bg-black/60 blur-3xl rounded-[100%] mix-blend-multiply dark:mix-blend-normal opacity-40"
          style={{ transformOrigin: 'center right' }}
          animate={{
            rotate: [0, -3, 0],
            x: [0, -20, 0]
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />

        {/* Abstract Leaf Shape Detail (Top Left) */}
        <motion.div
          className="absolute -top-20 left-1/4 w-96 h-96 bg-warm-glow/5 blur-2xl rounded-full mix-blend-overlay"
          animate={{
            y: [0, 30, 0],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Acoustic Panel overlay texture (Subtle grid lines) */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] opacity-10" />
    </div>
  );
};
