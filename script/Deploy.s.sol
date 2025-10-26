// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CeloReferEnhanced.sol";
import "../src/ReputationNFT.sol";

contract DeployScript is Script {
    // Default cUSD addresses (Celo networks)
    address constant CELO_MAINNET_CUSD = 0x765DE816845861e75A25fCA122bb6898B8B1282a;
    address constant CELO_ALFAJORES_CUSD = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    // Deployment parameters
    address public cUSD;
    address public attestationSigner;
    address public treasury;
    string public nftBaseURI;
    string public nftName;
    string public nftSymbol;

    function setUp() public {
        // Network selection
        string memory network = vm.envOr("NETWORK", string("mainnet"));
        if (keccak256(bytes(network)) == keccak256(bytes("alfajores"))) {
            cUSD = vm.envOr("CELO_CUSD", CELO_ALFAJORES_CUSD);
        } else {
            cUSD = vm.envOr("CELO_CUSD", CELO_MAINNET_CUSD);
        }

        // Parameter setup
        attestationSigner = vm.envOr("ATTESTATION_SIGNER", address(0x1234567890123456789012345678901234567890));
        treasury = vm.envOr("TREASURY_ADDRESS", address(0x1111111111111111111111111111111111111111));
        nftBaseURI = vm.envOr("NFT_BASE_URI", string("https://api.celorefer.com/nft/"));
        nftName = vm.envOr("NFT_NAME", string("CeloRefer Reputation"));
        nftSymbol = vm.envOr("NFT_SYMBOL", string("CELOREFER"));
    }

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("======================================");
        console.log(" Deploying CeloReferEnhanced & ReputationNFT ");
        console.log("======================================");
        console.log("Deployer:", deployer);
        console.log("Network cUSD:", cUSD);
        console.log("Attestation Signer:", attestationSigner);
        console.log("Treasury:", treasury);
        console.log("NFT Base URI:", nftBaseURI);
        console.log("NFT Name:", nftName);
        console.log("NFT Symbol:", nftSymbol);
        console.log("--------------------------------------");

        vm.startBroadcast(deployerPrivateKey);

        // --- Deploy contracts ---
        CeloReferEnhanced celoRefer = new CeloReferEnhanced(
            cUSD,
            attestationSigner,
            treasury
        );
        console.log("CeloReferEnhanced deployed at:", address(celoRefer));

        ReputationNFT reputationNFT = new ReputationNFT(
            nftName,
            nftSymbol,
            nftBaseURI,
            address(celoRefer)
        );
        console.log("ReputationNFT deployed at:", address(reputationNFT));

        // --- Configure contracts ---
        setupInitialConfiguration(celoRefer, reputationNFT);

        vm.stopBroadcast();

        // --- Summary ---
        logDeploymentSummary(address(celoRefer), address(reputationNFT));
    }

    function setupInitialConfiguration(CeloReferEnhanced celoRefer, ReputationNFT reputationNFT) internal {
        console.log("Setting up initial configuration...");

        // Validate contracts
        require(address(celoRefer) != address(0), "Invalid CeloReferEnhanced address");
        require(address(reputationNFT) != address(0), "Invalid ReputationNFT address");

        // Create initial quests
        celoRefer.createQuest(
            "First Steps",
            "Refer your first 5 users to the platform",
            5,
            100 * 10**18 // 100 cUSD
        );

        celoRefer.createQuest(
            "Community Builder",
            "Refer 25 users and build your network",
            25,
            500 * 10**18 // 500 cUSD
        );

        celoRefer.createQuest(
            "Network Champion",
            "Reach 100 referrals and become a champion",
            100,
            2000 * 10**18 // 2000 cUSD
        );

        console.log("Initial quests created successfully");

        // Register deployer as genesis user
        celoRefer.registerGenesis("GENESIS");
        console.log("Genesis user registered with code: GENESIS");

        console.log("ReputationNFT ready for minting");
    }

    function logDeploymentSummary(address celoReferAddress, address reputationNFTAddress) internal view {
        console.log("\n=========== DEPLOYMENT SUMMARY ===========");
        console.log("CeloReferEnhanced:", celoReferAddress);
        console.log("ReputationNFT:", reputationNFTAddress);
        console.log("cUSD Token:", cUSD);
        console.log("Attestation Signer:", attestationSigner);
        console.log("Treasury:", treasury);
        console.log("NFT Base URI:", nftBaseURI);
        console.log("NFT Name:", nftName);
        console.log("NFT Symbol:", nftSymbol);
        console.log("Genesis Code: GENESIS");
        console.log("Initial Quests: 3 created");
        console.log("==========================================\n");

        console.log("Next Steps:");
        console.log("1. Fund CeloReferEnhanced with cUSD for rewards.");
        console.log("2. Authorize partners via: celoRefer.authorizePartner(partner, true).");
        console.log("3. Mint NFTs: reputationNFT.mint(userAddress).");
        console.log("4. Ensure metadata server is active at NFT Base URI.");
    }
}
