/**
 * CeloRefer SDK
 * SDK for interacting with CeloReferEnhanced and DemoDApp contracts on Celo Alfajores
 */

// Contract ABIs
const CELO_REFER_ABI = [
  "function register(string memory referralCode) external",
  "function registerGenesis(string memory userCode) external",
  "function recordActionAndDistributeRewards(address user, uint256 actionValue) external",
  "function createQuest(string memory name, string memory description, uint256 targetReferrals, uint256 rewardAmount) external",
  "function claimQuestReward(uint256 questId) external",
  "function startSeason(uint256 duration, uint256 prizePool, uint256 winnersCount) external",
  "function endSeason() external",
  "function distributeSeasonRewards(address[] calldata winners, uint256[] calldata amounts) external",
  "function subscribePartner(address partner, uint256 tier, uint256 duration) external",
  "function authorizePartner(address partner, bool authorized) external",
  "function setPlatformFee(uint256 _platformFeeBps) external",
  "function updateTreasury(address _newTreasury) external",
  "function emergencyWithdraw(uint256 amount) external",
  "function getBadgeTier(address user) public view returns (uint8 tier)",
  "function getRewardRates(address user) public view returns (uint256 level1Bps, uint256 level2Bps)",
  "function getUserInfo(address user) external view returns (tuple(address directReferrer, address parentReferrer, string referralCode, bool isRegistered) referralInfo, tuple(uint256 referralCount, uint256 totalEarned, uint256 totalActions, uint256 registrationTime) stats, uint8 badgeTier, bool verified)",
  "function getQuestProgress(address user, uint256 questId) external view returns (tuple(bool completed, bool claimed, uint256 progress))",
  "function getSeasonStats(uint256 seasonId, address user) external view returns (tuple(uint256 referrals, uint256 earnings))",
  "function getCurrentSeason() external view returns (tuple(uint256 startTime, uint256 endTime, uint256 totalPrizePool, uint256 winnersCount, bool isActive, bool distributed))",
  "function referralTree(address) external view returns (address directReferrer, address parentReferrer, string referralCode, bool isRegistered)",
  "function userStats(address) external view returns (uint256 referralCount, uint256 totalEarned, uint256 totalActions, uint256 registrationTime)",
  "function codeToReferrer(string) external view returns (address)",
  "function isVerified(address) external view returns (bool)",
  "function authorizedPartners(address) external view returns (bool)",
  "function quests(uint256) external view returns (string name, string description, uint256 targetReferrals, uint256 rewardAmount, bool isActive)",
  "function questCount() external view returns (uint256)",
  "function currentSeasonId() external view returns (uint256)",
  "function seasonCount() external view returns (uint256)",
  "function platformFeeBps() external view returns (uint256)",
  "function treasury() external view returns (address)",
  "function owner() external view returns (address)",
  "event UserRegistered(address indexed user, address indexed directReferrer, address indexed parentReferrer, string referralCode)",
  "event RewardDistributed(address indexed user, address indexed referrer, uint256 amount, uint8 level)",
  "event QuestCreated(uint256 indexed questId, string name, uint256 targetReferrals, uint256 rewardAmount)",
  "event QuestCompleted(address indexed user, uint256 indexed questId)",
  "event QuestRewardClaimed(address indexed user, uint256 indexed questId, uint256 amount)",
  "event SeasonStarted(uint256 indexed seasonId, uint256 startTime, uint256 endTime, uint256 prizePool)",
  "event SeasonEnded(uint256 indexed seasonId)"
];

const DEMO_DAPP_ABI = [
  "function stake(uint256 amount, string memory referralCode) external",
  "function stakeWithGenesis(uint256 amount, string memory userCode) external",
  "function unstake(uint256 amount) external",
  "function performAction(uint256 actionValue) external",
  "function getUserStakeInfo(address user) external view returns (uint256 stakedAmount, uint256 stakeTime, bool isRegistered, string memory referralCode)",
  "function getContractStats() external view returns (uint256 _totalStaked, uint256 _minimumStake, uint256 contractBalance)",
  "function userStakes(address) external view returns (uint256)",
  "function totalStaked() external view returns (uint256)",
  "function minimumStake() external view returns (uint256)",
  "event Staked(address indexed user, uint256 amount, string referralCode)",
  "event Unstaked(address indexed user, uint256 amount)"
];

const ERC20_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function name() external view returns (string)"
];

class CeloReferSDK {
  constructor(provider, signer) {
    this.provider = provider;
    this.signer = signer;
    
    // Contract addresses on Celo Alfajores
    this.CELO_REFER_ADDRESS = "0x180a9b92653819d8b0e724af3320ffbe4b4170e8";
    this.DEMO_DAPP_ADDRESS = "0xece0f83ff830fd139665349ba391e2ade19dced6";
    this.CUSD_ADDRESS = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"; // Alfajores cUSD
    
    // Initialize contracts
    if (signer) {
      this.celoRefer = new ethers.Contract(this.CELO_REFER_ADDRESS, CELO_REFER_ABI, signer);
      this.demoDApp = new ethers.Contract(this.DEMO_DAPP_ADDRESS, DEMO_DAPP_ABI, signer);
      this.cUSD = new ethers.Contract(this.CUSD_ADDRESS, ERC20_ABI, signer);
    } else if (provider) {
      this.celoRefer = new ethers.Contract(this.CELO_REFER_ADDRESS, CELO_REFER_ABI, provider);
      this.demoDApp = new ethers.Contract(this.DEMO_DAPP_ADDRESS, DEMO_DAPP_ABI, provider);
      this.cUSD = new ethers.Contract(this.CUSD_ADDRESS, ERC20_ABI, provider);
    }
  }

  // ========== CeloRefer Functions ==========
  
  /**
   * Register user with referral code
   */
  async register(referralCode) {
    const tx = await this.celoRefer.register(referralCode);
    return await tx.wait();
  }

  /**
   * Register as genesis user (first user)
   */
  async registerGenesis(userCode) {
    const tx = await this.celoRefer.registerGenesis(userCode);
    return await tx.wait();
  }

  /**
   * Get user information
   */
  async getUserInfo(address) {
    return await this.celoRefer.getUserInfo(address);
  }

  /**
   * Get user referral tree info
   */
  async getReferralTree(address) {
    return await this.celoRefer.referralTree(address);
  }

  /**
   * Get user stats
   */
  async getUserStats(address) {
    return await this.celoRefer.userStats(address);
  }

  /**
   * Get address from referral code
   */
  async getAddressFromCode(code) {
    return await this.celoRefer.codeToReferrer(code);
  }

  /**
   * Get badge tier for user
   */
  async getBadgeTier(address) {
    return await this.celoRefer.getBadgeTier(address);
  }

  /**
   * Get reward rates for user
   */
  async getRewardRates(address) {
    return await this.celoRefer.getRewardRates(address);
  }

  /**
   * Check if user is verified
   */
  async isVerified(address) {
    return await this.celoRefer.isVerified(address);
  }

  // ========== Quest Functions ==========

  /**
   * Get quest details
   */
  async getQuest(questId) {
    return await this.celoRefer.quests(questId);
  }

  /**
   * Get total quest count
   */
  async getQuestCount() {
    return await this.celoRefer.questCount();
  }

  /**
   * Get user quest progress
   */
  async getQuestProgress(address, questId) {
    return await this.celoRefer.getQuestProgress(address, questId);
  }

  /**
   * Claim quest reward
   */
  async claimQuestReward(questId) {
    const tx = await this.celoRefer.claimQuestReward(questId);
    return await tx.wait();
  }

  /**
   * Create new quest (owner only)
   */
  async createQuest(name, description, targetReferrals, rewardAmount) {
    const tx = await this.celoRefer.createQuest(name, description, targetReferrals, rewardAmount);
    return await tx.wait();
  }

  // ========== Season Functions ==========

  /**
   * Get current season info
   */
  async getCurrentSeason() {
    return await this.celoRefer.getCurrentSeason();
  }

  /**
   * Get current season ID
   */
  async getCurrentSeasonId() {
    return await this.celoRefer.currentSeasonId();
  }

  /**
   * Get season stats for user
   */
  async getSeasonStats(seasonId, address) {
    return await this.celoRefer.getSeasonStats(seasonId, address);
  }

  /**
   * Start new season (owner only)
   */
  async startSeason(duration, prizePool, winnersCount) {
    const tx = await this.celoRefer.startSeason(duration, prizePool, winnersCount);
    return await tx.wait();
  }

  /**
   * End current season (owner only)
   */
  async endSeason() {
    const tx = await this.celoRefer.endSeason();
    return await tx.wait();
  }

  /**
   * Distribute season rewards (owner only)
   */
  async distributeSeasonRewards(winners, amounts) {
    const tx = await this.celoRefer.distributeSeasonRewards(winners, amounts);
    return await tx.wait();
  }

  // ========== Admin Functions ==========

  /**
   * Authorize partner (owner only)
   */
  async authorizePartner(partner, authorized) {
    const tx = await this.celoRefer.authorizePartner(partner, authorized);
    return await tx.wait();
  }

  /**
   * Check if address is authorized partner
   */
  async isAuthorizedPartner(address) {
    return await this.celoRefer.authorizedPartners(address);
  }

  /**
   * Get platform fee
   */
  async getPlatformFee() {
    return await this.celoRefer.platformFeeBps();
  }

  /**
   * Set platform fee (owner only)
   */
  async setPlatformFee(feeBps) {
    const tx = await this.celoRefer.setPlatformFee(feeBps);
    return await tx.wait();
  }

  /**
   * Get treasury address
   */
  async getTreasury() {
    return await this.celoRefer.treasury();
  }

  /**
   * Get contract owner
   */
  async getOwner() {
    return await this.celoRefer.owner();
  }

  // ========== DemoDApp Functions ==========

  /**
   * Stake tokens
   */
  async stake(amount, referralCode) {
    const tx = await this.demoDApp.stake(amount, referralCode);
    return await tx.wait();
  }

  /**
   * Stake with genesis registration
   */
  async stakeWithGenesis(amount, userCode) {
    const tx = await this.demoDApp.stakeWithGenesis(amount, userCode);
    return await tx.wait();
  }

  /**
   * Unstake tokens
   */
  async unstake(amount) {
    const tx = await this.demoDApp.unstake(amount);
    return await tx.wait();
  }

  /**
   * Perform action
   */
  async performAction(actionValue) {
    const tx = await this.demoDApp.performAction(actionValue);
    return await tx.wait();
  }

  /**
   * Get user stake info
   */
  async getUserStakeInfo(address) {
    return await this.demoDApp.getUserStakeInfo(address);
  }

  /**
   * Get contract stats
   */
  async getContractStats() {
    return await this.demoDApp.getContractStats();
  }

  /**
   * Get minimum stake
   */
  async getMinimumStake() {
    return await this.demoDApp.minimumStake();
  }

  // ========== cUSD Token Functions ==========

  /**
   * Get cUSD balance
   */
  async getCUSDBalance(address) {
    return await this.cUSD.balanceOf(address);
  }

  /**
   * Approve cUSD spending
   */
  async approveCUSD(spender, amount) {
    const tx = await this.cUSD.approve(spender, amount);
    return await tx.wait();
  }

  /**
   * Get cUSD allowance
   */
  async getCUSDAllowance(owner, spender) {
    return await this.cUSD.allowance(owner, spender);
  }

  // ========== Utility Functions ==========

  /**
   * Format cUSD amount (handles 18 decimals)
   */
  formatCUSD(amount) {
    return ethers.formatUnits(amount, 18);
  }

  /**
   * Parse cUSD amount (handles 18 decimals)
   */
  parseCUSD(amount) {
    return ethers.parseUnits(amount.toString(), 18);
  }

  /**
   * Get badge name from tier
   */
  getBadgeName(tier) {
    const badges = ["Bronze", "Silver", "Gold", "Platinum"];
    return badges[tier] || "Unknown";
  }

  /**
   * Format reward rate (basis points to percentage)
   */
  formatRewardRate(bps) {
    return (Number(bps) / 100).toFixed(1) + "%";
  }

  /**
   * Listen to events
   */
  onEvent(eventName, callback) {
    if (this.celoRefer.filters[eventName]) {
      this.celoRefer.on(eventName, callback);
    } else if (this.demoDApp.filters[eventName]) {
      this.demoDApp.on(eventName, callback);
    }
  }

  /**
   * Remove event listener
   */
  removeListener(eventName, callback) {
    if (this.celoRefer.filters[eventName]) {
      this.celoRefer.off(eventName, callback);
    } else if (this.demoDApp.filters[eventName]) {
      this.demoDApp.off(eventName, callback);
    }
  }
}

// Export for use in browser or Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CeloReferSDK;
}

