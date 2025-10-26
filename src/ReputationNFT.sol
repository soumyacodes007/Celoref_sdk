// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title ReputationNFT
 * @dev Soulbound NFT representing user reputation in the CeloRefer ecosystem
 */
contract ReputationNFT is ERC721, Ownable {
    using Strings for uint256;

    // Base URI for metadata
    string private _baseTokenURI;
    
    // Counter for token IDs
    uint256 private _tokenIdCounter;
    
    // Mapping from user address to token ID
    mapping(address => uint256) public userToTokenId;
    
    // Mapping from token ID to user address
    mapping(uint256 => address) public tokenIdToUser;
    
    // CeloRefer contract address for badge tier queries
    address public celoReferContract;

    event ReputationNFTMinted(address indexed user, uint256 indexed tokenId);
    event BaseURIUpdated(string newBaseURI);

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI,
        address _celoReferContract
    ) ERC721(name, symbol) Ownable(msg.sender) {
        _baseTokenURI = baseURI;
        celoReferContract = _celoReferContract;
        _tokenIdCounter = 1; // Start from 1
    }

    /**
     * @dev Mint a soulbound reputation NFT to a user
     * @param to The address to mint the NFT to
     */
    function mint(address to) external onlyOwner returns (uint256) {
        require(to != address(0), "ReputationNFT: Cannot mint to zero address");
        require(userToTokenId[to] == 0, "ReputationNFT: User already has reputation NFT");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(to, tokenId);
        
        userToTokenId[to] = tokenId;
        tokenIdToUser[tokenId] = to;

        emit ReputationNFTMinted(to, tokenId);
        return tokenId;
    }

    /**
     * @dev Get the token ID for a user
     * @param user The user address
     * @return tokenId The token ID (0 if user doesn't have an NFT)
     */
    function getTokenIdByUser(address user) external view returns (uint256) {
        return userToTokenId[user];
    }

    /**
     * @dev Get the user address for a token ID
     * @param tokenId The token ID
     * @return user The user address
     */
    function getUserByTokenId(uint256 tokenId) external view returns (address) {
        require(_ownerOf(tokenId) != address(0), "ReputationNFT: Token does not exist");
        return tokenIdToUser[tokenId];
    }

    /**
     * @dev Override tokenURI to return dynamic metadata based on user's reputation
     * @param tokenId The token ID
     * @return The token URI
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "ReputationNFT: URI query for nonexistent token");
        
        return string(abi.encodePacked(_baseTokenURI, tokenId.toString()));
    }

    /**
     * @dev Set the base URI for token metadata
     * @param baseURI The new base URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
        emit BaseURIUpdated(baseURI);
    }

    /**
     * @dev Update the CeloRefer contract address
     * @param _celoReferContract The new CeloRefer contract address
     */
    function setCeloReferContract(address _celoReferContract) external onlyOwner {
        require(_celoReferContract != address(0), "ReputationNFT: Invalid contract address");
        celoReferContract = _celoReferContract;
    }

    /**
     * @dev Get the current token ID counter
     * @return The next token ID to be minted
     */
    function getCurrentTokenId() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Get the total number of minted tokens
     * @return The total supply
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter - 1;
    }

    // Soulbound functionality - prevent transfers
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from == address(0)) and burning (to == address(0))
        // Prevent all other transfers
        if (from != address(0) && to != address(0)) {
            revert("ReputationNFT: Soulbound token cannot be transferred");
        }
        
        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Override approve to prevent approvals (soulbound)
     */
    function approve(address, uint256) public pure override {
        revert("ReputationNFT: Soulbound token cannot be approved");
    }

    /**
     * @dev Override setApprovalForAll to prevent approvals (soulbound)
     */
    function setApprovalForAll(address, bool) public pure override {
        revert("ReputationNFT: Soulbound token cannot be approved");
    }

    /**
     * @dev Override getApproved to always return zero address (soulbound)
     */
    function getApproved(uint256) public pure override returns (address) {
        return address(0);
    }

    /**
     * @dev Override isApprovedForAll to always return false (soulbound)
     */
    function isApprovedForAll(address, address) public pure override returns (bool) {
        return false;
    }
}