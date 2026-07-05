"use client";

import React, { useState } from "react";
import { useSimState } from "@/context/SimStateContext";
import { User, Shield, UserPlus, CreditCard, ChevronDown, ChevronUp, Swords, HelpCircle } from "lucide-react";

export default function SimulatorHarness() {
  const {
    users,
    activeUser,
    matches,
    switchUser,
    createUser,
    addFundsAdmin,
    bypassWinnerLock
  } = useSimState();

  const [isOpen, setIsOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newUserError, setNewUserError] = useState("");
  const [fundAmount, setFundAmount] = useState("100");
  const [activeTab, setActiveTab] = useState<"users" | "matches" | "about">("users");

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setNewUserError("");
    if (!newUsername.trim()) return;

    const result = createUser(newUsername);
    if (typeof result === "string") {
      setNewUserError(result);
    } else {
      setNewUsername("");
    }
  };

  const handleAddFunds = (userId: string) => {
    const amt = parseFloat(fundAmount);
    if (!isNaN(amt) && amt > 0) {
      addFundsAdmin(userId, amt);
    }
  };

  if (!activeUser) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end font-sans">
      {/* Toggle button (Sharp, Glowy Pink border, Lime Background) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-primary text-dark-bg font-extrabold rounded shadow-[0_0_12px_rgba(213,255,64,0.3)] hover:shadow-[0_0_20px_rgba(213,255,64,0.6)] border border-pink-pop transition-all duration-300 transform hover:-translate-y-0.5 text-xs uppercase tracking-wider cursor-pointer"
      >
        <Shield className="w-3.5 h-3.5 animate-pulse text-pink-pop" />
        <span>SIM CONTROL</span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

      {/* Expanded panel (Sharp borders, Hybrid lime/pink outlines) */}
      {isOpen && (
        <div className="mt-3 w-85 sm:w-96 max-h-[500px] overflow-y-auto bg-dark-bg/95 border-2 border-r-pink-pop/30 border-b-pink-pop/30 border-t-primary/30 border-l-primary/30 rounded-lg p-4 shadow-[0_10px_35px_rgba(0,0,0,0.9)] flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex justify-between items-center border-b border-dark-border pb-2">
            <div>
              <h3 className="font-black text-xs text-primary tracking-widest uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-pink-pop rounded-full"></span>
                Simulation Console
              </h3>
              <p className="text-[10px] text-sage-muted mt-0.5 font-mono">
                Bypass checkout approvals and hot-swap active users.
              </p>
            </div>
            <span className="text-[9px] font-mono bg-pink-pop/10 text-pink-pop border border-pink-pop/25 px-2 py-0.5 rounded font-bold">
              SYS-RADAR
            </span>
          </div>

          {/* Active session info (Sharp layout, Pink highlight) */}
          <div className="bg-[#0b0c0f] border border-dark-border p-2.5 rounded flex items-center justify-between border-l-2 border-l-pink-pop">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs rounded">
                {activeUser.username[0].toUpperCase()}
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-sage-muted font-mono">Current Impersonation</div>
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  {activeUser.username}
                  {activeUser.id === "samandreas" && (
                    <span className="text-[8px] bg-pink-pop text-white px-1.5 py-0.2 rounded font-black font-mono">ROOT_ADMIN</span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[9px] uppercase tracking-wider text-sage-muted font-mono">Balance</div>
              <div className="text-xs font-black text-primary font-mono">₹{activeUser.walletBalance}</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-dark-border text-[10px] uppercase font-bold tracking-widest">
            <button
              onClick={() => setActiveTab("users")}
              className={`flex-1 py-2 text-center border-b transition-all ${
                activeTab === "users"
                  ? "border-primary text-primary font-black"
                  : "border-transparent text-sage-muted hover:text-white"
              }`}
            >
              Profiles
            </button>
            <button
              onClick={() => setActiveTab("matches")}
              className={`flex-1 py-2 text-center border-b transition-all ${
                activeTab === "matches"
                  ? "border-primary text-primary font-black"
                  : "border-transparent text-sage-muted hover:text-white"
              }`}
            >
              Matches ({matches.filter(m => m.status !== "completed").length})
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`flex-1 py-2 text-center border-b transition-all ${
                activeTab === "about"
                  ? "border-primary text-primary font-black"
                  : "border-transparent text-sage-muted hover:text-white"
              }`}
            >
              Info
            </button>
          </div>

          {/* Tab Contents */}
          {activeTab === "users" && (
            <div className="flex flex-col gap-3">
              {/* Select User List */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-sage-muted font-bold uppercase tracking-wider">Select impersonated profile:</label>
                <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => switchUser(u.id)}
                      className={`flex items-center justify-between p-2 rounded text-[11px] font-bold border transition-all text-left cursor-pointer ${
                        activeUser.id === u.id
                          ? "bg-primary/10 border-primary text-primary shadow-[inset_0_0_6px_rgba(213,255,64,0.05)]"
                          : "bg-dark-bg/60 border-dark-border text-sage-muted hover:text-white hover:border-dark-border/80"
                      }`}
                    >
                      <span className="truncate flex items-center gap-1">
                        {u.username}
                        {u.id === "samandreas" && "👑"}
                      </span>
                      <span className="font-bold text-[9px] font-mono">₹{u.walletBalance}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Create User Form */}
              <form onSubmit={handleCreateUser} className="border-t border-dark-border pt-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-sage-muted font-bold uppercase tracking-wider flex items-center gap-1">
                    <UserPlus className="w-3 h-3 text-pink-pop" />
                    Initialize New Profile
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Username"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      maxLength={15}
                      className="flex-1 bg-dark-bg border border-dark-border rounded px-2.5 py-1.5 text-xs text-white placeholder-sage-muted/30 focus:outline-none focus:border-primary/50 font-medium"
                    />
                    <button
                      type="submit"
                      className="bg-primary/15 hover:bg-primary/25 border border-primary/25 text-primary text-[10px] font-bold px-3 rounded uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Init
                    </button>
                  </div>
                  {newUserError && <p className="text-[9px] text-red-500 font-semibold">{newUserError}</p>}
                </div>
              </form>

              {/* Admin Credit helper */}
              <div className="border-t border-dark-border pt-3 flex flex-col gap-2">
                <label className="text-[10px] text-sage-muted font-bold uppercase tracking-wider flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-pink-pop" />
                  Fast Credit Profile Balance (Direct ₹)
                </label>
                <div className="flex gap-2">
                  <select
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    className="bg-dark-bg border border-dark-border rounded px-2 py-1 text-xs text-white focus:outline-none font-mono"
                  >
                    <option value="50">₹50</option>
                    <option value="100">₹100</option>
                    <option value="500">₹500</option>
                    <option value="1000">₹1000</option>
                  </select>
                  <button
                    onClick={() => handleAddFunds(activeUser.id)}
                    className="flex-1 bg-pink-pop text-white text-[10px] font-extrabold py-1.5 px-3 rounded hover:bg-pink-pop-dark shadow-[0_0_8px_rgba(255,0,122,0.2)] transition-all uppercase tracking-wider cursor-pointer"
                  >
                    Direct Credit to {activeUser.username}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "matches" && (
            <div className="flex flex-col gap-3">
              <label className="text-[10px] text-sage-muted font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Swords className="w-3.5 h-3.5 text-pink-pop" />
                Live Matches Lock overrides:
              </label>
              
              {matches.filter(m => m.status !== "completed").length === 0 ? (
                <div className="text-xs text-center py-6 text-sage-muted bg-dark-bg/30 border border-dashed border-dark-border rounded">
                  No active pools to override. Go to dashboard and create a match!
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto">
                  {matches
                    .filter(m => m.status !== "completed")
                    .map(m => {
                      const timeDiff = Date.now() - new Date(m.createdAt).getTime();
                      const isLocked = timeDiff < 10 * 60 * 1000;
                      
                      return (
                        <div key={m.id} className="bg-dark-bg/50 border border-dark-border p-2 rounded flex flex-col gap-1.5 border-l-2 border-l-primary">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-primary font-mono">{m.id}</span>
                            <span className="text-[9px] text-sage-muted font-mono font-bold uppercase bg-dark-border px-1.5 py-0.5 rounded">
                              {m.game}
                            </span>
                          </div>
                          <div className="text-xs text-white font-bold">
                            {m.teamA} vs {m.teamB}
                          </div>
                          <div className="flex justify-between items-center text-[9px] text-sage-muted border-t border-dark-border/40 pt-1.5 mt-1 font-mono">
                            <span>Status: <b className="text-green-400 capitalize">{m.status}</b></span>
                            <span>{isLocked ? "🔒 Locked" : "🔓 Unlocked"}</span>
                          </div>
                          {isLocked && (
                            <button
                              onClick={() => bypassWinnerLock(m.id)}
                              className="mt-1 w-full bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/35 text-yellow-400 font-extrabold py-1 px-2 rounded text-[9px] tracking-wide uppercase transition-all cursor-pointer"
                            >
                              ⚡ Bypass 10m Winner Declare Lock
                            </button>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {activeTab === "about" && (
            <div className="flex flex-col gap-2 text-xs text-sage-muted leading-relaxed font-sans">
              <div className="flex items-center gap-1 text-white font-bold uppercase tracking-wider text-[10px]">
                <HelpCircle className="w-3.5 h-3.5 text-primary" />
                How to verify the UPI Intent Flow?
              </div>
              <ol className="list-decimal list-inside space-y-1.5 bg-dark-bg/40 p-2.5 rounded border border-dark-border/60 text-[11px]">
                <li>Create a match as any user (min ₹10 bet limit).</li>
                <li>Switch profiles using the <b>Profiles</b> tab above.</li>
                <li>Go to <b>Wallet &rarr; Deposit Funds</b>.</li>
                <li>Enter the amount you wish to deposit.</li>
                <li>On mobile, click <b>Pay via UPI</b>. On desktop, scan the dual-glow QR.</li>
                <li>Enter any dummy reference code and submit.</li>
                <li>Note that the balance is **credited instantly** in the app.</li>
                <li>Join the pool, wait 10m (or bypass lock in this panel), and declare the winner!</li>
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
