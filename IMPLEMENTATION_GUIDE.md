# CeloRefer - Complete Frontend Implementation Guide 🚀

## 📋 Overview

This guide provides step-by-step instructions to build a fully functional, multi-page demo with:
- Phone number login → Wallet simulation
- Multi-page navigation
- Real blockchain integration
- Demo simulator for presentations
- Live reward distribution
- Leaderboard updates

---

## 🏗️ Architecture

### **Pages Structure**
```
app/
├── page.tsx                    # Home/Welcome
├── phone-login/page.tsx        # Phone Login → Wallet
├── dashboard/page.tsx          # User Dashboard
├── referrals/page.tsx          # Referral Tree
├── nft/page.tsx               # NFT Reputation
├── analytics/page.tsx          # Charts & Analytics
├── quests/page.tsx            # Quest System
├── leaderboard/page.tsx       # Seasonal Rankings
├── demo/page.tsx              # 🎯 DEMO SIMULATOR
└── layout.tsx                 # Navigation Layout
```

---

## 🔧 Step-by-Step Implementation

### **Step 1: Install Dependencies** ✅ DONE

```bash
cd demo-frontend
npm install framer-motion react-hot-toast recharts ethers@5.7.2
```

### **Step 2: Create Phone-to-Wallet Utility** ✅ DONE

File: `src/lib/phoneToWallet.ts`
- Maps phone numbers to deterministic wallet addresses
- Stores in localStorage
- Provides demo accounts (Alice & Bob)

### **Step 3: Add Toast Notifications Provider**

**File: `src/providers/ToastProvider.tsx`**
```tsx
'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1F2937',
          color: '#F9FAFB',
          borderRadius: '0.5rem',
        },
        success: {
          iconTheme: {
            primary: '#35D07F',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}
```

**Update `app/layout.tsx`:**
```tsx
import { ToastProvider } from '@/providers/ToastProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ToastProvider />
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### **Step 4: Create Navigation Component**

**File: `src/components/Navigation.tsx`**
```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, Trophy, Users, BarChart3, Target, 
  Medal, Phone, Zap 
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/referrals', label: 'Referrals', icon: Users },
  { href: '/nft', label: 'NFT Badge', icon: Medal },
  { href: '/quests', label: 'Quests', icon: Target },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/phone-login', label: 'Phone Login', icon: Phone },
  { href: '/demo', label: '🎬 Demo', icon: Zap },
];

export function Navigation() {
  const pathname = usePathname();
  
  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center space-x-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'border-celo-green text-celo-green'
                    : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
```

**Update `app/layout.tsx` to include Navigation:**
```tsx
import { Navigation } from '@/components/Navigation';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ToastProvider />
          <Navigation />
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### **Step 5: Create Phone Login Page** 🎯 KEY FEATURE

**File: `app/phone-login/page.tsx`**
```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Phone, Wallet, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { phoneToWallet, formatPhoneNumber, getWalletByPhone } from '@/lib/phoneToWallet';

export default function PhoneLoginPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhoneLogin = async () => {
    if (phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate or get wallet
    const wallet = phoneToWallet(phoneNumber);
    
    toast.success(`Wallet generated! ${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`);
    
    // Store active wallet
    localStorage.setItem('active_phone_wallet', JSON.stringify(wallet));
    
    setLoading(false);
    
    // Redirect to dashboard
    setTimeout(() => router.push(`/dashboard?phone=${wallet.phoneNumber}`), 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-celo-green/10 to-celo-gold/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="card">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-celo-green to-celo-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Phone Login (Demo)
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your phone number to simulate SocialConnect login
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="5551234567"
                maxLength={10}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg"
              />
              {phoneNumber.length >= 10 && (
                <p className="text-sm text-gray-500 mt-1">
                  Format: {formatPhoneNumber(phoneNumber)}
                </p>
              )}
            </div>

            <button
              onClick={handlePhoneLogin}
              disabled={phoneNumber.length < 10 || loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                'Generating Wallet...'
              ) : (
                <>
                  <Wallet className="w-5 h-5" />
                  Login with Phone
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              <strong>Demo Mode:</strong> Your phone number is hashed to generate a deterministic wallet address. 
              In production, this would use Celo SocialConnect.
            </p>
          </div>

          <div className="mt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Quick test accounts:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPhoneNumber('5551234567')}
                className="btn-secondary text-sm py-2"
              >
                Alice (Referrer)
              </button>
              <button
                onClick={() => setPhoneNumber('5557654321')}
                className="btn-secondary text-sm py-2"
              >
                Bob (Referee)
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
```

### **Step 6: Create Demo Simulator Page** 🎬 MAIN DEMO TOOL

**File: `app/demo/page.tsx`**
```tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, Users, DollarSign, Trophy, CheckCircle, 
  Copy, Link as LinkIcon 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getDemoAccount } from '@/lib/phoneToWallet';

export default function DemoPage() {
  const [step, setStep] = useState(0);
  const [aliceData, setAliceData] = useState({
    referralCode: 'ALICE001',
    referrals: 0,
    earnings: 0,
    badge: 'Bronze',
  });
  const [bobData, setBobData] = useState({
    registered: false,
    earnedReward: 0,
  });

  const alice = getDemoAccount('alice');
  const bob = getDemoAccount('bob');

  const demoSteps = [
    {
      title: '1. Alice Registers',
      description: 'Alice logs in with phone and gets her referral link',
      action: () => {
        toast.success('Alice registered! 🎉');
        setStep(1);
      },
    },
    {
      title: '2. Alice Gets Referral Link',
      description: 'Alice copies her unique referral link',
      action: () => {
        navigator.clipboard.writeText(`https://celorefer.com?ref=${aliceData.referralCode}`);
        toast.success('Referral link copied!');
        setStep(2);
      },
    },
    {
      title: '3. Bob Uses Referral Link',
      description: 'Bob clicks Alice\'s link and registers',
      action: () => {
        setBobData({ registered: true, earnedReward: 0 });
        setAliceData(prev => ({ ...prev, referrals: prev.referrals + 1 }));
        toast.success('Bob registered under Alice! 🎉');
        setStep(3);
      },
    },
    {
      title: '4. Bob Makes Purchase',
      description: 'Bob makes a $100 purchase on the platform',
      action: () => {
        // Simulate reward distribution
        const aliceReward = 100 * 0.05; // 5% for Bronze
        setAliceData(prev => ({
          ...prev,
          earnings: prev.earnings + aliceReward,
        }));
        toast.success(`Alice earned $${aliceReward}! 💰`);
        setStep(4);
      },
    },
    {
      title: '5. Alice Reaches Silver',
      description: 'Alice gets 5 referrals and upgrades to Silver tier',
      action: () => {
        setAliceData(prev => ({
          ...prev,
          referrals: 5,
          badge: 'Silver',
        }));
        toast.success('Alice upgraded to Silver! 🥈');
        setStep(5);
      },
    },
    {
      title: '6. Leaderboard Updates',
      description: 'Alice moves up in the seasonal leaderboard',
      action: () => {
        toast.success('Alice is now #3 on the leaderboard! 🏆');
        setStep(6);
      },
    },
  ];

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🎬 Interactive Demo Simulator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Click through the complete user journey
          </p>
        </div>

        {/* Demo Controls */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Alice's Side */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Alice (Referrer)
                </h2>
                <p className="text-sm text-gray-500">{alice.address.slice(0, 10)}...</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Badge:</span>
                <span className="badge badge-silver">{aliceData.badge}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Referrals:</span>
                <span className="font-bold text-gray-900 dark:text-white">{aliceData.referrals}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Earnings:</span>
                <span className="font-bold text-celo-green">${aliceData.earnings}</span>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://celorefer.com?ref=${aliceData.referralCode}`);
                    toast.success('Link copied!');
                  }}
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Referral Link
                </button>
              </div>
            </div>
          </motion.div>

          {/* Bob's Side */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Bob (Referee)
                </h2>
                <p className="text-sm text-gray-500">{bob.address.slice(0, 10)}...</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className={`badge ${bobData.registered ? 'badge-silver' : 'bg-gray-200 text-gray-700'}`}>
                  {bobData.registered ? 'Registered' : 'Not Registered'}
                </span>
              </div>
              {bobData.registered && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Referred by:</span>
                    <span className="text-sm font-medium">Alice</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Purchases:</span>
                    <span className="font-bold">$100</span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Demo Steps */}
        <div className="card">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Demo Steps
          </h3>
          <div className="space-y-4">
            {demoSteps.map((demoStep, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  step === index
                    ? 'border-celo-green bg-celo-green/10'
                    : step > index
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {step > index && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {demoStep.title}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-8">
                      {demoStep.description}
                    </p>
                  </div>
                  <button
                    onClick={demoStep.action}
                    disabled={step !== index}
                    className="btn-primary disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {step > index ? 'Done' : step === index ? 'Run' : 'Waiting'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {step >= demoSteps.length && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
              <Trophy className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-green-900 dark:text-green-100">
                Demo Complete! 🎉
              </p>
              <button
                onClick={() => {
                  setStep(0);
                  setAliceData({ referralCode: 'ALICE001', referrals: 0, earnings: 0, badge: 'Bronze' });
                  setBobData({ registered: false, earnedReward: 0 });
                }}
                className="btn-primary mt-4"
              >
                Reset Demo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 📝 Implementation Checklist

Use this to track your progress:

```
Phase 1: Core Setup (1 hour)
- [x] Install dependencies
- [x] Create phone-to-wallet utility
- [ ] Add toast notifications
- [ ] Create navigation component
- [ ] Update layout with navigation

Phase 2: Key Pages (3 hours)
- [ ] Phone login page
- [ ] Demo simulator page
- [ ] Update dashboard with phone wallet support
- [ ] NFT reputation page
- [ ] Referral tree page

Phase 3: Polish (2 hours)
- [ ] Add animations with Framer Motion
- [ ] Create activity feed component
- [ ] Add loading states
- [ ] Mobile responsiveness
- [ ] Error handling

Phase 4: Demo Features (1 hour)
- [ ] Test full demo flow
- [ ] Add mock data where needed
- [ ] Ensure leaderboard updates
- [ ] Test reward calculations
```

---

## 🎯 Key Files Created

1. ✅ `lib/phoneToWallet.ts` - Phone-to-wallet mapping
2. ⏳ `providers/ToastProvider.tsx` - Toast notifications
3. ⏳ `components/Navigation.tsx` - Navigation bar
4. ⏳ `app/phone-login/page.tsx` - Phone login
5. ⏳ `app/demo/page.tsx` - Demo simulator

---

## 🚀 Quick Start

```bash
cd demo-frontend
npm run dev
```

Navigate to:
- http://localhost:3000/phone-login - Test phone login
- http://localhost:3000/demo - Run interactive demo

---

## 📞 Need Help?

Check existing components in `src/components/` for reference patterns.
All blockchain interactions use wagmi hooks with the SDK.

**Remember**: This is a demo - mix of real + simulated data is expected!
