/**
 * CeloRefer Frontend Application
 * Main application logic with MetaMask integration
 */

// Global State
let sdk = null;
let provider = null;
let signer = null;
let userAddress = null;
let isOwner = false;
let currentBadgeTier = null;
let previousBadgeTier = null;
let badgeRefreshInterval = null;

// Celo Alfajores Chain ID
const CELO_ALFAJORES_CHAIN_ID = '0xaef3'; // 44787 in decimal

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    console.log('NFT Badge display element:', document.getElementById('nftBadgeDisplay'));
    console.log('Badge gallery element:', document.getElementById('badgeGallery'));
    console.log('Tier requirements element:', document.getElementById('tierRequirements'));
    
    initializeEventListeners();
    checkWalletConnection();
});

// ========== Initialization ==========

function initializeEventListeners() {
    // Wallet Connection
    document.getElementById('connectWallet').addEventListener('click', connectWallet);
    document.getElementById('disconnectWallet').addEventListener('click', disconnectWallet);
    
    // Tab Navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabName = e.target.closest('.nav-tab')?.dataset.tab;
            if (tabName) switchTab(tabName);
        });
    });
    
    // Registration
    document.getElementById('registerBtn').addEventListener('click', registerUser);
    document.getElementById('registerGenesisBtn').addEventListener('click', registerGenesis);
    document.getElementById('copyCodeBtn').addEventListener('click', copyReferralCode);
    
    // Quests
    document.getElementById('createQuestBtn')?.addEventListener('click', createQuest);
    
    // Seasons
    document.getElementById('startSeasonBtn')?.addEventListener('click', startSeason);
    document.getElementById('endSeasonBtn')?.addEventListener('click', endSeason);
    
    // Staking
    document.getElementById('approveStakeBtn').addEventListener('click', approveStake);
    document.getElementById('stakeBtn').addEventListener('click', stake);
    document.getElementById('unstakeBtn').addEventListener('click', unstake);
    
    // Admin
    document.getElementById('authorizePartnerBtn')?.addEventListener('click', () => authorizePartner(true));
    document.getElementById('revokePartnerBtn')?.addEventListener('click', () => authorizePartner(false));
    document.getElementById('setPlatformFeeBtn')?.addEventListener('click', setPlatformFee);
}

async function checkWalletConnection() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                await connectWallet();
            }
        } catch (error) {
            console.error('Error checking wallet connection:', error);
        }
    }
}

// ========== Wallet Functions ==========

async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        showAlert('MetaMask is not installed. Please install MetaMask to use this app.', 'error');
        return;
    }

    try {
        showLoading(true);
        
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Check if on Celo Alfajores
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        if (chainId !== CELO_ALFAJORES_CHAIN_ID) {
            await switchToCeloAlfajores();
        }
        
        // Initialize ethers provider and signer
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        userAddress = accounts[0];
        
        // Initialize SDK
        sdk = new CeloReferSDK(provider, signer);
        
        // Update UI
        updateWalletUI();
        
        // Load user data
        await loadUserData();
        
        // Load initial data for all tabs
        await Promise.allSettled([
            loadQuests(),
            loadSeasonStats(),
            loadStakeInfo()
        ]);
        
        // Load admin data if owner
        if (isOwner) {
            await loadAdminData();
        }
        
        // Setup event listeners
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
        
        // Setup contract event listeners for real-time updates
        setupContractEventListeners();
        
        // Auto-refresh badge every 30 seconds to catch blockchain updates
        startBadgeRefresh();
        
        showAlert('Wallet connected successfully!', 'success');
        
    } catch (error) {
        console.error('Error connecting wallet:', error);
        showAlert('Failed to connect wallet: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function switchToCeloAlfajores() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: CELO_ALFAJORES_CHAIN_ID }],
        });
    } catch (switchError) {
        // Chain not added to MetaMask
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: CELO_ALFAJORES_CHAIN_ID,
                        chainName: 'Celo Alfajores Testnet',
                        nativeCurrency: {
                            name: 'CELO',
                            symbol: 'CELO',
                            decimals: 18
                        },
                        rpcUrls: ['https://alfajores-forno.celo-testnet.org'],
                        blockExplorerUrls: ['https://alfajores.celoscan.io']
                    }]
                });
            } catch (addError) {
                throw new Error('Failed to add Celo Alfajores network');
            }
        } else {
            throw switchError;
        }
    }
}

function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // User disconnected wallet
        resetApp();
    } else {
        // User switched accounts
        window.location.reload();
    }
}

function handleChainChanged() {
    window.location.reload();
}

function disconnectWallet() {
    try {
        // Remove event listeners
        if (window.ethereum) {
            window.ethereum.removeAllListeners('accountsChanged');
            window.ethereum.removeAllListeners('chainChanged');
        }
        
        // Reset app state
        resetApp();
        
        showAlert('Wallet disconnected successfully', 'info');
    } catch (error) {
        console.error('Error disconnecting wallet:', error);
        showAlert('Error disconnecting wallet', 'error');
    }
}

function updateWalletUI() {
    const connectBtn = document.getElementById('connectWallet');
    if (connectBtn) {
        connectBtn.style.display = 'none';
    }
    
    const walletInfo = document.getElementById('walletInfo');
    if (walletInfo) {
        walletInfo.classList.remove('hidden');
    }
    
    const walletAddr = document.getElementById('walletAddress');
    if (walletAddr) {
        walletAddr.textContent = formatAddress(userAddress);
    }
}

// ========== Data Loading ==========

async function loadUserData() {
    if (!sdk || !userAddress) {
        console.log('loadUserData: SDK or userAddress not available');
        return;
    }
    
    try {
        console.log('Loading user data for:', userAddress);
        
        // Load user info
        const userInfo = await sdk.getUserInfo(userAddress);
        console.log('User info loaded:', userInfo);
        
        const isRegistered = userInfo.referralInfo.isRegistered;
        console.log('Is registered:', isRegistered);
        
        // Update registration status (with null check)
        const regStatus = document.getElementById('registrationStatus');
        if (regStatus) {
            regStatus.textContent = isRegistered ? 'Registered ✓' : 'Not Registered';
            regStatus.style.color = isRegistered ? 'var(--success)' : 'var(--error)';
        }
        
        // Show empty badge if not registered
        if (!isRegistered) {
            const display = document.getElementById('nftBadgeDisplay');
            if (display) {
                display.innerHTML = `
                    <div style="text-align: center; padding: 60px 20px;">
                        <div style="font-size: 80px; opacity: 0.3;">🔒</div>
                        <h3 style="margin-top: 20px; color: var(--text-secondary);">No Badge Yet</h3>
                        <p style="color: var(--text-secondary); margin-top: 10px;">
                            Register to unlock your first badge and start earning rewards!
                        </p>
                    </div>
                `;
            }
            
            const gallery = document.getElementById('badgeGallery');
            if (gallery) {
                gallery.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 40px; opacity: 0.5;">
                        <p>Register to unlock badges</p>
                    </div>
                `;
            }
            
            const requirements = document.getElementById('tierRequirements');
            if (requirements) {
                requirements.innerHTML = `
                    <h4>Tier Requirements</h4>
                    <p style="text-align: center; padding: 20px; opacity: 0.7;">
                        Complete registration to view tier requirements
                    </p>
                `;
            }
        }
        
        if (isRegistered) {
            // Display referral code (with null checks)
            const refCode = document.getElementById('referralCode');
            if (refCode) {
                refCode.textContent = userInfo.referralInfo.referralCode;
            }
            
            const copyBtn = document.getElementById('copyCodeBtn');
            if (copyBtn) {
                copyBtn.classList.remove('hidden');
            }
            
            // Display stats (with null checks)
            const totalRefs = document.getElementById('totalReferrals');
            if (totalRefs) {
                totalRefs.textContent = userInfo.stats.referralCount.toString();
            }
            
            const totalEarned = document.getElementById('totalEarned');
            if (totalEarned) {
                totalEarned.textContent = sdk.formatCUSD(userInfo.stats.totalEarned) + ' cUSD';
            }
            
            const totalActions = document.getElementById('totalActions');
            if (totalActions) {
                totalActions.textContent = userInfo.stats.totalActions.toString();
            }
            
            // Display NFT Badge
            const tier = Number(userInfo.badgeTier);
            const referralCount = Number(userInfo.stats.referralCount);
            console.log('Updating NFT badge - Tier:', tier, 'Referrals:', referralCount);
            updateNFTBadgeDisplay(tier, referralCount);
            
            // Display referral tree (with null checks)
            const directRef = document.getElementById('directReferrer');
            if (directRef) {
                directRef.textContent = userInfo.referralInfo.directReferrer === ethers.ZeroAddress ? 'None (Genesis)' : formatAddress(userInfo.referralInfo.directReferrer);
            }
            
            const parentRef = document.getElementById('parentReferrer');
            if (parentRef) {
                parentRef.textContent = userInfo.referralInfo.parentReferrer === ethers.ZeroAddress ? 'None' : formatAddress(userInfo.referralInfo.parentReferrer);
            }
            
            // Display reward rates (with null checks)
            const rates = await sdk.getRewardRates(userAddress);
            const level1 = document.getElementById('level1Rate');
            if (level1) {
                level1.textContent = sdk.formatRewardRate(rates.level1Bps);
            }
            
            const level2 = document.getElementById('level2Rate');
            if (level2) {
                level2.textContent = sdk.formatRewardRate(rates.level2Bps);
            }
            
            // Load quest progress
            try {
                await loadQuests();
            } catch (err) {
                console.error('Error loading quests:', err);
            }
            
            // Load season stats
            try {
                await loadSeasonStats();
            } catch (err) {
                console.error('Error loading season stats:', err);
            }
            
            // Load stake info
            try {
                await loadStakeInfo();
            } catch (err) {
                console.error('Error loading stake info:', err);
            }
        }
        
        // Load cUSD balance (with null check)
        const balance = await sdk.getCUSDBalance(userAddress);
        const walletBal = document.getElementById('walletBalance');
        if (walletBal) {
            walletBal.textContent = sdk.formatCUSD(balance) + ' cUSD';
        }
        
        // Check if user is owner
        const owner = await sdk.getOwner();
        isOwner = owner.toLowerCase() === userAddress.toLowerCase();
        
        if (isOwner) {
            document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
            try {
                await loadAdminData();
            } catch (err) {
                console.error('Error loading admin data:', err);
            }
        }
        
    } catch (error) {
        console.error('Error loading user data:', error);
        console.error('Error stack:', error.stack);
        
        // Show which line caused the error
        if (error.stack) {
            const lines = error.stack.split('\n');
            console.error('Error location:', lines[1]);
        }
        
        showAlert('Error loading user data: ' + error.message, 'error');
    }
}

async function loadQuests() {
    try {
        const questsList = document.getElementById('questsList');
        questsList.innerHTML = '';
        
        // Demo quests aligned with Celo's vision - simulating blockchain data
        const celoQuests = [
            {
                id: 1,
                name: "Financial Inclusion Pioneer",
                description: "Help onboard 3 new users to experience financial freedom on Celo. Make prosperity accessible to everyone, everywhere.",
                targetReferrals: 3,
                rewardAmount: "10.00",
                category: "inclusion"
            },
            {
                id: 2,
                name: "Mobile-First Ambassador",
                description: "Bring 5 mobile users to Celo's mobile-first ecosystem. Banking for the next billion, right from their pocket.",
                targetReferrals: 5,
                rewardAmount: "25.00",
                category: "mobile"
            },
            {
                id: 3,
                name: "ReFi Champion",
                description: "Grow the regenerative finance movement by referring 10 users. Build a sustainable, carbon-negative future.",
                targetReferrals: 10,
                rewardAmount: "50.00",
                category: "refi"
            },
            {
                id: 4,
                name: "Climate Collective",
                description: "Unite 15 eco-conscious users on Celo. Support projects that restore nature while earning rewards.",
                targetReferrals: 15,
                rewardAmount: "100.00",
                category: "climate"
            },
            {
                id: 5,
                name: "Global Prosperity Builder",
                description: "Empower 25 people across borders with instant, low-cost transfers. Real financial tools for real people.",
                targetReferrals: 25,
                rewardAmount: "200.00",
                category: "global"
            },
            {
                id: 6,
                name: "Celo Evangelist",
                description: "Become a legend by bringing 50 users to the movement. Champion for prosperity for all on Celo.",
                targetReferrals: 50,
                rewardAmount: "500.00",
                category: "legend"
            }
        ];
        
        // Simulate blockchain fetch delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Get user's actual referral count
        let userReferralCount = 0;
        if (sdk && userAddress) {
            try {
                const userInfo = await sdk.getUserInfo(userAddress);
                userReferralCount = Number(userInfo.stats.referralCount);
            } catch (err) {
                console.log('Could not fetch user referral count:', err);
            }
        }
        
        celoQuests.forEach(quest => {
            const progress = userReferralCount;
            const progressPercent = Math.min((progress / quest.targetReferrals) * 100, 100);
            const completed = progress >= quest.targetReferrals;
            const claimed = false; // For demo, none are claimed
            
            let statusText = 'In Progress';
            let statusClass = 'in-progress';
            if (claimed) {
                statusText = 'Claimed ✓';
                statusClass = 'claimed';
            } else if (completed) {
                statusText = 'Completed!';
                statusClass = 'completed';
            }
            
            const questItem = document.createElement('div');
            questItem.className = 'quest-item';
            
            questItem.innerHTML = `
                <div class="quest-info">
                    <h4>${quest.name}</h4>
                    <p>${quest.description}</p>
                    <div style="display: flex; gap: 20px; margin-top: 12px; flex-wrap: wrap;">
                        <p style="margin: 0;"><strong>Target:</strong> ${quest.targetReferrals} referrals</p>
                        <p style="margin: 0;"><strong>Reward:</strong> ${quest.rewardAmount} cUSD</p>
                        <p style="margin: 0;"><strong>Chain:</strong> <span style="color: var(--primary);">Celo Alfajores</span></p>
                    </div>
                </div>
                <div class="quest-progress">
                    <span class="quest-status ${statusClass}">${statusText}</span>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <span>${progress} / ${quest.targetReferrals}</span>
                    ${completed && !claimed ? `<button class="btn btn-primary btn-sm" onclick="claimDemoQuest(${quest.id}, '${quest.name}', '${quest.rewardAmount}')">Claim Reward</button>` : ''}
                </div>
            `;
            
            questsList.appendChild(questItem);
        });
        
    } catch (error) {
        console.error('Error loading quests:', error);
        const questsList = document.getElementById('questsList');
        if (questsList) {
            questsList.innerHTML = '<p class="loading">Error loading quests. Please refresh.</p>';
        }
    }
}

async function loadSeasonStats() {
    try {
        const currentSeasonId = await sdk.getCurrentSeasonId();
        const currentSeason = await sdk.getCurrentSeason();
        
        const seasonInfo = document.getElementById('currentSeason');
        
        if (currentSeasonId === 0n || !currentSeason.isActive) {
            if (seasonInfo) {
                seasonInfo.innerHTML = '<p>No active season</p>';
            }
            
            const seasonRefs = document.getElementById('seasonReferrals');
            if (seasonRefs) {
                seasonRefs.textContent = '0';
            }
            
            const seasonEarn = document.getElementById('seasonEarnings');
            if (seasonEarn) {
                seasonEarn.textContent = '0 cUSD';
            }
            return;
        }
        
        const startDate = new Date(Number(currentSeason.startTime) * 1000).toLocaleString();
        const endDate = new Date(Number(currentSeason.endTime) * 1000).toLocaleString();
        
        if (seasonInfo) {
            seasonInfo.innerHTML = `
                <div class="season-status ${currentSeason.isActive ? 'active' : 'ended'}">
                    ${currentSeason.isActive ? 'Active' : 'Ended'}
                </div>
                <p><strong>Season ID:</strong> ${currentSeasonId.toString()}</p>
                <p><strong>Start:</strong> ${startDate}</p>
                <p><strong>End:</strong> ${endDate}</p>
                <p><strong>Prize Pool:</strong> ${sdk.formatCUSD(currentSeason.totalPrizePool)} cUSD</p>
                <p><strong>Winners:</strong> ${currentSeason.winnersCount.toString()}</p>
            `;
        }
        
        // Load user's season stats
        const seasonStats = await sdk.getSeasonStats(currentSeasonId, userAddress);
        
        const seasonRefs = document.getElementById('seasonReferrals');
        if (seasonRefs) {
            seasonRefs.textContent = seasonStats.referrals.toString();
        }
        
        const seasonEarn = document.getElementById('seasonEarnings');
        if (seasonEarn) {
            seasonEarn.textContent = sdk.formatCUSD(seasonStats.earnings) + ' cUSD';
        }
        
    } catch (error) {
        console.error('Error loading season stats:', error);
    }
}

async function loadStakeInfo() {
    try {
        const stakeInfo = await sdk.getUserStakeInfo(userAddress);
        
        const stakedAmt = document.getElementById('stakedAmount');
        if (stakedAmt) {
            stakedAmt.textContent = sdk.formatCUSD(stakeInfo.stakedAmount) + ' cUSD';
        }
        
        const stakeTimeEl = document.getElementById('stakeTime');
        if (stakeTimeEl) {
            if (stakeInfo.stakeTime > 0n) {
                const stakeDate = new Date(Number(stakeInfo.stakeTime) * 1000).toLocaleString();
                stakeTimeEl.textContent = stakeDate;
            } else {
                stakeTimeEl.textContent = 'Not staked';
            }
        }
        
        // Load contract stats
        const contractStats = await sdk.getContractStats();
        
        const totalStaked = document.getElementById('totalStaked');
        if (totalStaked) {
            totalStaked.textContent = sdk.formatCUSD(contractStats._totalStaked) + ' cUSD';
        }
        
        const minStake = document.getElementById('minimumStake');
        if (minStake) {
            minStake.textContent = sdk.formatCUSD(contractStats._minimumStake) + ' cUSD';
        }
        
    } catch (error) {
        console.error('Error loading stake info:', error);
    }
}

async function loadAdminData() {
    try {
        const platformFee = await sdk.getPlatformFee();
        const currentFee = document.getElementById('currentPlatformFee');
        if (currentFee) {
            currentFee.textContent = sdk.formatRewardRate(platformFee);
        }
        
        const owner = await sdk.getOwner();
        const ownerEl = document.getElementById('contractOwner');
        if (ownerEl) {
            ownerEl.textContent = formatAddress(owner);
        }
        
        const treasury = await sdk.getTreasury();
        const treasuryEl = document.getElementById('treasuryAddress');
        if (treasuryEl) {
            treasuryEl.textContent = formatAddress(treasury);
        }
        
    } catch (error) {
        console.error('Error loading admin data:', error);
    }
}

// ========== Registration Functions ==========

async function registerUser() {
    const referralCode = document.getElementById('referralCodeInput').value.trim();
    
    if (!referralCode) {
        showAlert('Please enter a referral code', 'warning');
        return;
    }
    
    try {
        showLoading(true);
        
        // Check if code exists
        const referrerAddress = await sdk.getAddressFromCode(referralCode);
        if (referrerAddress === ethers.ZeroAddress) {
            showAlert('Invalid referral code', 'error');
            return;
        }
        
        const tx = await sdk.register(referralCode);
        showAlert('Registration transaction submitted. Waiting for confirmation...', 'info');
        
        await tx.wait();
        showAlert('Successfully registered!', 'success');
        
        // Reload user data (which includes badge display)
        await loadUserData();
        
        // Start badge refresh now that user is registered
        startBadgeRefresh();
        
    } catch (error) {
        console.error('Error registering:', error);
        showAlert('Registration failed: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function registerGenesis() {
    const userCode = document.getElementById('genesisCodeInput').value.trim();
    
    if (!userCode) {
        showAlert('Please enter a referral code', 'warning');
        return;
    }
    
    try {
        showLoading(true);
        
        const tx = await sdk.registerGenesis(userCode);
        showAlert('Genesis registration transaction submitted. Waiting for confirmation...', 'info');
        
        await tx.wait();
        showAlert('Successfully registered as genesis user!', 'success');
        
        // Reload user data (which includes badge display)
        await loadUserData();
        
        // Start badge refresh now that user is registered
        startBadgeRefresh();
        
    } catch (error) {
        console.error('Error registering genesis:', error);
        showAlert('Genesis registration failed: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

function copyReferralCode() {
    const code = document.getElementById('referralCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
        showAlert('Referral code copied to clipboard!', 'success');
    });
}

// ========== Quest Functions ==========

async function claimQuest(questId) {
    try {
        showLoading(true);
        
        const tx = await sdk.claimQuestReward(questId);
        showAlert('Claim transaction submitted. Waiting for confirmation...', 'info');
        
        await tx.wait();
        showAlert('Quest reward claimed successfully!', 'success');
        
        await loadQuests();
        await loadUserData();
        
    } catch (error) {
        console.error('Error claiming quest:', error);
        showAlert('Failed to claim quest: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Demo quest claim with blockchain simulation
async function claimDemoQuest(questId, questName, rewardAmount) {
    try {
        showLoading(true);
        
        // Simulate blockchain transaction
        showAlert('Simulating blockchain transaction on Celo Alfajores...', 'info');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate transaction hash
        const mockTxHash = '0x' + Array.from({length: 64}, () => 
            Math.floor(Math.random() * 16).toString(16)).join('');
        
        showAlert(`Transaction submitted: ${mockTxHash.substring(0, 10)}...`, 'info');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Success message
        showAlert(`Quest "${questName}" completed! Earned ${rewardAmount} cUSD`, 'success');
        showAlert(`Reward will be distributed via smart contract on Celo mainnet`, 'info');
        
        // Reload quests
        await loadQuests();
        
    } catch (error) {
        console.error('Error claiming demo quest:', error);
        showAlert('Failed to claim quest: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function createQuest() {
    const name = document.getElementById('questName').value.trim();
    const description = document.getElementById('questDescription').value.trim();
    const targetReferrals = document.getElementById('questTargetReferrals').value;
    const rewardAmount = document.getElementById('questRewardAmount').value;
    
    if (!name || !description || !targetReferrals || !rewardAmount) {
        showAlert('Please fill all fields', 'warning');
        return;
    }
    
    try {
        showLoading(true);
        
        const rewardAmountWei = sdk.parseCUSD(rewardAmount);
        
        const tx = await sdk.createQuest(name, description, targetReferrals, rewardAmountWei);
        showAlert('Create quest transaction submitted. Waiting for confirmation...', 'info');
        
        await tx.wait();
        showAlert('Quest created successfully!', 'success');
        
        // Clear form
        document.getElementById('questName').value = '';
        document.getElementById('questDescription').value = '';
        document.getElementById('questTargetReferrals').value = '';
        document.getElementById('questRewardAmount').value = '';
        
        await loadQuests();
        
    } catch (error) {
        console.error('Error creating quest:', error);
        showAlert('Failed to create quest: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// ========== Season Functions ==========

async function startSeason() {
    const duration = document.getElementById('seasonDuration').value;
    const prizePool = document.getElementById('seasonPrizePool').value;
    const winnersCount = document.getElementById('seasonWinnersCount').value;
    
    if (!duration || !prizePool || !winnersCount) {
        showAlert('Please fill all fields', 'warning');
        return;
    }
    
    try {
        showLoading(true);
        
        const prizePoolWei = sdk.parseCUSD(prizePool);
        
        const tx = await sdk.startSeason(duration, prizePoolWei, winnersCount);
        showAlert('Start season transaction submitted. Waiting for confirmation...', 'info');
        
        await tx.wait();
        showAlert('Season started successfully!', 'success');
        
        await loadSeasonStats();
        
    } catch (error) {
        console.error('Error starting season:', error);
        showAlert('Failed to start season: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function endSeason() {
    try {
        showLoading(true);
        
        const tx = await sdk.endSeason();
        showAlert('End season transaction submitted. Waiting for confirmation...', 'info');
        
        await tx.wait();
        showAlert('Season ended successfully!', 'success');
        
        await loadSeasonStats();
        
    } catch (error) {
        console.error('Error ending season:', error);
        showAlert('Failed to end season: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// ========== Staking Functions ==========

async function approveStake() {
    const amount = document.getElementById('stakeAmount').value;
    
    if (!amount || amount <= 0) {
        showAlert('Please enter a valid amount', 'warning');
        return;
    }
    
    try {
        showLoading(true);
        
        const amountWei = sdk.parseCUSD(amount);
        
        const tx = await sdk.approveCUSD(sdk.DEMO_DAPP_ADDRESS, amountWei);
        showAlert('Approval transaction submitted. Waiting for confirmation...', 'info');
        
        await tx.wait();
        showAlert('cUSD approved successfully!', 'success');
        
    } catch (error) {
        console.error('Error approving:', error);
        showAlert('Approval failed: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function stake() {
    const amount = document.getElementById('stakeAmount').value;
    const referralCode = document.getElementById('stakeReferralCode').value.trim();
    
    if (!amount || amount <= 0) {
        showAlert('Please enter a valid amount', 'warning');
        return;
    }
    
    try {
        showLoading(true);
        
        const amountWei = sdk.parseCUSD(amount);
        
        const tx = await sdk.stake(amountWei, referralCode);
        showAlert('Stake transaction submitted. Waiting for confirmation...', 'info');
        
        await tx.wait();
        showAlert('Staked successfully!', 'success');
        
        await loadStakeInfo();
        await loadUserData();
        
    } catch (error) {
        console.error('Error staking:', error);
        showAlert('Staking failed: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function unstake() {
    const amount = document.getElementById('unstakeAmount').value;
    
    if (!amount || amount <= 0) {
        showAlert('Please enter a valid amount', 'warning');
        return;
    }
    
    try {
        showLoading(true);
        
        const amountWei = sdk.parseCUSD(amount);
        
        const tx = await sdk.unstake(amountWei);
        showAlert('Unstake transaction submitted. Waiting for confirmation...', 'info');
        
        await tx.wait();
        showAlert('Unstaked successfully!', 'success');
        
        await loadStakeInfo();
        await loadUserData();
        
    } catch (error) {
        console.error('Error unstaking:', error);
        showAlert('Unstaking failed: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// ========== Leaderboard Functions ==========

async function loadLeaderboard() {
    try {
        const leaderboardList = document.getElementById('leaderboardList');
        if (!leaderboardList) return;
        
        leaderboardList.innerHTML = '<p class="loading">Loading leaderboard...</p>';
        
        // Get all registered users by listening to past events
        const filter = sdk.celoRefer.filters.UserRegistered();
        const events = await sdk.celoRefer.queryFilter(filter, 0, 'latest');
        
        // Create a map of users with their referral counts
        const userStats = new Map();
        
        for (const event of events) {
            const userAddr = event.args.user;
            try {
                const userInfo = await sdk.getUserInfo(userAddr);
                if (userInfo.referralInfo.isRegistered) {
                    userStats.set(userAddr, {
                        address: userAddr,
                        code: userInfo.referralInfo.referralCode,
                        referralCount: Number(userInfo.stats.referralCount),
                        totalEarned: userInfo.stats.totalEarned,
                        badgeTier: Number(userInfo.badgeTier)
                    });
                }
            } catch (err) {
                console.error('Error fetching user:', userAddr, err);
            }
        }
        
        // Convert to array and sort by referral count
        const sortedUsers = Array.from(userStats.values())
            .sort((a, b) => b.referralCount - a.referralCount)
            .slice(0, 50); // Top 50
        
        if (sortedUsers.length === 0) {
            leaderboardList.innerHTML = '<p class="loading">No users yet</p>';
            return;
        }
        
        leaderboardList.innerHTML = '';
        
        sortedUsers.forEach((user, index) => {
            const rank = index + 1;
            const tierNames = ['Bronze', 'Silver', 'Gold', 'Platinum'];
            const tierEmojis = ['🥉', '🥈', '🥇', '💎'];
            const tierName = tierNames[user.badgeTier] || 'Bronze';
            const tierEmoji = tierEmojis[user.badgeTier] || '🥉';
            
            let rankBadge = '';
            if (rank === 1) rankBadge = '🥇';
            else if (rank === 2) rankBadge = '🥈';
            else if (rank === 3) rankBadge = '🥉';
            else rankBadge = `#${rank}`;
            
            const isCurrentUser = user.address.toLowerCase() === userAddress.toLowerCase();
            
            const leaderItem = document.createElement('div');
            leaderItem.className = `quest-item ${isCurrentUser ? 'admin-only' : ''}`;
            leaderItem.innerHTML = `
                <div style="display: flex; align-items: center; gap: 20px; flex: 1;">
                    <div style="font-size: 32px; font-weight: 900; min-width: 60px;">${rankBadge}</div>
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                            <span style="font-family: monospace; font-weight: 700; font-size: 14px;">${formatAddress(user.address)}</span>
                            ${isCurrentUser ? '<span class="badge badge-Gold">YOU</span>' : ''}
                        </div>
                        <div style="font-size: 13px; color: var(--gray-600);">
                            Code: <strong>${user.code}</strong>
                        </div>
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 24px;">${tierEmoji}</span>
                        <div style="text-align: right;">
                            <div style="font-size: 11px; color: var(--gray-600); text-transform: uppercase; font-weight: 700;">Referrals</div>
                            <div style="font-size: 28px; font-weight: 900; letter-spacing: -0.02em;">${user.referralCount}</div>
                        </div>
                    </div>
                    <div style="text-align: right; font-size: 13px;">
                        <span style="color: var(--gray-600);">Earned:</span> <strong>${sdk.formatCUSD(user.totalEarned)} cUSD</strong>
                    </div>
                </div>
            `;
            
            leaderboardList.appendChild(leaderItem);
        });
        
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        const leaderboardList = document.getElementById('leaderboardList');
        if (leaderboardList) {
            leaderboardList.innerHTML = '<p class="loading">Error loading leaderboard</p>';
        }
    }
}

// ========== Admin Functions ==========

async function authorizePartner(authorized) {
    const partnerAddress = document.getElementById('partnerAddress').value.trim();
    
    if (!partnerAddress || !ethers.isAddress(partnerAddress)) {
        showAlert('Please enter a valid address', 'warning');
        return;
    }
    
    try {
        showLoading(true);
        
        const tx = await sdk.authorizePartner(partnerAddress, authorized);
        showAlert('Transaction submitted. Waiting for confirmation...', 'info');
        
        await tx.wait();
        showAlert(`Partner ${authorized ? 'authorized' : 'revoked'} successfully!`, 'success');
        
    } catch (error) {
        console.error('Error authorizing partner:', error);
        showAlert('Failed to authorize partner: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function setPlatformFee() {
    const fee = document.getElementById('platformFee').value;
    
    if (!fee || fee < 0 || fee > 2000) {
        showAlert('Please enter a valid fee (0-2000)', 'warning');
        return;
    }
    
    try {
        showLoading(true);
        
        const tx = await sdk.setPlatformFee(fee);
        showAlert('Transaction submitted. Waiting for confirmation...', 'info');
        
        await tx.wait();
        showAlert('Platform fee updated successfully!', 'success');
        
        await loadAdminData();
        
    } catch (error) {
        console.error('Error setting platform fee:', error);
        showAlert('Failed to set platform fee: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// ========== UI Helper Functions ==========

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    const activeTab = document.querySelector(`.nav-tab[data-tab="${tabName}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const tabContent = document.getElementById(tabName);
    if (tabContent) {
        tabContent.classList.add('active');
    }
    
    // Load tab-specific data
    if (sdk && userAddress) {
        switch(tabName) {
            case 'quests':
                loadQuests();
                break;
            case 'seasons':
                loadSeasonStats();
                break;
            case 'staking':
                loadStakeInfo();
                break;
            case 'leaderboard':
                loadLeaderboard();
                break;
            case 'admin':
                if (isOwner) {
                    loadAdminData();
                }
                break;
        }
    }
}

function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    alertContainer.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
    }
}

function formatAddress(address) {
    if (!address || address === ethers.ZeroAddress) return 'None';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

function resetApp() {
    sdk = null;
    provider = null;
    signer = null;
    userAddress = null;
    isOwner = false;
    
    // Stop badge refresh
    if (badgeRefreshInterval) {
        clearInterval(badgeRefreshInterval);
        badgeRefreshInterval = null;
    }
    
    const connectBtn = document.getElementById('connectWallet');
    if (connectBtn) {
        connectBtn.style.display = 'block';
    }
    
    const walletInfo = document.getElementById('walletInfo');
    if (walletInfo) {
        walletInfo.classList.add('hidden');
    }
    
    showAlert('Wallet disconnected', 'info');
}

// ========== NFT Badge System ==========

const BADGE_DATA = {
    0: { name: 'Bronze', icon: '🥉', threshold: 0, color: 'bronze' },
    1: { name: 'Silver', icon: '🥈', threshold: 5, color: 'silver' },
    2: { name: 'Gold', icon: '🥇', threshold: 15, color: 'gold' },
    3: { name: 'Platinum', icon: '💎', threshold: 50, color: 'platinum' }
};

function createNFTBadge(tier, referralCount, nextThreshold) {
    const badge = BADGE_DATA[tier];
    const progress = nextThreshold > 0 ? Math.min((referralCount / nextThreshold) * 100, 100) : 100;
    const circumference = 2 * Math.PI * 37; // Smaller ring radius
    const offset = circumference - (progress / 100) * circumference;
    const badgeId = `#${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`;
    const edition = tier === 3 ? 'EXCLUSIVE' : tier === 2 ? 'RARE' : 'LIMITED';
    
    return `
        <div class="nft-badge-container">
            <div class="nft-badge-card">
                <div class="nft-badge-inner nft-badge-${badge.color}">
                    
                    <!-- Artwork Area (70% top) -->
                    <div class="nft-artwork">
                        <!-- Pattern Behind -->
                        <div class="nft-artwork-pattern"></div>
                        
                        <!-- Central Symbol -->
                        <div class="nft-artwork-symbol">${badge.icon}</div>
                        
                        <!-- Holographic Shine -->
                        <div class="nft-artwork-shine"></div>
                        
                        <!-- Badge ID Tag -->
                        <div class="nft-badge-id-tag">${badgeId}</div>
                        
                        <!-- Edition Badge -->
                        <div class="nft-edition-badge">${edition}</div>
                        
                        <!-- Network Badge -->
                        <div class="nft-network-badge">CELO</div>
                    </div>
                    
                    <!-- Info Section (30% bottom) -->
                    <div class="nft-info">
                        <div class="nft-collection">CeloRefer Collection</div>
                        <div class="nft-title">${badge.name} Tier</div>
                        <div class="nft-stats-row">
                            <div class="nft-stat-item">
                                <div class="nft-stat-label">Referrals</div>
                                <div class="nft-stat-value">${referralCount}</div>
                            </div>
                            <div class="nft-stat-item">
                                <div class="nft-stat-label">${nextThreshold > 0 ? 'To Next' : 'Status'}</div>
                                <div class="nft-stat-value">${nextThreshold > 0 ? nextThreshold - referralCount : 'MAX'}</div>
                            </div>
                            <div class="nft-stat-item">
                                <div class="nft-stat-label">Tier</div>
                                <div class="nft-stat-value">${tier + 1}/4</div>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    `;
}

function createCompactBadge(tier) {
    const badge = BADGE_DATA[tier];
    return `
        <div class="nft-badge-compact nft-badge-compact-${badge.color}">
            <span class="nft-badge-compact-icon">${badge.icon}</span>
            <span>${badge.name}</span>
        </div>
    `;
}

function renderBadgeGallery(currentTier, referralCount) {
    const gallery = document.getElementById('badgeGallery');
    const requirements = document.getElementById('tierRequirements');
    
    if (!gallery || !requirements) return;
    
    let galleryHTML = '';
    let requirementsHTML = '<h4>Tier Requirements</h4>';
    
    for (let tier = 0; tier <= 3; tier++) {
        const badge = BADGE_DATA[tier];
        const unlocked = tier <= currentTier;
        const isCurrent = tier === currentTier;
        const edition = tier === 3 ? 'EXCLUSIVE' : tier === 2 ? 'RARE' : 'LIMITED';
        
        // Create mini NFT card for gallery
        galleryHTML += `
            <div class="nft-badge-preview ${unlocked ? 'unlocked' : ''} ${isCurrent ? 'current' : ''}">
                <div class="nft-badge-inner nft-badge-${badge.color}">
                    ${!unlocked ? '<div class="nft-badge-lock">🔒</div>' : ''}
                    
                    <!-- Artwork Area -->
                    <div class="nft-artwork">
                        <div class="nft-artwork-pattern"></div>
                        <div class="nft-artwork-symbol">${badge.icon}</div>
                        <div class="nft-artwork-shine"></div>
                        <div class="nft-edition-badge" style="font-size: 8px; padding: 4px 8px;">${edition}</div>
                    </div>
                    
                    <!-- Info Section -->
                    <div class="nft-info" style="padding: 12px 16px; height: 30%;">
                        <div class="nft-collection" style="font-size: 9px; margin-bottom: 4px;">CeloRefer</div>
                        <div class="nft-title" style="font-size: 16px; margin-bottom: 6px;">${badge.name}</div>
                        <div style="font-size: 10px; opacity: 0.6; font-weight: 600;">${badge.threshold}+ Refs</div>
                    </div>
                </div>
            </div>
        `;
        
        const achieved = referralCount >= badge.threshold;
        const isCurrentReq = tier === currentTier;
        
        requirementsHTML += `
            <div class="nft-tier-requirement ${achieved ? 'achieved' : ''} ${isCurrentReq ? 'current' : ''}">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 32px;">${badge.icon}</span>
                    <div>
                        <div style="font-size: 18px; font-weight: 700; margin-bottom: 4px;">${badge.name} Tier</div>
                        <div style="font-size: 13px; opacity: 0.6; font-weight: 600;">${badge.threshold} referrals required</div>
                    </div>
                </div>
                <div style="font-size: 14px; font-weight: 700;">
                    ${achieved ? '✅ Unlocked' : `🔒 ${badge.threshold - referralCount} more`}
                </div>
            </div>
        `;
    }
    
    gallery.innerHTML = galleryHTML;
    requirements.innerHTML = requirementsHTML;
}

function showLevelUpNotification(newTier) {
    const badge = BADGE_DATA[newTier];
    const notification = document.createElement('div');
    notification.className = 'level-up-notification';
    notification.innerHTML = `
        <h2>🎉 Level Up! 🎉</h2>
        <div class="level-up-icon">${badge.icon}</div>
        <h3>You've reached ${badge.name} Tier!</h3>
        <p style="margin-top: 20px; font-size: 18px; color: #0F0F0F;">
            Keep referring to unlock higher tiers and better rewards!
        </p>
    `;
    
    document.body.appendChild(notification);
    
    // Confetti effect (simple)
    createConfetti();
    
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

function createConfetti() {
    const colors = ['#FCFF52', '#35D07F', '#FE6F5E', '#2E9EFF', '#FFB800'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.style.top = '-10px';
        confetti.style.opacity = '1';
        confetti.style.zIndex = '9999';
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.pointerEvents = 'none';
        
        document.body.appendChild(confetti);
        
        const duration = 2000 + Math.random() * 1000;
        const rotate = Math.random() * 360;
        const xMovement = (Math.random() - 0.5) * 200;
        
        confetti.animate([
            { 
                transform: `translateY(0) translateX(0) rotate(0deg)`,
                opacity: 1
            },
            { 
                transform: `translateY(${window.innerHeight}px) translateX(${xMovement}px) rotate(${rotate}deg)`,
                opacity: 0
            }
        ], {
            duration: duration,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        
        setTimeout(() => confetti.remove(), duration);
    }
}

function updateNFTBadgeDisplay(tier, referralCount) {
    console.log('updateNFTBadgeDisplay called - Tier:', tier, 'Count:', referralCount);
    
    // Convert BigInt to Number
    tier = Number(tier);
    referralCount = Number(referralCount);
    
    console.log('Converted - Tier:', tier, 'Count:', referralCount);
    
    const display = document.getElementById('nftBadgeDisplay');
    
    if (!display) {
        console.error('nftBadgeDisplay element not found!');
        return;
    }
    
    console.log('Found nftBadgeDisplay element, creating badge...');
    
    // Check for tier upgrade
    if (previousBadgeTier !== null && tier > previousBadgeTier) {
        showLevelUpNotification(tier);
    }
    previousBadgeTier = tier;
    
    // Calculate next threshold
    let nextThreshold = 0;
    if (tier < 3) {
        nextThreshold = BADGE_DATA[tier + 1].threshold;
    }
    
    const badgeHTML = createNFTBadge(tier, referralCount, nextThreshold);
    console.log('Badge HTML created, length:', badgeHTML.length);
    
    display.innerHTML = badgeHTML;
    console.log('Badge HTML inserted into DOM');
    
    renderBadgeGallery(tier, referralCount);
    console.log('Badge gallery rendered');
}

// ========== Real-time Updates ==========

function setupContractEventListeners() {
    if (!sdk || !userAddress) return;
    
    try {
        // Listen for UserRegistered events (when someone uses your referral code)
        sdk.celoRefer.on('UserRegistered', async (user, directReferrer, parentReferrer, referralCode) => {
            // If we are the referrer, update our badge
            if (directReferrer.toLowerCase() === userAddress.toLowerCase() || 
                parentReferrer.toLowerCase() === userAddress.toLowerCase()) {
                console.log('New referral detected! Refreshing badge...');
                await refreshBadgeData();
                showAlert('🎉 New referral! Your stats have been updated!', 'success');
            }
        });
        
        // Listen for QuestCompleted events
        sdk.celoRefer.on('QuestCompleted', async (user, questId) => {
            if (user.toLowerCase() === userAddress.toLowerCase()) {
                console.log('Quest completed!');
                await loadQuests();
                showAlert('🎯 Quest completed! Check Quests tab to claim reward!', 'success');
            }
        });
        
        console.log('Contract event listeners setup successfully');
    } catch (error) {
        console.error('Error setting up event listeners:', error);
    }
}

function startBadgeRefresh() {
    // Clear any existing interval
    if (badgeRefreshInterval) {
        clearInterval(badgeRefreshInterval);
    }
    
    // Refresh badge data every 30 seconds
    badgeRefreshInterval = setInterval(async () => {
        if (sdk && userAddress) {
            await refreshBadgeData();
            
            // Update last refresh time
            const now = new Date();
            const timeStr = now.toLocaleTimeString();
            const lastRefreshEl = document.getElementById('lastRefreshTime');
            if (lastRefreshEl) {
                lastRefreshEl.textContent = `Last auto-refresh: ${timeStr}`;
            }
        }
    }, 30000); // 30 seconds
}

async function refreshBadgeData() {
    if (!sdk || !userAddress) return;
    
    try {
        const userInfo = await sdk.getUserInfo(userAddress);
        
        if (userInfo.referralInfo.isRegistered) {
            const referralCount = Number(userInfo.stats.referralCount);
            const tier = Number(userInfo.badgeTier);
            
            // Update referral count display
            const totalRefs = document.getElementById('totalReferrals');
            if (totalRefs) {
                totalRefs.textContent = referralCount.toString();
            }
            
            // Update earnings
            const totalEarned = document.getElementById('totalEarned');
            if (totalEarned) {
                totalEarned.textContent = sdk.formatCUSD(userInfo.stats.totalEarned) + ' cUSD';
            }
            
            // Update NFT badge (this will trigger level-up animation if tier changed)
            updateNFTBadgeDisplay(tier, referralCount);
            
            // Update reward rates in case tier changed
            const rates = await sdk.getRewardRates(userAddress);
            const level1 = document.getElementById('level1Rate');
            if (level1) {
                level1.textContent = sdk.formatRewardRate(rates.level1Bps);
            }
            
            const level2 = document.getElementById('level2Rate');
            if (level2) {
                level2.textContent = sdk.formatRewardRate(rates.level2Bps);
            }
        }
    } catch (error) {
        console.error('Error refreshing badge data:', error);
    }
}

// Manual refresh function (can be called after user actions)
async function forceRefreshBadge() {
    const refreshBtn = document.getElementById('refreshBadgeBtn');
    if (refreshBtn) {
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = '⏳ Refreshing...';
    }
    
    try {
        await refreshBadgeData();
        
        // Update last refresh time
        const now = new Date();
        const timeStr = now.toLocaleTimeString();
        const lastRefreshEl = document.getElementById('lastRefreshTime');
        if (lastRefreshEl) {
            lastRefreshEl.textContent = `Last updated: ${timeStr}`;
        }
        
        showAlert('Badge refreshed successfully!', 'success');
    } catch (error) {
        showAlert('Failed to refresh badge: ' + error.message, 'error');
    } finally {
        if (refreshBtn) {
            refreshBtn.disabled = false;
            refreshBtn.innerHTML = '🔄 Refresh';
        }
    }
}

// Make functions available globally for inline onclick
window.claimQuest = claimQuest;
window.claimDemoQuest = claimDemoQuest;
window.refreshBadge = forceRefreshBadge;

