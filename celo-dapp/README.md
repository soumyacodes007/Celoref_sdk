# CeloRefer Demo DApp

A decentralized Celo Native Growth Engine built on the Celo blockchain.

## 📁 Project Structure

```
celorefer-demo/
├── contracts/                    # Solidity Smart Contracts
│   ├── celoReferEnhanced.sol    # Main referral system contract
│   └── reputationNFT.sol        # Demo DApp staking contract
│
├── sdk/                          # JavaScript SDK
│   └── celoRefer-sdk.js         # SDK for interacting with contracts
│
├── frontend/                     # Frontend Application
│   ├── index.html               # Landing page (main entry point)
│   ├── test-nft.html            # NFT badge testing page
│   ├── clear-cache.html         # Cache clearing utility
│   │
│   ├── app/                     # Dashboard Application
│   │   └── index.html           # Main dashboard (at /app/)
│   │
│   ├── css/                     # Stylesheets
│   │   ├── landing.css          # Landing page styles
│   │   ├── app.css              # Dashboard styles
│   │   └── badge-nft-bw.css     # NFT badge styles
│   │
│   └── js/                      # JavaScript files
│       └── app.js               # Main application logic
│
└── README.md                    # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js and npm installed
- MetaMask browser extension
- Celo Alfajores testnet configured in MetaMask

### Contract Addresses (Alfajores Testnet)

- **CeloReferEnhanced**: `0x180a9b92653819d8b0e724af3320ffbe4b4170e8`
- **ReputationNFT (DemoDApp)**: `0xece0f83ff830fd139665349ba391e2ade19dced6`

### Running the Application

1. **Install http-server** (if not already installed):
   ```bash
   npm install -g http-server
   ```

2. **Navigate to the frontend directory**:
   ```bash
   cd celorefer-demo/frontend
   ```

3. **Start the server**:
   ```bash
   http-server -p 8080
   ```

4. **Open in browser**:
   ```
   http://localhost:8080
   ```

## 🎨 Features

### Landing Page
- Professional black & white design
- Animated NFT badge showcase (Bronze, Gold, Platinum)
- Features, benefits, and how-it-works sections
- Responsive navigation and footer

### Dashboard
- **Overview**: User stats, referral code, NFT badges
- **Badge Collection**: Dynamic NFT badges based on tier
- **Quests**: Active quests and rewards system
- **Seasons**: Seasonal competitions and leaderboards
- **Staking**: Stake cUSD tokens
- **Admin Panel**: Platform management (owner only)
- **Leaderboard**: Top 50 referrers ranked by count

### NFT Badges
- **Bronze Tier**: 0-9 referrals
- **Silver Tier**: 10-49 referrals
- **Gold Tier**: 50-99 referrals
- **Platinum Tier**: 100+ referrals

Each badge features:
- Unique animated geometric patterns
- Holographic shine effects
- Tier-specific gradients
- Edition tags (LIMITED, RARE, EXCLUSIVE)

## 🛠️ Technology Stack

- **Blockchain**: Celo (Alfajores Testnet)
- **Smart Contracts**: Solidity
- **Frontend**: HTML, CSS, JavaScript
- **Web3 Library**: ethers.js v6.7.0
- **Wallet**: MetaMask

## 📚 SDK Usage

The SDK provides easy access to all contract functions:

```javascript
// Initialize SDK
const sdk = new CeloReferSDK(
  '0x180a9b92653819d8b0e724af3320ffbe4b4170e8',
  '0xece0f83ff830fd139665349ba391e2ade19dced6',
  provider
);

// Register user
await sdk.registerUser(referralCode);

// Get user info
const userInfo = await sdk.getUserInfo(address);

// Get badge tier
const tier = await sdk.getBadgeTier(address);
```

## 🔗 Links

- **Documentation**: [https://celoref.mintlify.app/api-reference/introduction](https://celoref.mintlify.app/api-reference/introduction)
- **npm Package**: [https://www.npmjs.com/package/celorefer-sdk](https://www.npmjs.com/package/celorefer-sdk)

## 📝 License

MIT

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

Built with ❤️ on Celo

