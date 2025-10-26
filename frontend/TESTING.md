# Frontend Testing Guide

Complete test cases for CeloRefer frontend and SocialConnect integration.

## 🧪 Test Setup

### Prerequisites
```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open browser
# - Primary: http://localhost:3000
# - Incognito: http://localhost:3000?ref=CODE
```

### Test Wallets (Alfajores Testnet)

```typescript
// Use MetaMask with these test accounts:
Account 1 (Alice - Genesis):
- Address: 0x2EF1B0E9b39B8C8b1a3b5c7F5a6E7C8d9A0b1C2d
- Use for: Genesis registration, first referrer

Account 2 (Bob - Level 1):
- Address: 0x3FA2C1F0c40C9D9c2b4c6d8G6b7F8D9e0B1c2D3e
- Use for: First referred user

Account 3 (Charlie - Level 2):
- Address: 0x4GB3D2G1d51D0E0d3c5d7e9H7c8G9E0f1C2d3E4f
- Use for: Second level referral
```

### Test Phone Numbers (Indian)

```
Alice:   +91 98765 43210  → Code: 123456
Bob:     +91 98765 43211  → Code: 234567
Charlie: +91 98765 43212  → Code: 345678
```

## ✅ Test Cases

### Test 1: Wallet Connection
**Objective:** Verify wallet connects properly

**Steps:**
1. Open http://localhost:3000
2. Click "Connect Wallet" button
3. Select MetaMask
4. Approve connection

**Expected Result:**
- ✅ Wallet address appears in header
- ✅ Dashboard loads with user data
- ✅ No console errors

**Status:** Pass/Fail: ______

---

### Test 2: Genesis Registration
**Objective:** First user can register without referral

**Steps:**
1. Connect Account 1 (Alice)
2. See "Register to Get Started" card
3. Check "I'm the first user" checkbox
4. Enter code: "ALICE2025"
5. Click "Register Now"
6. Confirm transaction in MetaMask

**Expected Result:**
- ✅ Transaction succeeds
- ✅ Dashboard appears with:
  - Badge: Bronze 🥉
  - Referrals: 0
  - Earnings: 0 cUSD
  - Referral Code: ALICE2025 or auto-generated
- ✅ Registration card disappears

**Status:** Pass/Fail: ______

---

### Test 3: SocialConnect - Phone Verification
**Objective:** User can verify phone number

**Steps:**
1. After registration, see "Verify with SocialConnect" card
2. Enter phone: +91 98765 43210
3. Click "Send Code"
4. Enter code: 123456
5. Click "Verify Phone"
6. Confirm transaction

**Expected Result:**
- ✅ Step 1 (phone) → Step 2 (code) transition
- ✅ Transaction confirms
- ✅ Card shows "Phone Number Verified ✓"
- ✅ Shield icon appears

**Status:** Pass/Fail: ______

---

### Test 4: Referral Link Generation
**Objective:** User gets shareable referral link

**Steps:**
1. Scroll to "Your Referral Link" card
2. Copy referral code (e.g., ALICE2025)
3. Copy full link
4. Check social share buttons

**Expected Result:**
- ✅ Referral code displayed in input field
- ✅ Full link: http://localhost:3000?ref=ALICE2025
- ✅ Copy button works (shows "Copied!")
- ✅ Twitter/Facebook buttons open share dialogs

**Status:** Pass/Fail: ______

---

### Test 5: Referral Link - Auto-Fill
**Objective:** Link pre-fills referral code for new users

**Steps:**
1. Copy link: http://localhost:3000?ref=ALICE2025
2. Open in **Incognito window** or **different browser**
3. Paste the link
4. Connect Account 2 (Bob)

**Expected Result:**
- ✅ Registration form shows
- ✅ Referral code field auto-filled: "ALICE2025"
- ✅ Cannot edit referral code (or can clear it)
- ✅ "I'm first user" checkbox is unchecked

**Status:** Pass/Fail: ______

---

### Test 6: Level 1 Referral Registration
**Objective:** Second user registers with referral

**Steps:**
1. In incognito (Account 2 - Bob)
2. Code should be pre-filled: ALICE2025
3. Click "Register Now"
4. Confirm transaction

**Expected Result:**
- ✅ Transaction succeeds
- ✅ Bob's dashboard appears
- ✅ Bob sees his own referral code

**Back to Account 1 (Alice):**
- ✅ Refresh page
- ✅ Referrals: 0 → 1
- ✅ Quest progress: "First Steps" 1/5 (20%)

**Status:** Pass/Fail: ______

---

### Test 7: Level 2 Referral Chain
**Objective:** Third user referred by second user

**Steps:**
1. Bob copies his referral link
2. Open in another incognito (Account 3 - Charlie)
3. Connect with Charlie's wallet
4. Register with Bob's code

**Expected Result:**
Charlie:
- ✅ Successfully registered
- ✅ Has his own referral code

Bob:
- ✅ Referrals: 0 → 1
- ✅ Quest progress updated

Alice:
- ✅ Should see Level 2 benefits (if applicable)

**Status:** Pass/Fail: ______

---

### Test 8: Dashboard Stats Display
**Objective:** All stats display correctly

**Steps:**
1. Check all 4 stat cards on dashboard
2. Verify badge tier
3. Check reward rates

**Expected Result:**
- ✅ Total Referrals: Shows correct number
- ✅ Total Earned: Shows cUSD amount
- ✅ Total Actions: Shows count
- ✅ Badge: Shows correct tier (Bronze/Silver/Gold/Platinum)
- ✅ Reward Rates: Shows % (5%+2% for Bronze)

**Status:** Pass/Fail: ______

---

### Test 9: Quest System Display
**Objective:** Quests show with progress

**Steps:**
1. Scroll to "Active Quests" panel
2. Check all 3 quests
3. Verify progress bars

**Expected Result:**
Quest 1: "First Steps"
- ✅ Target: 5 referrals
- ✅ Reward: 10 cUSD
- ✅ Progress bar shows: X/5 (XX%)

Quest 2: "Rising Star"
- ✅ Target: 15 referrals
- ✅ Reward: 50 cUSD

Quest 3: "Elite Network"
- ✅ Target: 50 referrals
- ✅ Reward: 200 cUSD

**Status:** Pass/Fail: ______

---

### Test 10: Seasonal Leaderboard
**Objective:** Leaderboard displays properly

**Steps:**
1. Scroll to "Seasonal Leaderboard"
2. Check prize pool and time left
3. Verify top 5 users

**Expected Result:**
- ✅ Prize Pool: Shows amount in cUSD
- ✅ Time Left: Shows days remaining
- ✅ Season Status: "Active" or "Ended"
- ✅ Top 5 users with:
  - Rank (🥇🥈🥉)
  - Truncated address
  - Badge icon
  - Referral count
  - Earnings

**Status:** Pass/Fail: ______

---

### Test 11: Mobile Responsiveness
**Objective:** UI works on mobile devices

**Steps:**
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select iPhone or Android device
4. Navigate through all sections

**Expected Result:**
- ✅ Layout adjusts for mobile
- ✅ Cards stack vertically
- ✅ Buttons are tappable
- ✅ Text is readable
- ✅ No horizontal scroll

**Status:** Pass/Fail: ______

---

### Test 12: Dark Mode
**Objective:** Dark mode works properly

**Steps:**
1. Enable dark mode in browser/OS
2. Refresh page
3. Check all components

**Expected Result:**
- ✅ Background changes to dark
- ✅ Text remains readable
- ✅ Cards have dark theme
- ✅ Icons are visible
- ✅ No contrast issues

**Status:** Pass/Fail: ______

---

## 🔧 Common Issues & Solutions

### Issue 1: Wallet Won't Connect
**Solution:**
- Make sure MetaMask is installed
- Switch to Alfajores testnet
- Refresh page and try again

### Issue 2: Transaction Fails
**Solution:**
- Check you have CELO for gas
- Verify contract is deployed
- Check contract address in .env.local

### Issue 3: Referral Code Not Auto-Filling
**Solution:**
- Check URL has ?ref=CODE parameter
- Clear browser cache
- Try in incognito mode

### Issue 4: Stats Not Updating
**Solution:**
- Refresh page after transaction
- Wait for blockchain confirmation
- Check contract has cUSD for rewards

### Issue 5: SocialConnect Verification Fails
**Solution:**
- This is a mock implementation
- Use test codes: 123456, 234567, etc.
- Check contract owner has called authorizePartner

---

## 📊 Test Results Summary

Fill this out after testing:

```
Total Tests: 12
Passed: ___
Failed: ___
Skipped: ___

Critical Issues: ___
Minor Issues: ___

Ready for Demo: Yes / No
```

---

## 🎯 Quick Test Checklist

Before demo, verify these work:

- [ ] Wallet connects
- [ ] Registration succeeds
- [ ] Referral link generates
- [ ] Link opens and auto-fills
- [ ] New user can register
- [ ] Dashboard shows stats
- [ ] SocialConnect flow works
- [ ] No console errors
- [ ] Mobile layout looks good
- [ ] All buttons work

---

## 🚀 Demo Script with Test Data

```bash
# Account 1: Alice (Genesis)
Address: 0x2EF1...C2d
Phone: +91 98765 43210
Code: ALICE2025
Action: Register as genesis → Verify phone → Copy link

# Account 2: Bob (Level 1)
Address: 0x3FA2...D3e  
Phone: +91 98765 43211
Referral: ALICE2025
Action: Open link → Register → Alice gets +1 referral

# Account 3: Charlie (Level 2)
Address: 0x4GB3...E4f
Phone: +91 98765 43212
Referral: [Bob's code]
Action: Register → Bob +1, Alice sees Level 2 benefits
```

---

## 📞 Support

If tests fail, check:
1. Contract deployed? → `foundry.toml`
2. Contract funded? → Check balance
3. Environment variables? → `.env.local`
4. Network correct? → Alfajores testnet

Good luck with your demo! 🎉
