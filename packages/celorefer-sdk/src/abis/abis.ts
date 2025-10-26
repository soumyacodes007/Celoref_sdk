// Contract addresses - Deployed on Celo Sepolia (Chain ID: 11142220)
export const CONTRACT_ADDRESSES = {
  CELO_REFER: '0xCCAddAC9Ac91D548ada36684dB2b3796A0c7Ea73' as `0x${string}`, // CeloReferEnhanced deployed contract
  REPUTATION_NFT: '0xe667437aF0424Ee9cb983b755Ccccf218779E37b' as `0x${string}`, // ReputationNFT deployed contract
  DEMO_DAPP: '0x3691d28DD7E25429e5Ee77Fa0eC3795Ab965904C' as `0x${string}`, // DemoDApp contract (if deployed)
  CUSD: '0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b' as `0x${string}`, // cUSD on Celo Sepolia testnet
  CUSD_ALFAJORES: '0x765DE816845861e75A25fCA122bb6898B8B1282a' as `0x${string}`, // cUSD on Alfajores testnet
} as const;

// Network configuration
export const CELO_ALFAJORES_CHAIN_ID = 44787;
export const CELO_SEPOLIA_CHAIN_ID = 11142220; // Actual deployment network

// CeloRefer ABI
export const CELO_REFER_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "_cUSD", "type": "address"}, {"internalType": "address", "name": "_attestationSigner", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{"internalType": "string", "name": "referralCode", "type": "string"}],
    "name": "register",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "userCode", "type": "string"}],
    "name": "registerGenesis",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserInfo",
    "outputs": [
      {"components": [{"internalType": "address", "name": "directReferrer", "type": "address"}, {"internalType": "address", "name": "parentReferrer", "type": "address"}, {"internalType": "string", "name": "referralCode", "type": "string"}, {"internalType": "bool", "name": "isRegistered", "type": "bool"}], "internalType": "struct CeloRefer.ReferralInfo", "name": "referralInfo", "type": "tuple"},
      {"components": [{"internalType": "uint256", "name": "referralCount", "type": "uint256"}, {"internalType": "uint256", "name": "totalEarned", "type": "uint256"}, {"internalType": "uint256", "name": "totalActions", "type": "uint256"}, {"internalType": "uint256", "name": "registrationTime", "type": "uint256"}], "internalType": "struct CeloRefer.UserStats", "name": "stats", "type": "tuple"},
      {"internalType": "uint8", "name": "badgeTier", "type": "uint8"},
      {"internalType": "bool", "name": "verified", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getBadgeTier",
    "outputs": [{"internalType": "uint8", "name": "tier", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "", "type": "string"}],
    "name": "codeToReferrer",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getRewardRates",
    "outputs": [
      {"internalType": "uint256", "name": "level1Bps", "type": "uint256"},
      {"internalType": "uint256", "name": "level2Bps", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}, {"internalType": "uint256", "name": "actionValue", "type": "uint256"}],
    "name": "recordActionAndDistributeRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "questId", "type": "uint256"}],
    "name": "quests",
    "outputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "description", "type": "string"},
      {"internalType": "uint256", "name": "targetReferrals", "type": "uint256"},
      {"internalType": "uint256", "name": "rewardAmount", "type": "uint256"},
      {"internalType": "bool", "name": "isActive", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}, {"internalType": "uint256", "name": "questId", "type": "uint256"}],
    "name": "getQuestProgress",
    "outputs": [
      {"components": [
        {"internalType": "bool", "name": "completed", "type": "bool"},
        {"internalType": "bool", "name": "claimed", "type": "bool"},
        {"internalType": "uint256", "name": "progress", "type": "uint256"}
      ], "internalType": "struct CeloReferEnhanced.UserQuestProgress", "name": "", "type": "tuple"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "questId", "type": "uint256"}],
    "name": "claimQuestReward",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "questCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrentSeason",
    "outputs": [
      {"components": [
        {"internalType": "uint256", "name": "startTime", "type": "uint256"},
        {"internalType": "uint256", "name": "endTime", "type": "uint256"},
        {"internalType": "uint256", "name": "totalPrizePool", "type": "uint256"},
        {"internalType": "uint256", "name": "winnersCount", "type": "uint256"},
        {"internalType": "bool", "name": "isActive", "type": "bool"},
        {"internalType": "bool", "name": "distributed", "type": "bool"}
      ], "internalType": "struct CeloReferEnhanced.Season", "name": "", "type": "tuple"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "seasonId", "type": "uint256"}, {"internalType": "address", "name": "user", "type": "address"}],
    "name": "getSeasonStats",
    "outputs": [
      {"components": [
        {"internalType": "uint256", "name": "referrals", "type": "uint256"},
        {"internalType": "uint256", "name": "earnings", "type": "uint256"}
      ], "internalType": "struct CeloReferEnhanced.SeasonUserStats", "name": "", "type": "tuple"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currentSeasonId",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "seasonCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "seasonId", "type": "uint256"}],
    "name": "seasons",
    "outputs": [
      {"internalType": "uint256", "name": "startTime", "type": "uint256"},
      {"internalType": "uint256", "name": "endTime", "type": "uint256"},
      {"internalType": "uint256", "name": "totalPrizePool", "type": "uint256"},
      {"internalType": "uint256", "name": "winnersCount", "type": "uint256"},
      {"internalType": "bool", "name": "isActive", "type": "bool"},
      {"internalType": "bool", "name": "distributed", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "partner", "type": "address"}],
    "name": "partnerSubscriptions",
    "outputs": [
      {"internalType": "bool", "name": "isSubscribed", "type": "bool"},
      {"internalType": "uint256", "name": "tier", "type": "uint256"},
      {"internalType": "uint256", "name": "expiryTime", "type": "uint256"},
      {"internalType": "uint256", "name": "customizationLevel", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "partner", "type": "address"}],
    "name": "authorizedPartners",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "platformFeeBps",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "treasury",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "userStats",
    "outputs": [
      {"internalType": "uint256", "name": "referralCount", "type": "uint256"},
      {"internalType": "uint256", "name": "totalEarned", "type": "uint256"},
      {"internalType": "uint256", "name": "totalActions", "type": "uint256"},
      {"internalType": "uint256", "name": "registrationTime", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// ReputationNFT ABI
export const REPUTATION_NFT_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "symbol", "type": "string"},
      {"internalType": "string", "name": "baseURI", "type": "string"},
      {"internalType": "address", "name": "_celoReferContract", "type": "address"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{"internalType": "address", "name": "to", "type": "address"}],
    "name": "mint",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getTokenIdByUser",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "getUserByTokenId",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "tokenURI",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "baseURI", "type": "string"}],
    "name": "setBaseURI",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_celoReferContract", "type": "address"}],
    "name": "setCeloReferContract",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrentTokenId",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "ownerOf",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// DemoDApp ABI
export const DEMO_DAPP_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "_cUSD", "type": "address"}, {"internalType": "address", "name": "_celoRefer", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}, {"internalType": "string", "name": "referralCode", "type": "string"}],
    "name": "stake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}, {"internalType": "string", "name": "userCode", "type": "string"}],
    "name": "stakeWithGenesis",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "unstake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserStakeInfo",
    "outputs": [
      {"internalType": "uint256", "name": "stakedAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "stakeTime", "type": "uint256"},
      {"internalType": "bool", "name": "isRegistered", "type": "bool"},
      {"internalType": "string", "name": "referralCode", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getContractStats",
    "outputs": [
      {"internalType": "uint256", "name": "_totalStaked", "type": "uint256"},
      {"internalType": "uint256", "name": "_minimumStake", "type": "uint256"},
      {"internalType": "uint256", "name": "contractBalance", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "userStakes",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// ERC20 ABI (for cUSD)
export const ERC20_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "spender", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}, {"internalType": "address", "name": "spender", "type": "address"}],
    "name": "allowance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;