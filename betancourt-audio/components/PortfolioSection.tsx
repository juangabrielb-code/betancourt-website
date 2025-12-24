import React, { useRef } from 'react';
import { motion, useInView, Variants } from 'framer-motion';
import { Container, GlassCard, Badge, Reveal } from './UI';

interface Project {
  id: string;
  title: string;
  artist: string;
  genre: string;
  image: string;
  type: 'Mixing' | 'Mastering' | 'Production';
}

interface PortfolioSectionProps {
  t: any;
}

const PROJECTS: Project[] = [
  {
    id: '1',
    title: "Neon Nights",
    artist: "Lunar Echo",
    genre: "Synthwave",
    image: "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?q=80&w=800&auto=format&fit=crop",
    type: "Production"
  },
  {
    id: '2',
    title: "Acoustic Sessions",
    artist: "Sarah Woods",
    genre: "Indie Folk",
    image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=800&auto=format&fit=crop",
    type: "Mixing"
  },
  {
    id: '3',
    title: "Urban Flow",
    artist: "MC Kinetik",
    genre: "Hip Hop",
    image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?q=80&w=800&auto=format&fit=crop",
    type: "Mastering"
  },
  {
    id: '4',
    title: "Deep Horizons",
    artist: "The Void",
    genre: "Techno",
    image: "https://images.unsplash.com/photo-1558584673-c834fb1cc3ca?q=80&w=800&auto=format&fit=crop",
    type: "Production"
  }
];

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({ t }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', damping: 15 }
    }
  };

  return (
    <section id="portfolio" className="py-24 relative z-10">
      <Container>
        <div className="mb-16">
          <Reveal>
            <h2 className="text-3xl font-serif font-bold text-j-light-text dark:text-white mb-4">
              {t.portfolio.title}
            </h2>
            <p className="text-j-light-text/70 dark:text-j-dark-text/70 max-w-2xl">
              {t.portfolio.subtitle}
            </p>
          </Reveal>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {PROJECTS.map((project) => (
            <motion.div key={project.id} variants={itemVariants} className="group cursor-pointer">
              <GlassCard className="h-full p-0 overflow-hidden border-0 hover:shadow-2xl hover:shadow-warm-glow/20 transition-all duration-500">
                <div className="relative aspect-square overflow-hidden">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full h-full"
                  >
                     <img 
                      src={project.image} 
                      alt={project.title} 
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
                      <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  <div className="absolute top-4 right-4">
                    <Badge color="bg-black/50 backdrop-blur-md text-white border-white/10">
                      {project.type}
                    </Badge>
                  </div>
                </div>

                <div className="p-6 relative bg-j-light-surface/90 dark:bg-[#121413]/90 backdrop-blur-xl border-t border-white/5">
                  <p className="text-xs font-medium text-warm-glow mb-1 uppercase tracking-wider">{project.genre}</p>
                  <h3 className="text-lg font-bold text-j-light-text dark:text-white group-hover:text-warm-glow transition-colors">{project.title}</h3>
                  <p className="text-sm text-j-light-text/60 dark:text-j-dark-text/60">{project.artist}</p>
                  
                  <div className="mt-4 flex items-center text-xs font-semibold text-j-light-text dark:text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    {t.portfolio.listen}
                    <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
};