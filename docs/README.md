# CeloRefer SDK

A TypeScript SDK for interacting with the CeloRefer referral system on the Celo blockchain.

## Overview

CeloRefer is a decentralized referral system that allows users to earn rewards by referring others to participate in DeFi activities. This SDK provides a simple interface for integrating CeloRefer functionality into your applications.

## Features

- 🔐 **User Management** - Registration with referral codes and genesis user setup
- 🎖️ **Badge System** - Dynamic tier system (Bronze, Silver, Gold, Platinum) based on referrals
- 💰 **Dynamic Rewards** - Multi-level referral rewards with tier-based multipliers
- 🎯 **Quest System** - Gamified challenges with rewards for completing milestones
- 🏆 **Seasonal Competitions** - Time-based leaderboards with prize pools
- 🖼️ **Reputation NFTs** - On-chain achievement badges with dynamic metadata
- 🤝 **Partner Integration** - DApp subscription and authorization system
- 📊 **Leaderboard** - Real-time ranking and statistics
- 💵 **Token Operations** - cUSD balance checking and staking
- 🔗 **Referral Links** - Easy link generation for sharing

## Installation

```bash
npm install celorefer-sdk viem
```

Or with other package managers:

```bash
yarn add celorefer-sdk viem
pnpm add celorefer-sdk viem
bun add celorefer-sdk viem
```

## Usage

### Initialize the SDK

```typescript
import { CeloReferSDK } from 'celorefer-sdk';
import { createWalletClient, http } from 'viem';
import { celoAlfajores } from 'viem/chains';

// Create wallet client
const walletClient = createWalletClient({
  chain: celoAlfajores,
  transport: http(),
  account: yourAccount, // from privateKeyToAccount or browser wallet
});

// Initialize SDK (creates public client internally)
const sdk = CeloReferSDK.create(celoAlfajores, walletClient);
```

### Register a New User

```typescript
// Register with a referral code
const txHash = await sdk.registerUser('REF123ABC');
console.log('Registration transaction hash:', txHash);

// Register as genesis user (first user)
const genesisTxHash = await sdk.registerGenesisUser('MYCODE');
console.log('Genesis registration transaction hash:', genesisTxHash);
```

### Get User Information

```typescript
// Get user information
const userInfo = await sdk.getUserInfo('0x123...');
console.log('User info:', userInfo);

// Get badge tier
const badgeTier = await sdk.getBadgeTier('0x123...');
console.log('Badge tier:', badgeTier);

// Get referral code
const referralCode = await sdk.getReferralCode('0x123...');
console.log('Referral code:', referralCode);
```

### Staking Operations

```typescript
// Stake cUSD with referral registration
const stakeTxHash = await sdk.stake(1000000000000000000n, 'REF123ABC'); // 1 cUSD
console.log('Stake transaction hash:', stakeTxHash);

// Stake with genesis registration
const genesisStakeTxHash = await sdk.stakeWithGenesis(1000000000000000000n, 'MYCODE');
console.log('Genesis stake transaction hash:', genesisStakeTxHash);
```

### Quest System

```typescript
// List all active quests
const quests = await sdk.listActiveQuests();
console.log('Active quests:', quests);

// Get quest details
const quest = await sdk.getQuest(1);
console.log('Quest:', quest.name, quest.targetReferrals, quest.rewardAmount);

// Check user's progress on a quest
const progress = await sdk.getUserQuestProgress(userAddress, 1);
console.log('Progress:', progress.progress, 'Completed:', progress.completed);

// Claim quest reward
if (progress.completed) {
  const txHash = await sdk.claimQuestReward(1);
  console.log('Claimed quest reward:', txHash);
}
```

### Seasonal Competitions

```typescript
// Get current season
const season = await sdk.getCurrentSeason();
console.log('Prize pool:', season.totalPrizePool);
console.log('Winners count:', season.winnersCount);

// Get user's season stats
const seasonId = await sdk.getCurrentSeasonId();
const userStats = await sdk.getSeasonUserStats(seasonId, userAddress);
console.log('Season referrals:', userStats.referrals);
console.log('Season earnings:', userStats.earnings);

// List all seasons
const allSeasons = await sdk.listSeasons();
console.log('Total seasons:', allSeasons.length);
```

### Reputation NFT System

```typescript
// Mint reputation NFT
const txHash = await sdk.mintReputationNFT(userAddress);
console.log('NFT minted:', txHash);

// Check if user has NFT
const hasNFT = await sdk.hasReputationNFT(userAddress);
console.log('Has NFT:', hasNFT);

// Get NFT data
if (hasNFT) {
  const tokenId = await sdk.getTokenIdByUser(userAddress);
  const nftData = await sdk.getReputationNFTData(userAddress);
  console.log('NFT Tier:', nftData.tier);
  console.log('NFT Referrals:', nftData.referrals);
  console.log('NFT Earnings:', nftData.earnings);
  
  // Get token URI
  const tokenURI = await sdk.getNFTTokenURI(tokenId);
  console.log('Token URI:', tokenURI);
}

// Generate badge SVG
const svg = sdk.generateBadgeSVG(tier, referrals, earnings, rank);
// Use this SVG in your UI
```

### Partner Integration (for DApps)

```typescript
// Check if authorized partner
const isPartner = await sdk.isAuthorizedPartner(partnerAddress);

// Record user action and distribute rewards
if (isPartner) {
  const actionValue = 1000000000000000000n; // 1 cUSD
  const txHash = await sdk.recordAction(userAddress, actionValue);
  console.log('Action recorded:', txHash);
}

// Get partner subscription details
const subscription = await sdk.getPartnerSubscription(partnerAddress);
console.log('Subscription tier:', subscription.tier);
console.log('Expiry:', subscription.expiryTime);

// Get platform fee
const fee = await sdk.getPlatformFee();
console.log('Platform fee:', fee / 100, '%'); // Convert basis points to %

// Get treasury address
const treasury = await sdk.getTreasury();
console.log('Treasury:', treasury);
```

### Dynamic Reward Rates

```typescript
// Get user's reward rates (based on badge tier)
const rates = await sdk.getRewardRates(userAddress);
console.log('Level 1 rate:', sdk.bpsToPercentage(rates.level1Bps), '%');
console.log('Level 2 rate:', sdk.bpsToPercentage(rates.level2Bps), '%');

// Badge tiers get better rates:
// Bronze: 5% / 2%
// Silver: 6% / 2.5%
// Gold: 7% / 3%
// Platinum: 8% / 3.5%
```

### Leaderboard

```typescript
// Get top users (returns mock data for now)
const topUsers = await sdk.getTopUsers(10);
topUsers.forEach(user => {
  console.log(`Rank ${user.rank}: ${user.address}`);
  console.log(`Referrals: ${user.referralCount}, Earnings: ${user.totalEarnings}`);
});

// Get user's rank
const rank = await sdk.getUserRank(userAddress);
console.log('Your rank:', rank);

// Get leaderboard stats
const stats = await sdk.getLeaderboardStats();
console.log('Total users:', stats.totalUsers);
console.log('Total referrals:', stats.totalReferrals);
```

### Utility Functions

```typescript
// Generate referral link
const referralLink = sdk.generateReferralLink('REF123ABC');
console.log('Referral link:', referralLink);

// Get badge information
const badgeInfo = sdk.getBadgeInfo(2); // Gold badge
console.log('Badge info:', badgeInfo);

// Get contract statistics
const stats = await sdk.getContractStats();
console.log('Contract stats:', stats);

// Convert basis points to percentage
const percentage = sdk.bpsToPercentage(500n); // 5%
```

## Deployed Contracts

**Network:** Celo Sepolia Testnet (Chain ID: 11142220)

| Contract | Address |
|----------|----------|
| CeloReferEnhanced | `0xCCAddAC9Ac91D548ada36684dB2b3796A0c7Ea73` |
| ReputationNFT | `0xe667437aF0424Ee9cb983b755Ccccf218779E37b` |
| cUSD | `0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b` |

**Block Explorer:** https://alfajores.celoscan.io

## Badge System

The CeloRefer system includes a tiered badge system based on referral count:

| Tier | Name | Threshold | Level 1 Rate | Level 2 Rate |
|------|------|-----------|--------------|---------------|
| 0 | Bronze | 0+ | 5% | 2% |
| 1 | Silver | 5+ | 6% | 2.5% |
| 2 | Gold | 15+ | 7% | 3% |
| 3 | Platinum | 50+ | 8% | 3.5% |

**Benefits by Tier:**
- **Bronze**: Starting tier for new users
- **Silver**: Improved reward rates + quest access
- **Gold**: Premium features + priority support
- **Platinum**: Elite status + maximum benefits + exclusive perks

## Reward Structure

**Multi-Level Referral System:**
- **Level 1 (Direct Referrer)**: Dynamic rate based on badge tier (5-8%)
- **Level 2 (Grandparent)**: Dynamic rate based on badge tier (2-3.5%)

**Platform Fee:** 15% (goes to treasury for sustainability)

**Reward Distribution:**
1. User performs action (e.g., stakes 100 cUSD)
2. Platform fee deducted (15 cUSD to treasury)
3. Remaining 85 cUSD distributed:
   - Direct referrer gets their tier rate (e.g., 5% = 4.25 cUSD)
   - Level 2 referrer gets their tier rate (e.g., 2% = 1.7 cUSD)
   - Rest goes to user's activity