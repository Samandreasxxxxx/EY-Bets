"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Types
export interface UserStats {
  totalWins: number;
  totalLosses: number;
  totalMatches: number;
  netProfit: number;
  totalMoneyWon: number;
  totalMoneyLost: number;
  biggestWin: number;
  streak: number;
}

export interface User {
  id: string; // lowercase username
  username: string; // display name
  walletBalance: number;
  isBanned: boolean;
  createdAt: string;
  stats: UserStats;
  badges: string[];
  friends: string[];
}

export interface Match {
  id: string; // POOL-XXXX
  game: "Foosball" | "Table Tennis";
  teamA: string;
  teamB: string;
  creatorId: string;
  creatorName: string;
  minBet: number;
  maxBet: number;
  betWindowMinutes: number;
  createdAt: string;
  closesAt: string; // ISO String
  unlocksWinnerAt: string; // ISO String (10 mins from creation)
  status: "betting" | "active" | "completed";
  winner: "A" | "B" | null;
  totalPool: number;
  feeDeducted: number;
  distributablePool: number;
}

export interface Bet {
  id: string;
  matchId: string;
  userId: string;
  username: string;
  team: "A" | "B";
  amount: number;
  status: "active" | "won" | "lost";
  payout: number;
  createdAt: string;
}

export interface DepositRequest {
  id: string;
  userId: string;
  username: string;
  amount: number;
  upiRef: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  username: string;
  amount: number;
  upiId: string;
  status: "pending" | "completed" | "rejected";
  createdAt: string;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: "deposit" | "withdraw" | "bet_placed" | "bet_refund" | "win_payout" | "platform_fee";
  amount: number;
  referenceId: string; // matchId or UPI ref
  details: string;
  createdAt: string;
}

interface SimStateContextType {
  users: User[];
  activeUser: User | null;
  matches: Match[];
  bets: Bet[];
  depositRequests: DepositRequest[];
  withdrawalRequests: WithdrawalRequest[];
  friendRequests: FriendRequest[];
  notifications: Notification[];
  walletTransactions: WalletTransaction[];
  switchUser: (userId: string) => void;
  createUser: (username: string) => User | string;
  createMatch: (
    game: "Foosball" | "Table Tennis",
    teamA: string,
    teamB: string,
    betWindowMinutes: number,
    minBet: number,
    maxBet: number
  ) => Match;
  placeBet: (matchId: string, team: "A" | "B", amount: number) => { success: boolean; message: string };
  requestDeposit: (amount: number, upiRef: string) => { success: boolean; message: string };
  requestWithdrawal: (amount: number, upiId: string) => { success: boolean; message: string };
  approveDeposit: (depositId: string) => void;
  rejectDeposit: (depositId: string) => void;
  approveWithdrawal: (withdrawalId: string) => void;
  rejectWithdrawal: (withdrawalId: string) => void;
  declareWinner: (matchId: string, winnerTeam: "A" | "B") => { success: boolean; message: string };
  sendFriendRequest: (friendUsername: string) => { success: boolean; message: string };
  acceptFriendRequest: (requestId: string) => void;
  rejectFriendRequest: (requestId: string) => void;
  clearNotifications: () => void;
  markNotificationsAsRead: () => void;
  bypassWinnerLock: (matchId: string) => void;
  addFundsAdmin: (userId: string, amount: number) => void;
}

const SimStateContext = createContext<SimStateContextType | undefined>(undefined);

export function SimStateProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const localUsers = localStorage.getItem("bb_users_v2");
    const localActiveUserId = localStorage.getItem("bb_active_user_id_v2");
    const localMatches = localStorage.getItem("bb_matches_v2");
    const localBets = localStorage.getItem("bb_bets_v2");
    const localDeposits = localStorage.getItem("bb_deposits_v2");
    const localWithdrawals = localStorage.getItem("bb_withdrawals_v2");
    const localFriendRequests = localStorage.getItem("bb_friend_requests_v2");
    const localNotifications = localStorage.getItem("bb_notifications_v2");
    const localTransactions = localStorage.getItem("bb_transactions_v2");

    let loadedUsers: User[] = [];
    
    if (localUsers) {
      loadedUsers = JSON.parse(localUsers);
      setUsers(loadedUsers);
    } else {
      // Seed default users with zero balances/stats
      const defaultUsers: User[] = [
        {
          id: "samandreas",
          username: "Samandreas",
          walletBalance: 0,
          isBanned: false,
          createdAt: new Date().toISOString(),
          stats: {
            totalWins: 0,
            totalLosses: 0,
            totalMatches: 0,
            netProfit: 0,
            totalMoneyWon: 0,
            totalMoneyLost: 0,
            biggestWin: 0,
            streak: 0
          },
          badges: ["👑 Owner"],
          friends: []
        },
        {
          id: "rohan",
          username: "Rohan",
          walletBalance: 0,
          isBanned: false,
          createdAt: new Date().toISOString(),
          stats: {
            totalWins: 0,
            totalLosses: 0,
            totalMatches: 0,
            netProfit: 0,
            totalMoneyWon: 0,
            totalMoneyLost: 0,
            biggestWin: 0,
            streak: 0
          },
          badges: [],
          friends: []
        },
        {
          id: "divya",
          username: "Divya",
          walletBalance: 0,
          isBanned: false,
          createdAt: new Date().toISOString(),
          stats: {
            totalWins: 0,
            totalLosses: 0,
            totalMatches: 0,
            netProfit: 0,
            totalMoneyWon: 0,
            totalMoneyLost: 0,
            biggestWin: 0,
            streak: 0
          },
          badges: [],
          friends: []
        },
        {
          id: "rahul",
          username: "Rahul",
          walletBalance: 0,
          isBanned: false,
          createdAt: new Date().toISOString(),
          stats: {
            totalWins: 0,
            totalLosses: 0,
            totalMatches: 0,
            netProfit: 0,
            totalMoneyWon: 0,
            totalMoneyLost: 0,
            biggestWin: 0,
            streak: 0
          },
          badges: [],
          friends: []
        },
        {
          id: "meera",
          username: "Meera",
          walletBalance: 0,
          isBanned: false,
          createdAt: new Date().toISOString(),
          stats: {
            totalWins: 0,
            totalLosses: 0,
            totalMatches: 0,
            netProfit: 0,
            totalMoneyWon: 0,
            totalMoneyLost: 0,
            biggestWin: 0,
            streak: 0
          },
          badges: [],
          friends: []
        }
      ];
      loadedUsers = defaultUsers;
      setUsers(defaultUsers);
      localStorage.setItem("bb_users_v2", JSON.stringify(defaultUsers));
    }

    // Set active user
    if (localActiveUserId) {
      const active = loadedUsers.find(u => u.id === localActiveUserId);
      setActiveUser(active || loadedUsers[0]);
    } else {
      setActiveUser(loadedUsers[0]);
      localStorage.setItem("bb_active_user_id_v2", loadedUsers[0].id);
    }

    // Seed matches and other tables if empty
    if (localMatches) {
      setMatches(JSON.parse(localMatches));
    } else {
      setMatches([]);
      localStorage.setItem("bb_matches_v2", JSON.stringify([]));
    }

    if (localBets) {
      setBets(JSON.parse(localBets));
    } else {
      setBets([]);
      localStorage.setItem("bb_bets_v2", JSON.stringify([]));
    }

    if (localDeposits) {
      setDepositRequests(JSON.parse(localDeposits));
    } else {
      setDepositRequests([]);
      localStorage.setItem("bb_deposits_v2", JSON.stringify([]));
    }

    if (localWithdrawals) {
      setWithdrawalRequests(JSON.parse(localWithdrawals));
    } else {
      setWithdrawalRequests([]);
      localStorage.setItem("bb_withdrawals_v2", JSON.stringify([]));
    }

    if (localFriendRequests) {
      setFriendRequests(JSON.parse(localFriendRequests));
    } else {
      setFriendRequests([]);
      localStorage.setItem("bb_friend_requests_v2", JSON.stringify([]));
    }

    if (localNotifications) {
      setNotifications(JSON.parse(localNotifications));
    } else {
      const initialNotifications: Notification[] = [
        {
          id: "not_1",
          userId: "samandreas",
          title: "👽 Welcome to BetBall!",
          message: "Invite your friends, fund your wallet via UPI, and start prediction battles.",
          isRead: false,
          createdAt: new Date().toISOString()
        }
      ];
      setNotifications(initialNotifications);
      localStorage.setItem("bb_notifications_v2", JSON.stringify(initialNotifications));
    }

    if (localTransactions) {
      setWalletTransactions(JSON.parse(localTransactions));
    } else {
      setWalletTransactions([]);
      localStorage.setItem("bb_transactions_v2", JSON.stringify([]));
    }

    setInitialized(true);
  }, []);

  // Save changes to localStorage helper
  const saveState = (
    updatedUsers: User[],
    updatedMatches: Match[],
    updatedBets: Bet[],
    updatedDeposits: DepositRequest[],
    updatedWithdrawals: WithdrawalRequest[],
    updatedFriends: FriendRequest[],
    updatedNotifications: Notification[],
    updatedTransactions: WalletTransaction[]
  ) => {
    setUsers(updatedUsers);
    setMatches(updatedMatches);
    setBets(updatedBets);
    setDepositRequests(updatedDeposits);
    setWithdrawalRequests(updatedWithdrawals);
    setFriendRequests(updatedFriends);
    setNotifications(updatedNotifications);
    setWalletTransactions(updatedTransactions);

    localStorage.setItem("bb_users_v2", JSON.stringify(updatedUsers));
    localStorage.setItem("bb_matches_v2", JSON.stringify(updatedMatches));
    localStorage.setItem("bb_bets_v2", JSON.stringify(updatedBets));
    localStorage.setItem("bb_deposits_v2", JSON.stringify(updatedDeposits));
    localStorage.setItem("bb_withdrawals_v2", JSON.stringify(updatedWithdrawals));
    localStorage.setItem("bb_friend_requests_v2", JSON.stringify(updatedFriends));
    localStorage.setItem("bb_notifications_v2", JSON.stringify(updatedNotifications));
    localStorage.setItem("bb_transactions_v2", JSON.stringify(updatedTransactions));

    // Also update active user reference
    if (activeUser) {
      const updatedActive = updatedUsers.find(u => u.id === activeUser.id);
      if (updatedActive) {
        setActiveUser(updatedActive);
      }
    }
  };

  // Switch User
  const switchUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setActiveUser(user);
      localStorage.setItem("bb_active_user_id_v2", userId);
    }
  };

  // Create Custom User
  const createUser = (username: string): User | string => {
    const trimmed = username.trim();
    if (!trimmed) return "Username cannot be empty";
    const id = trimmed.toLowerCase().replace(/\s+/g, "");
    
    if (users.some(u => u.id === id)) {
      return "Username already exists";
    }

    const newUser: User = {
      id,
      username: trimmed,
      walletBalance: 0,
      isBanned: false,
      createdAt: new Date().toISOString(),
      stats: {
        totalWins: 0,
        totalLosses: 0,
        totalMatches: 0,
        netProfit: 0,
        totalMoneyWon: 0,
        totalMoneyLost: 0,
        biggestWin: 0,
        streak: 0
      },
      badges: [],
      friends: []
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem("bb_users_v2", JSON.stringify(updatedUsers));
    
    // Automatically switch to the newly created user
    setActiveUser(newUser);
    localStorage.setItem("bb_active_user_id_v2", id);

    // Send a welcome notification
    const newNotif: Notification = {
      id: "welcome_" + id + "_" + Date.now(),
      userId: id,
      title: "🚀 Welcome " + trimmed + "!",
      message: "Deposit money to start placing bets and challenging friends.",
      isRead: false,
      createdAt: new Date().toISOString()
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    localStorage.setItem("bb_notifications_v2", JSON.stringify(updatedNotifs));

    return newUser;
  };

  // Create Match
  const createMatch = (
    game: "Foosball" | "Table Tennis",
    teamA: string,
    teamB: string,
    betWindowMinutes: number,
    minBet: number,
    maxBet: number
  ): Match => {
    if (!activeUser) throw new Error("No active user");

    const matchId = `POOL-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const closesAt = new Date(now.getTime() + betWindowMinutes * 60 * 1000).toISOString();
    const unlocksWinnerAt = new Date(now.getTime() + 10 * 60 * 1000).toISOString(); // 10 minutes from now

    const newMatch: Match = {
      id: matchId,
      game,
      teamA: teamA.trim() || "Team A",
      teamB: teamB.trim() || "Team B",
      creatorId: activeUser.id,
      creatorName: activeUser.username,
      minBet: Math.max(10, minBet), // Minimum ₹10 enforced
      maxBet: maxBet,
      betWindowMinutes,
      createdAt: now.toISOString(),
      closesAt,
      unlocksWinnerAt,
      status: "betting",
      winner: null,
      totalPool: 0,
      feeDeducted: 0,
      distributablePool: 0
    };

    const updatedMatches = [newMatch, ...matches];

    // System-wide notification for friends
    const updatedNotifications = [...notifications];
    users.forEach(u => {
      if (u.id !== activeUser.id) {
        updatedNotifications.unshift({
          id: `notif_${matchId}_${u.id}_${Date.now()}`,
          userId: u.id,
          title: `🔥 New ${game} Match!`,
          message: `${activeUser.username} created ${newMatch.teamA} vs ${newMatch.teamB}. Pool ID: ${matchId}. Join now!`,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    });

    saveState(
      users,
      updatedMatches,
      bets,
      depositRequests,
      withdrawalRequests,
      friendRequests,
      updatedNotifications,
      walletTransactions
    );

    return newMatch;
  };

  // Place Bet
  const placeBet = (matchId: string, team: "A" | "B", amount: number): { success: boolean; message: string } => {
    if (!activeUser) return { success: false, message: "No active session" };
    if (activeUser.isBanned) return { success: false, message: "Your account is banned" };
    
    const match = matches.find(m => m.id === matchId);
    if (!match) return { success: false, message: "Match not found" };
    if (match.status !== "betting") return { success: false, message: "Betting is closed for this match" };
    if (new Date() > new Date(match.closesAt)) return { success: false, message: "Betting window has expired" };
    
    if (amount < match.minBet) return { success: false, message: `Minimum bet is ₹${match.minBet}` };
    if (amount > match.maxBet) return { success: false, message: `Maximum bet is ₹${match.maxBet}` };

    if (activeUser.walletBalance < amount) {
      return { success: false, message: `Insufficient balance! You need ₹${amount - activeUser.walletBalance} more. Request a deposit.` };
    }

    // Deduct wallet balance
    const updatedUsers = users.map(u => {
      if (u.id === activeUser.id) {
        return { ...u, walletBalance: u.walletBalance - amount };
      }
      return u;
    });

    // Create bet
    const betId = `BET-${Math.floor(100000 + Math.random() * 900000)}`;
    const newBet: Bet = {
      id: betId,
      matchId,
      userId: activeUser.id,
      username: activeUser.username,
      team,
      amount,
      status: "active",
      payout: 0,
      createdAt: new Date().toISOString()
    };

    const updatedBets = [newBet, ...bets];

    // Update match total pool
    const updatedMatches = matches.map(m => {
      if (m.id === matchId) {
        const newTotal = m.totalPool + amount;
        return { ...m, totalPool: newTotal };
      }
      return m;
    });

    // Create wallet transaction
    const newTx: WalletTransaction = {
      id: `TX-${Date.now()}`,
      userId: activeUser.id,
      type: "bet_placed",
      amount: amount,
      referenceId: matchId,
      details: `Placed bet of ₹${amount} on ${team === "A" ? match.teamA : match.teamB}`,
      createdAt: new Date().toISOString()
    };
    const updatedTxs = [newTx, ...walletTransactions];

    // Add notification
    const newNotif: Notification = {
      id: `notif_${betId}_${Date.now()}`,
      userId: activeUser.id,
      title: "🎯 Bet Accepted!",
      message: `₹${amount} bet placed on ${team === "A" ? match.teamA : match.teamB} for match ${matchId}.`,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    const updatedNotifs = [newNotif, ...notifications];

    saveState(
      updatedUsers,
      updatedMatches,
      updatedBets,
      depositRequests,
      withdrawalRequests,
      friendRequests,
      updatedNotifs,
      updatedTxs
    );

    return { success: true, message: "Bet placed successfully!" };
  };

  // Request Deposit (UPI Intent Auto-Approval)
  const requestDeposit = (amount: number, upiRef: string): { success: boolean; message: string } => {
    if (!activeUser) return { success: false, message: "No active user" };
    if (amount < 10) return { success: false, message: "Minimum deposit is ₹10" };
    if (!upiRef.trim()) return { success: false, message: "UPI Reference ID is required" };

    const depositId = `DEP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newDeposit: DepositRequest = {
      id: depositId,
      userId: activeUser.id,
      username: activeUser.username,
      amount,
      upiRef: upiRef.trim(),
      status: "approved", // Auto-approved instantly!
      createdAt: new Date().toISOString()
    };

    const updatedDeposits = [newDeposit, ...depositRequests];

    // Credit user's wallet immediately
    const updatedUsers = users.map(u => {
      if (u.id === activeUser.id) {
        return { ...u, walletBalance: Math.round((u.walletBalance + amount) * 100) / 100 };
      }
      return u;
    });

    // Create wallet transaction log
    const newTx: WalletTransaction = {
      id: `TX-${Date.now()}`,
      userId: activeUser.id,
      type: "deposit",
      amount,
      referenceId: upiRef.trim(),
      details: "Deposit Credited instantly via UPI Intent redirection",
      createdAt: new Date().toISOString()
    };
    const updatedTxs = [newTx, ...walletTransactions];

    // Notifications
    const updatedNotifs = [...notifications];
    // For user
    updatedNotifs.unshift({
      id: `notif_dep_app_${depositId}_${Date.now()}`,
      userId: activeUser.id,
      title: "💰 Wallet Credited!",
      message: `Your deposit of ₹${amount} was successfully verified via UPI Ref ${upiRef} and credited instantly.`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    // For Admin (Notify that someone paid)
    if (activeUser.id !== "samandreas") {
      updatedNotifs.unshift({
        id: `notif_admin_dep_${depositId}_${Date.now()}`,
        userId: "samandreas", // Admin
        title: "💸 User Deposited",
        message: `${activeUser.username} deposited ₹${amount} via UPI (Ref: ${upiRef})`,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    saveState(
      updatedUsers,
      matches,
      bets,
      updatedDeposits,
      withdrawalRequests,
      friendRequests,
      updatedNotifs,
      updatedTxs
    );

    return { success: true, message: `Wallet funded with ₹${amount} successfully!` };
  };

  // Request Withdrawal
  const requestWithdrawal = (amount: number, upiId: string): { success: boolean; message: string } => {
    if (!activeUser) return { success: false, message: "No active user" };
    if (activeUser.isBanned) return { success: false, message: "Your account is banned" };
    if (amount < 50) return { success: false, message: "Minimum withdrawal is ₹50" };
    if (!upiId.trim()) return { success: false, message: "UPI ID is required for withdrawal" };
    if (activeUser.walletBalance < amount) return { success: false, message: "Insufficient balance in wallet" };

    // Deduct immediately (hold the balance)
    const updatedUsers = users.map(u => {
      if (u.id === activeUser.id) {
        return { ...u, walletBalance: u.walletBalance - amount };
      }
      return u;
    });

    const newWithdrawal: WithdrawalRequest = {
      id: `WITH-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: activeUser.id,
      username: activeUser.username,
      amount,
      upiId: upiId.trim(),
      status: "pending",
      createdAt: new Date().toISOString()
    };

    const updatedWithdrawals = [newWithdrawal, ...withdrawalRequests];

    // Notification for user and admin
    const updatedNotifs = [...notifications];
    // User
    updatedNotifs.unshift({
      id: `notif_with_user_${newWithdrawal.id}_${Date.now()}`,
      userId: activeUser.id,
      title: "📤 Withdrawal Request Received",
      message: `Your request for ₹${amount} to ${upiId} is processing. It will be credited within 24 hours.`,
      isRead: false,
      createdAt: new Date().toISOString()
    });
    // Admin
    updatedNotifs.unshift({
      id: `notif_with_admin_${newWithdrawal.id}_${Date.now()}`,
      userId: "samandreas", // Admin
      title: "🚨 Withdrawal Request",
      message: `${activeUser.username} requested withdrawal of ₹${amount} to ${upiId}`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    // Transaction log
    const newTx: WalletTransaction = {
      id: `TX-${Date.now()}`,
      userId: activeUser.id,
      type: "withdraw",
      amount: amount,
      referenceId: newWithdrawal.id,
      details: `Withdrawal request submitted (UPI ID: ${upiId}) - Processing (24h)`,
      createdAt: new Date().toISOString()
    };
    const updatedTxs = [newTx, ...walletTransactions];

    saveState(
      updatedUsers,
      matches,
      bets,
      depositRequests,
      updatedWithdrawals,
      friendRequests,
      updatedNotifs,
      updatedTxs
    );

    return { success: true, message: "Withdrawal requested! Payout will be processed within 24 hours." };
  };

  // Approve Deposit (Admin)
  const approveDeposit = (depositId: string) => {
    const deposit = depositRequests.find(d => d.id === depositId);
    if (!deposit || deposit.status !== "pending") return;

    // Credit user
    const updatedUsers = users.map(u => {
      if (u.id === deposit.userId) {
        return { ...u, walletBalance: u.walletBalance + deposit.amount };
      }
      return u;
    });

    // Update request
    const updatedDeposits = depositRequests.map(d => {
      if (d.id === depositId) return { ...d, status: "approved" as const };
      return d;
    });

    // Wallet transaction log
    const newTx: WalletTransaction = {
      id: `TX-${Date.now()}`,
      userId: deposit.userId,
      type: "deposit",
      amount: deposit.amount,
      referenceId: deposit.upiRef,
      details: "Deposit Approved by Admin (UPI Verification)",
      createdAt: new Date().toISOString()
    };
    const updatedTxs = [newTx, ...walletTransactions];

    // Notification to user
    const updatedNotifs = [...notifications];
    updatedNotifs.unshift({
      id: `notif_dep_app_${depositId}_${Date.now()}`,
      userId: deposit.userId,
      title: "💰 Wallet Credited!",
      message: `Your deposit of ₹${deposit.amount} has been verified and added to your wallet. Let's play!`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    saveState(
      updatedUsers,
      matches,
      bets,
      updatedDeposits,
      withdrawalRequests,
      friendRequests,
      updatedNotifs,
      updatedTxs
    );
  };

  // Reject Deposit (Admin)
  const rejectDeposit = (depositId: string) => {
    const updatedDeposits = depositRequests.map(d => {
      if (d.id === depositId) return { ...d, status: "rejected" as const };
      return d;
    });

    const deposit = depositRequests.find(d => d.id === depositId);
    const updatedNotifs = [...notifications];
    if (deposit) {
      updatedNotifs.unshift({
        id: `notif_dep_rej_${depositId}_${Date.now()}`,
        userId: deposit.userId,
        title: "❌ Deposit Rejected",
        message: `Your deposit of ₹${deposit.amount} with Ref ID ${deposit.upiRef} was rejected. Contact support if this is an error.`,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    saveState(
      users,
      matches,
      bets,
      updatedDeposits,
      withdrawalRequests,
      friendRequests,
      updatedNotifs,
      walletTransactions
    );
  };

  // Approve Withdrawal (Admin)
  const approveWithdrawal = (withdrawalId: string) => {
    const request = withdrawalRequests.find(w => w.id === withdrawalId);
    if (!request || request.status !== "pending") return;

    // Update status
    const updatedWithdrawals = withdrawalRequests.map(w => {
      if (w.id === withdrawalId) return { ...w, status: "completed" as const };
      return w;
    });

    // Notify user
    const updatedNotifs = [...notifications];
    updatedNotifs.unshift({
      id: `notif_with_app_${withdrawalId}_${Date.now()}`,
      userId: request.userId,
      title: "✅ Withdrawal Approved",
      message: `Your withdrawal of ₹${request.amount} has been completed and sent to your UPI ID ${request.upiId}.`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    saveState(
      users,
      matches,
      bets,
      depositRequests,
      updatedWithdrawals,
      friendRequests,
      updatedNotifs,
      walletTransactions
    );
  };

  // Reject Withdrawal (Admin)
  const rejectWithdrawal = (withdrawalId: string) => {
    const request = withdrawalRequests.find(w => w.id === withdrawalId);
    if (!request || request.status !== "pending") return;

    // Refund wallet balance
    const updatedUsers = users.map(u => {
      if (u.id === request.userId) {
        return { ...u, walletBalance: u.walletBalance + request.amount };
      }
      return u;
    });

    // Update status
    const updatedWithdrawals = withdrawalRequests.map(w => {
      if (w.id === withdrawalId) return { ...w, status: "rejected" as const };
      return w;
    });

    // Refund transaction log
    const newTx: WalletTransaction = {
      id: `TX-${Date.now()}`,
      userId: request.userId,
      type: "bet_refund",
      amount: request.amount,
      referenceId: withdrawalId,
      details: "Withdrawal rejected by Admin - Refunded to wallet",
      createdAt: new Date().toISOString()
    };
    const updatedTxs = [newTx, ...walletTransactions];

    // Notify user
    const updatedNotifs = [...notifications];
    updatedNotifs.unshift({
      id: `notif_with_rej_${withdrawalId}_${Date.now()}`,
      userId: request.userId,
      title: "❌ Withdrawal Rejected",
      message: `Your withdrawal of ₹${request.amount} to UPI ID ${request.upiId} was rejected. Funds have been refunded to your wallet.`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    saveState(
      updatedUsers,
      matches,
      bets,
      depositRequests,
      updatedWithdrawals,
      friendRequests,
      updatedNotifs,
      updatedTxs
    );
  };

  // Declare Winner
  const declareWinner = (matchId: string, winnerTeam: "A" | "B"): { success: boolean; message: string } => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return { success: false, message: "Match not found" };
    if (match.status === "completed") return { success: false, message: "Match is already resolved" };

    const timeDiff = Date.now() - new Date(match.createdAt).getTime();
    const tenMinutes = 10 * 60 * 1000;
    if (timeDiff < tenMinutes) {
      const remainingSeconds = Math.ceil((tenMinutes - timeDiff) / 1000);
      const remMins = Math.floor(remainingSeconds / 60);
      const remSecs = remainingSeconds % 60;
      return { 
        success: false, 
        message: `Winner declaration is locked to avoid premature clicks. Unlocks in ${remMins}m ${remSecs}s.`
      };
    }

    const matchBets = bets.filter(b => b.matchId === matchId);
    if (matchBets.length === 0) {
      // Complete empty match
      const updatedMatches = matches.map(m => {
        if (m.id === matchId) {
          return { ...m, status: "completed" as const, winner: winnerTeam };
        }
        return m;
      });
      saveState(users, updatedMatches, bets, depositRequests, withdrawalRequests, friendRequests, notifications, walletTransactions);
      return { success: true, message: "Match resolved (No active bets existed)." };
    }

    // Calculations
    const totalPool = matchBets.reduce((acc, b) => acc + b.amount, 0);
    const feeDeducted = Math.round(totalPool * 0.05 * 100) / 100;
    const distributablePool = totalPool - feeDeducted;

    const winningBets = matchBets.filter(b => b.team === winnerTeam);
    const losingBets = matchBets.filter(b => b.team !== winnerTeam);
    const winningBetsSum = winningBets.reduce((acc, b) => acc + b.amount, 0);

    const updatedBets = bets.map(b => {
      if (b.matchId === matchId) {
        if (b.team === winnerTeam) {
          const payout = winningBetsSum > 0 ? Math.round((distributablePool * (b.amount / winningBetsSum)) * 100) / 100 : 0;
          return { ...b, status: "won" as const, payout };
        } else {
          return { ...b, status: "lost" as const, payout: 0 };
        }
      }
      return b;
    });

    const localMatchBetsWithPayout = updatedBets.filter(b => b.matchId === matchId);

    // Update users' wallets and stats
    const newTxs = [...walletTransactions];
    const newNotifs = [...notifications];

    const updatedUsers = users.map(u => {
      const userBets = localMatchBetsWithPayout.filter(b => b.userId === u.id);
      if (userBets.length === 0) return u;

      let balanceDelta = 0;
      let wonMoney = 0;
      let lostMoney = 0;
      let isWinner = false;
      let profitChange = 0;

      userBets.forEach(bet => {
        if (bet.status === "won") {
          balanceDelta += bet.payout;
          wonMoney += bet.payout;
          profitChange += (bet.payout - bet.amount);
          isWinner = true;

          // Wallet log for win
          newTxs.unshift({
            id: `TX-WIN-${bet.id}-${Date.now()}`,
            userId: u.id,
            type: "win_payout",
            amount: bet.payout,
            referenceId: matchId,
            details: `Payout won on ${winnerTeam === "A" ? match.teamA : match.teamB} (Bet: ₹${bet.amount})`,
            createdAt: new Date().toISOString()
          });

          // Notif to user
          newNotifs.unshift({
            id: `notif_win_${bet.id}_${Date.now()}`,
            userId: u.id,
            title: "👽 You Won a Pool!",
            message: `Congratulations! Your bet of ₹${bet.amount} on ${winnerTeam === "A" ? match.teamA : match.teamB} paid out ₹${bet.payout} (Net profit: ₹${Math.round((bet.payout - bet.amount)*100)/100})`,
            isRead: false,
            createdAt: new Date().toISOString()
          });
        } else {
          lostMoney += bet.amount;
          profitChange -= bet.amount;

          // Notif to user
          newNotifs.unshift({
            id: `notif_loss_${bet.id}_${Date.now()}`,
            userId: u.id,
            title: "📉 Bet Lost",
            message: `You lost your bet of ₹${bet.amount} on ${winnerTeam === "A" ? match.teamB : match.teamA} in match ${matchId}.`,
            isRead: false,
            createdAt: new Date().toISOString()
          });
        }
      });

      const wins = u.stats.totalWins + (isWinner ? 1 : 0);
      const losses = u.stats.totalLosses + (!isWinner ? 1 : 0);
      const newStreak = isWinner ? u.stats.streak + 1 : 0;

      // Badges check
      const badges = [...u.badges];
      if (newStreak >= 3 && !badges.includes("⚡ Streak Master")) {
        badges.push("⚡ Streak Master");
      }
      if (wonMoney - lostMoney > 1000 && !badges.includes("💎 High Roller")) {
        badges.push("💎 High Roller");
      }

      return {
        ...u,
        walletBalance: Math.round((u.walletBalance + balanceDelta) * 100) / 100,
        stats: {
          totalWins: wins,
          totalLosses: losses,
          totalMatches: u.stats.totalMatches + 1,
          netProfit: Math.round((u.stats.netProfit + profitChange) * 100) / 100,
          totalMoneyWon: Math.round((u.stats.totalMoneyWon + wonMoney) * 100) / 100,
          totalMoneyLost: Math.round((u.stats.totalMoneyLost + lostMoney) * 100) / 100,
          biggestWin: Math.max(u.stats.biggestWin, wonMoney),
          streak: newStreak
        },
        badges
      };
    });

    // Update match
    const updatedMatches = matches.map(m => {
      if (m.id === matchId) {
        return {
          ...m,
          status: "completed" as const,
          winner: winnerTeam,
          totalPool,
          feeDeducted,
          distributablePool
        };
      }
      return m;
    });

    // Add platform fee to admin transactions
    newTxs.unshift({
      id: `TX-FEE-${matchId}-${Date.now()}`,
      userId: "samandreas", // Admin
      type: "platform_fee",
      amount: feeDeducted,
      referenceId: matchId,
      details: `Collected 5% platform fee from Match Pool ${matchId}`,
      createdAt: new Date().toISOString()
    });

    saveState(
      updatedUsers,
      updatedMatches,
      updatedBets,
      depositRequests,
      withdrawalRequests,
      friendRequests,
      newNotifs,
      newTxs
    );

    return { success: true, message: "Match winner declared! Payouts successfully distributed." };
  };

  // Send Friend Request
  const sendFriendRequest = (friendUsername: string): { success: boolean; message: string } => {
    if (!activeUser) return { success: false, message: "No active user" };
    const friend = users.find(u => u.username.toLowerCase() === friendUsername.toLowerCase().trim());
    if (!friend) return { success: false, message: "User not found" };
    if (friend.id === activeUser.id) return { success: false, message: "You cannot add yourself" };
    if (activeUser.friends.includes(friend.id)) return { success: false, message: "You are already friends" };
    
    // Add immediately for simpler MVP flow, or create request
    // Let's create a pending request
    if (friendRequests.some(r => r.senderId === activeUser.id && r.receiverId === friend.id && r.status === "pending")) {
      return { success: false, message: "Request already pending" };
    }

    const newRequest: FriendRequest = {
      id: `REQ-${Date.now()}`,
      senderId: activeUser.id,
      senderName: activeUser.username,
      receiverId: friend.id,
      receiverName: friend.username,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    const updatedFriends = [newRequest, ...friendRequests];

    // Notification to receiver
    const updatedNotifs = [...notifications];
    updatedNotifs.unshift({
      id: `notif_friend_${newRequest.id}_${Date.now()}`,
      userId: friend.id,
      title: "🤝 Friend Request",
      message: `${activeUser.username} sent you a friend request. Accept in your Profile page.`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    saveState(
      users,
      matches,
      bets,
      depositRequests,
      withdrawalRequests,
      updatedFriends,
      updatedNotifs,
      walletTransactions
    );

    return { success: true, message: "Friend request sent to " + friend.username };
  };

  // Accept Friend Request
  const acceptFriendRequest = (requestId: string) => {
    const req = friendRequests.find(r => r.id === requestId);
    if (!req) return;

    // Update users friends lists
    const updatedUsers = users.map(u => {
      if (u.id === req.senderId) {
        return { ...u, friends: [...u.friends.filter(f => f !== req.receiverId), req.receiverId] };
      }
      if (u.id === req.receiverId) {
        return { ...u, friends: [...u.friends.filter(f => f !== req.senderId), req.senderId] };
      }
      return u;
    });

    // Update status
    const updatedRequests = friendRequests.map(r => {
      if (r.id === requestId) return { ...r, status: "accepted" as const };
      return r;
    });

    // Notify sender
    const updatedNotifs = [...notifications];
    updatedNotifs.unshift({
      id: `notif_friend_acc_${requestId}_${Date.now()}`,
      userId: req.senderId,
      title: "🤝 Friend Request Accepted",
      message: `${req.receiverName} accepted your friend request. You are now friends!`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    saveState(
      updatedUsers,
      matches,
      bets,
      depositRequests,
      withdrawalRequests,
      updatedRequests,
      updatedNotifs,
      walletTransactions
    );
  };

  // Reject Friend Request
  const rejectFriendRequest = (requestId: string) => {
    const updatedRequests = friendRequests.map(r => {
      if (r.id === requestId) return { ...r, status: "rejected" as const };
      return r;
    });

    saveState(
      users,
      matches,
      bets,
      depositRequests,
      withdrawalRequests,
      updatedRequests,
      notifications,
      walletTransactions
    );
  };

  // Clear Notifications
  const clearNotifications = () => {
    if (!activeUser) return;
    const updated = notifications.filter(n => n.userId !== activeUser.id);
    saveState(users, matches, bets, depositRequests, withdrawalRequests, friendRequests, updated, walletTransactions);
  };

  // Mark Notifications as Read
  const markNotificationsAsRead = () => {
    if (!activeUser) return;
    const updated = notifications.map(n => {
      if (n.userId === activeUser.id) {
        return { ...n, isRead: true };
      }
      return n;
    });
    saveState(users, matches, bets, depositRequests, withdrawalRequests, friendRequests, updated, walletTransactions);
  };

  // Bypass Winner Lock (Simulation Control)
  const bypassWinnerLock = (matchId: string) => {
    const updatedMatches = matches.map(m => {
      if (m.id === matchId) {
        // Set creation date back by 10 mins so lock is satisfied
        return { 
          ...m, 
          createdAt: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
          unlocksWinnerAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
          closesAt: new Date(Date.now() - 1 * 60 * 1000).toISOString() // Also close betting
        };
      }
      return m;
    });
    saveState(users, updatedMatches, bets, depositRequests, withdrawalRequests, friendRequests, notifications, walletTransactions);
  };

  // Add Funds directly (Admin helper / debug tool)
  const addFundsAdmin = (userId: string, amount: number) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return { ...u, walletBalance: u.walletBalance + amount };
      }
      return u;
    });

    const newTx: WalletTransaction = {
      id: `TX-ADMIN-${Date.now()}`,
      userId,
      type: "deposit",
      amount,
      referenceId: "ADMIN_DIRECT",
      details: "Admin directly credited balance (Simulation helper)",
      createdAt: new Date().toISOString()
    };
    const updatedTxs = [newTx, ...walletTransactions];

    saveState(
      updatedUsers,
      matches,
      bets,
      depositRequests,
      withdrawalRequests,
      friendRequests,
      notifications,
      updatedTxs
    );
  };

  return (
    <SimStateContext.Provider
      value={{
        users,
        activeUser,
        matches,
        bets,
        depositRequests,
        withdrawalRequests,
        friendRequests,
        notifications,
        walletTransactions,
        switchUser,
        createUser,
        createMatch,
        placeBet,
        requestDeposit,
        requestWithdrawal,
        approveDeposit,
        rejectDeposit,
        approveWithdrawal,
        rejectWithdrawal,
        declareWinner,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        clearNotifications,
        markNotificationsAsRead,
        bypassWinnerLock,
        addFundsAdmin
      }}
    >
      {initialized ? children : <div className="min-h-screen bg-dark-bg flex items-center justify-center text-primary font-mono animate-pulse">👽 LOADING CYBERNETIC CORES...</div>}
    </SimStateContext.Provider>
  );
}

export function useSimState() {
  const context = useContext(SimStateContext);
  if (context === undefined) {
    throw new Error("useSimState must be used within a SimStateProvider");
  }
  return context;
}
