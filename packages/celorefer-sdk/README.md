# CeloRefer SDK

> **The first decentralized referral and reputation protocol SDK for Celo.**

A TypeScript SDK for building referral programs on the Celo blockchain. Track referrals on-chain, reward growth automatically, and turn every user into an ambassador.

[![npm version](https://img.shields.io/npm/v/celorefer-sdk.svg)](https://www.npmjs.com/package/celorefer-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📚 Documentation

**Full API Reference:** https://celoref.mintlify.app/api-reference/introduction

## 🚀 Quick Start

### Installation

```bash
npm install celorefer-sdk viem
```

### Basic Usage

```typescript
import { CeloReferSDK } from 'celorefer-sdk';
import { createWalletClient, http } from 'viem';
import { celoAlfajores } from 'viem/chains';

// Initialize SDK
const walletClient = createWalletClient({
  chain: celoAlfajores,
  transport: http(),
});

const sdk = CeloReferSDK.create(celoAlfajores, walletClient);

// Register a user
const txHash = await sdk.registerUser('REF123ABC');

// Get user info
const userInfo = await sdk.getUserInfo(address);
console.log(`Badge: ${userInfo.badgeTier}`);
console.log(`Referrals: ${userInfo.stats.referralCount}`);
```

---

## ✅ For Judges: How to Validate the SDK

We've created a comprehensive validation suite that tests all SDK functionality against live smart contracts on Celo Sepolia.

### Run Validation (30 seconds)

```bash
# Navigate to SDK directory
cd packages/celorefer-sdk

# Install dependencies
npm install

# Run comprehensive validation
npm run validate
```

### Expected Output

```
╔════════════════════════════════════════════════════════════╗
║      CELOREFER SDK - COMPREHENSIVE VALIDATION SUITE       ║
╚════════════════════════════════════════════════════════════╝

Network:       Celo Sepolia Testnet
Chain ID:      11142220

============================================================
  TEST SUMMARY
============================================================

✅ Passed:  31
❌ Failed:  0
⏭️  Skipped: 3
📋 Total:   34

🎉 ALL TESTS PASSED! SDK is production-ready!
```

### What Gets Tested

The validation script tests **all 11 core modules** with **34 test cases**:

1. **SDK Initialization** (2 tests)
   - SDK instance creation
   - Wallet client connection

2. **User Management** (5 tests)
   - Get user information
   - Registration status
   - User statistics
   - Referral code generation
   - Referral link creation

3. **Badge & Tier System** (5 tests)
   - Badge tier calculation (Bronze, Silver, Gold, Platinum)
   - All 4 tier information retrieval
   - Threshold verification

4. **Dynamic Reward Rates** (2 tests)
   - Tier-based reward rates (5-8% L1, 2-3.5% L2)
   - Basis points to percentage conversion

5. **Quest System** (4 tests)
   - Quest count (3 active quests)
   - List active quests
   - Quest details and progress tracking

6. **Seasonal Competitions** (3 tests)
   - Season count and ID retrieval
   - Season details and user stats

7. **NFT Reputation System** (4 tests)
   - NFT ownership checking
   - Total supply tracking
   - Badge SVG generation

8. **Partner Integration** (4 tests)
   - Partner authorization
   - Platform fee (15%)
   - Treasury address retrieval

9. **Token Operations** (1 test)
   - cUSD balance checking

10. **Leaderboard Functions** (3 tests)
    - Top users retrieval
    - User rank calculation
    - Aggregate statistics

11. **Contract Configuration** (1 test)
    - Contract addresses verification

### Live Contracts

All tests interact with **real deployed contracts** on Celo Sepolia:

| Contract | Address | Explorer |
|----------|---------|----------|
| CeloReferEnhanced | `0xCCAddAC9Ac91D548ada36684dB2b3796A0c7Ea73` | [View](https://alfajores.celoscan.io/address/0xCCAddAC9Ac91D548ada36684dB2b3796A0c7Ea73) |
| ReputationNFT | `0xe667437aF0424Ee9cb983b755Ccccf218779E37b` | [View](https://alfajores.celoscan.io/address/0xe667437aF0424Ee9cb983b755Ccccf218779E37b) |
| cUSD Token | `0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b` | [View](https://alfajores.celoscan.io/address/0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b) |

---

## 🎯 Core Features

### User Management
- User registration with referral codes
- Genesis user registration
- User profile and statistics retrieval
- Referral link generation

### Badge & Reputation System
- 4-tier badge system (Bronze, Silver, Gold, Platinum)
- Dynamic reward rates based on tier
- Tier progression based on referral count
- Reputation tracking

### Quest System
- Create and manage quests
- Track user quest progress
- Reward users for completing milestones
- Active/inactive quest management

### Seasonal Competitions
- Time-based competitive seasons
- Prize pool distribution
- Winner selection
- Season statistics tracking

### NFT Reputation
- Soulbound reputation NFTs
- Dynamic metadata reflecting user stats
- On-chain reputation verification
- SVG badge generation

### Partner Integration
- DApp authorization system
- Subscription management
- Custom reward configurations
- Platform fee management

### Leaderboard
- Global user rankings
- Top users retrieval
- Aggregate statistics
- Real-time updates

---

## 📖 API Reference

### Core Methods

```typescript
// User Management
await sdk.getUserInfo(address)
await sdk.registerUser(referralCode)
await sdk.getBadgeTier(address)
await sdk.getReferralCode(address)
sdk.generateReferralLink(code)

// Quest System
await sdk.listActiveQuests()
await sdk.getQuest(questId)
await sdk.getUserQuestProgress(address, questId)
await sdk.claimQuestReward(questId)

// NFT System
await sdk.mintReputationNFT(address)
await sdk.hasReputationNFT(address)
await sdk.getReputationNFTData(address)
sdk.generateBadgeSVG(tier, referrals, earnings, rank)

// Rewards
await sdk.getRewardRates(address)
sdk.bpsToPercentage(bps)

// And 60+ more methods...
```

**Complete API Documentation:** https://celoref.mintlify.app/api-reference/introduction

---

## 🛠 Development

### Build

```bash
npm run build
```

### Test

```bash
# Unit tests
npm test

# Live integration tests
npm run test:live

# Comprehensive validation
npm run validate
```

### Lint

```bash
npm run lint
```

---

## 📦 Package Details

- **Language:** TypeScript
- **Blockchain Library:** viem 2.38.4
- **Network:** Celo Sepolia (Testnet)
- **Build Tool:** tsup
- **Testing:** vitest + tsx
- **Bundle Size:** ~32 KB

---

## 🔗 Links

- **npm Package:** https://www.npmjs.com/package/celorefer-sdk
- **Documentation:** https://celoref.mintlify.app/api-reference/introduction
- **GitHub:** https://github.com/celorefer/celo-hackathon
- **Block Explorer:** https://alfajores.celoscan.io

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🤝 Support

- **GitHub Issues:** https://github.com/celorefer/celo-hackathon/issues
- **Documentation:** https://celoref.mintlify.app

---

**Built with ❤️ for the Celo ecosystem**
