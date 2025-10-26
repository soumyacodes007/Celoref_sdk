// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/ReputationNFT.sol";

contract ReputationNFTTest is Test {
    ReputationNFT public reputationNFT;
    
    address public owner;
    address public celoReferContract;
    address public user1;
    address public user2;
    
    string constant NFT_NAME = "CeloRefer Reputation";
    string constant NFT_SYMBOL = "CELOREFER";
    string constant BASE_URI = "https://api.celorefer.com/nft/";
    
    event ReputationNFTMinted(address indexed user, uint256 indexed tokenId);
    event BaseURIUpdated(string newBaseURI);
    
    function setUp() public {
        owner = address(this);
        celoReferContract = makeAddr("celoReferContract");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        reputationNFT = new ReputationNFT(
            NFT_NAME,
            NFT_SYMBOL,
            BASE_URI,
            celoReferContract
        );
    }
    
    function testDeployment() public view {
        assertEq(reputationNFT.name(), NFT_NAME);
        assertEq(reputationNFT.symbol(), NFT_SYMBOL);
        assertEq(reputationNFT.owner(), owner);
        assertEq(reputationNFT.celoReferContract(), celoReferContract);
        assertEq(reputationNFT.getCurrentTokenId(), 1);
        assertEq(reputationNFT.totalSupply(), 0);
    }
    
    function testMinting() public {
        vm.expectEmit(true, true, false, true);
        emit ReputationNFTMinted(user1, 1);
        
        uint256 tokenId = reputationNFT.mint(user1);
        
        assertEq(tokenId, 1);
        assertEq(reputationNFT.ownerOf(tokenId), user1);
        assertEq(reputationNFT.userToTokenId(user1), tokenId);
        assertEq(reputationNFT.tokenIdToUser(tokenId), user1);
        assertEq(reputationNFT.getTokenIdByUser(user1), tokenId);
        assertEq(reputationNFT.getUserByTokenId(tokenId), user1);
        assertEq(reputationNFT.getCurrentTokenId(), 2);
        assertEq(reputationNFT.totalSupply(), 1);
    }
    
    function testMultipleMinting() public {
        uint256 tokenId1 = reputationNFT.mint(user1);
        uint256 tokenId2 = reputationNFT.mint(user2);
        
        assertEq(tokenId1, 1);
        assertEq(tokenId2, 2);
        assertEq(reputationNFT.ownerOf(tokenId1), user1);
        assertEq(reputationNFT.ownerOf(tokenId2), user2);
        assertEq(reputationNFT.totalSupply(), 2);
    }
    
    function testTokenURI() public {
        uint256 tokenId = reputationNFT.mint(user1);
        string memory expectedURI = string(abi.encodePacked(BASE_URI, "1"));
        assertEq(reputationNFT.tokenURI(tokenId), expectedURI);
    }
    
    function testSetBaseURI() public {
        string memory newBaseURI = "https://new-api.celorefer.com/nft/";
        
        vm.expectEmit(false, false, false, true);
        emit BaseURIUpdated(newBaseURI);
        
        reputationNFT.setBaseURI(newBaseURI);
        
        uint256 tokenId = reputationNFT.mint(user1);
        string memory expectedURI = string(abi.encodePacked(newBaseURI, "1"));
        assertEq(reputationNFT.tokenURI(tokenId), expectedURI);
    }
    
    function testSetCeloReferContract() public {
        address newContract = makeAddr("newContract");
        reputationNFT.setCeloReferContract(newContract);
        assertEq(reputationNFT.celoReferContract(), newContract);
    }
    
    function testSoulboundTransferRestrictions() public {
        uint256 tokenId = reputationNFT.mint(user1);
        
        // Test direct transfer
        vm.prank(user1);
        vm.expectRevert("ReputationNFT: Soulbound token cannot be transferred");
        reputationNFT.transferFrom(user1, user2, tokenId);
        
        // Test safe transfer
        vm.prank(user1);
        vm.expectRevert("ReputationNFT: Soulbound token cannot be transferred");
        reputationNFT.safeTransferFrom(user1, user2, tokenId);
        
        // Test safe transfer with data
        vm.prank(user1);
        vm.expectRevert("ReputationNFT: Soulbound token cannot be transferred");
        reputationNFT.safeTransferFrom(user1, user2, tokenId, "");
    }
    
    function testSoulboundApprovalRestrictions() public {
        uint256 tokenId = reputationNFT.mint(user1);
        
        // Test approve
        vm.prank(user1);
        vm.expectRevert("ReputationNFT: Soulbound token cannot be approved");
        reputationNFT.approve(user2, tokenId);
        
        // Test setApprovalForAll
        vm.prank(user1);
        vm.expectRevert("ReputationNFT: Soulbound token cannot be approved");
        reputationNFT.setApprovalForAll(user2, true);
        
        // Test getApproved always returns zero address
        assertEq(reputationNFT.getApproved(tokenId), address(0));
        
        // Test isApprovedForAll always returns false
        assertFalse(reputationNFT.isApprovedForAll(user1, user2));
    }
    
    function testRevertConditions() public {
        // Test minting to zero address
        vm.expectRevert("ReputationNFT: Cannot mint to zero address");
        reputationNFT.mint(address(0));
        
        // Test double minting to same user
        reputationNFT.mint(user1);
        vm.expectRevert("ReputationNFT: User already has reputation NFT");
        reputationNFT.mint(user1);
        
        // Test tokenURI for non-existent token
        vm.expectRevert("ReputationNFT: URI query for nonexistent token");
        reputationNFT.tokenURI(999);
        
        // Test getUserByTokenId for non-existent token
        vm.expectRevert("ReputationNFT: Token does not exist");
        reputationNFT.getUserByTokenId(999);
        
        // Test setCeloReferContract with zero address
        vm.expectRevert("ReputationNFT: Invalid contract address");
        reputationNFT.setCeloReferContract(address(0));
    }
    
    function testOnlyOwnerFunctions() public {
        address nonOwner = makeAddr("nonOwner");
        
        // Test mint
        vm.prank(nonOwner);
        vm.expectRevert();
        reputationNFT.mint(user1);
        
        // Test setBaseURI
        vm.prank(nonOwner);
        vm.expectRevert();
        reputationNFT.setBaseURI("new-uri");
        
        // Test setCeloReferContract
        vm.prank(nonOwner);
        vm.expectRevert();
        reputationNFT.setCeloReferContract(makeAddr("newContract"));
    }
    
    function testGetTokenIdByUserReturnsZeroForNonExistentUser() public {
        assertEq(reputationNFT.getTokenIdByUser(user1), 0);
        
        // After minting, should return the token ID
        uint256 tokenId = reputationNFT.mint(user1);
        assertEq(reputationNFT.getTokenIdByUser(user1), tokenId);
    }
}