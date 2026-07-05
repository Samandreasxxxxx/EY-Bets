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
    // Generate 25 lightweight confetti particles (was 60)
    const colors = ["#D5FF40", "#FFFFFF", "#b8de2c", "#FF007A", "#FF2E93"];
    const generated: Particle[] = [];
    
    for (let i = 0; i < 25; i++) {
      generated.push({
        id: i,
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 120,
        y: window.innerHeight * 0.65,
        angle: Math.random() * Math.PI + Math.PI, // Upward arc
        speed: 12 + Math.random() * 15,
        size: 5 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    setParticles(generated);

    // Auto-destruct particles after 2.5 seconds
    const timer = setTimeout(() => {
      setParticles([]);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => {
        const initialVx = Math.cos(p.angle) * p.speed;
        const initialVy = Math.sin(p.angle) * p.speed;
        
        return (
          <motion.div
            key={p.id}
            initial={{ 
              x: p.x, 
              y: p.y, 
              scale: 0.3, 
              rotate: 0,
              opacity: 1 
            }}
            animate={{
              x: [
                p.x, 
                p.x + initialVx * 8, 
                p.x + initialVx * 20
              ],
              y: [
                p.y, 
                p.y + initialVy * 8 - 40, 
                p.y + initialVy * 20 + 200
              ],
              rotate: [0, Math.random() * 180, Math.random() * 360],
              scale: [0.3, 1, 0.4],
              opacity: [1, 1, 0]
            }}
            transition={{
              duration: 1.8 + Math.random() * 0.6,
              ease: "easeOut"
            }}
            style={{
              position: "absolute",
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: p.id % 2 === 0 ? "50%" : "1px"
            }}
          />
        );
      })}
    </div>
  );
}
