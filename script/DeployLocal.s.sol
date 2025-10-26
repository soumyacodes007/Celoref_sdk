// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CeloReferEnhanced.sol";
import "../src/ReputationNFT.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Mock cUSD for local testing
contract MockCUSD is ERC20 {
    constructor() ERC20("Celo Dollar", "cUSD") {
        _mint(msg.sender, 1000000 * 10**18); // 1M cUSD
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract DeployLocalScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80));
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying contracts locally with account:", deployer);
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy mock cUSD
        MockCUSD cUSD = new MockCUSD();
        console.log("Mock cUSD deployed at:", address(cUSD));

        // Deploy CeloReferEnhanced contract
        CeloReferEnhanced celoRefer = new CeloReferEnhanced(
            address(cUSD),
            deployer, // Use deployer as attestation signer for testing
            deployer  // Use deployer as treasury for testing
        );
        
        console.log("CeloReferEnhanced deployed at:", address(celoRefer));

        // Deploy ReputationNFT contract
        ReputationNFT reputationNFT = new ReputationNFT(
            "CeloRefer Reputation",
            "CELOREFER",
            "https://api.celorefer.com/nft/",
            address(celoRefer)
        );
        
        console.log("ReputationNFT deployed at:", address(reputationNFT));

        // Setup for testing
        setupTestEnvironment(celoRefer, reputationNFT, cUSD, deployer);

        vm.stopBroadcast();

        // Log deployment summary
        logLocalDeploymentSummary(address(celoRefer), address(reputationNFT), address(cUSD));
    }

    function setupTestEnvironment(
        CeloReferEnhanced celoRefer, 
        ReputationNFT reputationNFT, 
        MockCUSD cUSD, 
        address deployer
    ) internal {
        console.log("Setting up test environment...");
        
        // Fund the contract with cUSD for rewards
        cUSD.transfer(address(celoRefer), 100000 * 10**18);
        
        // Authorize deployer as partner for testing
        celoRefer.authorizePartner(deployer, true);
        
        // Create test quests
        celoRefer.createQuest(
            "Beginner",
            "Make your first 3 referrals",
            3,
            50 * 10**18
        );
        
        celoRefer.createQuest(
            "Intermediate",
            "Reach 10 referrals",
            10,
            200 * 10**18
        );
        
        celoRefer.createQuest(
            "Advanced",
            "Become a power user with 25 referrals",
            25,
            1000 * 10**18
        );

        // Register genesis user
        celoRefer.registerGenesis("GENESIS");
        
        // Start a test season
        celoRefer.startSeason(
            30 days,           // duration
            5000 * 10**18,     // prize pool
            5                  // winners count
        );
        
        // Subscribe deployer as enterprise partner
        celoRefer.subscribePartner(deployer, 3, 365 days);
        
        // Mint a test reputation NFT for the deployer
        reputationNFT.mint(deployer);
        console.log("Test reputation NFT minted for deployer");
        
        console.log("Test environment setup complete");
    }

    function logLocalDeploymentSummary(address celoReferAddress, address reputationNFTAddress, address cUSDAddress) internal view {
        console.log("\n=== LOCAL DEPLOYMENT SUMMARY ===");
        console.log("CeloReferEnhanced:", celoReferAddress);
        console.log("ReputationNFT:", reputationNFTAddress);
        console.log("Mock cUSD:", cUSDAddress);
        console.log("Genesis Code: GENESIS");
        console.log("Test Season: Active (30 days)");
        console.log("Test Quests: 3 created");
        console.log("Test NFT: 1 minted for deployer");
        console.log("===============================\n");
        
        console.log("To interact with contracts:");
        console.log("1. Register users: celoRefer.register('GENESIS')");
        console.log("2. Record actions: celoRefer.recordActionAndDistributeRewards(user, amount)");
        console.log("3. Mint NFTs: reputationNFT.mint(user)");
        console.log("4. Check user stats: celoRefer.getUserInfo(user)");
    }
}