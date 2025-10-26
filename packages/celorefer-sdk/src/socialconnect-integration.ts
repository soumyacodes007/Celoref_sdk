/**
 * SocialConnect Integration for CeloRefer
 * 
 * This module demonstrates how to integrate Celo's SocialConnect protocol
 * with CeloRefer to enable phone-based referral tracking and identity verification.
 * 
 * SocialConnect allows mapping phone numbers to wallet addresses on Celo,
 * creating a seamless mobile-first user experience.
 * 
 * @see https://docs.celo.org/protocol/identity
 */

import { createPublicClient, createWalletClient, http, type Address, type Hash } from 'viem';
import { celoAlfajores, celo } from 'viem/chains';

// SocialConnect Contract Addresses (Celo Mainnet)
const SOCIAL_CONNECT_ADDRESSES = {
  // Federated Attestations contract - stores phone number to address mappings
  FEDERATED_ATTESTATIONS: '0x70F9314aF173c246669cFb0EEe79F9Cfd9C34ee3' as Address,
  
  // ODIS (Oblivious Decentralized Identifier Service) - privacy-preserving phone number hashing
  ODIS_PAYMENTS: '0x645170cdB6B5c1bc80847bb728dBa56C50a20a49' as Address,
};

// SocialConnect Contract Addresses (Alfajores Testnet)
const SOCIAL_CONNECT_ADDRESSES_TESTNET = {
  FEDERATED_ATTESTATIONS: '0x70F9314aF173c246669cFb0EEe79F9Cfd9C34ee3' as Address,
  ODIS_PAYMENTS: '0x645170cdB6B5c1bc80847bb728dBa56C50a20a49' as Address,
};

/**
 * Phone number attestation status
 */
export enum AttestationStatus {
  NONE = 'NONE',           // No attestation exists
  PENDING = 'PENDING',     // Attestation requested but not verified
  VERIFIED = 'VERIFIED',   // Phone number verified and mapped
}

/**
 * User identity with phone number mapping
 */
export interface UserIdentity {
  address: Address;
  phoneNumber?: string;
  phoneNumberHash?: Hash;
  attestationStatus: AttestationStatus;
  verifiedAt?: Date;
}

/**
 * Referral with phone-based tracking
 */
export interface PhoneBasedReferral {
  referrerPhone: string;
  referrerAddress: Address;
  referralCode: string;
  timestamp: Date;
}

/**
 * SocialConnect Integration Class
 * 
 * Provides methods to:
 * - Verify phone numbers via SocialConnect
 * - Look up wallet addresses from phone numbers
 * - Create phone-based referral links
 * - Track referrals via WhatsApp/SMS
 */
export class SocialConnectIntegration {
  private publicClient: ReturnType<typeof createPublicClient>;
  private walletClient: ReturnType<typeof createWalletClient> | null;
  private isTestnet: boolean;

  constructor(
    chain: typeof celo | typeof celoAlfajores,
    walletClient?: ReturnType<typeof createWalletClient>
  ) {
    this.isTestnet = chain.id === celoAlfajores.id;
    this.walletClient = walletClient || null;

    this.publicClient = createPublicClient({
      chain,
      transport: http(),
    });
  }

  /**
   * Request phone number attestation
   * 
   * Initiates the SocialConnect verification process:
   * 1. User provides phone number
   * 2. ODIS hashes the phone number (privacy-preserving)
   * 3. Attestation request is submitted on-chain
   * 4. User receives SMS with verification code
   * 
   * @param phoneNumber - E.164 format phone number (e.g., "+1234567890")
   * @param walletAddress - User's wallet address to map to phone
   * @returns Transaction hash of attestation request
   */
  async requestPhoneAttestation(
    phoneNumber: string,
    walletAddress: Address
  ): Promise<Hash> {
    if (!this.walletClient) {
      throw new Error('Wallet client required for attestation requests');
    }

    console.log(`[SocialConnect] Requesting attestation for ${phoneNumber} -> ${walletAddress}`);

    // Step 1: Hash phone number using ODIS (Oblivious Decentralized Identifier Service)
    const phoneHash = await this.hashPhoneNumber(phoneNumber);

    // Step 2: Submit attestation request to FederatedAttestations contract
    // In production, this would call the actual contract
    const mockTxHash = '0x' + Array(64).fill(0).map(() => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('') as Hash;

    console.log(`[SocialConnect] Attestation requested: ${mockTxHash}`);
    console.log(`[SocialConnect] SMS verification code sent to ${phoneNumber}`);

    return mockTxHash;
  }

  /**
   * Verify phone number with SMS code
   * 
   * Completes the attestation process by submitting the verification code
   * received via SMS. Once verified, the phone number is permanently mapped
   * to the wallet address on-chain.
   * 
   * @param phoneNumber - User's phone number
   * @param verificationCode - 6-digit code from SMS
   * @param walletAddress - User's wallet address
   * @returns Transaction hash of verification
   */
  async verifyPhoneNumber(
    phoneNumber: string,
    verificationCode: string,
    walletAddress: Address
  ): Promise<Hash> {
    if (!this.walletClient) {
      throw new Error('Wallet client required for verification');
    }

    console.log(`[SocialConnect] Verifying code ${verificationCode} for ${phoneNumber}`);

    // In production, this would:
    // 1. Submit verification code to attestation service
    // 2. Service validates code matches the one sent via SMS
    // 3. If valid, mapping is recorded on-chain in FederatedAttestations

    const mockTxHash = '0x' + Array(64).fill(0).map(() => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('') as Hash;

    console.log(`[SocialConnect] ✓ Phone verified: ${phoneNumber} -> ${walletAddress}`);
    
    return mockTxHash;
  }

  /**
   * Look up wallet address from phone number
   * 
   * Queries SocialConnect to find which wallet address is mapped to a
   * given phone number. This enables referral tracking via phone contacts.
   * 
   * @param phoneNumber - Phone number to look up
   * @returns Wallet address or null if not registered
   */
  async lookupAddressFromPhone(phoneNumber: string): Promise<Address | null> {
    const phoneHash = await this.hashPhoneNumber(phoneNumber);

    console.log(`[SocialConnect] Looking up address for phone hash: ${phoneHash.slice(0, 10)}...`);

    // In production, this would query FederatedAttestations.lookupAddresses()
    // For demo purposes, we return a mock address if phone is in expected format
    
    if (phoneNumber.match(/^\+\d{10,15}$/)) {
      const mockAddress = `0x${phoneNumber.slice(-40).padStart(40, '0')}` as Address;
      console.log(`[SocialConnect] Found address: ${mockAddress}`);
      return mockAddress;
    }

    console.log(`[SocialConnect] No address found for ${phoneNumber}`);
    return null;
  }

  /**
   * Look up phone number from wallet address (reverse lookup)
   * 
   * Queries SocialConnect to find which phone number is mapped to a
   * given wallet address.
   * 
   * @param address - Wallet address to look up
   * @returns Phone number or null if not registered
   */
  async lookupPhoneFromAddress(address: Address): Promise<string | null> {
    console.log(`[SocialConnect] Looking up phone for address: ${address}`);

    // In production, this would query FederatedAttestations contract
    // Note: This may not always be available due to privacy settings
    
    // Mock implementation
    const mockPhone = `+1${address.slice(-10)}`;
    console.log(`[SocialConnect] Found phone: ${mockPhone}`);
    
    return mockPhone;
  }

  /**
   * Generate referral link for WhatsApp/SMS sharing
   * 
   * Creates a mobile-friendly referral link that can be shared via
   * messaging apps. When clicked, it opens the dApp with the referral
   * code pre-filled.
   * 
   * @param referralCode - User's unique referral code
   * @param dappUrl - Base URL of your dApp
   * @returns Shareable referral link
   */
  generatePhoneReferralLink(referralCode: string, dappUrl: string): string {
    const baseUrl = dappUrl.replace(/\/$/, '');
    const referralUrl = `${baseUrl}?ref=${referralCode}`;
    
    return referralUrl;
  }

  /**
   * Generate WhatsApp share URL
   * 
   * Creates a WhatsApp deep link that opens a chat with the referral
   * message pre-filled. User just needs to select contact and send.
   * 
   * @param referralCode - User's referral code
   * @param dappUrl - Base URL of your dApp
   * @param customMessage - Optional custom message
   * @returns WhatsApp share URL
   */
  generateWhatsAppShareUrl(
    referralCode: string,
    dappUrl: string,
    customMessage?: string
  ): string {
    const referralLink = this.generatePhoneReferralLink(referralCode, dappUrl);
    
    const defaultMessage = `Hey! 🚀 Join me on CeloRefer and start earning crypto rewards. Use my code ${referralCode}`;
    const message = customMessage || defaultMessage;
    
    const encodedMessage = encodeURIComponent(`${message}\n\n${referralLink}`);
    
    return `https://wa.me/?text=${encodedMessage}`;
  }

  /**
   * Generate SMS share text
   * 
   * Creates SMS-friendly text that can be shared via the native SMS app.
   * 
   * @param referralCode - User's referral code
   * @param dappUrl - Base URL of your dApp
   * @returns SMS text content
   */
  generateSmsShareText(referralCode: string, dappUrl: string): string {
    const referralLink = this.generatePhoneReferralLink(referralCode, dappUrl);
    
    return `Join me on CeloRefer! Use code ${referralCode} to earn crypto rewards: ${referralLink}`;
  }

  /**
   * Check if user has verified phone number
   * 
   * @param address - Wallet address to check
   * @returns User identity with attestation status
   */
  async getUserIdentity(address: Address): Promise<UserIdentity> {
    console.log(`[SocialConnect] Checking identity for ${address}`);

    // In production, this would query FederatedAttestations
    const phoneNumber = await this.lookupPhoneFromAddress(address);
    
    if (phoneNumber) {
      return {
        address,
        phoneNumber,
        phoneNumberHash: await this.hashPhoneNumber(phoneNumber),
        attestationStatus: AttestationStatus.VERIFIED,
        verifiedAt: new Date(),
      };
    }

    return {
      address,
      attestationStatus: AttestationStatus.NONE,
    };
  }

  /**
   * Track phone-based referral
   * 
   * Records when a user signs up via a phone contact's referral link.
   * This enables tracking viral growth through social graphs.
   * 
   * @param referralCode - Referral code used
   * @param newUserAddress - New user's wallet address
   * @returns Referral tracking data
   */
  async trackPhoneReferral(
    referralCode: string,
    newUserAddress: Address
  ): Promise<PhoneBasedReferral | null> {
    console.log(`[SocialConnect] Tracking referral: ${referralCode} -> ${newUserAddress}`);

    // In production, this would:
    // 1. Look up referrer address from referral code
    // 2. Get referrer's phone number from SocialConnect
    // 3. Record on-chain via CeloReferEnhanced.register()

    // Mock implementation
    const mockReferrerAddress = '0x1234567890123456789012345678901234567890' as Address;
    const referrerPhone = await this.lookupPhoneFromAddress(mockReferrerAddress);

    if (referrerPhone) {
      return {
        referrerPhone,
        referrerAddress: mockReferrerAddress,
        referralCode,
        timestamp: new Date(),
      };
    }

    return null;
  }

  /**
   * Hash phone number using ODIS (privacy-preserving)
   * 
   * ODIS (Oblivious Decentralized Identifier Service) hashes phone numbers
   * in a way that preserves privacy while allowing verification.
   * 
   * @param phoneNumber - Phone number in E.164 format
   * @returns Hashed phone number
   */
  private async hashPhoneNumber(phoneNumber: string): Promise<Hash> {
    // In production, this would call ODIS service API
    // For now, we create a simple hash
    
    // Validate E.164 format
    if (!phoneNumber.match(/^\+\d{10,15}$/)) {
      throw new Error('Phone number must be in E.164 format (e.g., +1234567890)');
    }

    // Mock hash - in production, this would be a privacy-preserving ODIS hash
    const mockHash = '0x' + Array(64).fill(0).map((_, i) => {
      const charCode = phoneNumber.charCodeAt(i % phoneNumber.length);
      return (charCode % 16).toString(16);
    }).join('') as Hash;

    return mockHash;
  }

  /**
   * Estimate cost of phone attestation in CELO/cUSD
   * 
   * SocialConnect attestations have a small fee to prevent spam.
   * 
   * @returns Cost in wei
   */
  async getAttestationCost(): Promise<bigint> {
    // In production, query ODIS_PAYMENTS contract for current rate
    // Typical cost: ~$0.05 worth of CELO
    return BigInt(50000000000000000); // 0.05 CELO in wei
  }
}

/**
 * Example Usage
 */
export async function exampleSocialConnectFlow() {
  console.log('\n=== SocialConnect Integration Example ===\n');

  // Initialize on testnet
  const socialConnect = new SocialConnectIntegration(celoAlfajores);

  // Example 1: Phone number verification flow
  console.log('--- Phone Verification Flow ---');
  const userPhone = '+1234567890';
  const userAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' as Address;

  // const attestationTx = await socialConnect.requestPhoneAttestation(userPhone, userAddress);
  // User receives SMS with code...
  // const verifyTx = await socialConnect.verifyPhoneNumber(userPhone, '123456', userAddress);

  // Example 2: Lookup address from phone (for referral tracking)
  console.log('\n--- Address Lookup ---');
  const foundAddress = await socialConnect.lookupAddressFromPhone('+1987654321');
  console.log(`Wallet for +1987654321: ${foundAddress}`);

  // Example 3: Generate shareable referral links
  console.log('\n--- Referral Link Generation ---');
  const referralCode = 'ALICE123';
  const dappUrl = 'https://celorefer.app';

  const referralLink = socialConnect.generatePhoneReferralLink(referralCode, dappUrl);
  console.log(`Referral Link: ${referralLink}`);

  const whatsappUrl = socialConnect.generateWhatsAppShareUrl(referralCode, dappUrl);
  console.log(`WhatsApp Share: ${whatsappUrl}`);

  const smsText = socialConnect.generateSmsShareText(referralCode, dappUrl);
  console.log(`SMS Text: ${smsText}`);

  // Example 4: Check user identity
  console.log('\n--- User Identity Check ---');
  const identity = await socialConnect.getUserIdentity(userAddress);
  console.log(`Identity:`, identity);

  // Example 5: Track referral
  console.log('\n--- Track Phone Referral ---');
  const referral = await socialConnect.trackPhoneReferral('ALICE123', userAddress);
  console.log(`Referral:`, referral);

  console.log('\n=== Example Complete ===\n');
}

// Run example if executed directly
if (require.main === module) {
  exampleSocialConnectFlow().catch(console.error);
}
