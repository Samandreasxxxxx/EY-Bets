"use client";

import React from "react";

interface SymbioteTimerBarProps {
  percentage: number; // 0 to 100
  timeString: string; // e.g. "04:32"
  isExpired: boolean;
}

export default function SymbioteTimerBar({ percentage, timeString, isExpired }: SymbioteTimerBarProps) {
  // Ensure percentage is bounded between 0 and 100
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  return (
    <div className="relative w-full bg-dark-bg/60 border border-dark-border rounded-xl p-3 overflow-hidden select-none">
      {/* SVG gooey liquid filter */}
      <svg className="absolute w-0 h-0" width="0" height="0">
        <defs>
          <filter id="symbiote-gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-mono tracking-widest text-sage-muted uppercase flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isExpired ? "bg-red-500 animate-pulse" : "bg-primary animate-pulse"}`}></span>
          {isExpired ? "Betting Closed" : "Betting Window Open"}
        </span>
        <span className={`font-mono text-sm font-bold tracking-wider ${isExpired ? "text-red-500" : "text-primary glow-text-green"}`}>
          {timeString}
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="relative h-6 bg-dark-bg border border-dark-border/80 rounded-lg overflow-hidden flex items-center px-1">
        {/* Symbiote Goo Liquid layer */}
        <div
          style={{ 
            width: `${clampedPercentage}%`,
            filter: "url(#symbiote-gooey)" 
          }}
          className="relative h-4 rounded-md transition-all duration-1000 ease-out bg-gradient-to-r from-primary/60 via-primary to-primary shadow-[0_0_12px_rgba(213,255,64,0.6)] flex items-center justify-end overflow-visible"
        >
          {/* Pulsating organic blob at the leading edge */}
          {clampedPercentage > 0 && (
            <div className="absolute -right-2 w-5 h-5 rounded-full bg-primary animate-pulse shadow-[0_0_15px_rgba(213,255,64,0.9)] border-2 border-dark-bg"></div>
          )}
          
          {/* Muted background bubbles to give a liquid texture */}
          {clampedPercentage > 15 && (
            <>
              <div className="absolute left-[10%] w-2 h-2 rounded-full bg-white/30 animate-bounce"></div>
              <div className="absolute right-[30%] w-1.5 h-1.5 rounded-full bg-white/20 animate-ping"></div>
              <div className="absolute left-[50%] w-2.5 h-2.5 rounded-full bg-white/35 animate-pulse"></div>
            </>
          )}
        </div>

        {/* Muted indicator lines */}
        <div className="absolute inset-0 flex justify-between px-6 pointer-events-none">
          <div className="w-[1px] h-full bg-dark-border/40"></div>
          <div className="w-[1px] h-full bg-dark-border/40"></div>
          <div className="w-[1px] h-full bg-dark-border/40"></div>
        </div>
      </div>
    </div>
  );
}
