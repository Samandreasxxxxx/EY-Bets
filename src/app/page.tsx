"use client";

import React, { useState } from "react";
import { useSimState } from "@/context/SimStateContext";
import Header from "@/components/Header";
import SimulatorHarness from "@/components/SimulatorHarness";
import CreateMatchModal from "@/components/CreateMatchModal";
import ActiveMatchCard from "@/components/ActiveMatchCard";
import { Swords, Plus, TrendingUp, Award, History, Calendar, Trophy, Coins } from "lucide-react";

export default function Dashboard() {
  const { 
    activeUser, 
    matches, 
    users,
    bets,
    depositRequests
  } = useSimState();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"All" | "Foosball" | "Table Tennis">("All");

  if (!activeUser) return null;

  // Filter live matches (betting or active status)
  const liveMatches = matches.filter((m) => m.status !== "completed");
  const filteredLiveMatches = liveMatches.filter((m) => {
    if (activeFilter === "All") return true;
    return m.game === activeFilter;
  });

  // Completed matches history
  const completedMatches = matches.filter((m) => m.status === "completed");

  // Calculate Win Rate
  const totalMatches = activeUser.stats.totalMatches;
  const winRate = totalMatches > 0 ? Math.round((activeUser.stats.totalWins / totalMatches) * 100) : 0;

  // Assemble Social Activity Feed events dynamically
  const feedEvents: { id: string; time: number; type: string; text: string; icon: string }[] = [];

  // 1. Match creation events
  matches.forEach(m => {
    feedEvents.push({
      id: `feed-match-${m.id}`,
      time: new Date(m.createdAt).getTime(),
      type: "match",
      text: `${m.creatorName} launched a ${m.game} pool (#${m.id})`,
      icon: "🎮"
    });
  });

  // 2. Bets placed and won
  bets.forEach(b => {
    const matchObj = matches.find(m => m.id === b.matchId);
    const teamLabel = matchObj ? (b.team === "A" ? matchObj.teamA : matchObj.teamB) : `Team ${b.team}`;
    feedEvents.push({
      id: `feed-bet-${b.id}`,
      time: new Date(b.createdAt).getTime(),
      type: "bet",
      text: `${b.username} bet ₹${b.amount} on ${teamLabel}`,
      icon: "🎯"
    });

    if (b.status === "won" && b.payout > 0) {
      feedEvents.push({
        id: `feed-win-${b.id}`,
        time: new Date(b.createdAt).getTime() + 500, // offset slightly
        type: "win",
        text: `${b.username} claimed ₹${b.payout} winning payout!`,
        icon: "👽"
      });
    }
  });

  // 3. Approved deposits
  depositRequests.filter(d => d.status === "approved").forEach(d => {
    feedEvents.push({
      id: `feed-dep-${d.id}`,
      time: new Date(d.createdAt).getTime(),
      type: "deposit",
      text: `${d.username} funded wallet with ₹${d.amount}`,
      icon: "💸"
    });
  });

  // Sort and limit to top 5
  const sortedFeed = feedEvents
    .sort((a, b) => b.time - a.time)
    .slice(0, 5);

  return (
    <div className="flex flex-col min-h-screen bg-dark-bg font-sans pb-24 relative">
      {/* Global Navigation */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6 relative z-10">
        
        {/* Banner Welcome (Sharp, Linear border details, Pink edge glow) */}
        <div className="bg-gradient-to-br from-dark-card to-dark-bg border border-dark-border border-l-4 border-l-pink-pop rounded p-5 md:p-6 shadow-lg relative overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative z-10">
            <h1 className="text-xl font-black tracking-wider text-white uppercase flex items-center gap-2 font-mono">
              LOBBY FEED <span className="text-primary animate-pulse">●</span>
            </h1>
            <p className="text-sage-muted text-[11px] font-mono uppercase tracking-wide mt-1.5 leading-relaxed max-w-2xl">
              Welcome, staker <span className="text-white font-bold">{activeUser.username}</span>! Switch active user sessions using the simulation panel below to trigger UPI intent payments.
            </p>
          </div>
          
          <button
            onClick={() => setIsCreateOpen(true)}
            className="sm:self-center flex items-center justify-center gap-1.5 px-5 py-3 bg-primary text-dark-bg font-extrabold rounded shadow-[0_0_12px_rgba(213,255,64,0.3)] hover:shadow-[0_0_20px_rgba(213,255,64,0.6)] border border-pink-pop transition-all transform hover:-translate-y-0.5 text-[10px] tracking-widest uppercase shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3px]" />
            <span>Create Match</span>
          </button>
          
          {/* Decorative faint background grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808003_1px,transparent_1px),linear-gradient(to_bottom,#80808003_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-20"></div>
        </div>

        {/* Quick Stats Dashboard (Sharp, Hot Pink edge Pop) */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Wallet Card */}
          <div className="bg-[#0c0d10] border border-[#1a1d24] hover:border-pink-pop/20 transition-all p-4 rounded flex flex-col justify-between shadow relative">
            <div className="flex justify-between items-start text-sage-muted">
              <span className="text-[9px] font-bold font-mono uppercase tracking-widest">Cash Balance</span>
              <Coins className="w-4 h-4 text-primary" />
            </div>
            <div className="mt-3">
              <span className="text-xl md:text-2xl font-black font-mono text-white">₹{activeUser.walletBalance}</span>
            </div>
            <span className="text-[9px] text-sage-muted mt-2 font-mono uppercase">
              UPI Escrow Active
            </span>
          </div>

          {/* Net Profit Card */}
          <div className="bg-[#0c0d10] border border-[#1a1d24] hover:border-pink-pop/20 transition-all p-4 rounded flex flex-col justify-between shadow">
            <div className="flex justify-between items-start text-sage-muted">
              <span className="text-[9px] font-bold font-mono uppercase tracking-widest">Net Profit</span>
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div className="mt-3">
              <span className={`text-xl md:text-2xl font-black font-mono ${activeUser.stats.netProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                {activeUser.stats.netProfit >= 0 ? "+" : ""}₹{activeUser.stats.netProfit}
              </span>
            </div>
            <span className="text-[9px] text-sage-muted mt-2 font-mono uppercase">
              Payout Claims: ₹{activeUser.stats.totalMoneyWon}
            </span>
          </div>

          {/* Win Rate Card */}
          <div className="bg-[#0c0d10] border border-[#1a1d24] hover:border-pink-pop/20 transition-all p-4 rounded flex flex-col justify-between shadow">
            <div className="flex justify-between items-start text-sage-muted">
              <span className="text-[9px] font-bold font-mono uppercase tracking-widest">Win Rate %</span>
              <Trophy className="w-4 h-4 text-primary" />
            </div>
            <div className="mt-3">
              <span className="text-xl md:text-2xl font-black font-mono text-white">{winRate}%</span>
            </div>
            <span className="text-[9px] text-sage-muted mt-2 font-mono uppercase">
              Record: {activeUser.stats.totalWins}W / {activeUser.stats.totalLosses}L
            </span>
          </div>

          {/* Winning Streak Card */}
          <div className="bg-[#0c0d10] border border-[#1a1d24] hover:border-pink-pop/20 transition-all p-4 rounded flex flex-col justify-between shadow border-r-2 border-r-pink-pop">
            <div className="flex justify-between items-start text-sage-muted">
              <span className="text-[9px] font-bold font-mono uppercase tracking-widest">Win Streak</span>
              <Award className="w-4 h-4 text-pink-pop animate-pulse" />
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-xl md:text-2xl font-black font-mono text-primary glow-text-green">{activeUser.stats.streak}</span>
              <span className="text-[9px] text-sage-muted font-bold font-mono uppercase">Lobby</span>
            </div>
            <span className="text-[9px] text-sage-muted mt-2 font-mono uppercase">
              Record claim: ₹{activeUser.stats.biggestWin}
            </span>
          </div>

        </section>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: Live Pools List (2 Cols on lg) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            
            {/* Filter and Title */}
            <div className="flex justify-between items-center bg-[#0c0d10] border border-[#1a1d24] p-3.5 rounded">
              <div className="flex items-center gap-2">
                <Swords className="w-4 h-4 text-primary" />
                <h3 className="font-black text-xs uppercase text-white tracking-widest font-mono">Prediction Pools</h3>
              </div>
              
              {/* Selector Buttons */}
              <div className="flex gap-1 text-[10px] uppercase font-bold font-mono">
                {(["All", "Foosball", "Table Tennis"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-1 rounded transition-all cursor-pointer ${
                      activeFilter === filter
                        ? "bg-primary text-dark-bg shadow-sm"
                        : "bg-dark-bg border border-dark-border text-sage-muted hover:text-white"
                    }`}
                  >
                    {filter === "All" ? "All" : filter === "Foosball" ? "Foosball" : "TT"}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            {filteredLiveMatches.length === 0 ? (
              <div className="bg-dark-card border border-dark-border border-dashed rounded py-12 px-6 text-center flex flex-col items-center gap-4 shadow-sm">
                <div className="w-14 h-14 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-xl animate-pulse">
                  📡
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white uppercase tracking-widest font-mono">No active signal frequencies</h4>
                  <p className="text-[10px] text-sage-muted mt-1.5 max-w-sm mx-auto leading-relaxed font-mono">
                    There are no live prediction pools for {activeFilter === "All" ? "any games" : activeFilter} right now. Create a match to launch a pool.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="bg-primary/15 hover:bg-primary/25 border border-primary/25 text-primary text-[10px] font-bold px-4 py-2 rounded transition-all uppercase tracking-widest cursor-pointer"
                >
                  Create Match Pool
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredLiveMatches.map((match) => (
                  <ActiveMatchCard key={match.id} match={match} />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Lobby Feed & Match History (1 Col on lg) */}
          <div className="flex flex-col gap-6">
            
            {/* Live Social Feed (Pop Highlights) */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 bg-[#0c0d10] border border-[#1a1d24] p-3.5 rounded relative">
                {/* Ping Dot */}
                <span className="relative flex h-2 w-2 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-pop opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-pop"></span>
                </span>
                <h3 className="font-black text-xs uppercase text-white tracking-widest font-mono">Lobby Signal Radar</h3>
              </div>
              
              <div className="bg-[#0c0d10] border border-[#1a1d24] p-4 rounded shadow-md flex flex-col gap-3">
                {sortedFeed.length === 0 ? (
                  <div className="text-xs text-sage-muted text-center py-6 font-mono">
                    Lobby activity scanner is quiet.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5 font-sans text-xs">
                    {sortedFeed.map((ev) => (
                      <div key={ev.id} className="flex gap-2.5 items-start bg-dark-bg/35 p-2.5 rounded border border-dark-border/40 hover:border-pink-pop/20 transition-all">
                        <span className="text-sm shrink-0 select-none">{ev.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium leading-normal text-[10.5px]">{ev.text}</p>
                          <span className="text-[8px] text-sage-muted/65 font-mono mt-0.5 block">
                            {new Date(ev.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Match History */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 bg-[#0c0d10] border border-[#1a1d24] p-3.5 rounded">
                <History className="w-4 h-4 text-primary" />
                <h3 className="font-black text-xs uppercase text-white tracking-widest font-mono">Resolved Matches</h3>
              </div>

              {/* History Cards */}
              {completedMatches.length === 0 ? (
                <div className="bg-dark-card border border-dark-border rounded py-10 px-4 text-center text-sage-muted text-[10px] font-mono uppercase tracking-wider">
                  No finished match signals recorded.
                </div>
              ) : (
                <div className="flex flex-col gap-3.5 max-h-[400px] overflow-y-auto pr-1">
                  {completedMatches.map((m) => (
                    <div 
                      key={m.id} 
                      className="bg-[#0c0d10] border border-[#1a1d24] p-3.5 rounded shadow flex flex-col gap-2 font-sans"
                    >
                      {/* Game and date */}
                      <div className="flex justify-between items-center text-[9px] text-sage-muted font-mono font-bold uppercase">
                        <span className="bg-dark-bg/60 border border-dark-border/40 px-2 py-0.5 rounded text-primary">
                          {m.game.toUpperCase()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(m.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </span>
                      </div>

                      {/* Team names */}
                      <div className="flex justify-between items-center text-xs font-bold mt-1">
                        <span className={m.winner === "A" ? "text-green-400" : "text-white"}>
                          {m.teamA} {m.winner === "A" && "🏆"}
                        </span>
                        <span className="text-[9px] text-sage-muted italic font-normal">vs</span>
                        <span className={m.winner === "B" ? "text-green-400" : "text-white"}>
                          {m.teamB} {m.winner === "B" && "🏆"}
                        </span>
                      </div>

                      {/* Payout Details */}
                      <div className="border-t border-dark-border/40 pt-2 mt-1 flex justify-between items-center text-[9px] text-sage-muted font-mono">
                        <span>Total Stakes: <b className="text-white font-bold">₹{m.totalPool}</b></span>
                        <span>Comm (5%): <b className="text-white font-bold">₹{m.feeDeducted}</b></span>
                        <span>Payouts: <b className="text-primary font-bold">₹{m.distributablePool}</b></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </main>

      {/* Simulator Control Harness */}
      <SimulatorHarness />

      {/* Create Match Modal Popup */}
      <CreateMatchModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
