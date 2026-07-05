"use client";

import React, { useState } from "react";
import { useSimState } from "@/context/SimStateContext";
import Header from "@/components/Header";
import SimulatorHarness from "@/components/SimulatorHarness";
import { Trophy, Zap, Percent, Compass } from "lucide-react";

export default function LeaderboardPage() {
  const { users } = useSimState();
  const [sortBy, setSortBy] = useState<"profit" | "earnings">("profit");

  // Sort users
  const sortedUsers = [...users].sort((a, b) => {
    if (sortBy === "profit") {
      return b.stats.netProfit - a.stats.netProfit;
    } else {
      return b.stats.totalMoneyWon - a.stats.totalMoneyWon;
    }
  });

  const top3 = sortedUsers.slice(0, 3);

  // Position names mapping for podium (2nd, 1st, 3rd)
  const podiumOrder = [
    { pos: 1, user: top3[1], height: "h-28 sm:h-36", scale: "scale-95", glow: "border-t-white/40" }, // 2nd place
    { pos: 0, user: top3[0], height: "h-36 sm:h-48", scale: "scale-100", glow: "border-t-primary shadow-[0_0_15px_rgba(213,255,64,0.15)]" },   // 1st place
    { pos: 2, user: top3[2], height: "h-20 sm:h-28", scale: "scale-90", glow: "border-t-pink-pop/50" }  // 3rd place
  ];

  return (
    <div className="flex flex-col min-h-screen bg-dark-bg font-sans pb-24 overflow-hidden relative">
      <Header />

      {/* Floating Black Asteroids Layer with Lime & Pink Glow outlines */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Asteroid 1 (Large, slow, pink glow) */}
        <div className="absolute top-28 left-[10%] w-16 h-14 asteroid-rock asteroid-glow-pink rounded-[40%_60%_55%_45%] opacity-70 animate-float-asteroid-slow"></div>
        {/* Asteroid 2 (Medium, green glow) */}
        <div className="absolute top-44 right-[12%] w-10 h-10 asteroid-rock asteroid-glow-green rounded-[50%_40%_60%_50%] opacity-65 animate-float-asteroid-medium"></div>
        {/* Asteroid 3 (Small, plain) */}
        <div className="absolute top-96 left-[5%] w-6 h-6 asteroid-rock rounded-full opacity-50 animate-float-asteroid-fast"></div>
        {/* Asteroid 4 (Medium, pink glow, behind podium) */}
        <div className="absolute top-[26rem] right-[8%] w-12 h-10 asteroid-rock asteroid-glow-pink rounded-full opacity-60 animate-float-asteroid-slow"></div>
        {/* Asteroid 5 (Small, green glow, bottom-left) */}
        <div className="absolute top-[30rem] left-[15%] w-8 h-8 asteroid-rock asteroid-glow-green rounded-[60%_40%_30%_70%] opacity-50 animate-float-asteroid-medium"></div>
        {/* Asteroid 6 (Large, bottom right, pink glow) */}
        <div className="absolute bottom-20 right-[5%] w-20 h-16 asteroid-rock asteroid-glow-pink rounded-[45%_55%_45%_55%] opacity-70 animate-float-asteroid-slow"></div>
      </div>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-8 relative z-10">
        
        {/* Page Title & Sort Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-wider text-white uppercase flex items-center gap-2">
              NET STANDINGS <span className="text-pink-pop animate-pulse">●</span>
            </h1>
            <p className="text-sage-muted text-[11px] font-mono mt-0.5 uppercase tracking-wider">
              Score leaderboard sorted by profits or absolute win payouts.
            </p>
          </div>

          {/* Sort Toggle (Sharp) */}
          <div className="flex bg-[#0c0d10] border border-dark-border p-1 rounded shrink-0 self-start text-[10px] uppercase font-bold font-mono">
            <button
              onClick={() => setSortBy("profit")}
              className={`px-4 py-1.5 rounded transition-all cursor-pointer ${
                sortBy === "profit"
                  ? "bg-primary text-dark-bg font-extrabold"
                  : "text-sage-muted hover:text-white"
              }`}
            >
              Net Profit
            </button>
            <button
              onClick={() => setSortBy("earnings")}
              className={`px-4 py-1.5 rounded transition-all cursor-pointer ${
                sortBy === "earnings"
                  ? "bg-primary text-dark-bg font-extrabold"
                  : "text-sage-muted hover:text-white"
              }`}
            >
              Total Earnings
            </button>
          </div>
        </div>

        {/* PODIUM DISPLAY */}
        {sortedUsers.length > 0 && (
          <section className="flex flex-col items-center select-none pt-4 pb-2">
            
            {/* Podium Columns (Sharp and Glassmorphic) */}
            <div className="flex items-end justify-center gap-4 sm:gap-8 w-full max-w-2xl px-2 h-76 sm:h-96 relative">
              
              {podiumOrder.map(({ pos, user, height, scale, glow }) => {
                if (!user) return null;

                const isWinner = pos === 0;
                const isThird = pos === 2;
                const winRate = user.stats.totalMatches > 0 ? Math.round((user.stats.totalWins / user.stats.totalMatches) * 100) : 0;
                
                return (
                  <div 
                    key={user.id} 
                    className={`flex flex-col items-center flex-1 transition-all ${scale}`}
                  >
                    {/* User profile bubble */}
                    <div className="flex flex-col items-center mb-3 text-center">
                      <div className="relative">
                        {/* Crown for 1st */}
                        {isWinner && (
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl animate-bounce">
                            👑
                          </span>
                        )}
                        {/* Profile initials (Sharp box) */}
                        <div className={`w-12 h-12 sm:w-15 sm:h-15 flex items-center justify-center font-black text-sm border-2 rounded ${
                          isWinner 
                            ? "bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(213,255,64,0.3)]" 
                            : isThird 
                            ? "bg-pink-pop/15 border-pink-pop text-pink-pop shadow-[0_0_15px_rgba(255,0,122,0.2)]" 
                            : "bg-dark-card border-dark-border text-white"
                        }`}>
                          {user.username[0].toUpperCase()}
                        </div>
                        {/* Rank tag on avatar */}
                        <span className={`absolute -bottom-1.5 -right-1 w-5 h-5 rounded flex items-center justify-center text-[10px] font-black font-mono border ${isWinner ? "bg-primary text-dark-bg border-primary" : "bg-dark-card text-sage-muted border-dark-border"}`}>
                          {pos + 1}
                        </span>
                      </div>
                      
                      {/* Name */}
                      <span className="text-xs font-black text-white mt-3.5 block max-w-[80px] sm:max-w-[120px] truncate uppercase font-mono tracking-wider">
                        {user.username}
                      </span>
                      
                      {/* Sub-Stat */}
                      <span className="text-[10px] font-mono font-bold mt-0.5">
                        {sortBy === "profit" ? (
                          <span className={user.stats.netProfit >= 0 ? "text-green-400" : "text-red-400"}>
                            {user.stats.netProfit >= 0 ? "+" : ""}₹{user.stats.netProfit}
                          </span>
                        ) : (
                          <span className="text-primary">₹{user.stats.totalMoneyWon}</span>
                        )}
                      </span>
                    </div>

                    {/* Physical Podium Block (Sharp edges, Gradient borders) */}
                    <div className={`w-full ${height} bg-[#0c0d10] border-x border-b border-dark-border rounded-t flex flex-col justify-end p-3 relative overflow-hidden`}>
                      
                      {/* Top base glow */}
                      <div className={`absolute top-0 inset-x-0 h-[2px] ${glow}`}></div>
                      
                      {/* Large background rank number */}
                      <span className="absolute inset-0 flex items-center justify-center font-mono font-black text-white/5 text-6xl sm:text-8xl select-none">
                        {pos + 1}
                      </span>

                      {/* Stats inside podium */}
                      <div className="relative z-10 w-full flex flex-col gap-1 items-center font-mono text-[9px] text-sage-muted/70 bg-dark-bg/60 p-1.5 rounded border border-dark-border/40">
                        <span className="flex items-center gap-0.5">
                          🔥 {user.stats.streak} Streak
                        </span>
                        <span>{winRate}% WR</span>
                      </div>

                    </div>
                  </div>
                );
              })}

            </div>

            {/* Glowing circle underneath */}
            <div className="w-72 sm:w-96 h-2 bg-pink-pop/10 blur-sm rounded-full shadow-[0_0_15px_rgba(255,0,122,0.3)] mt-2"></div>
          </section>
        )}

        {/* RANKINGS LIST TABLE */}
        <section className="bg-dark-card border border-[#1a1d24] rounded-lg p-5 shadow-lg flex flex-col gap-3 font-sans">
          <div className="flex justify-between items-center text-[10px] text-sage-muted border-b border-dark-border pb-3 uppercase font-bold tracking-widest font-mono">
            <span>Standings Standings ({sortedUsers.length} users):</span>
            <span className="flex items-center gap-1"><Compass className="w-3.5 h-3.5 text-pink-pop animate-pulse" /> Sort: {sortBy === "profit" ? "Profit" : "Won"}</span>
          </div>

          <div className="flex flex-col gap-2.5">
            {sortedUsers.map((user, idx) => {
              const winRate = user.stats.totalMatches > 0 ? Math.round((user.stats.totalWins / user.stats.totalMatches) * 100) : 0;
              const isTop3 = idx < 3;
              
              return (
                <div 
                  key={user.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded border transition-all gap-3 ${
                    idx === 0 
                      ? "bg-primary/5 border-primary/25 shadow-[inset_0_0_8px_rgba(213,255,64,0.03)]" 
                      : idx === 2
                      ? "bg-pink-pop/5 border-pink-pop/25 shadow-[inset_0_0_8px_rgba(255,0,122,0.03)]"
                      : "bg-[#0b0c0f]/40 border-dark-border hover:border-dark-border/80"
                  }`}
                >
                  {/* Left info: rank and username */}
                  <div className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-black font-mono border ${isTop3 ? "bg-primary text-dark-bg border-primary" : "bg-dark-bg text-sage-muted border-dark-border"}`}>
                      {idx + 1}
                    </span>
                    <div className="w-8 h-8 rounded bg-dark-bg border border-dark-border flex items-center justify-center font-bold text-xs text-white">
                      {user.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5 uppercase font-mono">
                        {user.username}
                        {user.badges.map((b) => (
                          <span 
                            key={b} 
                            className="text-[8px] bg-dark-bg border border-dark-border text-primary px-1 rounded font-mono font-bold"
                          >
                            {b.split(" ")[0]}
                          </span>
                        ))}
                      </div>
                      <div className="text-[9px] text-sage-muted mt-0.5 font-mono uppercase tracking-wider">
                        Matches: {user.stats.totalWins}W / {user.stats.totalLosses}L
                      </div>
                    </div>
                  </div>

                  {/* Right stats panel */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 border-t sm:border-t-0 border-dark-border/40 pt-2 sm:pt-0 font-mono text-[10px]">
                    {/* Win rate */}
                    <div className="flex items-center gap-1.5 text-sage-muted">
                      <div>
                        <div className="text-[8px] uppercase font-bold text-sage-muted/70 font-sans">Win Rate</div>
                        <div className="font-semibold text-white">{winRate}%</div>
                      </div>
                    </div>

                    {/* Streak */}
                    <div className="flex items-center gap-1.5 text-sage-muted">
                      <div>
                        <div className="text-[8px] uppercase font-bold text-sage-muted/70 font-sans">Streak</div>
                        <div className="font-semibold text-white">{user.stats.streak}</div>
                      </div>
                    </div>

                    {/* Earnings / Profit */}
                    <div className="text-right">
                      <div className="text-[8px] uppercase font-bold text-sage-muted/70 font-sans">
                        {sortBy === "profit" ? "Net Profit" : "Total Won"}
                      </div>
                      <div className="font-black text-xs">
                        {sortBy === "profit" ? (
                          <span className={user.stats.netProfit >= 0 ? "text-green-400" : "text-red-400"}>
                            {user.stats.netProfit >= 0 ? "+" : ""}₹{user.stats.netProfit}
                          </span>
                        ) : (
                          <span className="text-primary glow-text-green">₹{user.stats.totalMoneyWon}</span>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </section>

      </main>

      <SimulatorHarness />
    </div>
  );
}
