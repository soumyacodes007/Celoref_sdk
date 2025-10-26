import { 
  createPublicClient, 
  createWalletClient, 
  http, 
  Chain,
  WalletClient,
  PublicClient,
  Transport,
  Account
} from 'viem';
import { 
  CELO_REFER_ABI, 
  REPUTATION_NFT_ABI,
  DEMO_DAPP_ABI, 
  ERC20_ABI,
  CONTRACT_ADDRESSES 
} from './abis';
import { Address } from './types';
import { 
  CeloReferConfig, 
  UserInfo, 
  UserStakeInfo, 
  ContractStats,
  BadgeTier,
  ReferralInfo,
  UserStats,
  ReputationNFTData,
  LeaderboardUser,
  LeaderboardStats,
  Quest,
  UserQuestProgress,
  Season,
  SeasonUserStats,
  PartnerSubscription,
  RewardRates
} from './types';

export class CeloReferSDK {
  private config: CeloReferConfig;
  private publicClient: PublicClient<Transport, Chain>;
  private walletClient?: WalletClient<Transport, Chain, Account>;

  constructor(
    config: CeloReferConfig,
    publicClient: PublicClient<Transport, Chain>,
    walletClient?: WalletClient<Transport, Chain, Account>
  ) {
    this.config = config;
    this.publicClient = publicClient;
    this.walletClient = walletClient;
  }

  /**
   * Create a new instance of the SDK with default configuration
   * @param chain The chain to use (default: Celo Alfajores)
   * @param walletClient Optional wallet client for write operations
   * @returns New CeloReferSDK instance
   */
  static create(
    chain: Chain,
    walletClient?: WalletClient<Transport, Chain, Account>
  ): CeloReferSDK {
    const publicClient = createPublicClient({
      chain,
      transport: http(),
    });

    const config: CeloReferConfig = {
      contractAddresses: CONTRACT_ADDRESSES,
    };

    return new CeloReferSDK(config, publicClient, walletClient);
  }

  /**
   * Get user information from the CeloRefer contract
   * @param userAddress The address of the user
   * @returns User information including referral info, stats, badge tier, and verification status
   */
  async getUserInfo(userAddress: Address): Promise<UserInfo> {
    const result = await this.publicClient.readContract({
      address: this.config.contractAddresses.CELO_REFER,
      abi: CELO_REFER_ABI,
      functionName: 'getUserInfo',
      args: [userAddress],
    }) as [ReferralInfo, UserStats, number, boolean];

    return {
      referralInfo: result[0],
      stats: result[1],
      badgeTier: result[2] as BadgeTier,
      verified: result[3],
    };
  }

  /**
   * Get the badge tier for a user
   * @param userAddress The address of the user
   * @returns The badge tier (0=Bronze, 1=Silver, 2=Gold, 3=Platinum)
   */
  async getBadgeTier(userAddress: Address): Promise<BadgeTier> {
    const result = await this.publicClient.readContract({
      address: this.config.contractAddresses.CELO_REFER,
      abi: CELO_REFER_ABI,
      functionName: 'getBadgeTier',
      args: [userAddress],
    }) as number;

    return result as BadgeTier;
  }

  /**
   * Register a new user with a referral code
   * @param referralCode The referral code to use for registration
   * @param account The account to register (uses connected wallet if not provided)
   */
  async registerUser(referralCode: string, account?: Address): Promise<`0x${string}`> {
    if (!this.walletClient) {
      throw new Error('Wallet client is required for write operations');
    }

    const [walletAddress] = await this.walletClient.getAddresses();
    const userAddress = account || walletAddress;

    const { request } = await this.publicClient.simulateContract({
      address: this.config.contractAddresses.CELO_REFER,
      abi: CELO_REFER_ABI,
      functionName: 'register',
      args: [referralCode],
      account: userAddress,
    });

    return await this.walletClient.writeContract(request);
  }

  /**
   * Register the first user (genesis user) without a referral code
   * @param userCode The referral code for the genesis user
   * @param account The account to register (uses connected wallet if not provided)
   */
  async registerGenesisUser(userCode: string, account?: Address): Promise<`0x${string}`> {
    if (!this.walletClient) {
      throw new Error('Wallet client is required for write operations');
    }

    const [walletAddress] = await this.walletClient.getAddresses();
    const userAddress = account || walletAddress;

    const { request } = await this.publicClient.simulateContract({
      address: this.config.contractAddresses.CELO_REFER,
      abi: CELO_REFER_ABI,
      functionName: 'registerGenesis',
      args: [userCode],
      account: userAddress,
    });

    return await this.walletClient.writeContract(request);
  }

  /**
   * Get user's staking information from the DemoDApp
   * @param userAddress The address of the user
   * @returns User's staking information
   */
  async getUserStakeInfo(userAddress: Address): Promise<UserStakeInfo> {
    const result = await this.publicClient.readContract({
      address: this.config.contractAddresses.DEMO_DAPP,
      abi: DEMO_DAPP_ABI,
      functionName: 'getUserStakeInfo',
      args: [userAddress],
    }) as [bigint, bigint, boolean, string];

    return {
      stakedAmount: result[0],
      stakeTime: result[1],
      isRegistered: result[2],
      referralCode: result[3],
    };
  }

  /**
   * Stake cUSD tokens with optional referral registration
   * @param amount Amount of cUSD to stake
   * @param referralCode Referral code (optional if already registered)
   * @param account The account to stake from (uses connected wallet if not provided)
   */
  async stake(amount: bigint, referralCode?: string, account?: Address): Promise<`0x${string}`> {
    if (!this.walletClient) {
      throw new Error('Wallet client is required for write operations');
    }

    const [walletAddress] = await this.walletClient.getAddresses();
    const userAddress = account || walletAddress;

    // First approve cUSD transfer if needed
    await this.approveCUSDCustom(amount, this.config.contractAddresses.DEMO_DAPP, userAddress);

    const { request } = await this.publicClient.simulateContract({
      address: this.config.contractAddresses.DEMO_DAPP,
      abi: DEMO_DAPP_ABI,
      functionName: 'stake',
      args: [amount, referralCode || ''],
      account: userAddress,
    });

    return await this.walletClient.writeContract(request);
  }

  /**
   * Stake with genesis registration (for first user)
   * @param amount Amount of cUSD to stake
   * @param userCode User's referral code
   * @param account The account to stake from (uses connected wallet if not provided)
   */
  async stakeWithGenesis(amount: bigint, userCode: string, account?: Address): Promise<`0x${string}`> {
    if (!this.walletClient) {
      throw new Error('Wallet client is required for write operations');
    }

    const [walletAddress] = await this.walletClient.getAddresses();
    const userAddress = account || walletAddress;

    // First approve cUSD transfer if needed
    await this.approveCUSDCustom(amount, this.config.contractAddresses.DEMO_DAPP, userAddress);

    const { request } = await this.publicClient.simulateContract({
      address: this.config.contractAddresses.DEMO_DAPP,
      abi: DEMO_DAPP_ABI,
      functionName: 'stakeWithGenesis',
      args: [amount, userCode],
      account: userAddress,
    });

    return await this.walletClient.writeContract(request);
  }

  /**
   * Approve cUSD transfer for a contract
   * @param amount Amount to approve
   * @param spender The contract that will spend the tokens
   * @param account The account to approve from (uses connected wallet if not provided)
   */
  async approveCUSDCustom(amount: bigint, spender: Address, account?: Address): Promise<`0x${string}`> {
    if (!this.walletClient) {
      throw new Error('Wallet client is required for write operations');
    }

    const [walletAddress] = await this.walletClient.getAddresses();
    const userAddress = account || walletAddress;

    const { request } = await this.publicClient.simulateContract({
      address: this.config.contractAddresses.CUSD,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spender, amount],
      account: userAddress,
    });

    return await this.walletClient.writeContract(request);
  }

  /**
   * Get cUSD balance for an account
   * @param account The account to check balance for
   * @returns The cUSD balance
   */
  async getCUSDBalance(account: Address): Promise<bigint> {
    return await this.publicClient.readContract({
      address: this.config.contractAddresses.CUSD,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [account],
    });
  }

  /**
   * Get contract statistics from the DemoDApp
   * @returns Contract statistics
   */
  async getContractStats(): Promise<ContractStats> {
    const result = await this.publicClient.readContract({
      address: this.config.contractAddresses.DEMO_DAPP,
      abi: DEMO_DAPP_ABI,
      functionName: 'getContractStats',
    }) as [bigint, bigint, bigint];

    return {
      totalStaked: result[0],
      minimumStake: result[1],
      contractBalance: result[2],
    };
  }

  /**
   * Get the referral code for a user
   * @param userAddress The address of the user
   * @returns The referral code
   */
  async getReferralCode(userAddress: Address): Promise<string> {
    const userInfo = await this.getUserInfo(userAddress);
    return userInfo.referralInfo.referralCode;
  }

  /**
   * Generate a referral link for a user
   * @param referralCode The referral code
   * @returns The referral link
   */
  generateReferralLink(referralCode: string): string {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}?ref=${referralCode}`;
    }
    return `https://your-domain.com?ref=${referralCode}`;
  }

  /**
   * Get badge information
   * @param tier The badge tier
   * @returns Badge information
   */
  getBadgeInfo(tier: BadgeTier): { name: string; color: string; description: string; referralThreshold: number } {
    const badges = [
      {
        name: 'Bronze',
        color: 'text-amber-600',
        description: 'Starting tier for new referrers',
        referralThreshold: 0,
      },
      {
        name: 'Silver',
        color: 'text-gray-400',
        description: 'For referrers with 5+ referrals',
        referralThreshold: 5,
      },
      {
        name: 'Gold',
        color: 'text-yellow-500',
        description: 'For referrers with 15+ referrals',
        referralThreshold: 15,
      },
      {
        name: 'Platinum',
        color: 'text-purple-500',
        description: 'Elite tier for referrers with 50+ referrals',
        referralThreshold: 50,
      },
    ];

    return badges[tier];
  }

  // NFT Reputation System Functions

  /**
   * Mint a reputation NFT for a user on Celo blockchain
   * @param userAddress The address of the user to mint the NFT for
   * @returns Transaction hash
   */
  async mintReputationNFT(userAddress: Address): Promise<`0x${string}`> {
    if (!this.walletClient) {
      throw new Error('Wallet client is required for write operations');
    }

    const [walletAddress] = await this.walletClient.getAddresses();
    
    const { request } = await this.publicClient.simulateContract({
      address: this.config.contractAddresses.REPUTATION_NFT,
      abi: REPUTATION_NFT_ABI,
      functionName: 'mint',
      args: [userAddress],
      account: walletAddress,
    });

    return await this.walletClient.writeContract(request);
  }

  /**
   * Fetch NFT metadata from blockchain
   * @param userAddress The address of the user
   * @returns NFT data including tier, referrals, earnings, and member since
   */
  async getReputationNFTData(userAddress: string): Promise<ReputationNFTData> {
    // Get user info from CeloRefer contract
    const userInfo = await this.getUserInfo(userAddress as Address);
    
    return {
      tier: userInfo.badgeTier,
      referrals: Number(userInfo.stats.referralCount),
      earnings: userInfo.stats.totalEarned.toString(),
      memberSince: Number(userInfo.stats.registrationTime),
    };
  }

  /**
   * Update NFT metadata after referral action
   * @param userAddress The address of the user
   * @param referrals Number of referrals
   * @param earnings Total earnings
   * @param tier Badge tier
   * @returns Transaction hash
   */
  async updateReputationNFT(userAddress: string, referrals: number, earnings: string, tier: number): Promise<`0x${string}`> {
    // Note: In the current contract implementation, the NFT metadata is dynamically generated
    // based on user data from the CeloRefer contract, so we don't need to manually update it.
    // This function is provided for compatibility with the requested interface.
    
    // In a real implementation, this would call a function on the ReputationNFT contract
    // that only the owner or the CeloRefer contract can call.
    
    // For now, we'll just return a mock transaction hash
    console.warn('updateReputationNFT is not implemented in the current contract version. NFT metadata is dynamically generated.');
    return '0x0000000000000000000000000000000000000000000000000000000000000000';
  }

  /**
   * Creates SVG badge image with dynamic stats
   * @param tier Badge tier (0=Bronze, 1=Silver, 2=Gold, 3=Platinum)
   * @param referrals Number of referrals
   * @param earnings Total earnings
   * @param rank User rank
   * @returns SVG as data URI
   */
  generateBadgeSVG(tier: number, referrals: number, earnings: string, rank: number): string {
    const tierNames = ['Bronze', 'Silver', 'Gold', 'Platinum'];
    const tierColors = ['#CD7F32', '#C0C0C0', '#FFD700', '#E5E4E2'];
    
    const svg = `
      <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${tierColors[tier] || '#808080'}" rx="20"/>
        <rect x="5" y="5" width="290" height="190" fill="white" rx="15" opacity="0.9"/>
        <text x="150" y="40" font-family="Arial" font-size="24" text-anchor="middle" fill="black">Reputation Badge</text>
        <text x="150" y="70" font-family="Arial" font-size="20" text-anchor="middle" fill="${tierColors[tier] || '#808080'}">${tierNames[tier] || 'Unknown'}</text>
        <text x="150" y="100" font-family="Arial" font-size="16" text-anchor="middle" fill="black">Referrals: ${referrals}</text>
        <text x="150" y="125" font-family="Arial" font-size="16" text-anchor="middle" fill="black">Earnings: ${earnings}</text>
        <text x="150" y="150" font-family="Arial" font-size="16" text-anchor="middle" fill="black">Rank: ${rank}</text>
      </svg>
    `;
    
    // Convert to base64 data URI
    const base64Svg = Buffer.from(svg.trim()).toString('base64');
    return `data:image/svg+xml;base64,${base64Svg}`;
  }

  // ============================================================
  // QUEST SYSTEM METHODS
  // ============================================================

  /**
   * Get details of a specific quest
   * @param questId The ID of the quest
   * @returns Quest details
   */
  async getQuest(questId: number): Promise<Quest> {
    const result = await this.publicClient.readContract({
      address: this.config.contractAddresses.CELO_REFER,
      abi: CELO_REFER_ABI,
      functionName: 'quests',
      args: [BigInt(questId)],
    }) as [string, string, bigint, bigint, boolean];

    return {
      name: result[0],
      description: result[1],
      targetReferrals: result[2],
      rewardAmount: result[3],
      isActive: result[4],
    };
  }

  /**
   * Get user's progress on a specific quest
   * @param userAddress The address of the user
   * @param questId The ID of the quest
   * @returns User's quest progress
   */
  async getUserQuestProgress(userAddress: Address, questId: number): Promise<UserQuestProgress> {
    const result = await this.publicClient.readContract({
      address: this.config.contractAddresses.CELO_REFER,
      abi: CELO_REFER_ABI,
      functionName: 'getQuestProgress',
      args: [userAddress, BigInt(questId)],
    }) as UserQuestProgress;

    return result;
  }

  /**
   * Claim reward for a completed quest
   * @param questId The ID of the quest to claim
   * @returns Transaction hash
   */
  async claimQuestReward(questId: number): Promise<`0x${string}`> {
    if (!this.walletClient) {
      throw new Error('Wallet client is required for write operations');
    }

    const [walletAddress] = await this.walletClient.getAddresses();

    const { request } = await this.publicClient.simulateContract({
      address: this.config.contractAddresses.CELO_REFER,
      abi: CELO_REFER_ABI,
      functionName: 'claimQuestReward',
      args: [BigInt(questId)],
      account: walletAddress,
    });

    return await this.walletClient.writeContract(request);
  }

  /**
   * List all active quests
   * @returns Array of active quests with their IDs
   */
  async listActiveQuests(): Promise<Array<Quest & { id: number }>> {
    const questCount = await this.publicClient.readContract({
      address: this.config.contractAddresses.CELO_REFER,
      abi: CELO_REFER_ABI,
      functionName: 'questCount',
    }) as bigint;

    const quests: Array<Quest & { id: number }> = [];
    
    for (let i = 1; i <= Number(questCount); i++) {
      const quest = await this.getQuest(i);
      if (quest.isActive) {
        quests.push({ ...quest, id: i });
      }
    }

    return quests;
  }

  /**
   * Get total quest count
   * @returns Total number of quests created
   */
  async getQuestCount(): Promise<number> {
    const count = await this.publicClient.readContract({
      address: this.config.contractAddresses.CELO_REFER,
      abi: CELO_REFER_ABI,
      functionName: 'questCount',
    }) as bigint;

    return Number(count);
  }

  // ============================================================
  // SEASON/COMPETITION METHODS
  // ============================================================

  /**
   * Get details of the current active season
   * @returns Current season details
   */
  async getCurrentSeason(): Promise<Season> {
    const result = await this.publicClient.readContract({
      address: this.config.contractAddresses.CELO_REFER,
      abi: CELO_REFER_ABI,
      functionName: 'getCurrentSeason',
    }) as Season;

    return result;
  }

  /**
   * Get a user's statistics for a specific season
   * @param seasonId The ID of the season
   * @param userAddress The address of the user
   * @returns User's season statistics
   */
  async getSeasonUserStats(seasonId: number, userAddress: Address): Promise<SeasonUserStats> {
    const result = await this.publicClient.readContract({
      address: this.config.contractAddresses.CELO_REFER,
      abi: CELO_REFER_ABI,
      functionName: 'getSeasonStats',
      args: [BigInt(seasonId), userAddress],
    }) as SeasonUserStats;

    return result;
  }

  /**
   * Get details of a specific season
   * @param seasonId The ID of the season
   * @returns Season details
   */
  async getSeason(seasonId: number): Promise<Season> {
    const result = await this.publicClient.readContract({
      address: this.config.contractAddresses.CELO_REFER,
      abi: CELO_REFER_ABI,
      functionName: 'seasons',
      args: [BigInt(seasonId)],
    }) as [bigint, bigint, bigint, bigint, boolean, boolean];

    return {
      startTime: result[0],
      endTime: result[1],
      totalPrizePool: result[2],
      winnersCount: result[3],
      isActive: result[4],
      distributed: result[5],
    };
  }

  /**
   * Get the current season ID
   * @returns Current season ID
   */
  async getCurrentSeasonId(): Promise<number> {
    const id = await this.publicClient.readContract({
      address: this.config.contractAddresses.CELO_REFER,
      abi: CELO_REFER_ABI,
      functionName: 'currentSeasonId',
    }) as bigint;

    return Number(id);
  }

  /**
   * Get total season count
   * @returns Total number of seasons
   */
  async getSeasonCount(): Promise<number> {
    const count = await this.publicClient.readContract({
      address: this.config.contractAddresses.CELO_REFER,
      abi: CELO_REFER_ABI,
      functionName: 'seasonCount',
    }) as bigint;

    return Number(count);
  }

  /**
   * List all seasons
   * @returns Array of all seasons with their IDs
   */
  async listSeasons(): Promise<Array<Season & { id: number }>> {
    const seasonCount = await this.getSeasonCount();
    const seasons: Array<Season & { id: number }> = [];
    
    for (let i = 1; i <= seasonCount; i++) {
      const season = await this.getSeason(i);
      seasons.push({ ...season, id: i });
    }

    return seasons;
  }

  // ============================================================
  // PARTNER/DAPP INTEGRATION METHODS
  // ============================================================

  /**
   * Record an action and distribute rewards (for authorized partners)
   * @param userAddress The user who performed the action
   * @param actionValue The value of the action in cUSD (as bigint)
   * @returns Transaction hash
   */
  async recordAction(userAddress: Address, actionValue: bigint): Promise<`0x${string}`> {
    if (!this.walletClient) {
      throw new Error('Wallet client is required for write operations');
    }

    const [walletAddress] = await this.walletClient.getAddresses();

    const { request } = await this.publicClient.simulateContract({
      address: this.config.contractAddresses.CELO_REFER,
      abi: CELO_REFER_ABI,
      functionName: 'recordActionAndDistributeRewards',
      args: [userAddress, actionValue],
      account: walletAddress,
    });

    return await this.walletClient.writeContract(request);
  }

  /**
   * Check if an address is an authorized partner
   * @param partnerAddress The address to check
   * @returns True if authorized, false otherwise
   */
  async isAuthorizedPartner(partnerAddress: Address): Promise<boolean> {
    const result = await this.publicClient.readContract({
      address: this.config.contractAddresses.CELO_REFER,
      abi: CELO_REFER_ABI,
      functionName: 'authorizedPartners',
      args: [partnerAddress],
    }) as boolean;

    return result;
  }

  /**
   * Get partner subscription details
   * @param partnerAddress The partner's address
   * @returns Partner subscription information
   */
  async getPartnerSubscription(partnerAddress: Address): Promise<PartnerSubscription> {
    const result = await this.publicClient.readContract({
      address: this.config.contractAddresses.CELO_REFER,
      abi: CELO_REFER_ABI,
      functionName: 'partnerSubscriptions',
      args: [partnerAddress],
    }) as [boolean, bigint, bigint, bigint];

    return {
      isSubscribed: result[0],
      tier: result[1],
      expiryTime: result[2],
      customizationLevel: result[3],
    };
  }

  /**
   * Get platform fee in basis points
   * @returns Platform fee (e.g., 1500 = 15%)
   */
  async getPlatformFee(): Promise<number> {
    const fee = await this.publicClient.readContract({
      address: this.config.contractAddresses.CELO_REFER,
      abi: CELO_REFER_ABI,
      functionName: 'platformFeeBps',
    }) as bigint;

    return Number(fee);
  }

  /**
   * Get treasury address
   * @returns Treasury address
   */
  async getTreasury(): Promise<Address> {
    const address = await this.publicClient.readContract({
      address: this.config.contractAddresses.CELO_REFER,
      abi: CELO_REFER_ABI,
      functionName: 'treasury',
    }) as Address;

    return address;
  }

  // ============================================================
  // REWARD RATES METHODS
  // ============================================================

  /**
   * Get dynamic reward rates for a user based on their badge tier
   * @param userAddress The user's address
   * @returns Reward rates in basis points
   */
  async getRewardRates(userAddress: Address): Promise<RewardRates> {
    const result = await this.publicClient.readContract({
      address: this.config.contractAddresses.CELO_REFER,
      abi: CELO_REFER_ABI,
      functionName: 'getRewardRates',
      args: [userAddress],
    }) as [bigint, bigint];

    return {
      level1Bps: result[0],
      level2Bps: result[1],
    };
  }

  /**
   * Calculate reward percentages from basis points
   * @param bps Basis points (e.g., 500 = 5%)
   * @returns Percentage as a number
   */
  bpsToPercentage(bps: bigint): number {
    return Number(bps) / 100;
  }

  /**
   * Get user stats directly from contract
   * @param userAddress The user's address
   * @returns User statistics
   */
  async getUserStats(userAddress: Address): Promise<UserStats> {
    const result = await this.publicClient.readContract({
      address: this.config.contractAddresses.CELO_REFER,
      abi: CELO_REFER_ABI,
      functionName: 'userStats',
      args: [userAddress],
    }) as [bigint, bigint, bigint, bigint];

    return {
      referralCount: result[0],
      totalEarned: result[1],
      totalActions: result[2],
      registrationTime: result[3],
    };
  }

  // ============================================================
  // NFT REPUTATION METHODS (UPDATED)
  // ============================================================

  /**
   * Check if a user has a reputation NFT
   * @param userAddress The user's address
   * @returns True if user has NFT, false otherwise
   */
  async hasReputationNFT(userAddress: Address): Promise<boolean> {
    const tokenId = await this.publicClient.readContract({
      address: this.config.contractAddresses.REPUTATION_NFT,
      abi: REPUTATION_NFT_ABI,
      functionName: 'getTokenIdByUser',
      args: [userAddress],
    }) as bigint;

    return tokenId > 0n;
  }

  /**
   * Get token ID for a user
   * @param userAddress The user's address
   * @returns Token ID (0 if user doesn't have NFT)
   */
  async getTokenIdByUser(userAddress: Address): Promise<number> {
    const tokenId = await this.publicClient.readContract({
      address: this.config.contractAddresses.REPUTATION_NFT,
      abi: REPUTATION_NFT_ABI,
      functionName: 'getTokenIdByUser',
      args: [userAddress],
    }) as bigint;

    return Number(tokenId);
  }

  /**
   * Get NFT metadata URI
   * @param tokenId The token ID
   * @returns Metadata URI
   */
  async getNFTTokenURI(tokenId: number): Promise<string> {
    const uri = await this.publicClient.readContract({
      address: this.config.contractAddresses.REPUTATION_NFT,
      abi: REPUTATION_NFT_ABI,
      functionName: 'tokenURI',
      args: [BigInt(tokenId)],
    }) as string;

    return uri;
  }

  /**
   * Get total supply of reputation NFTs
   * @returns Total NFT supply
   */
  async getNFTTotalSupply(): Promise<number> {
    const supply = await this.publicClient.readContract({
      address: this.config.contractAddresses.REPUTATION_NFT,
      abi: REPUTATION_NFT_ABI,
      functionName: 'totalSupply',
    }) as bigint;

    return Number(supply);
  }

  // Leaderboard Functions

  /**
   * Fetches top users sorted by referral count
   * @param limit Number of users to fetch (default: 100)
   * @returns Array of top users with their stats
   * NOTE: This is a simplified implementation for hackathon purposes.
   * In production, this would use a subgraph or indexer.
   */
  async getTopUsers(limit: number = 100): Promise<LeaderboardUser[]> {
    // Note: This is a simplified implementation for hackathon purposes.
    // In a real implementation, you would need to iterate through all users
    // or use an indexer/subgraph to efficiently fetch leaderboard data.
    
    console.warn('getTopUsers is a simplified implementation for hackathon. In production, use a subgraph or indexer.');
    
    // Return mock data for demonstration
    return [
      {
        rank: 1,
        address: '0x1234567890123456789012345678901234567890',
        referralCount: 150,
        totalEarnings: '150000000000000000000', // 150 cUSD
        badgeTier: 3, // Platinum
        referralCode: 'REF1234'
      },
      {
        rank: 2,
        address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        referralCount: 120,
        totalEarnings: '120000000000000000000', // 120 cUSD
        badgeTier: 3, // Platinum
        referralCode: 'REF5678'
      },
      {
        rank: 3,
        address: '0x9876543210987654321098765432109876543210',
        referralCount: 95,
        totalEarnings: '95000000000000000000', // 95 cUSD
        badgeTier: 2, // Gold
        referralCode: 'REF9012'
      }
    ];
  }

  /**
   * Returns the user's rank on the global leaderboard
   * @param userAddress The address of the user
   * @returns User's rank or -1 if not found
   */
  async getUserRank(userAddress: string): Promise<number> {
    // Note: This is a simplified implementation for hackathon purposes.
    // In a real implementation, you would query an indexer or subgraph.
    
    console.warn('getUserRank is a simplified implementation for hackathon. In production, use a subgraph or indexer.');
    
    // Return mock data for demonstration
    if (userAddress === '0x1234567890123456789012345678901234567890') {
      return 1;
    } else if (userAddress === '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd') {
      return 2;
    } else if (userAddress === '0x9876543210987654321098765432109876543210') {
      return 3;
    }
    
    return -1; // User not found
  }

  /**
   * Returns aggregate statistics
   * @returns Leaderboard statistics
   */
  async getLeaderboardStats(): Promise<LeaderboardStats> {
    // Note: This is a simplified implementation for hackathon purposes.
    // In a real implementation, you would query an indexer or subgraph.
    
    console.warn('getLeaderboardStats is a simplified implementation for hackathon. In production, use a subgraph or indexer.');
    
    return {
      totalUsers: 1250,
      totalReferrals: '25000',
      totalEarnings: '5000000000000000000000' // 5000 cUSD
    };
  }
}