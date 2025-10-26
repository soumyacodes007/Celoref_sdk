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

contract DebugTest is Test {
    CeloReferEnhanced public celoRefer;
    MockCUSD public cUSD;
    
    address public owner;
    address public treasury;
    address public user1;
    address public user2;
    
    function setUp() public {
        owner = address(this);
        treasury = makeAddr("treasury");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        // Deploy contracts
        cUSD = new MockCUSD();
        
        celoRefer = new CeloReferEnhanced(
            address(cUSD),
            owner,
            treasury
        );
        
        // Fund the contract
        cUSD.transfer(address(celoRefer), 100000 * 10**18);
    }
    
    function testBasicRegistrationFlow() public {
        console.log("=== Debug: Basic Registration Flow ===");
        
        // 1. Register genesis user
        vm.prank(user1);
        celoRefer.registerGenesis("GENESIS");
        
        // Check genesis registration
        (address directRef, address parentRef, string memory code, bool isReg) = celoRefer.referralTree(user1);
        console.log("Genesis registered:", isReg);
        console.log("Genesis code:", code);
        
        // Check initial stats
        (uint256 referralCount, , , ) = celoRefer.userStats(user1);
        console.log("Initial referral count:", referralCount);
        
        // 2. Register referred user
        vm.prank(user2);
        celoRefer.register("GENESIS");
        
        // Check referred user registration
        (directRef, parentRef, code, isReg) = celoRefer.referralTree(user2);
        console.log("User2 registered:", isReg);
        console.log("User2 direct referrer:", directRef);
        console.log("Expected referrer:", user1);
        console.log("Referrers match:", directRef == user1);
        
        // Check updated stats
        (referralCount, , , ) = celoRefer.userStats(user1);
        console.log("Final referral count:", referralCount);
        
        // Assertions
        assertTrue(isReg);
        assertEq(directRef, user1);
        assertEq(referralCount, 1);
    }
    
    function testMultipleRegistrations() public {
        console.log("=== Debug: Multiple Registrations ===");
        
        // Register genesis
        vm.prank(user1);
        celoRefer.registerGenesis("GENESIS");
        
        // Register multiple users
        for (uint i = 0; i < 5; i++) {
            address newUser = makeAddr(string(abi.encodePacked("testUser", vm.toString(i))));
            vm.prank(newUser);
            celoRefer.register("GENESIS");
            
            (uint256 referralCount, , , ) = celoRefer.userStats(user1);
            console.log("After registration", i + 1, "referral count:", referralCount);
        }
        
        // Final check
        (uint256 finalCount, , , ) = celoRefer.userStats(user1);
        console.log("Final referral count:", finalCount);
        assertEq(finalCount, 5);
    }
}