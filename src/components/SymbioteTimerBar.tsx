"use client";

import React from "react";

interface SymbioteTimerBarProps {
  percentage: number; // 0 to 100
  timeString: string; // e.g. "04:32"
  isExpired: boolean;
}

export default function SymbioteTimerBar({ percentage, timeString, isExpired }: SymbioteTimerBarProps) {
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  return (
    <div className="relative w-full bg-dark-bg/40 border border-dark-border rounded-lg p-3 overflow-hidden select-none">
      
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-mono tracking-widest text-sage-muted uppercase flex items-center gap-1.5 font-bold">
          <span className={`w-1.5 h-1.5 rounded-full ${isExpired ? "bg-red-500 animate-pulse" : "bg-primary animate-pulse"}`}></span>
          {isExpired ? "Closed" : "Betting open"}
        </span>
        <span className={`font-mono text-xs font-black tracking-wider ${isExpired ? "text-red-500" : "text-primary"}`}>
          {timeString}
        </span>
      </div>

      {/* High-Performance Progress Bar Container */}
      <div className="relative h-2.5 bg-dark-bg border border-dark-border/60 rounded overflow-hidden flex items-center">
        {/* Fill layer */}
        <div
          style={{ width: `${clampedPercentage}%` }}
          className="h-full rounded-l transition-all duration-1000 ease-out bg-gradient-to-r from-primary/50 to-primary flex items-center justify-end"
        >
          {/* Subtle leading indicator dot */}
          {clampedPercentage > 0 && clampedPercentage < 100 && (
            <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0 mr-0.5"></div>
          )}
        </div>
      </div>
    </div>
  );
}
