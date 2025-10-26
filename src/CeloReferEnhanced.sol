// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CeloReferEnhanced
 * @dev Enhanced referral system with Quests, Seasons, and Platform Fees
 */
contract CeloReferEnhanced is Ownable, ReentrancyGuard {
    // Data Structures
    struct ReferralInfo {
        address directReferrer;
        address parentReferrer;
        string referralCode;
        bool isRegistered;
    }

    struct UserStats {
        uint256 referralCount;
        uint256 totalEarned;
        uint256 totalActions;
        uint256 registrationTime;
    }

    struct Quest {
        string name;
        string description;
        uint256 targetReferrals;
        uint256 rewardAmount;
        bool isActive;
    }

    struct UserQuestProgress {
        bool completed;
        bool claimed;
        uint256 progress;
    }

    struct Season {
        uint256 startTime;
        uint256 endTime;
        uint256 totalPrizePool;
        uint256 winnersCount;
        bool isActive;
        bool distributed;
    }

    struct SeasonUserStats {
        uint256 referrals;
        uint256 earnings;
    }

    // Mappings
    mapping(address => ReferralInfo) public referralTree;
    mapping(address => UserStats) public userStats;
    mapping(string => address) public codeToReferrer;
    mapping(address => bool) public isVerified;
    mapping(address => bool) public authorizedPartners;
    
    // Quest System
    mapping(uint256 => Quest) public quests;
    mapping(address => mapping(uint256 => UserQuestProgress)) public userQuestProgress;
    uint256 public questCount;
    
    // Seasonal Competition
    mapping(uint256 => Season) public seasons;
    mapping(uint256 => mapping(address => SeasonUserStats)) public seasonUserStats;
    uint256 public currentSeasonId;
    uint256 public seasonCount;
    
    // White-label Partners (Subscription System)
    struct PartnerSubscription {
        bool isSubscribed;
        uint256 tier; // 0=Free, 1=Basic, 2=Pro, 3=Enterprise
        uint256 expiryTime;
        uint256 customizationLevel; // 0-100
    }
    mapping(address => PartnerSubscription) public partnerSubscriptions;

    // Configuration
    IERC20 public cUSD;
    address public attestationSigner;
    address public treasury; // Platform treasury for fees
    
    // Reward percentages (basis points) - Now dynamic based on badge tier
    uint256 public platformFeeBps = 1500;  // 15% platform fee
    
    // Tiered reward rates (basis points)
    // Bronze: 5% + 2%
    // Silver: 10% + 4%
    // Gold: 15% + 6%
    // Platinum: 20% + 8%
    
    // Badge thresholds
    uint256 public constant BRONZE_THRESHOLD = 0;
    uint256 public constant SILVER_THRESHOLD = 5;
    uint256 public constant GOLD_THRESHOLD = 15;
    uint256 public constant PLATINUM_THRESHOLD = 50;

    // Events
    event UserRegistered(address indexed user, address indexed directReferrer, address indexed parentReferrer, string referralCode);
    event RewardDistributed(address indexed user, address indexed referrer, uint256 amount, uint8 level);
    event PlatformFeeCollected(address indexed partner, uint256 amount);
    event ActionRecorded(address indexed user, address indexed partner, uint256 actionValue);
    event PartnerAuthorized(address indexed partner, bool authorized);
    event UserVerified(address indexed user, bool verified);
    
    event QuestCreated(uint256 indexed questId, string name, uint256 targetReferrals, uint256 rewardAmount);
    event QuestCompleted(address indexed user, uint256 indexed questId);
    event QuestRewardClaimed(address indexed user, uint256 indexed questId, uint256 amount);
    
    event SeasonStarted(uint256 indexed seasonId, uint256 startTime, uint256 endTime, uint256 prizePool);
    event SeasonEnded(uint256 indexed seasonId);
    event SeasonRewardDistributed(uint256 indexed seasonId, address indexed winner, uint256 amount, uint256 rank);
    
    event PartnerSubscribed(address indexed partner, uint256 tier, uint256 expiryTime);

    // Modifiers
    modifier onlyPartner() {
        require(authorizedPartners[msg.sender], "Not authorized partner");
        _;
    }

    modifier onlyRegistered(address user) {
        require(referralTree[user].isRegistered, "User not registered");
        _;
    }

    constructor(address _cUSD, address _attestationSigner, address _treasury) Ownable(msg.sender) {
        require(_cUSD != address(0) && _attestationSigner != address(0) && _treasury != address(0), "Invalid addresses");
        cUSD = IERC20(_cUSD);
        attestationSigner = _attestationSigner;
        treasury = _treasury;
    }

    // Registration Functions
    function register(string memory referralCode) external {
        require(!referralTree[msg.sender].isRegistered, "Already registered");
        require(bytes(referralCode).length > 0, "Empty referral code");
        
        address directReferrer = codeToReferrer[referralCode];
        require(directReferrer != address(0), "Invalid referral code");
        require(directReferrer != msg.sender, "Cannot refer yourself");

        address parentReferrer = referralTree[directReferrer].directReferrer;
        string memory newUserCode = _generateReferralCode(msg.sender);

        referralTree[msg.sender] = ReferralInfo(directReferrer, parentReferrer, newUserCode, true);
        codeToReferrer[newUserCode] = msg.sender;
        
        userStats[directReferrer].referralCount++;
        userStats[msg.sender].registrationTime = block.timestamp;
        
        // Update seasonal stats if season is active
        if (currentSeasonId > 0 && seasons[currentSeasonId].isActive) {
            seasonUserStats[currentSeasonId][directReferrer].referrals++;
        }
        
        // Check quest progress
        _updateQuestProgress(directReferrer);

        emit UserRegistered(msg.sender, directReferrer, parentReferrer, newUserCode);
    }

    function registerGenesis(string memory userCode) external {
        require(!referralTree[msg.sender].isRegistered, "Already registered");
        require(bytes(userCode).length > 0, "Empty user code");
        require(codeToReferrer[userCode] == address(0), "Code already taken");

        referralTree[msg.sender] = ReferralInfo(address(0), address(0), userCode, true);
        codeToReferrer[userCode] = msg.sender;
        userStats[msg.sender].registrationTime = block.timestamp;

        emit UserRegistered(msg.sender, address(0), address(0), userCode);
    }

    // Reward Distribution with Platform Fee
    function recordActionAndDistributeRewards(address user, uint256 actionValue) 
        external 
        onlyPartner 
        onlyRegistered(user) 
        nonReentrant 
    {
        require(actionValue > 0, "Invalid action value");

        // Calculate platform fee
        uint256 platformFee = (actionValue * platformFeeBps) / 10000;
        uint256 remainingValue = actionValue - platformFee;
        
        // Transfer platform fee to treasury
        if (platformFee > 0) {
            require(cUSD.transfer(treasury, platformFee), "Platform fee transfer failed");
            emit PlatformFeeCollected(msg.sender, platformFee);
        }

        ReferralInfo memory userRef = referralTree[user];
        userStats[user].totalActions++;

        // Distribute Level 1 reward from remaining value (with dynamic rates)
        if (userRef.directReferrer != address(0)) {
            (uint256 level1Rate, ) = getRewardRates(userRef.directReferrer);
            uint256 level1Reward = (remainingValue * level1Rate) / 10000;
            if (level1Reward > 0) {
                require(cUSD.transfer(userRef.directReferrer, level1Reward), "Level 1 transfer failed");
                userStats[userRef.directReferrer].totalEarned += level1Reward;
                
                // Update seasonal stats
                if (currentSeasonId > 0 && seasons[currentSeasonId].isActive) {
                    seasonUserStats[currentSeasonId][userRef.directReferrer].earnings += level1Reward;
                }
                
                emit RewardDistributed(user, userRef.directReferrer, level1Reward, 1);
            }
        }

        // Distribute Level 2 reward (with dynamic rates)
        if (userRef.parentReferrer != address(0)) {
            (, uint256 level2Rate) = getRewardRates(userRef.parentReferrer);
            uint256 level2Reward = (remainingValue * level2Rate) / 10000;
            if (level2Reward > 0) {
                require(cUSD.transfer(userRef.parentReferrer, level2Reward), "Level 2 transfer failed");
                userStats[userRef.parentReferrer].totalEarned += level2Reward;
                
                // Update seasonal stats
                if (currentSeasonId > 0 && seasons[currentSeasonId].isActive) {
                    seasonUserStats[currentSeasonId][userRef.parentReferrer].earnings += level2Reward;
                }
                
                emit RewardDistributed(user, userRef.parentReferrer, level2Reward, 2);
            }
        }

        emit ActionRecorded(user, msg.sender, actionValue);
    }

    // Quest System Functions
    function createQuest(
        string memory name,
        string memory description,
        uint256 targetReferrals,
        uint256 rewardAmount
    ) external onlyOwner {
        questCount++;
        quests[questCount] = Quest(name, description, targetReferrals, rewardAmount, true);
        emit QuestCreated(questCount, name, targetReferrals, rewardAmount);
    }

    function _updateQuestProgress(address user) internal {
        uint256 userReferrals = userStats[user].referralCount;
        
        for (uint256 i = 1; i <= questCount; i++) {
            if (quests[i].isActive && !userQuestProgress[user][i].completed) {
                userQuestProgress[user][i].progress = userReferrals;
                
                if (userReferrals >= quests[i].targetReferrals) {
                    userQuestProgress[user][i].completed = true;
                    emit QuestCompleted(user, i);
                }
            }
        }
    }

    function claimQuestReward(uint256 questId) external nonReentrant {
        require(quests[questId].isActive, "Quest not active");
        require(userQuestProgress[msg.sender][questId].completed, "Quest not completed");
        require(!userQuestProgress[msg.sender][questId].claimed, "Reward already claimed");
        
        userQuestProgress[msg.sender][questId].claimed = true;
        uint256 reward = quests[questId].rewardAmount;
        
        require(cUSD.transfer(msg.sender, reward), "Quest reward transfer failed");
        emit QuestRewardClaimed(msg.sender, questId, reward);
    }

    // Seasonal Competition Functions
    function startSeason(uint256 duration, uint256 prizePool, uint256 winnersCount) external onlyOwner {
        if (currentSeasonId > 0) {
            require(!seasons[currentSeasonId].isActive, "Season already active");
        }
        
        seasonCount++;
        currentSeasonId = seasonCount;
        
        seasons[currentSeasonId] = Season({
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            totalPrizePool: prizePool,
            winnersCount: winnersCount,
            isActive: true,
            distributed: false
        });
        
        emit SeasonStarted(currentSeasonId, block.timestamp, block.timestamp + duration, prizePool);
    }

    function endSeason() external onlyOwner {
        require(seasons[currentSeasonId].isActive, "No active season");
        require(block.timestamp >= seasons[currentSeasonId].endTime, "Season not ended yet");
        
        seasons[currentSeasonId].isActive = false;
        emit SeasonEnded(currentSeasonId);
    }

    function distributeSeasonRewards(address[] calldata winners, uint256[] calldata amounts) external onlyOwner nonReentrant {
        require(!seasons[currentSeasonId].distributed, "Already distributed");
        require(winners.length == amounts.length, "Length mismatch");
        
        uint256 totalDistributed = 0;
        for (uint256 i = 0; i < winners.length; i++) {
            require(cUSD.transfer(winners[i], amounts[i]), "Transfer failed");
            totalDistributed += amounts[i];
            emit SeasonRewardDistributed(currentSeasonId, winners[i], amounts[i], i + 1);
        }
        
        seasons[currentSeasonId].distributed = true;
    }

    // White-label Subscription System
    function subscribePartner(address partner, uint256 tier, uint256 duration) external onlyOwner {
        partnerSubscriptions[partner] = PartnerSubscription({
            isSubscribed: true,
            tier: tier,
            expiryTime: block.timestamp + duration,
            customizationLevel: tier * 25 // Basic=25%, Pro=50%, Enterprise=75%
        });
        
        emit PartnerSubscribed(partner, tier, block.timestamp + duration);
    }

    // View Functions
    function getBadgeTier(address user) public view returns (uint8 tier) {
        uint256 referralCount = userStats[user].referralCount;
        if (referralCount >= PLATINUM_THRESHOLD) return 3;
        if (referralCount >= GOLD_THRESHOLD) return 2;
        if (referralCount >= SILVER_THRESHOLD) return 1;
        return 0;
    }
    
    /**
     * @dev Get dynamic reward rates based on user's badge tier
     * @param user The user address
     * @return level1Bps Level 1 reward in basis points
     * @return level2Bps Level 2 reward in basis points
     */
    function getRewardRates(address user) public view returns (uint256 level1Bps, uint256 level2Bps) {
        uint8 tier = getBadgeTier(user);
        
        if (tier == 3) { // Platinum: 20% + 8%
            return (2000, 800);
        } else if (tier == 2) { // Gold: 15% + 6%
            return (1500, 600);
        } else if (tier == 1) { // Silver: 10% + 4%
            return (1000, 400);
        } else { // Bronze: 5% + 2%
            return (500, 200);
        }
    }

    function getUserInfo(address user) external view returns (
        ReferralInfo memory referralInfo,
        UserStats memory stats,
        uint8 badgeTier,
        bool verified
    ) {
        return (referralTree[user], userStats[user], getBadgeTier(user), isVerified[user]);
    }

    function getQuestProgress(address user, uint256 questId) external view returns (UserQuestProgress memory) {
        return userQuestProgress[user][questId];
    }

    function getSeasonStats(uint256 seasonId, address user) external view returns (SeasonUserStats memory) {
        return seasonUserStats[seasonId][user];
    }

    function getCurrentSeason() external view returns (Season memory) {
        return seasons[currentSeasonId];
    }

    // Admin functions
    function authorizePartner(address partner, bool authorized) external onlyOwner {
        authorizedPartners[partner] = authorized;
        emit PartnerAuthorized(partner, authorized);
    }

    function setPlatformFee(uint256 _platformFeeBps) external onlyOwner {
        require(_platformFeeBps <= 2000, "Fee too high"); // Max 20%
        platformFeeBps = _platformFeeBps;
    }

    // Note: Reward percentages are now dynamic based on badge tier
    // Use getRewardRates() to see current rates for any user

    function updateTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid treasury address");
        treasury = _newTreasury;
    }

    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(cUSD.transfer(owner(), amount), "Emergency withdraw failed");
    }

    // Internal functions
    function _generateReferralCode(address user) internal pure returns (string memory) {
        return string(abi.encodePacked("REF", _toHexString(uint160(user))));
    }

    function _toHexString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 length = 0;
        while (temp != 0) {
            length++;
            temp >>= 4;
        }
        bytes memory buffer = new bytes(length);
        while (value != 0) {
            length -= 1;
            buffer[length] = bytes1(uint8(48 + uint256(value & 0xf)));
            value >>= 4;
        }
        return string(buffer);
    }
}
