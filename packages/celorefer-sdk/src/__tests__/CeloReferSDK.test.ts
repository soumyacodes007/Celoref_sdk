import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CeloReferSDK } from '../CeloReferSDK';
import { 
  CELO_REFER_ABI, 
  DEMO_DAPP_ABI, 
  ERC20_ABI,
  CONTRACT_ADDRESSES 
} from '../abis';

// Mock viem
vi.mock('viem', async () => {
  const actual = await vi.importActual('viem') as any;
  return {
    ...actual,
    createPublicClient: vi.fn().mockReturnValue({
      readContract: vi.fn(),
      simulateContract: vi.fn().mockResolvedValue({
        request: {}
      })
    }),
    createWalletClient: vi.fn().mockReturnValue({
      getAddresses: vi.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
      writeContract: vi.fn().mockResolvedValue('0x1234567890123456789012345678901234567890')
    }),
    http: vi.fn()
  };
});

describe('CeloReferSDK', () => {
  let sdk: CeloReferSDK;
  
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create mock clients
    const mockChain = {
      id: 44787, // Alfajores testnet
      name: 'Celo Alfajores',
      network: 'alfajores',
      nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
      rpcUrls: { default: { http: ['https://alfajores-forno.celo-testnet.org'] } }
    };
    
    const mockWalletClient = {
      getAddresses: vi.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
      writeContract: vi.fn().mockResolvedValue('0x1234567890123456789012345678901234567890')
    };
    
    sdk = CeloReferSDK.create(mockChain, mockWalletClient as any);
  });

  it('should create an instance of CeloReferSDK', () => {
    expect(sdk).toBeInstanceOf(CeloReferSDK);
  });

  it('should get user info', async () => {
    const mockUserInfo = [
      {
        directReferrer: '0x0000000000000000000000000000000000000000',
        parentReferrer: '0x0000000000000000000000000000000000000000',
        referralCode: 'REF123',
        isRegistered: true
      },
      {
        referralCount: 5n,
        totalEarned: 1000000000000000000n,
        totalActions: 3n,
        registrationTime: 1640995200n
      },
      1,
      true
    ];
    
    // Mock the readContract method
    (sdk as any).publicClient.readContract = vi.fn().mockResolvedValue(mockUserInfo);
    
    const userInfo = await sdk.getUserInfo('0x1234567890123456789012345678901234567890');
    
    expect(userInfo).toEqual({
      referralInfo: mockUserInfo[0],
      stats: mockUserInfo[1],
      badgeTier: 1,
      verified: true
    });
  });

  it('should register a user', async () => {
    const txHash = await sdk.registerUser('REF123');
    expect(txHash).toBe('0x1234567890123456789012345678901234567890');
  });

  it('should get badge info', () => {
    const badgeInfo = sdk.getBadgeInfo(2);
    expect(badgeInfo.name).toBe('Gold');
    expect(badgeInfo.referralThreshold).toBe(15);
  });

  it('should generate referral link', () => {
    const referralLink = sdk.generateReferralLink('REF123');
    expect(referralLink).toContain('?ref=REF123');
  });

  // NFT Reputation System Tests
  it('should mint reputation NFT', async () => {
    const txHash = await sdk.mintReputationNFT('0x1234567890123456789012345678901234567890');
    expect(txHash).toBe('0x1234567890123456789012345678901234567890');
  });

  it('should get reputation NFT data', async () => {
    const mockUserInfo = [
      {
        directReferrer: '0x0000000000000000000000000000000000000000',
        parentReferrer: '0x0000000000000000000000000000000000000000',
        referralCode: 'REF123',
        isRegistered: true
      },
      {
        referralCount: 5n,
        totalEarned: 1000000000000000000n,
        totalActions: 3n,
        registrationTime: 1640995200n
      },
      1,
      true
    ];
    
    // Mock the readContract method
    (sdk as any).publicClient.readContract = vi.fn().mockResolvedValue(mockUserInfo);
    
    const nftData = await sdk.getReputationNFTData('0x1234567890123456789012345678901234567890');
    expect(nftData).toBeDefined();
    expect(nftData.tier).toBe(1);
    expect(nftData.referrals).toBe(5);
    expect(nftData.earnings).toBe('1000000000000000000');
  });

  it('should update reputation NFT', async () => {
    const txHash = await sdk.updateReputationNFT('0x1234567890123456789012345678901234567890', 10, '2000000000000000000', 2);
    expect(txHash).toBe('0x0000000000000000000000000000000000000000000000000000000000000000');
  });

  it('should generate badge SVG', () => {
    const svg = sdk.generateBadgeSVG(2, 10, '2000000000000000000', 5);
    expect(svg).toContain('data:image/svg+xml;base64,');
    // Decode the base64 to check the content
    const base64Data = svg.replace('data:image/svg+xml;base64,', '');
    const decodedSvg = Buffer.from(base64Data, 'base64').toString('utf-8');
    expect(decodedSvg).toContain('Reputation Badge');
    expect(decodedSvg).toContain('Gold');
  });

  // Leaderboard Tests
  it('should get top users', async () => {
    const topUsers = await sdk.getTopUsers(10);
    expect(topUsers).toBeDefined();
    expect(Array.isArray(topUsers)).toBe(true);
  });

  it('should get user rank', async () => {
    const rank = await sdk.getUserRank('0x1234567890123456789012345678901234567890');
    expect(typeof rank).toBe('number');
  });

  it('should get leaderboard stats', async () => {
    const stats = await sdk.getLeaderboardStats();
    expect(stats).toBeDefined();
    expect(typeof stats.totalUsers).toBe('number');
    expect(typeof stats.totalReferrals).toBe('string');
    expect(typeof stats.totalEarnings).toBe('string');
  });
});