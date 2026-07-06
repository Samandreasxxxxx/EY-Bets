"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSimState } from "@/context/SimStateContext";
import { Bell, Wallet, Shield, Check, Trash2 } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const { 
    activeUser, 
    notifications, 
    clearNotifications, 
    markNotificationsAsRead 
  } = useSimState();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  if (!activeUser) return null;

  // Filter notifications for active user
  const userNotifs = notifications.filter((n) => n.userId === activeUser.id);
  const unreadCount = userNotifs.filter((n) => !n.isRead).length;

  const handleMarkRead = () => {
    markNotificationsAsRead();
  };

  const handleClearAll = () => {
    clearNotifications();
  };

  return (
    <header className="sticky top-0 z-40 bg-dark-bg/90 backdrop-blur-xl border-b border-[#FF007A]/15 py-3.5 px-4 sm:px-6 flex items-center justify-between font-sans shadow-[0_2px_15px_rgba(0,0,0,0.4)]">
      
      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-2 group">
        <span className="text-xl font-black text-white tracking-tighter flex items-center gap-0.5 bg-gradient-to-r from-primary via-white to-[#FF007A] bg-clip-text text-transparent">
          👽 BET<span className="text-primary group-hover:glow-text-green transition-all">BALL</span>
        </span>
        <span className="hidden sm:inline-block text-[8px] font-mono font-bold text-pink-pop border border-pink-pop/35 bg-pink-pop/5 px-1.5 py-0.5 tracking-wider rounded">
          SECTOR-3
        </span>
      </Link>

      {/* Main Nav Links (Sharp & Glowing) */}
      <nav className="hidden md:flex items-center gap-7 text-xs font-bold uppercase tracking-wider text-sage-muted">
        <Link 
          href="/" 
          className={`hover:text-white transition-all duration-200 flex items-center gap-1 ${
            pathname === "/" 
              ? "text-primary glow-text-green border-b border-primary pb-0.5" 
              : "hover:border-b hover:border-white pb-0.5"
          }`}
        >
          Lobby
        </Link>
        <Link 
          href="/leaderboard" 
          className={`hover:text-white transition-all duration-200 ${
            pathname === "/leaderboard" 
              ? "text-primary glow-text-green border-b border-primary pb-0.5" 
              : "hover:border-b hover:border-white pb-0.5"
          }`}
        >
          Leaderboard
        </Link>
        <Link 
          href="/wallet" 
          className={`hover:text-white transition-all duration-200 ${
            pathname === "/wallet" 
              ? "text-primary glow-text-green border-b border-primary pb-0.5" 
              : "hover:border-b hover:border-white pb-0.5"
          }`}
        >
          Wallet
        </Link>
        {/* Admin Link */}
        {activeUser.id === "samandreas" && (
          <Link 
            href="/admin" 
            className={`hover:text-white text-yellow-400 flex items-center gap-1 transition-all duration-200 ${
              pathname === "/admin" 
                ? "border-b border-yellow-400 pb-0.5 glow-text-pink" 
                : "hover:border-b hover:border-yellow-400 pb-0.5"
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-pink-pop animate-pulse" />
            Console
          </Link>
        )}
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        
        {/* Mobile Nav Icons (Muted screen shortcuts) */}
        <div className="flex md:hidden items-center gap-3 text-sage-muted text-[10px] uppercase font-bold tracking-wider">
          <Link href="/" className={`hover:text-white ${pathname === "/" ? "text-primary glow-text-green" : ""}`}>
            Lobby
          </Link>
          <Link href="/leaderboard" className={`hover:text-white ${pathname === "/leaderboard" ? "text-primary glow-text-green" : ""}`}>
            Board
          </Link>
          <Link href="/wallet" className={`hover:text-white ${pathname === "/wallet" ? "text-primary glow-text-green" : ""}`}>
            Cash
          </Link>
          {activeUser.id === "samandreas" && (
            <Link href="/admin" className={`text-yellow-400 font-extrabold ${pathname === "/admin" ? "glow-text-pink" : ""}`}>
              Console
            </Link>
          )}
        </div>

        {/* Wallet Balance widget (Sharp with Pink Border Pop) */}
        <Link 
          href="/wallet"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-card border border-dark-border hover:border-pink-pop/30 transition-all rounded-lg font-mono font-bold text-white shadow-[0_0_10px_rgba(0,0,0,0.3)] text-xs"
        >
          <Wallet className="w-3.5 h-3.5 text-primary" />
          <span className="hidden sm:inline text-sage-muted font-sans font-normal mr-0.5">Cash:</span>
          <span>₹{activeUser.walletBalance}</span>
        </Link>

        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative p-2 bg-dark-card border border-dark-border hover:border-pink-pop/35 rounded-lg text-sage-muted hover:text-white transition-all"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-pink-pop text-white text-[8px] font-black rounded flex items-center justify-center border border-dark-bg animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifDropdown && (
            <div className="absolute right-0 mt-3 w-76 sm:w-85 bg-dark-card border border-dark-border rounded-xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.85)] z-50 flex flex-col gap-3 animate-in fade-in duration-200">
              <div className="flex justify-between items-center border-b border-dark-border pb-2.5">
                <span className="font-bold text-xs text-white uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-pink-pop rounded-full"></span>
                  Transmissions
                </span>
                <div className="flex gap-2.5">
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkRead}
                      className="text-[9px] text-primary hover:underline flex items-center gap-0.5 font-bold uppercase tracking-wider"
                    >
                      <Check className="w-2.5 h-2.5" /> Read
                    </button>
                  )}
                  {userNotifs.length > 0 && (
                    <button 
                      onClick={handleClearAll}
                      className="text-[9px] text-red-450 hover:underline flex items-center gap-0.5 font-bold uppercase tracking-wider"
                    >
                      <Trash2 className="w-2.5 h-2.5" /> Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-[250px] overflow-y-auto flex flex-col gap-2 pr-1">
                {userNotifs.length === 0 ? (
                  <div className="text-xs text-sage-muted text-center py-6 font-mono">
                    No active frequencies detected.
                  </div>
                ) : (
                  userNotifs.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-2.5 rounded-lg border text-xs leading-relaxed flex flex-col gap-1 ${
                        n.isRead 
                          ? "bg-dark-bg/25 border-dark-border/60 text-sage-muted" 
                          : "bg-pink-pop/5 border-pink-pop/20 text-white"
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between text-white tracking-wide">
                        <span>{n.title}</span>
                        {!n.isRead && (
                          <span className="w-1 h-1 rounded-full bg-pink-pop"></span>
                        )}
                      </div>
                      <p className="text-[10px] text-sage-muted mt-0.5">{n.message}</p>
                      <span className="text-[8px] text-sage-muted/50 font-mono mt-0.5 self-end">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Badge Profile Icon (Static) */}
        <div className="w-8 h-8 rounded bg-dark-card border border-dark-border flex items-center justify-center font-bold text-xs text-primary shadow select-none">
          {activeUser.username[0].toUpperCase()}
        </div>

      </div>
    </header>
  );
}
