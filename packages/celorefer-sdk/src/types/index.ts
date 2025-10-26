export type Address = `0x${string}`;

export type BadgeTier = 0 | 1 | 2 | 3; // Bronze, Silver, Gold, Platinum

export interface ReferralInfo {
  directReferrer: Address;
  parentReferrer: Address;
  referralCode: string;
  isRegistered: boolean;
}

export interface UserStats {
  referralCount: bigint;
  totalEarned: bigint;
  totalActions: bigint;
  registrationTime: bigint;
}

export interface ContractAddresses {
  CELO_REFER: Address;
  REPUTATION_NFT: Address;
  DEMO_DAPP: Address;
  CUSD: Address;
}

export interface CeloReferConfig {
  contractAddresses: ContractAddresses;
  chainId?: number;
}

export interface UserInfo {
  referralInfo: ReferralInfo;
  stats: UserStats;
  badgeTier: BadgeTier;
  verified: boolean;
}

export interface UserStakeInfo {
  stakedAmount: bigint;
  stakeTime: bigint;
  isRegistered: boolean;
  referralCode: string;
}

export interface ContractStats {
  totalStaked: bigint;
  minimumStake: bigint;
  contractBalance: bigint;
}

export interface BadgeInfo {
  name: string;
  color: string;
  description: string;
  referralThreshold: number;
}

export interface ReferralLink {
  code: string;
  url: string;
  qrCode?: string;
}

// NFT Reputation System Types
export interface ReputationNFTData {
  tier: number;
  referrals: number;
  earnings: string;
  memberSince: number;
}

// Leaderboard Types
export interface LeaderboardUser {
  rank: number;
  address: string;
  referralCount: number;
  totalEarnings: string;
  badgeTier: number;
  referralCode: string;
}

export interface LeaderboardStats {
  totalUsers: number;
  totalReferrals: string;
  totalEarnings: string;
}

// Quest System Types
export interface Quest {
  name: string;
  description: string;
  targetReferrals: bigint;
  rewardAmount: bigint;
  isActive: boolean;
}

export interface UserQuestProgress {
  completed: boolean;
  claimed: boolean;
  progress: bigint;
}

// Season/Competition Types
export interface Season {
  startTime: bigint;
  endTime: bigint;
  totalPrizePool: bigint;
  winnersCount: bigint;
  isActive: boolean;
  distributed: boolean;
}

export interface SeasonUserStats {
  referrals: bigint;
  earnings: bigint;
}

// Partner Subscription Types
export interface PartnerSubscription {
  isSubscribed: boolean;
  tier: bigint;
  expiryTime: bigint;
  customizationLevel: bigint;
}

// Reward Rates
export interface RewardRates {
  level1Bps: bigint; // Level 1 reward in basis points
  level2Bps: bigint; // Level 2 reward in basis points
}
