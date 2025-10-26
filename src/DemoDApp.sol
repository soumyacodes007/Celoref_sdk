// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./CeloRefer.sol";

/**
 * @title DemoDApp
 * @dev Demo application showcasing CeloRefer integration
 */
contract DemoDApp is Ownable, ReentrancyGuard {
    IERC20 public cUSD;
    CeloRefer public celoRefer;
    
    // Staking data
    mapping(address => uint256) public userStakes;
    mapping(address => uint256) public userStakeTime;
    uint256 public totalStaked;
    
    // Minimum stake amount
    uint256 public minimumStake = 1e18; // 1 cUSD
    
    // Events
    event Staked(address indexed user, uint256 amount, string referralCode);
    event Unstaked(address indexed user, uint256 amount);
    event ReferralRegistered(address indexed user, string referralCode);

    constructor(address _cUSD, address _celoRefer) Ownable(msg.sender) {
        require(_cUSD != address(0), "DemoDApp: Invalid cUSD address");
        require(_celoRefer != address(0), "DemoDApp: Invalid CeloRefer address");
        
        cUSD = IERC20(_cUSD);
        celoRefer = CeloRefer(_celoRefer);
    }

    /**
     * @dev Stake cUSD tokens with optional referral registration
     * @param amount Amount of cUSD to stake
     * @param referralCode Referral code (empty string if already registered)
     */
    function stake(uint256 amount, string memory referralCode) external nonReentrant {
        require(amount >= minimumStake, "DemoDApp: Amount below minimum stake");
        require(cUSD.balanceOf(msg.sender) >= amount, "DemoDApp: Insufficient balance");
        
        // Check if user is registered in CeloRefer
        (CeloRefer.ReferralInfo memory referralInfo, , , ) = celoRefer.getUserInfo(msg.sender);
        
        // If not registered and referral code provided, register first
        if (!referralInfo.isRegistered && bytes(referralCode).length > 0) {
            celoRefer.register(referralCode);
            emit ReferralRegistered(msg.sender, referralCode);
        }
        
        // Transfer cUSD from user to this contract
        require(cUSD.transferFrom(msg.sender, address(this), amount), "DemoDApp: Transfer failed");
        
        // Update staking data
        userStakes[msg.sender] += amount;
        userStakeTime[msg.sender] = block.timestamp;
        totalStaked += amount;
        
        // Record action in CeloRefer if user is registered
        (referralInfo, , , ) = celoRefer.getUserInfo(msg.sender);
        if (referralInfo.isRegistered) {
            celoRefer.recordActionAndDistributeRewards(msg.sender, amount);
        }
        
        emit Staked(msg.sender, amount, referralCode);
    }

    /**
     * @dev Stake with genesis registration (for first user)
     * @param amount Amount of cUSD to stake
     * @param userCode User's referral code
     */
    function stakeWithGenesis(uint256 amount, string memory userCode) external nonReentrant {
        require(amount >= minimumStake, "DemoDApp: Amount below minimum stake");
        require(cUSD.balanceOf(msg.sender) >= amount, "DemoDApp: Insufficient balance");
        require(bytes(userCode).length > 0, "DemoDApp: Empty user code");
        
        // Check if user is already registered
        (CeloRefer.ReferralInfo memory referralInfo, , , ) = celoRefer.getUserInfo(msg.sender);
        require(!referralInfo.isRegistered, "DemoDApp: User already registered");
        
        // Register as genesis user
        celoRefer.registerGenesis(userCode);
        
        // Transfer cUSD from user to this contract
        require(cUSD.transferFrom(msg.sender, address(this), amount), "DemoDApp: Transfer failed");
        
        // Update staking data
        userStakes[msg.sender] += amount;
        userStakeTime[msg.sender] = block.timestamp;
        totalStaked += amount;
        
        // Record action in CeloRefer
        celoRefer.recordActionAndDistributeRewards(msg.sender, amount);
        
        emit Staked(msg.sender, amount, userCode);
        emit ReferralRegistered(msg.sender, userCode);
    }

    /**
     * @dev Unstake cUSD tokens
     * @param amount Amount to unstake
     */
    function unstake(uint256 amount) external nonReentrant {
        require(userStakes[msg.sender] >= amount, "DemoDApp: Insufficient stake");
        require(amount > 0, "DemoDApp: Invalid amount");
        
        // Update staking data
        userStakes[msg.sender] -= amount;
        totalStaked -= amount;
        
        // Transfer cUSD back to user
        require(cUSD.transfer(msg.sender, amount), "DemoDApp: Transfer failed");
        
        emit Unstaked(msg.sender, amount);
    }

    /**
     * @dev Get user's staking information
     * @param user User address
     */
    function getUserStakeInfo(address user) external view returns (
        uint256 stakedAmount,
        uint256 stakeTime,
        bool isRegistered,
        string memory referralCode
    ) {
        (CeloRefer.ReferralInfo memory referralInfo, , , ) = celoRefer.getUserInfo(user);
        
        return (
            userStakes[user],
            userStakeTime[user],
            referralInfo.isRegistered,
            referralInfo.referralCode
        );
    }

    /**
     * @dev Perform a simple action that triggers rewards
     * @param actionValue Value of the action
     */
    function performAction(uint256 actionValue) external {
        require(actionValue > 0, "DemoDApp: Invalid action value");
        
        // Check if user is registered
        (CeloRefer.ReferralInfo memory referralInfo, , , ) = celoRefer.getUserInfo(msg.sender);
        require(referralInfo.isRegistered, "DemoDApp: User not registered");
        
        // Record action and distribute rewards
        celoRefer.recordActionAndDistributeRewards(msg.sender, actionValue);
    }

    // Admin functions
    function setMinimumStake(uint256 _minimumStake) external onlyOwner {
        minimumStake = _minimumStake;
    }

    function updateCeloReferContract(address _celoRefer) external onlyOwner {
        require(_celoRefer != address(0), "DemoDApp: Invalid CeloRefer address");
        celoRefer = CeloRefer(_celoRefer);
    }

    /**
     * @dev Emergency withdraw function
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(cUSD.transfer(owner(), amount), "DemoDApp: Emergency withdraw failed");
    }

    /**
     * @dev Get contract statistics
     */
    function getContractStats() external view returns (
        uint256 _totalStaked,
        uint256 _minimumStake,
        uint256 contractBalance
    ) {
        return (
            totalStaked,
            minimumStake,
            cUSD.balanceOf(address(this))
        );
    }
}