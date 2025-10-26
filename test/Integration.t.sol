// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../src/CeloReferEnhanced.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Mock cUSD token for testing
contract MockCUSD is ERC20 {
    constructor() ERC20("Celo Dollar", "cUSD") {
        _mint(msg.sender, 1000000 * 10**18);
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract IntegrationTest is Test {
    CeloReferEnhanced public celoRefer;
    MockCUSD public cUSD;
    
    address public owner;
    address public treasury;
    address public partner;
    
    // Test users
    address[] public users;
    
    function setUp() public {
        owner = address(this);
        treasury = makeAddr("treasury");
        partner = makeAddr("partner");
        
        // Create test users
        for (uint i = 0; i < 100; i++) {
            users.push(makeAddr(string(abi.encodePacked("user", vm.toString(i)))));
        }
        
        // Deploy contracts
        cUSD = new MockCUSD();
        
        celoRefer = new CeloReferEnhanced(
            address(cUSD),
            owner,
            treasury
        );
        
        // Setup
        celoRefer.authorizePartner(partner, true);
        cUSD.transfer(address(celoRefer), 500000 * 10**18);
        cUSD.mint(partner, 100000 * 10**18);
        
        vm.prank(partner);
        cUSD.approve(address(celoRefer), type(uint256).max);
    }
    
    function testFullReferralFlow() public {
        console.log("=== Testing Full Referral Flow ===");
        
        // 1. Register genesis user
        vm.prank(users[0]);
        celoRefer.registerGenesis("GENESIS");
        console.log("Genesis user registered");
        
        // Verify genesis registration
        (, , string memory code, bool isReg) = celoRefer.referralTree(users[0]);
        assertTrue(isReg);
        assertEq(code, "GENESIS");
        
        // 2. Build referral network (3 levels deep, 10 users per level)
        string memory currentCode = "GENESIS";
        uint256 userIndex = 1;
        
        // Level 1: 10 direct referrals to genesis
        for (uint i = 0; i < 10; i++) {
            vm.prank(users[userIndex]);
            celoRefer.register(currentCode);
            
            // Verify each registration
            (, , , bool registered) = celoRefer.referralTree(users[userIndex]);
            assertTrue(registered);
            
            userIndex++;
        }
        
        // Level 2: Each level 1 user gets 5 referrals
        for (uint i = 1; i <= 10; i++) {
            (, , string memory level1Code, ) = celoRefer.referralTree(users[i]);
            for (uint j = 0; j < 5; j++) {
                vm.prank(users[userIndex]);
                celoRefer.register(level1Code);
                userIndex++;
            }
        }
        
        console.log("Referral network built with users:", userIndex);
        
        // 3. Verify referral counts
        (uint256 genesisReferrals, , , ) = celoRefer.userStats(users[0]);
        assertEq(genesisReferrals, 10);
        console.log("Genesis user referrals verified");
        
        // 4. Test badge progression
        uint8 genesisTier = celoRefer.getBadgeTier(users[0]);
        console.log("Genesis user badge tier verified");
        assertTrue(genesisTier >= 1); // Should be at least Silver
        
        // 5. Record actions and test reward distribution
        uint256 initialTreasuryBalance = cUSD.balanceOf(treasury);
        uint256 initialGenesisBalance = cUSD.balanceOf(users[0]);
        uint256 initialLevel1Balance = cUSD.balanceOf(users[1]);
        
        // Record action for a level 2 user
        uint256 actionValue = 1000 * 10**18;
        vm.prank(partner);
        celoRefer.recordActionAndDistributeRewards(users[11], actionValue);
        
        // Verify platform fee
        uint256 platformFee = (actionValue * 1500) / 10000;
        assertEq(cUSD.balanceOf(treasury) - initialTreasuryBalance, platformFee);
        
        // Verify rewards based on badge tiers
        (uint256 level1Rate, uint256 level2Rate) = celoRefer.getRewardRates(users[1]);
        uint256 remainingValue = actionValue - platformFee;
        uint256 expectedLevel1Reward = (remainingValue * level1Rate) / 10000;
        uint256 expectedLevel2Reward = (remainingValue * level2Rate) / 10000;
        
        assertEq(cUSD.balanceOf(users[1]) - initialLevel1Balance, expectedLevel1Reward);
        assertEq(cUSD.balanceOf(users[0]) - initialGenesisBalance, expectedLevel2Reward);
        
        console.log("Rewards distributed successfully");
    }
    
    function testQuestSystemIntegration() public {
        console.log("=== Testing Quest System Integration ===");
        
        // Create quests
        celoRefer.createQuest("Starter", "Get 5 referrals", 5, 100 * 10**18);
        celoRefer.createQuest("Builder", "Get 15 referrals", 15, 500 * 10**18);
        celoRefer.createQuest("Champion", "Get 50 referrals", 50, 2000 * 10**18);
        
        // Register genesis and build network
        vm.prank(users[0]);
        celoRefer.registerGenesis("GENESIS");
        
        // Add referrals progressively and test quest completion
        for (uint i = 1; i <= 60; i++) {
            vm.prank(users[i]);
            celoRefer.register("GENESIS");
            
            // Check quest progress at milestones
            if (i == 5) {
                (bool completed, , ) = celoRefer.userQuestProgress(users[0], 1);
                assertTrue(completed);
                
                uint256 balanceBefore = cUSD.balanceOf(users[0]);
                vm.prank(users[0]);
                celoRefer.claimQuestReward(1);
                assertEq(cUSD.balanceOf(users[0]) - balanceBefore, 100 * 10**18);
                console.log("Quest 1 completed and claimed");
            }
            
            if (i == 15) {
                (bool completed, , ) = celoRefer.userQuestProgress(users[0], 2);
                assertTrue(completed);
                
                uint256 balanceBefore = cUSD.balanceOf(users[0]);
                vm.prank(users[0]);
                celoRefer.claimQuestReward(2);
                assertEq(cUSD.balanceOf(users[0]) - balanceBefore, 500 * 10**18);
                console.log("Quest 2 completed and claimed");
            }
            
            if (i == 50) {
                (bool completed, , ) = celoRefer.userQuestProgress(users[0], 3);
                assertTrue(completed);
                
                uint256 balanceBefore = cUSD.balanceOf(users[0]);
                vm.prank(users[0]);
                celoRefer.claimQuestReward(3);
                assertEq(cUSD.balanceOf(users[0]) - balanceBefore, 2000 * 10**18);
                console.log("Quest 3 completed and claimed");
                break;
            }
        }
        
        // Verify final badge tier
        uint8 finalTier = celoRefer.getBadgeTier(users[0]);
        assertEq(finalTier, 3); // Should be Platinum
        console.log("Final badge tier verified");
    }
    
    function testSeasonalCompetitionIntegration() public {
        console.log("=== Testing Seasonal Competition Integration ===");
        
        // Start season
        uint256 prizePool = 10000 * 10**18;
        celoRefer.startSeason(30 days, prizePool, 3);
        
        // Register users and build activity
        vm.prank(users[0]);
        celoRefer.registerGenesis("GENESIS");
        
        // Create competitive activity
        for (uint i = 1; i <= 20; i++) {
            vm.prank(users[i]);
            celoRefer.register("GENESIS");
            
            // Record actions for some users to create earnings
            if (i % 3 == 0) {
                vm.prank(partner);
                celoRefer.recordActionAndDistributeRewards(users[i], 500 * 10**18);
            }
        }
        
        // Check seasonal stats
        (uint256 seasonReferrals, uint256 seasonEarnings) = celoRefer.seasonUserStats(1, users[0]);
        assertEq(seasonReferrals, 20);
        assertGt(seasonEarnings, 0);
        
        console.log("Season stats verified");
        
        // Fast forward to end season
        vm.warp(block.timestamp + 31 days);
        celoRefer.endSeason();
        
        // Distribute rewards
        address[] memory winners = new address[](3);
        uint256[] memory amounts = new uint256[](3);
        
        winners[0] = users[0];
        winners[1] = users[1];
        winners[2] = users[2];
        
        amounts[0] = 5000 * 10**18;
        amounts[1] = 3000 * 10**18;
        amounts[2] = 2000 * 10**18;
        
        uint256 winner1BalanceBefore = cUSD.balanceOf(users[0]);
        celoRefer.distributeSeasonRewards(winners, amounts);
        
        assertEq(cUSD.balanceOf(users[0]) - winner1BalanceBefore, 5000 * 10**18);
        console.log("Season rewards distributed successfully");
    }
    

    
    function testPartnerSubscriptionIntegration() public {
        console.log("=== Testing Partner Subscription Integration ===");
        
        address[] memory partners = new address[](4);
        for (uint i = 0; i < 4; i++) {
            partners[i] = makeAddr(string(abi.encodePacked("partner", vm.toString(i))));
        }
        
        // Subscribe partners to different tiers
        uint256[] memory tiers = new uint256[](4);
        tiers[0] = 0; // Free
        tiers[1] = 1; // Basic
        tiers[2] = 2; // Pro
        tiers[3] = 3; // Enterprise
        
        for (uint i = 0; i < 4; i++) {
            celoRefer.subscribePartner(partners[i], tiers[i], 365 days);
            celoRefer.authorizePartner(partners[i], true);
            
            (bool isSubscribed, uint256 tier, , uint256 customizationLevel) = celoRefer.partnerSubscriptions(partners[i]);
            assertTrue(isSubscribed);
            assertEq(tier, tiers[i]);
            assertEq(customizationLevel, tiers[i] * 25);
            
            console.log("Partner subscribed successfully");
        }
        
        console.log("Partner subscription system working correctly");
    }
    
    function testScalabilityAndGasOptimization() public {
        console.log("=== Testing Scalability and Gas Optimization ===");
        
        // Register genesis
        vm.prank(users[0]);
        celoRefer.registerGenesis("GENESIS");
        
        // Measure gas for various operations
        uint256 gasStart;
        uint256 gasUsed;
        
        // Test registration gas usage
        gasStart = gasleft();
        vm.prank(users[1]);
        celoRefer.register("GENESIS");
        gasUsed = gasStart - gasleft();
        console.log("Registration gas measured");
        
        // Test reward distribution gas usage
        gasStart = gasleft();
        vm.prank(partner);
        celoRefer.recordActionAndDistributeRewards(users[1], 1000 * 10**18);
        gasUsed = gasStart - gasleft();
        console.log("Reward distribution gas measured");
        
        // Test quest progress update (happens during registration)
        celoRefer.createQuest("Gas Test", "Test quest", 5, 100 * 10**18);
        
        gasStart = gasleft();
        vm.prank(users[2]);
        celoRefer.register("GENESIS");
        gasUsed = gasStart - gasleft();
        console.log("Registration with quest update gas measured");
        
        console.log("Gas optimization tests completed");
    }
}