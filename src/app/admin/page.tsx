"use client";

import React, { useState } from "react";
import { useSimState } from "@/context/SimStateContext";
import Header from "@/components/Header";
import SimulatorHarness from "@/components/SimulatorHarness";
import { 
  ShieldAlert, Coins, ArrowDownLeft, ArrowUpRight, Users, Check, X, TrendingUp
} from "lucide-react";

export default function AdminPage() {
  const {
    activeUser,
    users,
    matches,
    depositRequests,
    withdrawalRequests,
    approveDeposit,
    rejectDeposit,
    approveWithdrawal,
    rejectWithdrawal,
    addFundsAdmin
  } = useSimState();

  const [activeTab, setActiveTab] = useState<"deposits" | "withdrawals" | "users" | "analytics">("deposits");
  const [searchQuery, setSearchQuery] = useState("");
  const [directCreditAmount, setDirectCreditAmount] = useState<string>("100");

  // Access Control check
  if (!activeUser || activeUser.id !== "samandreas") {
    return (
      <div className="flex flex-col min-h-screen bg-dark-bg font-sans relative">
        <Header />
        <main className="flex-1 w-full max-w-lg mx-auto px-4 py-20 flex flex-col items-center justify-center text-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-red-500/10 border-2 border-red-500/35 flex items-center justify-center text-3xl text-red-500 animate-ping rounded">
            🚨
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-widest uppercase font-mono">ACCESS BLOCKED</h1>
            <p className="text-[11px] text-red-400 mt-2 font-mono uppercase tracking-wide">
              Quarantine active. Impersonate root owner account to bypass.
            </p>
          </div>
          <p className="text-xs text-sage-muted leading-relaxed font-mono">
            Switch your active profile to **Samandreas** using the floating console in the bottom right corner.
          </p>
        </main>
        <SimulatorHarness />
      </div>
    );
  }

  // Filter requests
  const pendingDeposits = depositRequests.filter(d => d.status === "pending");
  const pendingWithdrawals = withdrawalRequests.filter(w => w.status === "pending");

  // Search users
  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  // Platform Analytics
  const completedMatches = matches.filter(m => m.status === "completed");
  const totalVolume = completedMatches.reduce((acc, m) => acc + m.totalPool, 0);
  const totalCommission = completedMatches.reduce((acc, m) => acc + m.feeDeducted, 0);
  const totalDeposits = depositRequests.filter(d => d.status === "approved").reduce((acc, d) => acc + d.amount, 0);
  const totalWithdrawals = withdrawalRequests.filter(w => w.status === "completed").reduce((acc, w) => acc + w.amount, 0);

  const handleAdminCredit = (userId: string) => {
    const amt = parseFloat(directCreditAmount);
    if (!isNaN(amt) && amt > 0) {
      addFundsAdmin(userId, amt);
      alert(`Credited ₹${amt} directly to ${users.find(u => u.id === userId)?.username}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-dark-bg font-sans pb-24 relative">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6 relative z-10">
        
        {/* Banner Title */}
        <div className="flex items-center justify-between border-b border-dark-border pb-4 relative">
          {/* Subtle Pink Indicator Line */}
          <div className="absolute top-0 left-0 w-24 h-[2px] bg-pink-pop"></div>

          <div className="pt-3">
            <h1 className="text-xl md:text-2xl font-black tracking-wider text-yellow-400 uppercase flex items-center gap-2 font-mono">
              <ShieldAlert className="w-5 h-5 text-pink-pop animate-pulse" />
              SYSTEM CONSOLE <span className="text-primary">●</span>
            </h1>
            <p className="text-sage-muted text-[11px] font-mono mt-0.5 uppercase tracking-wide">
              Verify payments ledger, settle withdrawals, and inspect database accounts.
            </p>
          </div>
          
          <span className="hidden sm:inline-block text-[9px] font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-3 py-1 rounded uppercase tracking-wider font-mono">
            ROOT AUTHENTICATED
          </span>
        </div>

        {/* Navigation Tabs (Sharp design) */}
        <div className="flex flex-wrap gap-2.5 text-[10px] uppercase font-bold tracking-widest font-mono">
          {[
            { id: "deposits", label: `Verify Deposits (${pendingDeposits.length})` },
            { id: "withdrawals", label: `Settle Withdrawals (${pendingWithdrawals.length})` },
            { id: "users", label: "User Directory" },
            { id: "analytics", label: "Analytics" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded border transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-yellow-400 text-dark-bg font-extrabold shadow-[0_0_12px_rgba(250,204,21,0.2)]"
                  : "bg-dark-card border-dark-border text-sage-muted hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: VERIFY DEPOSITS */}
        {activeTab === "deposits" && (
          <section className="bg-dark-card border border-[#1a1d24] rounded p-5 shadow">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2 border-b border-dark-border pb-2.5 font-mono">
              <Coins className="w-4 h-4 text-yellow-400" />
              Expected payment approvals
            </h3>

            {pendingDeposits.length === 0 ? (
              <div className="text-xs text-sage-muted text-center py-16 font-mono">
                No deposit verification requests pending. All transactions auto-approved.
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {pendingDeposits.map((dep) => (
                  <div 
                    key={dep.id}
                    className="bg-dark-bg/40 border border-dark-border p-4 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-sans"
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm">{dep.username}</span>
                        <span className="text-[9px] bg-dark-border text-sage-muted px-2 py-0.5 rounded font-mono">
                          ID: {dep.userId}
                        </span>
                      </div>
                      <div className="text-sage-muted flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] uppercase">
                        <span>Amt: <b className="text-white font-bold">₹{dep.amount}</b></span>
                        <span>UPI Ref: <b className="text-primary select-all cursor-pointer font-bold">{dep.upiRef}</b></span>
                        <span>Date: {new Date(dep.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Verification Actions */}
                    <div className="flex gap-2 text-[10px] font-bold uppercase tracking-wider font-mono">
                      <button
                        onClick={() => approveDeposit(dep.id)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-green-500/10 hover:bg-green-500/20 border border-green-500/25 text-green-400 px-4 py-2 rounded transition-all cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => rejectDeposit(dep.id)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-4 py-2 rounded transition-all cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: DISBURSE WITHDRAWALS */}
        {activeTab === "withdrawals" && (
          <section className="bg-dark-card border border-[#1a1d24] rounded p-5 shadow">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2 border-b border-dark-border pb-2.5 font-mono">
              <ShieldAlert className="w-4 h-4 text-yellow-400 animate-pulse" />
              Pending Withdrawal Settlements (Manual transfer)
            </h3>

            {pendingWithdrawals.length === 0 ? (
              <div className="text-xs text-sage-muted text-center py-16 font-mono">
                All withdrawal requests settled.
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {pendingWithdrawals.map((wit) => (
                  <div 
                    key={wit.id}
                    className="bg-dark-bg/40 border border-dark-border p-4 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-sans"
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm">{wit.username}</span>
                        <span className="text-[9px] bg-dark-border text-sage-muted px-2 py-0.5 rounded font-mono">
                          ID: {wit.id}
                        </span>
                      </div>
                      <div className="text-sage-muted flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] uppercase">
                        <span>Amt: <b className="text-yellow-400 font-bold">₹{wit.amount}</b></span>
                        <span>Recipient UPI: <b className="text-white select-all cursor-pointer font-bold">{wit.upiId}</b></span>
                        <span>Date: {new Date(wit.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Verification Actions */}
                    <div className="flex gap-2 text-[10px] font-bold uppercase tracking-wider font-mono">
                      <button
                        onClick={() => approveWithdrawal(wit.id)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-green-500/10 hover:bg-green-500/20 border border-green-500/25 text-green-400 px-4 py-2 rounded transition-all cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Disburse
                      </button>
                      <button
                        onClick={() => rejectWithdrawal(wit.id)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-4 py-2 rounded transition-all cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> Deny
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 3: MANAGE USERS */}
        {activeTab === "users" && (
          <section className="bg-dark-card border border-[#1a1d24] rounded p-5 shadow flex flex-col gap-4">
            
            {/* Header controls */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center border-b border-dark-border pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 font-mono">
                <Users className="w-4 h-4 text-yellow-400" />
                User directory accounts
              </h3>
              
              <input
                type="text"
                placeholder="Search usernames..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-60 bg-dark-bg border border-dark-border rounded px-3 py-2 text-xs text-white placeholder-sage-muted/30 focus:outline-none focus:border-primary/50 font-mono"
              />
            </div>

            {/* Directory List */}
            <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
              {filteredUsers.map((user) => (
                <div 
                  key={user.id}
                  className="bg-dark-bg/30 border border-dark-border p-4 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-sans"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-dark-card border border-dark-border flex items-center justify-center text-white font-bold text-xs rounded">
                      {user.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-extrabold text-white text-sm flex items-center gap-1.5 uppercase font-mono">
                        {user.username}
                        {user.id === "samandreas" && (
                          <span className="text-[8px] bg-yellow-400 text-dark-bg font-black px-1.5 rounded uppercase">ROOT</span>
                        )}
                        {user.isBanned && (
                          <span className="text-[8px] bg-red-500 text-white font-bold px-1.5 rounded uppercase">Banned</span>
                        )}
                      </div>
                      <div className="text-[10px] text-sage-muted flex gap-3 mt-0.5 font-mono">
                        <span>Balance: <b className="text-primary font-bold">₹{user.walletBalance}</b></span>
                        <span>Profit: <b className={user.stats.netProfit >= 0 ? "text-green-400" : "text-red-400"}>₹{user.stats.netProfit}</b></span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {user.id !== "samandreas" && (
                    <div className="flex flex-wrap items-center gap-3 border-t sm:border-t-0 border-dark-border/40 pt-3 sm:pt-0">
                      
                      {/* Direct Credit */}
                      <div className="flex items-center gap-1.5">
                        <select
                          value={directCreditAmount}
                          onChange={(e) => setDirectCreditAmount(e.target.value)}
                          className="bg-dark-bg border border-dark-border rounded px-2 py-1 text-xs text-white focus:outline-none font-mono"
                        >
                          <option value="50">₹50</option>
                          <option value="100">₹100</option>
                          <option value="500">₹500</option>
                          <option value="1000">₹1000</option>
                        </select>
                        <button
                          onClick={() => handleAdminCredit(user.id)}
                          className="bg-pink-pop/20 hover:bg-pink-pop/35 border border-pink-pop/35 text-pink-pop px-2.5 py-1.5 rounded font-bold text-[9px] uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Direct Credit
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              ))}
            </div>

          </section>
        )}

        {/* TAB 4: PLATFORM ANALYTICS */}
        {activeTab === "analytics" && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs uppercase">
            
            {/* Stat 1 */}
            <div className="bg-dark-card border border-dark-border p-5 rounded flex flex-col justify-between shadow">
              <div className="text-[9px] font-bold tracking-widest text-sage-muted">Total Pool Volume</div>
              <div className="text-2xl font-black text-white mt-2">₹{totalVolume}</div>
              <p className="text-[9px] text-sage-muted mt-2 font-sans lowercase">Sum of stakes in completed matches.</p>
            </div>

            {/* Stat 2 */}
            <div className="bg-dark-card border border-dark-border p-5 rounded flex flex-col justify-between shadow border-b-2 border-b-pink-pop">
              <div className="text-[9px] font-bold tracking-widest text-sage-muted">Fee Revenue (5%)</div>
              <div className="text-2xl font-black text-primary mt-2">₹{totalCommission}</div>
              <p className="text-[9px] text-sage-muted mt-2 font-sans lowercase">Platform commission fees collected.</p>
            </div>

            {/* Stat 3 */}
            <div className="bg-dark-card border border-dark-border p-5 rounded flex flex-col justify-between shadow">
              <div className="text-[9px] font-bold tracking-widest text-sage-muted">Deposits vs Payouts</div>
              <div className="text-xs font-bold text-white mt-2 flex flex-col gap-0.5">
                <span>In: <b className="text-green-400">₹{totalDeposits}</b></span>
                <span>Out: <b className="text-yellow-400">₹{totalWithdrawals}</b></span>
              </div>
              <p className="text-[9px] text-sage-muted mt-2">Net Flow: ₹{totalDeposits - totalWithdrawals}</p>
            </div>

            {/* Stat 4 */}
            <div className="bg-dark-card border border-dark-border p-5 rounded flex flex-col justify-between shadow">
              <div className="text-[9px] font-bold tracking-widest text-sage-muted">System Directory</div>
              <div className="text-2xl font-black text-white mt-2">{users.length} Terminals</div>
              <p className="text-[9px] text-sage-muted mt-2 font-sans lowercase">Total profiles initialized in db.</p>
            </div>

          </section>
        )}

      </main>

      <SimulatorHarness />
    </div>
  );
}
