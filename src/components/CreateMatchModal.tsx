"use client";

import React, { useState } from "react";
import { useSimState } from "@/context/SimStateContext";
import { X, Trophy, AlertTriangle, Coins } from "lucide-react";

interface CreateMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateMatchModal({ isOpen, onClose }: CreateMatchModalProps) {
  const { createMatch } = useSimState();

  const [game, setGame] = useState<"Foosball" | "Table Tennis">("Foosball");
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [betWindow, setBetWindow] = useState(5); // in minutes
  const [minBet, setMinBet] = useState(10);
  const [maxBet, setMaxBet] = useState(500);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!teamA.trim() || !teamB.trim()) {
      setError("Both Team Names are required!");
      return;
    }
    if (teamA.trim().toLowerCase() === teamB.trim().toLowerCase()) {
      setError("Team Names must be different!");
      return;
    }
    if (minBet < 10) {
      setError("Minimum bet must be ₹10 or above.");
      return;
    }
    if (maxBet < minBet) {
      setError("Maximum bet cannot be less than Minimum bet.");
      return;
    }

    try {
      createMatch(game, teamA, teamB, betWindow, minBet, maxBet);
      // Reset & Close
      setTeamA("");
      setTeamB("");
      setBetWindow(5);
      setMinBet(10);
      setMaxBet(500);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create match pool.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-dark-bg/85 backdrop-blur-sm transition-opacity"
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-dark-card border border-primary/20 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(213,255,64,0.15)] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-dark-border">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Create Match Pool</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-sage-muted hover:text-white transition-all bg-dark-bg/40 p-1.5 rounded-lg border border-dark-border"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 font-sans text-sm">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-center gap-2 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Game Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-sage-muted font-bold uppercase tracking-wider">Select Game Type</label>
            <div className="grid grid-cols-2 gap-3">
              {(["Foosball", "Table Tennis"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGame(g)}
                  className={`py-3 rounded-xl border text-center font-bold tracking-wide transition-all ${
                    game === g
                      ? "bg-primary text-dark-bg border-primary shadow-[0_0_15px_rgba(213,255,64,0.3)]"
                      : "bg-dark-bg/50 border-dark-border text-sage-muted hover:text-white"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Team Names */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-sage-muted font-bold uppercase tracking-wider">Team A Name</label>
              <input
                type="text"
                placeholder="e.g. Red Devils"
                value={teamA}
                onChange={(e) => setTeamA(e.target.value)}
                maxLength={20}
                className="bg-dark-bg border border-dark-border rounded-xl px-3 py-2.5 text-white placeholder-sage-muted/30 focus:outline-none focus:border-primary/50 transition-all font-medium"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-sage-muted font-bold uppercase tracking-wider">Team B Name</label>
              <input
                type="text"
                placeholder="e.g. Green Crawlers"
                value={teamB}
                onChange={(e) => setTeamB(e.target.value)}
                maxLength={20}
                className="bg-dark-bg border border-dark-border rounded-xl px-3 py-2.5 text-white placeholder-sage-muted/30 focus:outline-none focus:border-primary/50 transition-all font-medium"
              />
            </div>
          </div>

          {/* Betting Window */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-sage-muted font-bold uppercase tracking-wider">Betting Close Time (Minutes)</label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 5, 10].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setBetWindow(mins)}
                  className={`py-2 rounded-xl border font-mono font-bold transition-all text-xs ${
                    betWindow === mins
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-dark-bg/50 border-dark-border text-sage-muted hover:text-white"
                  }`}
                >
                  {mins} Min{mins === 1 ? "" : "s"}
                </button>
              ))}
            </div>
          </div>

          {/* Bet Limits */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-sage-muted font-bold uppercase tracking-wider flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-primary" />
                Min Bet (₹)
              </label>
              <input
                type="number"
                min={10}
                value={minBet}
                onChange={(e) => setMinBet(parseInt(e.target.value) || 0)}
                className="bg-dark-bg border border-dark-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-all font-mono font-semibold"
              />
              <span className="text-[10px] text-sage-muted">Minimum ₹10 required</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-sage-muted font-bold uppercase tracking-wider flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-primary" />
                Max Bet (₹)
              </label>
              <input
                type="number"
                min={minBet}
                value={maxBet}
                onChange={(e) => setMaxBet(parseInt(e.target.value) || 0)}
                className="bg-dark-bg border border-dark-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-all font-mono font-semibold"
              />
            </div>
          </div>

          {/* Footer Notice */}
          <div className="text-[11px] text-sage-muted bg-dark-bg/40 border border-dark-border/60 p-3 rounded-xl leading-relaxed">
            📢 **Centralized UPI Escrow**: Funds will be placed using your wallet balance. Winner payouts are split proportionally among the winning side, minus a **5% platform fee**. The creator declares the match winner after a **10-minute lockout** to prevent premature selection.
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-2 bg-primary text-dark-bg font-bold tracking-wider uppercase py-3 rounded-xl shadow-[0_0_15px_rgba(213,255,64,0.3)] hover:shadow-[0_0_25px_rgba(213,255,64,0.6)] border border-primary-dark transition-all transform hover:-translate-y-0.5"
          >
            Launch Pool
          </button>
        </form>
      </div>
    </div>
  );
}
