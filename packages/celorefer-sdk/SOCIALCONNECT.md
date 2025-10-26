# SocialConnect Integration Guide

## Overview

This module demonstrates how to integrate **Celo's SocialConnect protocol** with CeloRefer to enable phone-based referral tracking and identity verification.

SocialConnect allows mapping phone numbers to wallet addresses on Celo, creating a seamless mobile-first user experience perfect for viral growth loops.

## What is SocialConnect?

SocialConnect is Celo's decentralized identity protocol that:

- 📱 **Maps phone numbers to wallet addresses** on-chain
- 🔒 **Preserves privacy** using ODIS (Oblivious Decentralized Identifier Service)
- ✅ **Enables verification** through SMS-based attestations
- 🌍 **Works globally** with any E.164 format phone number

## Why SocialConnect + CeloRefer?

Combining SocialConnect with CeloRefer unlocks powerful viral mechanics:

1. **Referral via Phone Contacts** - Users share referral links through WhatsApp/SMS
2. **Verified Identity** - Phone verification prevents Sybil attacks
3. **Social Graph Tracking** - Map viral growth through real social connections
4. **Frictionless Onboarding** - Phone number = wallet address (no seed phrases needed)

## Key Features

### ✅ Phone Number Verification
```typescript
import { SocialConnectIntegration } from './socialconnect-integration';
import { celoAlfajores } from 'viem/chains';

const socialConnect = new SocialConnectIntegration(celoAlfajores);

// Step 1: Request attestation
const txHash = await socialConnect.requestPhoneAttestation(
  '+1234567890',
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
);
// User receives SMS with code...

// Step 2: Verify with SMS code
await socialConnect.verifyPhoneNumber(
  '+1234567890',
  '123456', // Code from SMS
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
);
```

### 📞 Address Lookup from Phone
```typescript
// Find wallet address from phone number
const address = await socialConnect.lookupAddressFromPhone('+1987654321');
console.log(`Wallet: ${address}`);

// Reverse lookup: phone from address
const phone = await socialConnect.lookupPhoneFromAddress(address);
console.log(`Phone: ${phone}`);
```

### 💬 WhatsApp/SMS Sharing
```typescript
const referralCode = 'ALICE123';
const dappUrl = 'https://celorefer.app';

// Generate WhatsApp deep link
const whatsappUrl = socialConnect.generateWhatsAppShareUrl(
  referralCode,
  dappUrl,
  'Join me on CeloRefer! 🚀'
);
// Returns: https://wa.me/?text=Join%20me...

// Generate SMS text
const smsText = socialConnect.generateSmsShareText(referralCode, dappUrl);
// Share via native SMS app
```

### 🔍 User Identity Check
```typescript
const identity = await socialConnect.getUserIdentity(userAddress);

console.log(identity);
// {
//   address: '0x742d35Cc...',
//   phoneNumber: '+1234567890',
//   attestationStatus: 'VERIFIED',
//   verifiedAt: Date
// }
```

### 📊 Referral Tracking
```typescript
// Track when someone signs up via referral link
const referral = await socialConnect.trackPhoneReferral(
  'ALICE123', // Referral code
  newUserAddress
);

console.log(referral);
// {
//   referrerPhone: '+1234567890',
//   referrerAddress: '0x1234...',
//   referralCode: 'ALICE123',
//   timestamp: Date
// }
```

## Integration with CeloRefer SDK

Combine SocialConnect with the main CeloRefer SDK for complete functionality:

```typescript
import { CeloReferSDK } from 'celorefer-sdk';
import { SocialConnectIntegration } from './socialconnect-integration';
import { createWalletClient, http } from 'viem';
import { celoAlfajores } from 'viem/chains';

// Initialize both SDKs
const walletClient = createWalletClient({
  chain: celoAlfajores,
  transport: http(),
});

const celoRefer = CeloReferSDK.create(celoAlfajores, walletClient);
const socialConnect = new SocialConnectIntegration(celoAlfajores, walletClient);

// Example: Phone-verified referral flow
async function phoneVerifiedReferral(phoneNumber: string, referralCode: string) {
  // 1. Look up referrer's address from phone
  const referrerAddress = await socialConnect.lookupAddressFromPhone(phoneNumber);
  
  if (!referrerAddress) {
    throw new Error('Referrer not found. Please verify phone number first.');
  }
  
  // 2. Get referrer's referral code from CeloRefer
  const referrerInfo = await celoRefer.getUserInfo(referrerAddress);
  
  // 3. Register new user with verified referral
  const userAddress = await walletClient.account?.address;
  if (userAddress) {
    await celoRefer.registerUser(referrerInfo.referralCode);
    console.log('✅ Registered with phone-verified referrer!');
  }
}

// Example: WhatsApp viral loop
async function shareReferralViaWhatsApp(userAddress: Address) {
  // 1. Get user's referral code from CeloRefer
  const userInfo = await celoRefer.getUserInfo(userAddress);
  
  // 2. Generate WhatsApp share link
  const whatsappUrl = socialConnect.generateWhatsAppShareUrl(
    userInfo.referralCode,
    'https://celorefer.app',
    `Hey! Join me on CeloRefer. I've earned ${userInfo.stats.referralCount} referrals so far! 💰`
  );
  
  // 3. Open WhatsApp (mobile) or show QR code (desktop)
  window.open(whatsappUrl, '_blank');
}
```

## SocialConnect Contract Addresses

### Celo Mainnet
- **FederatedAttestations**: `0x70F9314aF173c246669cFb0EEe79F9Cfd9C34ee3`
- **ODIS Payments**: `0x645170cdB6B5c1bc80847bb728dBa56C50a20a49`

### Alfajores Testnet
- **FederatedAttestations**: `0x70F9314aF173c246669cFb0EEe79F9Cfd9C34ee3`
- **ODIS Payments**: `0x645170cdB6B5c1bc80847bb728dBa56C50a20a49`

## How SocialConnect Works

### 1. Phone Number Hashing (ODIS)
```
User Phone (+1234567890)
       ↓
    ODIS API (privacy-preserving)
       ↓
Phone Hash (0xabc123...)
```

ODIS ensures phone numbers are hashed in a way that:
- ✅ Prevents rainbow table attacks
- ✅ Preserves privacy
- ✅ Allows verification without revealing the actual number

### 2. Attestation Flow
```
1. User requests attestation → FederatedAttestations contract
2. ODIS generates phone hash
3. Attestation service sends SMS with code
4. User submits verification code
5. Mapping recorded on-chain: phoneHash → walletAddress
```

### 3. Lookup Process
```
Phone Number → ODIS Hash → FederatedAttestations.lookupAddresses() → Wallet Address
```

## Cost of Attestations

Phone verification has a small fee (~$0.05 worth of CELO) to prevent spam:

```typescript
const cost = await socialConnect.getAttestationCost();
console.log(`Attestation cost: ${cost} wei`); // ~0.05 CELO
```

## Use Cases for CeloRefer

### 1. **MiniPay User Growth**
- 3M+ MiniPay users already have phone → wallet mappings
- Share referral codes via SMS/WhatsApp natively
- Track viral growth through real social graphs

### 2. **Anti-Sybil Protection**
- Require phone verification for referral rewards
- Limit one wallet per phone number
- Prevent fake referral farming

### 3. **Mobile-First Onboarding**
- New users sign up with phone number
- Instantly connected to referrer's network
- No need to manually enter referral codes

### 4. **Social Proof**
- Display verified phone users with badge
- Higher trust for verified referrers
- Boost conversion rates

## Production Implementation

For production use, you'll need to:

1. **Integrate ODIS SDK**
   ```bash
   npm install @celo/identity
   ```

2. **Add FederatedAttestations ABI**
   ```typescript
   import { FEDERATED_ATTESTATIONS_ABI } from './abis/FederatedAttestations';
   ```

3. **Set Up Attestation Service**
   - Use Celo's hosted service or run your own
   - Handle SMS sending via Twilio/etc.

4. **Add Error Handling**
   - Rate limiting for attestation requests
   - Retry logic for ODIS calls
   - Graceful fallbacks

## Example: Complete Viral Loop

```typescript
import { CeloReferSDK } from 'celorefer-sdk';
import { SocialConnectIntegration } from './socialconnect-integration';

async function createViralLoop() {
  const celoRefer = CeloReferSDK.create(celoAlfajores, walletClient);
  const socialConnect = new SocialConnectIntegration(celoAlfajores, walletClient);
  
  // Step 1: Alice verifies her phone
  await socialConnect.requestPhoneAttestation('+1111111111', aliceAddress);
  await socialConnect.verifyPhoneNumber('+1111111111', '123456', aliceAddress);
  
  // Step 2: Alice registers on CeloRefer
  await celoRefer.registerUser(''); // No referrer
  const aliceInfo = await celoRefer.getUserInfo(aliceAddress);
  
  // Step 3: Alice shares via WhatsApp
  const shareUrl = socialConnect.generateWhatsAppShareUrl(
    aliceInfo.referralCode,
    'https://celorefer.app'
  );
  // Alice sends to Bob via WhatsApp
  
  // Step 4: Bob clicks link and verifies his phone
  await socialConnect.requestPhoneAttestation('+2222222222', bobAddress);
  await socialConnect.verifyPhoneNumber('+2222222222', '654321', bobAddress);
  
  // Step 5: Bob registers with Alice's code
  await celoRefer.registerUser(aliceInfo.referralCode);
  
  // Step 6: Track the phone-based referral
  const referral = await socialConnect.trackPhoneReferral(
    aliceInfo.referralCode,
    bobAddress
  );
  
  console.log('✅ Viral loop complete!');
  console.log(`Alice (+${referral.referrerPhone}) referred Bob`);
  console.log(`Alice's new referral count: ${(await celoRefer.getUserInfo(aliceAddress)).stats.referralCount}`);
}
```

## Security Considerations

1. **Privacy**: Phone numbers are never stored in plaintext on-chain
2. **Rate Limiting**: Limit attestation requests per IP/address
3. **Verification**: Always verify SMS codes before recording mappings
4. **Cost**: Small fee prevents spam attacks
5. **Revocation**: Users can revoke phone → address mappings

## Resources

- 📚 [Celo SocialConnect Docs](https://docs.celo.org/protocol/identity)
- 📦 [ODIS SDK](https://github.com/celo-org/social-connect)
- 🔗 [FederatedAttestations Contract](https://github.com/celo-org/celo-monorepo/tree/master/packages/protocol/contracts/identity)
- 📖 [CeloRefer Documentation](https://celoref.mintlify.app)

## Future Enhancements

- [ ] Full ODIS integration with real hashing
- [ ] SMS gateway integration (Twilio/MessageBird)
- [ ] Support for email attestations
- [ ] Cross-chain identity bridging
- [ ] Reputation scores based on verified identity
- [ ] Social graph analytics

---

**Note**: This is a demonstration/blueprint for SocialConnect integration. For production use, integrate the official `@celo/identity` SDK and set up proper attestation infrastructure.
