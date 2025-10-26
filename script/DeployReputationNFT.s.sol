// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/ReputationNFT.sol";

contract DeployReputationNFTScript is Script {
    // Deploy parameters
    address public celoReferContract;
    string public nftBaseURI;
    string public nftName;
    string public nftSymbol;

    function setUp() public {
        // Set deployment parameters from environment variables
        celoReferContract = vm.envOr("CELO_REFER_CONTRACT", address(0x0));
        nftBaseURI = vm.envOr("NFT_BASE_URI", string("https://api.celorefer.com/nft/"));
        nftName = vm.envOr("NFT_NAME", string("CeloRefer Reputation"));
        nftSymbol = vm.envOr("NFT_SYMBOL", string("CELOREFER"));
    }

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying ReputationNFT with account:", deployer);
        console.log("Account balance:", deployer.balance);
        
        // Validate required parameters
        require(celoReferContract != address(0), "CELO_REFER_CONTRACT not set");
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy ReputationNFT contract
        ReputationNFT reputationNFT = new ReputationNFT(
            nftName,
            nftSymbol,
            nftBaseURI,
            celoReferContract
        );
        
        console.log("ReputationNFT deployed at:", address(reputationNFT));

        // Initial setup (optional)
        setupInitialConfiguration(reputationNFT);

        vm.stopBroadcast();

        // Log deployment summary
        logDeploymentSummary(address(reputationNFT));
    }

    function setupInitialConfiguration(ReputationNFT reputationNFT) internal {
        console.log("Setting up initial ReputationNFT configuration...");
        
        // No initial setup required for ReputationNFT
        // The contract is ready to mint NFTs once deployed
        
        console.log("ReputationNFT setup complete");
    }

    function logDeploymentSummary(address reputationNFTAddress) internal view {
        console.log("\n=== REPUTATION NFT DEPLOYMENT SUMMARY ===");
        console.log("ReputationNFT:", reputationNFTAddress);
        console.log("NFT Name:", nftName);
        console.log("NFT Symbol:", nftSymbol);
        console.log("Base URI:", nftBaseURI);
        console.log("CeloRefer Contract:", celoReferContract);
        console.log("========================================\n");
        
        console.log("Next steps:");
        console.log("1. Verify contract on block explorer");
        console.log("2. Set up metadata server at base URI");
        console.log("3. Start minting NFTs for users: reputationNFT.mint(userAddress)");
    }
}