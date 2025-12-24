import React, { useEffect, useState, useRef } from 'react';
import { 
  motion, 
  useScroll, 
  useSpring, 
  useTransform, 
  useMotionValue, 
  useMotionValueEvent,
  useVelocity
} from 'framer-motion';

export const ConsoleFader = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [trackHeight, setTrackHeight] = useState(0);
  
  // 1. Scroll Hooks
  const { scrollYProgress, scrollY } = useScroll();
  
  // 2. Physics for smooth movement
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // 3. Velocity for VU Meter effect (Speed of scroll = Audio Level)
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  });
  
  // Transform velocity to a 0-100 scale for the LED meter
  const meterLevel = useTransform(smoothVelocity, (v) => {
    const abs = Math.abs(v);
    return Math.min(abs / 20, 100); // Normalize speed to percentage
  });

  useEffect(() => {
    if (containerRef.current) {
      setTrackHeight(containerRef.current.clientHeight - 60); // 60px is approx knob height
    }
  }, []);

  // Map scroll progress (0-1) to track height (pixels)
  // We map 0 to 0 and 1 to trackHeight to mimic a scrollbar behavior (Down = Down)
  const y = useTransform(smoothProgress, [0, 1], [0, trackHeight]);

  const handleDrag = (event: any, info: any) => {
    if (trackHeight === 0) return;
    
    // Calculate percentage based on drag position relative to container
    const newY = info.point.y; 
    // We need to find where this point is relative to the track top
    // However, simpler approach with framer motion drag:
    // We assume the drag constraints set the bounding box.
    // We rely on the element's current Y to calculate scroll percentage.
  };

  // Since useTransform is read-only for mapping, we need a way to drive scroll from Drag.
  // We'll use the onDrag callback.
  const onDrag = (event: any, info: any) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const knobHeight = 60;
    const effectiveHeight = rect.height - knobHeight;
    
    // Calculate relative Y position within the track
    let relativeY = info.point.y - rect.top - (knobHeight / 2);
    
    // Clamp values
    if (relativeY < 0) relativeY = 0;
    if (relativeY > effectiveHeight) relativeY = effectiveHeight;

    // Calculate percentage (0 to 1)
    const percentage = relativeY / effectiveHeight;
    
    // Scroll the window
    const totalDocHeight = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: totalDocHeight * percentage,
      behavior: 'instant' // Instant because the drag provides the smoothing
    });
  };

  // Marks for the fader track (visual only)
  const ticks = [-10, -5, 0, 5, 10]; 

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1, duration: 0.8 }}
      className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex gap-4 items-center h-[400px]"
    >
      {/* VU Meter (Left of Fader) */}
      <div className="w-2 h-full bg-black/40 rounded-full overflow-hidden flex flex-col justify-end border border-white/5 relative">
        {/* LED Segments */}
        <div className="absolute inset-0 flex flex-col gap-[2px] opacity-30">
             {[...Array(40)].map((_, i) => (
                 <div key={i} className={`w-full h-[10%] ${i > 30 ? 'bg-red-500' : i > 20 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ height: '2.5%' }} />
             ))}
        </div>
        {/* Active Signal Mask */}
        <motion.div 
            className="w-full bg-gradient-to-t from-green-500 via-yellow-500 to-red-500"
            style={{ height: useTransform(meterLevel, l => `${l}%`) }}
        />
      </div>

      {/* Fader Track Container */}
      <div 
        ref={containerRef}
        className="relative w-16 h-full bg-[#1a1c1b] rounded-lg border border-white/10 shadow-2xl flex justify-center py-[30px]" // py is half knob height
      >
        {/* The Groove */}
        <div className="absolute top-4 bottom-4 w-1.5 bg-black rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,1)] border-l border-white/5"></div>

        {/* dB Ticks */}
        <div className="absolute inset-0 pointer-events-none">
          {ticks.map((tick, i) => {
            const pos = (i / (ticks.length - 1)) * 100;
            return (
              <div key={tick} className="absolute w-full flex justify-between px-3 text-[10px] font-mono text-white/30" style={{ top: `${pos}%` }}>
                <span>-</span>
                <span className="ml-auto">-</span>
              </div>
            )
          })}
          
          <div className="absolute top-[10%] right-3 text-[10px] font-mono text-warm-glow font-bold">0dB</div>
          <div className="absolute bottom-[10%] right-3 text-[10px] font-mono text-white/30">-∞</div>
        </div>

        {/* The Fader Knob (Cap) */}
        <motion.div
          style={{ y }} // Driven by scroll
          drag="y" // Enable Dragging
          dragConstraints={containerRef}
          dragElastic={0}
          dragMomentum={false}
          onDrag={onDrag}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95, cursor: "grabbing" }}
          className="absolute top-0 w-10 h-16 cursor-grab z-10 touch-none"
        >
            {/* Knob Visuals - Realistic Metallic Look */}
            <div className="w-full h-full bg-gradient-to-b from-[#3a3d3c] to-[#1a1c1b] rounded shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] flex items-center justify-center relative border border-black">
                {/* Concave center */}
                <div className="w-full h-[40%] bg-gradient-to-b from-black/40 to-transparent absolute top-[30%]"></div>
                
                {/* Center Line Indicator */}
                <div className="w-full h-[2px] bg-white absolute top-1/2 -translate-y-1/2 shadow-[0_0_5px_rgba(255,255,255,0.8)]"></div>
                
                {/* Side Grips */}
                <div className="absolute left-1 top-2 bottom-2 w-[1px] bg-black/30"></div>
                <div className="absolute right-1 top-2 bottom-2 w-[1px] bg-black/30"></div>
            </div>
            
            {/* Glow effect under the knob */}
            <div className="absolute -inset-4 bg-warm-glow/20 rounded-full blur-xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </motion.div>
      </div>
      
      {/* Label */}
      <div className="absolute -right-8 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] tracking-[0.3em] text-white/20 font-bold uppercase pointer-events-none whitespace-nowrap">
        Main Mix / Scroll
      </div>
    </motion.div>
  );
};
