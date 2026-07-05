"use client";

import React, { useState } from "react";
import { useSimState } from "@/context/SimStateContext";
import Header from "@/components/Header";
import SimulatorHarness from "@/components/SimulatorHarness";
import { Wallet, ArrowDownLeft, ArrowUpRight, Clock, Info, CheckCircle2, XCircle, Smartphone, ExternalLink } from "lucide-react";

export default function WalletPage() {
  const {
    activeUser,
    walletTransactions,
    depositRequests,
    withdrawalRequests,
    requestDeposit,
    requestWithdrawal
  } = useSimState();

  const [activeTab, setActiveTab] = useState<"history" | "deposits" | "withdrawals">("history");
  const [depositAmount, setDepositAmount] = useState<string>("100");
  const [depositUpiRef, setDepositUpiRef] = useState<string>("");
  const [depositStatus, setDepositStatus] = useState({ success: false, message: "" });

  const [withdrawAmount, setWithdrawAmount] = useState<string>("100");
  const [withdrawUpiId, setWithdrawUpiId] = useState<string>("");
  const [withdrawStatus, setWithdrawStatus] = useState({ success: false, message: "" });

  if (!activeUser) return null;

  // Filter lists for current user
  const myTransactions = walletTransactions.filter(t => t.userId === activeUser.id);
  const myDeposits = depositRequests.filter(d => d.userId === activeUser.id);
  const myWithdrawals = withdrawalRequests.filter(w => w.userId === activeUser.id);

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDepositStatus({ success: false, message: "" });

    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt < 10) {
      setDepositStatus({ success: false, message: "Minimum deposit amount is ₹10." });
      return;
    }
    if (!depositUpiRef.trim()) {
      setDepositStatus({ success: false, message: "UPI Reference ID is required." });
      return;
    }

    const res = requestDeposit(amt, depositUpiRef);
    setDepositStatus({ success: res.success, message: res.message });
    if (res.success) {
      setDepositUpiRef("");
      setDepositAmount("100");
    }
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawStatus({ success: false, message: "" });

    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt < 50) {
      setWithdrawStatus({ success: false, message: "Minimum withdrawal amount is ₹50." });
      return;
    }
    if (amt > activeUser.walletBalance) {
      setWithdrawStatus({ success: false, message: "Insufficient wallet balance." });
      return;
    }
    if (!withdrawUpiId.trim() || !withdrawUpiId.includes("@")) {
      setWithdrawStatus({ success: false, message: "Please enter a valid UPI ID (e.g., name@okaxis)." });
      return;
    }

    const res = requestWithdrawal(amt, withdrawUpiId);
    setWithdrawStatus({ success: res.success, message: res.message });
    if (res.success) {
      setWithdrawAmount("100");
      setWithdrawUpiId("");
    }
  };

  // Compile UPI Intent Link
  const upiIntentLink = `upi://pay?pa=sambitbarik.virtue@oksbi&pn=BetBall&am=${depositAmount || "0"}&cu=INR`;

  return (
    <div className="flex flex-col min-h-screen bg-dark-bg font-sans pb-24 relative">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6 relative z-10">
        
        {/* Banner Title */}
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-wider text-white uppercase flex items-center gap-2">
            WALLET TRANSFERS <span className="text-primary animate-pulse">●</span>
          </h1>
          <p className="text-sage-muted text-[11px] font-mono mt-0.5 uppercase tracking-wide">
            Fund bets using instant mobile UPI redirection or request withdrawals.
          </p>
        </div>

        {/* Top Wallet Overview */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Balance Display (3D glass card with hot pink highlight edge) */}
          <div className="lg:col-span-1 glass-3d glass-shine p-6 rounded-lg flex flex-col justify-between relative overflow-hidden">
            {/* Subtle Pink Indicator Line */}
            <div className="absolute top-0 left-0 w-24 h-[2px] bg-pink-pop"></div>

            <div className="flex justify-between items-center text-sage-muted">
              <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Available Balance</span>
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div className="my-6">
              <div className="text-3xl md:text-4xl font-black font-mono text-primary glow-text-green">
                ₹{activeUser.walletBalance}
              </div>
              <p className="text-[10px] text-sage-muted mt-2 font-mono uppercase tracking-wide">
                Stakes are held in secure escrow.
              </p>
            </div>
            
            <div className="border-t border-dark-border/60 pt-4 flex flex-col gap-1.5 text-[10px] text-sage-muted font-mono uppercase">
              <div className="flex justify-between">
                <span>Total Win Claims:</span>
                <span className="text-white font-bold">₹{activeUser.stats.totalMoneyWon}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Staked Losses:</span>
                <span className="text-white font-bold">₹{activeUser.stats.totalMoneyLost}</span>
              </div>
            </div>
            
            {/* Background grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808003_1px,transparent_1px),linear-gradient(to_bottom,#80808003_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-20"></div>
          </div>

          {/* Form Action Panel (Deposits & Withdrawals tabs) */}
          <div className="lg:col-span-2 glass-3d rounded-lg overflow-hidden flex flex-col justify-between">
            
            {/* Tabs Selector */}
            <div className="flex border-b border-dark-border bg-dark-bg/25 text-[10px] uppercase font-bold tracking-widest">
              <button
                onClick={() => setActiveTab("history")}
                className={`flex-1 py-4 text-center border-b-2 transition-all ${
                  activeTab === "history"
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-sage-muted hover:text-white"
                }`}
              >
                Log History
              </button>
              <button
                onClick={() => setActiveTab("deposits")}
                className={`flex-1 py-4 text-center border-b-2 transition-all ${
                  activeTab === "deposits"
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-sage-muted hover:text-white"
                }`}
              >
                Deposit Funds
              </button>
              <button
                onClick={() => setActiveTab("withdrawals")}
                className={`flex-1 py-4 text-center border-b-2 transition-all ${
                  activeTab === "withdrawals"
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-sage-muted hover:text-white"
                }`}
              >
                Withdraw Funds
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              
              {/* DEPOSIT FORM */}
              {activeTab === "deposits" && (
                <form onSubmit={handleDepositSubmit} className="flex flex-col gap-4 font-sans">
                  
                  {/* Dynamic scannable UPI QR Code & Instructions */}
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded flex flex-col gap-3.5 text-xs">
                    
                    <div className="flex justify-between items-start gap-3 flex-col sm:flex-row">
                      <div className="flex flex-col gap-2">
                        <h4 className="font-extrabold text-primary uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                          <ArrowDownLeft className="w-4 h-4 text-pink-pop" />
                          Central UPI Payment Escrow
                        </h4>
                        <p className="text-sage-muted text-[11px] leading-relaxed max-w-md">
                          On mobile devices, click the button below to pay directly using any installed UPI app (GPay/PhonePe). On desktop, scan the QR code.
                        </p>
                        
                        {/* Mobile Intent Direct Button */}
                        <a 
                          href={upiIntentLink}
                          className="self-start mt-1.5 flex items-center gap-1.5 bg-pink-pop text-white font-extrabold px-3 py-2 rounded text-[10px] tracking-wider uppercase shadow-[0_0_8px_rgba(255,0,122,0.3)] hover:bg-pink-pop-dark hover:shadow-[0_0_15px_rgba(255,0,122,0.5)] transition-all"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>Pay via UPI App</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {/* Dynamic QR Code Fallback */}
                      <div className="flex flex-col items-center gap-1.5 shrink-0 self-center sm:self-auto">
                        <div className="w-28 h-28 bg-primary p-1.5 rounded flex items-center justify-center shadow-[0_0_12px_rgba(213,255,64,0.15)]">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(upiIntentLink)}&color=08090a&bgcolor=D5FF40`}
                            alt="UPI QR Code"
                            className="w-24 h-24 object-contain"
                          />
                        </div>
                        <span className="text-[9px] text-sage-muted font-bold font-mono uppercase">Pay exactly ₹{depositAmount || "0"}</span>
                      </div>
                    </div>

                    <div className="bg-dark-bg p-2.5 border border-dark-border rounded flex items-center justify-between font-mono text-[10px] select-all cursor-pointer">
                      <span className="text-sage-muted">Central UPI ID:</span>
                      <span className="text-white font-bold">sambitbarik.virtue@oksbi</span>
                    </div>

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-sage-muted font-bold uppercase tracking-wider">Deposit Amount (₹)</label>
                      <input
                        type="number"
                        min={10}
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="bg-dark-bg border border-dark-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-mono font-semibold"
                        placeholder="e.g. 100"
                      />
                      <span className="text-[9px] text-sage-muted font-mono">Min ₹10</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-sage-muted font-bold uppercase tracking-wider">UPI Ref / Transaction ID</label>
                      <input
                        type="text"
                        value={depositUpiRef}
                        onChange={(e) => setDepositUpiRef(e.target.value)}
                        className="bg-dark-bg border border-dark-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-mono uppercase font-semibold"
                        placeholder="Enter any reference ID to verify"
                        maxLength={18}
                      />
                      <span className="text-[9px] text-sage-muted font-mono">Input receipt code to confirm payment</span>
                    </div>
                  </div>

                  {depositStatus.message && (
                    <p className={`text-[10px] font-bold ${depositStatus.success ? "text-green-400" : "text-red-400"}`}>
                      {depositStatus.message}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full mt-1.5 bg-primary text-dark-bg font-extrabold uppercase py-2.5 rounded shadow-[0_0_12px_rgba(213,255,64,0.15)] hover:shadow-[0_0_20px_rgba(213,255,64,0.4)] border border-primary-dark transition-all text-xs tracking-widest cursor-pointer"
                  >
                    Confirm Payment & Credit Wallet
                  </button>
                </form>
              )}

              {/* WITHDRAWAL FORM */}
              {activeTab === "withdrawals" && (
                <form onSubmit={handleWithdrawSubmit} className="flex flex-col gap-4 font-sans">
                  
                  {/* Payout Notice */}
                  <div className="bg-pink-pop/5 border border-pink-pop/20 p-4 rounded flex gap-3 text-xs leading-relaxed border-l-2 border-l-pink-pop">
                    <Info className="w-4 h-4 text-pink-pop shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-extrabold text-white uppercase tracking-wider text-[10px]">Manual Withdrawal Dispatch</h4>
                      <p className="text-sage-muted text-[10px] mt-1 leading-normal">
                        Payouts will be manually disbursed by the owner (**Samandreas**) via GPay/PhonePe.
                        Transactions are reviewed and settled **within 24 hours**.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-sage-muted font-bold uppercase tracking-wider">Withdrawal Amount (₹)</label>
                      <input
                        type="number"
                        min={50}
                        max={activeUser.walletBalance}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="bg-dark-bg border border-dark-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-mono font-semibold"
                        placeholder="e.g. 500"
                      />
                      <span className="text-[9px] text-sage-muted font-mono">Min ₹50 | Max ₹{activeUser.walletBalance}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-sage-muted font-bold uppercase tracking-wider">Your Destination UPI ID</label>
                      <input
                        type="text"
                        value={withdrawUpiId}
                        onChange={(e) => setWithdrawUpiId(e.target.value)}
                        className="bg-dark-bg border border-dark-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-mono font-semibold"
                        placeholder="e.g. username@upi"
                      />
                      <span className="text-[9px] text-sage-muted font-mono">Receipt account for cash disburse</span>
                    </div>
                  </div>

                  {withdrawStatus.message && (
                    <p className={`text-[10px] font-bold ${withdrawStatus.success ? "text-green-400" : "text-red-400"}`}>
                      {withdrawStatus.message}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={activeUser.walletBalance < 50}
                    className="w-full mt-1.5 bg-primary text-dark-bg font-extrabold uppercase py-2.5 rounded shadow-[0_0_12px_rgba(213,255,64,0.15)] hover:shadow-[0_0_20px_rgba(213,255,64,0.4)] border border-primary-dark transition-all text-xs tracking-widest disabled:opacity-50 disabled:hover:shadow-none cursor-pointer"
                  >
                    Request Payout
                  </button>
                </form>
              )}

              {/* LOG HISTORY */}
              {activeTab === "history" && (
                <div className="flex flex-col gap-3 font-sans">
                  <div className="flex items-center justify-between text-[10px] text-sage-muted border-b border-dark-border/40 pb-2 mb-1 uppercase font-bold tracking-wider">
                    <span>Account ledger:</span>
                  </div>
                  {myTransactions.length === 0 ? (
                    <div className="text-xs text-sage-muted text-center py-12 font-mono">
                      No transaction entries recorded.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {myTransactions.map((tx) => {
                        const isCredit = ["deposit", "bet_refund", "win_payout"].includes(tx.type);
                        
                        return (
                          <div 
                            key={tx.id} 
                            className="bg-dark-bg/30 border border-dark-border p-3 rounded flex items-center justify-between gap-3 text-xs border-l-2 border-l-primary"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs ${isCredit ? "bg-green-500/10 text-green-400 border border-green-500/25" : "bg-pink-pop/5 text-pink-pop border border-pink-pop/20"}`}>
                                {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                              </div>
                              <div>
                                <span className="font-black text-white capitalize text-[11px] flex items-center gap-1.5 font-mono">
                                  {tx.type.replace("_", " ")}
                                  <span className="text-[8px] text-sage-muted font-normal lowercase">#{tx.referenceId}</span>
                                </span>
                                <span className="text-[10px] text-sage-muted block mt-0.5">{tx.details}</span>
                              </div>
                            </div>
                            <div className="text-right flex flex-col gap-0.5">
                              <span className={`font-mono font-black text-xs ${isCredit ? "text-primary glow-text-green" : "text-white"}`}>
                                {isCredit ? "+" : "-"}₹{tx.amount}
                              </span>
                              <span className="text-[8px] text-sage-muted/50 font-mono">
                                {new Date(tx.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

        </section>

        {/* Deposit/Withdrawal Requests List Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
          
          {/* My Deposits Tracker */}
          <div className="glass-3d rounded-lg p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5 flex items-center gap-2 border-b border-dark-border/60 pb-2.5">
              <Clock className="w-4 h-4 text-primary" />
              Deposit Verification Logs
            </h3>
            {myDeposits.length === 0 ? (
              <div className="text-xs text-sage-muted text-center py-6 font-mono">
                No deposit request frequencies located.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                {myDeposits.map(dep => (
                  <div key={dep.id} className="bg-dark-bg/20 border border-dark-border p-3 rounded flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-white font-mono">Ref ID: {dep.upiRef}</div>
                      <div className="text-[9px] text-sage-muted mt-0.5 font-mono">DATE: {new Date(dep.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-white">₹{dep.amount}</span>
                      {dep.status === "pending" && (
                        <span className="text-[8px] font-mono font-black text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                          Pending
                        </span>
                      )}
                      {dep.status === "approved" && (
                        <span className="text-[8px] font-mono font-black text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                          Credited
                        </span>
                      )}
                      {dep.status === "rejected" && (
                        <span className="text-[8px] font-mono font-black text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Withdrawals Tracker */}
          <div className="glass-3d rounded-lg p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5 flex items-center gap-2 border-b border-dark-border/60 pb-2.5">
              <Clock className="w-4 h-4 text-primary" />
              Withdrawal Payout Logs
            </h3>
            {myWithdrawals.length === 0 ? (
              <div className="text-xs text-sage-muted text-center py-6 font-mono">
                No withdrawal transactions registered.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                {myWithdrawals.map(wit => (
                  <div key={wit.id} className="bg-dark-bg/20 border border-dark-border p-3 rounded flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-white font-mono">UPI ID: {wit.upiId}</div>
                      <div className="text-[9px] text-sage-muted mt-0.5 font-mono">DATE: {new Date(wit.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-white">₹{wit.amount}</span>
                      {wit.status === "pending" && (
                        <span className="text-[8px] font-mono font-black text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                          In Review
                        </span>
                      )}
                      {wit.status === "completed" && (
                        <span className="text-[8px] font-mono font-black text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                          Settled
                        </span>
                      )}
                      {wit.status === "rejected" && (
                        <span className="text-[8px] font-mono font-black text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                          Cancelled
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </section>

      </main>

      <SimulatorHarness />
    </div>
  );
}
