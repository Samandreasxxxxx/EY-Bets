"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  size: number;
  color: string;
}

export default function ConfettiEffect() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate 60 confetti particles
    const colors = ["#D5FF40", "#FFFFFF", "#b8de2c", "#88a31e", "#556410"];
    const generated: Particle[] = [];
    
    for (let i = 0; i < 60; i++) {
      generated.push({
        id: i,
        // Start near center-bottom
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 150,
        y: window.innerHeight * 0.7,
        angle: Math.random() * Math.PI + Math.PI, // Upward arc
        speed: 15 + Math.random() * 20,
        size: 6 + Math.random() * 10,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    setParticles(generated);

    // Auto-destruct particles after 3.5 seconds
    const timer = setTimeout(() => {
      setParticles([]);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => {
        // Calculate arc physics trajectory
        const gravity = 0.5;
        const initialVx = Math.cos(p.angle) * p.speed;
        const initialVy = Math.sin(p.angle) * p.speed;
        
        return (
          <motion.div
            key={p.id}
            initial={{ 
              x: p.x, 
              y: p.y, 
              scale: 0.2, 
              rotate: 0,
              opacity: 1 
            }}
            animate={{
              // Approximate projectile path
              x: [
                p.x, 
                p.x + initialVx * 10, 
                p.x + initialVx * 25
              ],
              y: [
                p.y, 
                p.y + initialVy * 10 - 50, 
                p.y + initialVy * 25 + 250 // falls back down
              ],
              rotate: [0, Math.random() * 360, Math.random() * 720],
              scale: [0.2, 1, 0.5],
              opacity: [1, 1, 0]
            }}
            transition={{
              duration: 2.5 + Math.random() * 1,
              ease: "easeOut"
            }}
            style={{
              position: "absolute",
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: p.id % 2 === 0 ? "50%" : "2px",
              boxShadow: p.color === "#D5FF40" ? "0 0 10px rgba(213,255,64,0.6)" : "none"
            }}
          />
        );
      })}
    </div>
  );
}
