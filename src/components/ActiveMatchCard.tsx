"use client";

import React, { useState, useEffect } from "react";
import { useSimState, Match, Bet } from "@/context/SimStateContext";
import SymbioteTimerBar from "./SymbioteTimerBar";
import ConfettiEffect from "./ConfettiEffect";
import { Swords, Coins, AlertCircle, CheckCircle, Info, Sparkles, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface ActiveMatchCardProps {
  match: Match;
}

export default function ActiveMatchCard({ match }: ActiveMatchCardProps) {
  const { 
    activeUser, 
    bets, 
    placeBet, 
    declareWinner, 
    bypassWinnerLock 
  } = useSimState();

  // Live Timer states
  const [timeLeft, setTimeLeft] = useState(0);
  const [timeString, setTimeString] = useState("00:00");
  const [isExpired, setIsExpired] = useState(false);
  const [lockTimeLeft, setLockTimeLeft] = useState(0); // Winner selection lock
  const [isWinnerUnlocked, setIsWinnerUnlocked] = useState(false);

  // Bet Form states
  const [selectedTeam, setSelectedTeam] = useState<"A" | "B" | null>(null);
  const [betAmount, setBetAmount] = useState<number>(50);
  const [betError, setBetError] = useState("");
  const [betSuccess, setBetSuccess] = useState("");

  // Get bets for this match
  const matchBets = bets.filter((b) => b.matchId === match.id);
  const teamABets = matchBets.filter((b) => b.team === "A");
  const teamBBets = matchBets.filter((b) => b.team === "B");

  const poolA = teamABets.reduce((acc, b) => acc + b.amount, 0);
  const poolB = teamBBets.reduce((acc, b) => acc + b.amount, 0);
  const totalPool = poolA + poolB;

  // Active user's bet on this match
  const userBet = matchBets.find((b) => b.userId === activeUser?.id);

  // Timer Tick
  useEffect(() => {
    const updateTimers = () => {
      const now = Date.now();
      
      // 1. Betting window countdown
      const closeTime = new Date(match.closesAt).getTime();
      const diff = closeTime - now;
      if (diff <= 0) {
        setTimeLeft(0);
        setTimeString("00:00");
        setIsExpired(true);
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(diff);
        setTimeString(`${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`);
        setIsExpired(false);
      }

      // 2. Creator winner lock countdown
      const unlockTime = new Date(match.unlocksWinnerAt).getTime();
      const lockDiff = unlockTime - now;
      if (lockDiff <= 0) {
        setLockTimeLeft(0);
        setIsWinnerUnlocked(true);
      } else {
        setLockTimeLeft(lockDiff);
        setIsWinnerUnlocked(false);
      }
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);

    return () => clearInterval(interval);
  }, [match]);

  const handlePlaceBet = (e: React.FormEvent) => {
    e.preventDefault();
    setBetError("");
    setBetSuccess("");

    if (!selectedTeam) {
      setBetError("Please select a team to bet on.");
      return;
    }

    const res = placeBet(match.id, selectedTeam, betAmount);
    if (!res.success) {
      setBetError(res.message);
    } else {
      setBetSuccess(res.message);
      // Auto clear success message
      setTimeout(() => setBetSuccess(""), 4000);
    }
  };

  const handleDeclareWinner = (winnerTeam: "A" | "B") => {
    if (!confirm(`Are you sure you want to declare ${winnerTeam === "A" ? match.teamA : match.teamB} as the winner? Payouts will be distributed instantly.`)) {
      return;
    }
    const res = declareWinner(match.id, winnerTeam);
    if (!res.success) {
      alert(res.message);
    }
  };

  // Calculate percentage of timer
  const initialWindow = match.betWindowMinutes * 60 * 1000;
  const elapsed = initialWindow - timeLeft;
  const timePercentage = initialWindow > 0 ? (timeLeft / initialWindow) * 100 : 0;

  // Calculate proportional bet percentages
  const pctA = totalPool > 0 ? Math.round((poolA / totalPool) * 100) : 50;
  const pctB = totalPool > 0 ? Math.round((poolB / totalPool) * 100) : 50;

  // Estimate potential payout multiplier
  const estPayoutA = poolA > 0 ? Math.round(((totalPool * 0.95) / poolA) * 100) / 100 : 0;
  const estPayoutB = poolB > 0 ? Math.round(((totalPool * 0.95) / poolB) * 100) / 100 : 0;

  if (!activeUser) return null;

  return (
    <div className="glass-3d glass-shine hover:border-pink-pop/35 transition-all rounded-lg overflow-hidden flex flex-col justify-between">
      {match.status === "completed" && userBet && userBet.status === "won" && (
        <ConfettiEffect />
      )}
      
      {/* Card Header (Sharp layout, Pink corner dots) */}
      <div className="px-5 py-4 border-b border-dark-border bg-dark-bg/25 flex justify-between items-center relative">
        {/* Subtle Pink Indicator Line */}
        <div className="absolute top-0 left-0 w-20 h-[2px] bg-pink-pop"></div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-dark-bg border border-dark-border rounded flex items-center justify-center text-sm font-bold shadow-inner">
            {match.game === "Foosball" ? "⚽" : "🏓"}
          </div>
          <div>
            <div className="text-xs font-mono font-black text-primary tracking-widest uppercase flex items-center gap-1.5">
              {match.game}
              <span className="text-[10px] text-pink-pop lowercase font-bold">#{match.id}</span>
            </div>
            <div className="text-[10px] text-sage-muted mt-0.5 font-mono">
              CREATOR: <span className="text-white font-bold">{match.creatorName}</span>
            </div>
          </div>
        </div>

        {/* Match State Badge (Sharp corners, Glowing edges) */}
        {match.status === "completed" ? (
          <span className="text-[8px] font-mono font-black bg-green-500/10 text-green-400 border border-green-500/25 px-2 py-0.5 rounded uppercase tracking-widest">
            Resolved
          </span>
        ) : isExpired ? (
          <span className="text-[8px] font-mono font-black bg-pink-pop/10 text-pink-pop border border-pink-pop/25 px-2 py-0.5 rounded uppercase tracking-widest animate-pulse shadow-[0_0_8px_rgba(255,0,122,0.1)]">
            LIVE PLAY
          </span>
        ) : (
          <span className="text-[8px] font-mono font-black bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded uppercase tracking-widest">
            Betting
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col gap-4.5 flex-1 justify-between">
        
        {/* Teams and Odds Container */}
        <div className="grid grid-cols-9 items-center gap-1 bg-[#090a0d] p-3 border border-dark-border rounded">
          
          {/* Team A */}
          <div className="col-span-4 flex flex-col gap-1 text-center truncate">
            <span className="text-xs font-black text-white uppercase tracking-wide truncate">{match.teamA}</span>
            <span className="text-[9px] text-sage-muted font-bold font-mono uppercase tracking-wider">Team A</span>
            {match.status !== "completed" && estPayoutA > 0 && (
              <span className="text-[10px] text-primary font-black font-mono">
                {estPayoutA}x Payout
              </span>
            )}
            {match.winner === "A" && (
              <span className="text-[9px] font-mono font-black text-green-400 flex items-center justify-center gap-1 mt-1 bg-green-500/10 border border-green-500/20 py-0.5 rounded">
                WINNER
              </span>
            )}
          </div>

          {/* VS Divider (Sharp badge) */}
          <div className="col-span-1 flex flex-col items-center justify-center">
            <div className="w-6 h-6 border border-dark-border flex items-center justify-center text-[10px] font-bold font-mono text-pink-pop bg-dark-bg select-none">
              VS
            </div>
          </div>

          {/* Team B */}
          <div className="col-span-4 flex flex-col gap-1 text-center truncate">
            <span className="text-xs font-black text-white uppercase tracking-wide truncate">{match.teamB}</span>
            <span className="text-[9px] text-sage-muted font-bold font-mono uppercase tracking-wider">Team B</span>
            {match.status !== "completed" && estPayoutB > 0 && (
              <span className="text-[10px] text-primary font-black font-mono">
                {estPayoutB}x Payout
              </span>
            )}
            {match.winner === "B" && (
              <span className="text-[9px] font-mono font-black text-green-400 flex items-center justify-center gap-1 mt-1 bg-green-500/10 border border-green-500/20 py-0.5 rounded">
                WINNER
              </span>
            )}
          </div>
        </div>

        {/* Proportional Pool Ratio Bar (Lime vs Dark border overlay) */}
        {totalPool > 0 && (
          <div className="flex flex-col gap-1.5 font-mono text-[9px] font-bold uppercase tracking-wider">
            <div className="flex justify-between text-sage-muted">
              <span>{match.teamA}: ₹{poolA} ({pctA}%)</span>
              <span>{match.teamB}: ₹{poolB} ({pctB}%)</span>
            </div>
            {/* Visual Bar */}
            <div className="h-1.5 w-full bg-dark-bg border border-dark-border rounded overflow-hidden flex">
              <div 
                style={{ width: `${pctA}%` }} 
                className="h-full bg-primary transition-all duration-500"
              ></div>
              <div 
                style={{ width: `${pctB}%` }} 
                className="h-full bg-pink-pop transition-all duration-500"
              ></div>
            </div>
            <div className="text-[9px] text-center text-sage-muted">
              Total Stakes: <span className="text-white font-black">₹{totalPool}</span>
            </div>
          </div>
        )}

        {/* Countdown Timer (if betting) */}
        {match.status === "betting" && !isExpired && (
          <SymbioteTimerBar percentage={timePercentage} timeString={timeString} isExpired={isExpired} />
        )}

        {/* Payout Resolution Result (completed) */}
        {match.status === "completed" && (
          <div className="bg-[#0b0c0f] border border-dark-border p-3.5 rounded flex flex-col gap-2.5 font-sans text-xs">
            <div className="flex items-center gap-2 text-primary font-extrabold uppercase tracking-widest text-[10px]">
              <Sparkles className="w-3.5 h-3.5 text-pink-pop animate-pulse" />
              <span>Pool Distribution Breakdown</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-sage-muted font-mono text-[10px]">
              <div>Total Stakes:</div>
              <div className="text-right text-white font-bold">₹{match.totalPool}</div>
              <div>Platform Commission (5%):</div>
              <div className="text-right text-white font-bold">₹{match.feeDeducted}</div>
              <div className="text-primary font-bold">Distributable Share:</div>
              <div className="text-right text-primary font-bold">₹{match.distributablePool}</div>
            </div>

            {/* Display Payout result for the active user */}
            {userBet && (
              <div className="mt-1.5 border-t border-dark-border/40 pt-2 flex items-center justify-between font-mono text-[10px]">
                <div>
                  <span className="text-sage-muted">Your bet of ₹{userBet.amount}:</span>
                </div>
                <div>
                  {userBet.status === "won" ? (
                    <span className="font-bold text-green-400 bg-green-500/10 px-2 py-0.5 border border-green-500/25 rounded">
                      Payout: +₹{userBet.payout}
                    </span>
                  ) : (
                    <span className="font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 border border-red-500/25 rounded">
                      Lost: -₹{userBet.amount}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ACTIVE BETTING CONTROLS */}
        {match.status === "betting" && !isExpired && (
          <>
            {userBet ? (
              <div className="bg-primary/5 border border-primary/20 p-3 rounded flex items-center gap-3 text-xs border-l-2 border-l-primary">
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <div className="font-black text-white uppercase tracking-wider text-[10px]">Bet Registered</div>
                  <div className="text-sage-muted text-[10px] mt-0.5 font-mono">
                    Staked <span className="text-primary font-bold">₹{userBet.amount}</span> on{" "}
                    <span className="text-white font-bold">{userBet.team === "A" ? match.teamA : match.teamB}</span>.
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePlaceBet} className="flex flex-col gap-3.5 border-t border-dark-border pt-4">
                <div className="text-[10px] text-sage-muted font-bold uppercase tracking-widest">Stake Bet</div>

                {/* Team Selector Buttons */}
                <div className="grid grid-cols-2 gap-3.5">
                  <button
                    type="button"
                    onClick={() => setSelectedTeam("A")}
                    className={`py-2 px-2.5 rounded font-mono font-bold text-xs border transition-all truncate cursor-pointer ${
                      selectedTeam === "A"
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-dark-bg/40 border-dark-border text-sage-muted hover:text-white"
                    }`}
                  >
                    {match.teamA}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTeam("B")}
                    className={`py-2 px-2.5 rounded font-mono font-bold text-xs border transition-all truncate cursor-pointer ${
                      selectedTeam === "B"
                        ? "bg-pink-pop/10 border-pink-pop text-pink-pop"
                        : "bg-dark-bg/40 border-dark-border text-sage-muted hover:text-white"
                    }`}
                  >
                    {match.teamB}
                  </button>
                </div>

                {/* Slider */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase text-sage-muted tracking-wider">
                    <span>Bet Size</span>
                    <span className="font-mono text-primary font-black">₹{betAmount}</span>
                  </div>
                  <input
                    type="range"
                    min={match.minBet}
                    max={match.maxBet}
                    step={10}
                    value={betAmount}
                    onChange={(e) => setBetAmount(parseInt(e.target.value) || match.minBet)}
                    className="w-full accent-primary bg-dark-bg h-1 rounded cursor-pointer"
                  />
                  
                  {/* Presets */}
                  <div className="grid grid-cols-4 gap-1.5 mt-0.5">
                    {[20, 50, 100, 200].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setBetAmount(Math.max(match.minBet, Math.min(match.maxBet, amt)))}
                        className="py-1 rounded bg-dark-bg border border-dark-border hover:border-pink-pop/40 text-[9px] text-sage-muted font-mono font-bold transition-all cursor-pointer"
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Account Details and warning */}
                <div className="flex justify-between items-center text-[10px] bg-dark-bg/30 border border-dark-border p-2 rounded font-mono">
                  <span className="text-sage-muted">Your Wallet Balance:</span>
                  <span className="font-bold text-white">₹{activeUser.walletBalance}</span>
                </div>

                {activeUser.walletBalance < betAmount && (
                  <div className="text-[10px] text-yellow-400 bg-yellow-500/10 border border-yellow-500/25 p-2.5 rounded flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <div>
                      <span>Insufficient wallet balance. Redirection path open to pay. </span>
                      <Link href="/wallet" className="text-primary hover:underline font-bold">
                        Fund Wallet ➔
                      </Link>
                    </div>
                  </div>
                )}

                {/* Message states */}
                {betError && <p className="text-[10px] text-red-400 font-semibold">{betError}</p>}
                {betSuccess && <p className="text-[10px] text-green-400 font-bold">{betSuccess}</p>}

                {/* Stake button */}
                <button
                  type="submit"
                  disabled={activeUser.walletBalance < betAmount}
                  className="w-full bg-primary text-dark-bg font-extrabold uppercase py-2.5 rounded shadow-[0_0_12px_rgba(213,255,64,0.15)] hover:shadow-[0_0_20px_rgba(213,255,64,0.4)] border border-primary-dark transition-all disabled:opacity-50 disabled:hover:shadow-none cursor-pointer text-xs tracking-wider"
                >
                  Register Bet
                </button>
              </form>
            )}
          </>
        )}

        {/* Live Play warning */}
        {match.status === "betting" && isExpired && (
          <div className="bg-pink-pop/5 border border-pink-pop/15 p-3 rounded flex items-center gap-3 text-xs border-l-2 border-l-pink-pop">
            <Info className="w-4 h-4 text-pink-pop shrink-0" />
            <div>
              <div className="font-bold text-white uppercase tracking-wider text-[10px]">Stakes Locked!</div>
              <div className="text-sage-muted text-[10px] mt-0.5 leading-normal">
                Match is active. The creator will declare the winner once the game finishes.
              </div>
            </div>
          </div>
        )}

        {/* CREATOR ACTION PANEL */}
        {activeUser.id === match.creatorId && match.status !== "completed" && (
          <div className="border-t border-dark-border pt-4 flex flex-col gap-3">
            <div className="text-[10px] text-primary font-black uppercase tracking-widest flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5 text-pink-pop" />
              Creator Controls
            </div>

            {!isWinnerUnlocked ? (
              <div className="bg-red-500/5 border border-red-500/15 p-3 rounded flex flex-col gap-1.5 text-xs text-sage-muted border-l-2 border-l-red-500">
                <div className="flex items-center gap-1.5 text-red-400 font-bold uppercase tracking-wider text-[10px]">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  Declaration Lock Active
                </div>
                <p className="text-[10px] leading-relaxed">
                  Winner selector locks for 10 minutes to avoid premature clicks. 
                  Unlocks in <span className="font-mono text-white font-bold">{Math.floor(lockTimeLeft / 60000)}m {Math.floor((lockTimeLeft % 60000) / 1000)}s</span>.
                </p>
                <button
                  type="button"
                  onClick={() => bypassWinnerLock(match.id)}
                  className="mt-1 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 text-[9px] font-bold py-1 px-2.5 rounded border border-yellow-500/20 transition-all text-center self-start cursor-pointer uppercase tracking-wider"
                >
                  ⚡ Fast-Forward Lock
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-sage-muted uppercase tracking-wider font-mono">Disburse payouts to:</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleDeclareWinner("A")}
                    className="bg-green-500/10 hover:bg-green-500/20 border border-green-500/35 text-green-400 font-bold py-2 rounded text-xs transition-all cursor-pointer uppercase tracking-wide"
                  >
                    🏆 {match.teamA} Wins
                  </button>
                  <button
                    onClick={() => handleDeclareWinner("B")}
                    className="bg-green-500/10 hover:bg-green-500/20 border border-green-500/35 text-green-400 font-bold py-2 rounded text-xs transition-all cursor-pointer uppercase tracking-wide"
                  >
                    🏆 {match.teamB} Wins
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bettors list drawer */}
        {matchBets.length > 0 && (
          <div className="border-t border-dark-border pt-3">
            <details className="group">
              <summary className="text-[10px] text-sage-muted font-bold cursor-pointer select-none hover:text-white flex items-center justify-between uppercase tracking-widest">
                <span>Stakers in Pool ({matchBets.length})</span>
                <span className="transition-transform group-open:rotate-180 font-mono text-[8px]">▼</span>
              </summary>
              <div className="mt-2.5 max-h-[140px] overflow-y-auto pr-1 flex flex-col gap-1.5 animate-in slide-in-from-top-1.5 duration-200">
                {matchBets.map((b) => (
                  <div key={b.id} className="flex justify-between items-center text-[10px] bg-[#0b0c0f] border border-dark-border p-2 rounded font-mono">
                    <span className="text-white font-bold truncate flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${b.team === "A" ? "bg-primary" : "bg-pink-pop"}`}></span>
                      {b.username}
                    </span>
                    <span className="text-sage-muted">
                      Staked ₹{b.amount} on <b className="text-white">{b.team === "A" ? "Team A" : "Team B"}</b>
                    </span>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}

      </div>
    </div>
  );
}
