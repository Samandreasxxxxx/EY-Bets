"use client";

import React, { useState, useEffect } from "react";
import { useSimState } from "@/context/SimStateContext";
import Header from "@/components/Header";
import SimulatorHarness from "@/components/SimulatorHarness";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { 
  Award, UserPlus, Users, Check, X, AlertCircle, TrendingUp
} from "lucide-react";

export default function ProfilePage() {
  const {
    users,
    activeUser,
    friendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest
  } = useSimState();

  const [mounted, setMounted] = useState(false);
  const [friendUsername, setFriendUsername] = useState("");
  const [friendError, setFriendError] = useState("");
  const [friendSuccess, setFriendSuccess] = useState("");

  // Recharts SSR safety
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!activeUser) return null;

  // Filter requests sent to current user
  const incomingRequests = friendRequests.filter(
    (r) => r.receiverId === activeUser.id && r.status === "pending"
  );

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    setFriendError("");
    setFriendSuccess("");

    if (!friendUsername.trim()) return;

    const res = sendFriendRequest(friendUsername);
    if (!res.success) {
      setFriendError(res.message);
    } else {
      setFriendSuccess(res.message);
      setFriendUsername("");
      setTimeout(() => setFriendSuccess(""), 4000);
    }
  };

  // Compile stats
  const winRate = activeUser.stats.totalMatches > 0 ? Math.round((activeUser.stats.totalWins / activeUser.stats.totalMatches) * 100) : 0;
  const netProfit = activeUser.stats.netProfit;
  
  // Chart Data
  const chartData = [
    { name: "Sign Up", profit: 0 },
    { name: "Pool 1", profit: Math.round(netProfit * 0.1) },
    { name: "Pool 2", profit: Math.round(netProfit * 0.35) },
    { name: "Pool 3", profit: Math.round(netProfit * 0.2) },
    { name: "Pool 4", profit: Math.round(netProfit * 0.65) },
    { name: "Current", profit: netProfit }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-dark-bg font-sans pb-24 relative">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6 relative z-10">
        
        {/* Banner Title */}
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-wider text-white uppercase flex items-center gap-2">
            PROFILE ANALYSIS <span className="text-primary animate-pulse">●</span>
          </h1>
          <p className="text-sage-muted text-[11px] font-mono mt-0.5 uppercase tracking-wide">
            Inspect your credentials, unlock achievements, and link with friends.
          </p>
        </div>

        {/* Profile Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* USER CARD & STATS SUMMARY */}
          <div className="lg:col-span-1 bg-[#0c0d10] border border-[#1a1d24] p-5 rounded-lg flex flex-col gap-6 shadow relative">
            {/* Subtle Pink Indicator Line */}
            <div className="absolute top-0 left-0 w-24 h-[2px] bg-pink-pop"></div>

            {/* Profile Avatar Header */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-dark-bg border border-dark-border rounded flex items-center justify-center text-2xl text-primary font-black shadow-inner">
                {activeUser.username[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-1.5 uppercase font-mono tracking-wider">
                  {activeUser.username}
                </h2>
                <p className="text-[9px] text-sage-muted font-mono mt-1">
                  JOINED: {new Date(activeUser.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Achievements Badges */}
            <div className="flex flex-col gap-2 border-t border-dark-border/40 pt-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-sage-muted flex items-center gap-1.5 font-mono">
                <Award className="w-3.5 h-3.5 text-pink-pop" />
                Unlocked Medals
              </span>
              
              {activeUser.badges.length === 0 ? (
                <p className="text-[10px] text-sage-muted italic bg-dark-bg/30 p-3 rounded font-mono">
                  No achievement signal locks cleared.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 mt-1">
                  {activeUser.badges.map((b) => (
                    <span 
                      key={b}
                      className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded font-bold font-mono tracking-wider"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* General Stats (Sharp grid layout) */}
            <div className="border-t border-dark-border/40 pt-4 flex flex-col gap-3 font-mono text-[10px] uppercase">
              <span className="text-[10px] font-bold uppercase tracking-widest text-sage-muted font-sans flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                Lobby Metrics
              </span>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="bg-dark-bg/40 border border-dark-border p-2.5 rounded">
                  <div className="text-[8px] text-sage-muted font-sans font-bold">Matches Played</div>
                  <div className="text-xs font-bold text-white mt-1">{activeUser.stats.totalMatches}</div>
                </div>
                <div className="bg-dark-bg/40 border border-dark-border p-2.5 rounded">
                  <div className="text-[8px] text-sage-muted font-sans font-bold">Win Rate %</div>
                  <div className="text-xs font-bold text-white mt-1">{winRate}%</div>
                </div>
                <div className="bg-dark-bg/40 border border-dark-border p-2.5 rounded">
                  <div className="text-[8px] text-sage-muted font-sans font-bold">Wins / Losses</div>
                  <div className="text-xs font-bold text-white mt-1">
                    {activeUser.stats.totalWins}W / {activeUser.stats.totalLosses}L
                  </div>
                </div>
                <div className="bg-dark-bg/40 border border-dark-border p-2.5 rounded">
                  <div className="text-[8px] text-sage-muted font-sans font-bold">Record Win</div>
                  <div className="text-xs font-bold text-primary mt-1">₹{activeUser.stats.biggestWin}</div>
                </div>
              </div>
            </div>

          </div>

          {/* NET PROFIT CHART */}
          <div className="lg:col-span-2 bg-[#0c0d10] border border-[#1a1d24] p-5 rounded-lg shadow flex flex-col gap-4 relative">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-primary" />
                Profit Progression Line
              </h3>
              <p className="text-[10px] text-sage-muted font-mono mt-0.5 uppercase tracking-wide">
                Cumulative earnings across predictions (calculated in INR).
              </p>
            </div>

            {/* Recharts Render */}
            <div className="h-60 sm:h-72 w-full bg-dark-bg/40 border border-dark-border rounded p-2.5">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="profileGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D5FF40" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#D5FF40" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#16181e" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#A3A39A" 
                      fontSize={9} 
                      fontFamily="monospace"
                      tickLine={false} 
                    />
                    <YAxis 
                      stroke="#A3A39A" 
                      fontSize={9} 
                      fontFamily="monospace"
                      tickLine={false} 
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "#0c0d10", 
                        borderColor: "#1a1d24",
                        borderRadius: "4px",
                        color: "#fff",
                        fontFamily: "monospace",
                        fontSize: "11px"
                      }}
                      cursor={{ stroke: "#FF007A", strokeWidth: 1 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#D5FF40" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#profileGrad)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-sage-muted animate-pulse font-mono">
                  Loading telemetry...
                </div>
              )}
            </div>

          </div>

        </section>

        {/* FRIENDS SYSTEM */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
          
          {/* Add Friend form */}
          <div className="md:col-span-1 bg-[#0c0d10] border border-[#1a1d24] p-5 rounded-lg shadow flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-dark-border pb-2.5">
              <UserPlus className="w-4 h-4 text-pink-pop" />
              Add Friend Link
            </h3>
            
            <form onSubmit={handleAddFriend} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-sage-muted font-bold uppercase tracking-wider">Friend Username</label>
                <input
                  type="text"
                  placeholder="Username"
                  value={friendUsername}
                  onChange={(e) => setFriendUsername(e.target.value)}
                  className="bg-dark-bg border border-dark-border rounded px-3 py-2 text-xs text-white placeholder-sage-muted/30 focus:outline-none focus:border-primary/50 transition-all font-medium"
                />
              </div>

              {friendError && (
                <p className="text-[10px] text-red-400 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {friendError}
                </p>
              )}
              {friendSuccess && (
                <p className="text-[10px] text-green-400 font-semibold">
                  {friendSuccess}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-primary text-dark-bg font-extrabold uppercase py-2.5 rounded shadow hover:shadow-lg transition-all text-[10px] tracking-wider cursor-pointer"
              >
                Send Request
              </button>
            </form>
          </div>

          {/* Incoming requests */}
          <div className="md:col-span-1 bg-[#0c0d10] border border-[#1a1d24] p-5 rounded-lg shadow flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-dark-border pb-2.5">
              <Users className="w-4 h-4 text-pink-pop animate-pulse" />
              Friend Requests ({incomingRequests.length})
            </h3>
            
            {incomingRequests.length === 0 ? (
              <div className="text-xs text-sage-muted text-center py-8 font-mono">
                No active request waves.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                {incomingRequests.map((req) => (
                  <div 
                    key={req.id} 
                    className="bg-dark-bg/40 border border-dark-border p-3 rounded flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{req.senderName}</div>
                      <div className="text-[9px] text-sage-muted mt-0.5">Wants to link</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptFriendRequest(req.id)}
                        className="bg-primary/20 hover:bg-primary/35 text-primary border border-primary/30 p-1.5 rounded transition-all cursor-pointer"
                        title="Accept"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => rejectFriendRequest(req.id)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 p-1.5 rounded transition-all cursor-pointer"
                        title="Reject"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Friends list */}
          <div className="md:col-span-1 bg-[#0c0d10] border border-[#1a1d24] p-5 rounded-lg shadow flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-dark-border pb-2.5">
              <Users className="w-4 h-4 text-pink-pop" />
              Friend Radar Network
            </h3>
            
            {activeUser.friends.length === 0 ? (
              <div className="text-xs text-sage-muted text-center py-8 font-mono">
                Isolated sector. Add friends.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                {activeUser.friends.map((friendId) => {
                  const friendObj = users.find(u => u.id === friendId);
                  if (!friendObj) return null;
                  
                  return (
                    <div 
                      key={friendId}
                      className="bg-dark-bg/30 border border-dark-border p-3 rounded flex items-center justify-between text-xs font-sans"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-dark-bg border border-dark-border flex items-center justify-center font-bold text-xs text-sage-muted rounded">
                          {friendObj.username[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white text-[11px] font-mono">{friendObj.username}</div>
                          <div className="text-[9px] text-sage-muted font-mono mt-0.5">
                            Profit: <span className={friendObj.stats.netProfit >= 0 ? "text-green-400" : "text-red-400"}>
                              ₹{friendObj.stats.netProfit}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <span className="flex items-center gap-1 text-[8px] text-sage-muted font-mono uppercase tracking-wider">
                        <span className="w-1 h-1 rounded-full bg-primary animate-pulse"></span>
                        Active
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </section>

      </main>

      <SimulatorHarness />
    </div>
  );
}
