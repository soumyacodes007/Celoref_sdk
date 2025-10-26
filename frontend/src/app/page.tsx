'use client';

import { useAccount } from 'wagmi';
import { Wallet, Connect, Avatar, Name } from '@composer-kit/ui/wallet';
import { Dashboard } from '@/components/Dashboard';
import { QuestsPanel } from '@/components/QuestsPanel';
import { SeasonalLeaderboard } from '@/components/SeasonalLeaderboard';
import { RegistrationFlow } from '@/components/RegistrationFlow';
import { SocialConnectVerification } from '@/components/SocialConnectVerification';
import { Trophy, Target, Users } from 'lucide-react';

export default function Home() {
  const { address, isConnected } = useAccount();

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-celo-green to-celo-gold rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  CeloRefer
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enhanced Referral System
                </p>
              </div>
            </div>
            <Wallet>
              <Connect label="Connect Wallet">
                <Avatar />
                <Name isTruncated />
              </Connect>
            </Wallet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isConnected ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-celo-green to-celo-gold rounded-full mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to CeloRefer
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Join the decentralized referral revolution. Earn rewards by referring
              users, complete quests, and compete in seasonal leaderboards.
            </p>
            <div className="flex justify-center">
              <Wallet>
                <Connect label="Connect Wallet to Get Started">
                  <Avatar />
                  <Name />
                </Connect>
              </Wallet>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
              <div className="card text-center">
                <div className="w-12 h-12 bg-celo-green/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-6 h-6 text-celo-green" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Tiered Rewards</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Earn 5-20% on referrals based on your badge tier
                </p>
              </div>
              <div className="card text-center">
                <div className="w-12 h-12 bg-celo-gold/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Complete Quests</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Unlock bonus rewards by completing challenges
                </p>
              </div>
              <div className="card text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Seasonal Contests</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Compete for prize pools every season
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <RegistrationFlow address={address!} />
            <SocialConnectVerification address={address!} />
            <Dashboard address={address!} />
            <div className="grid lg:grid-cols-2 gap-8 mt-8">
              <QuestsPanel address={address!} />
              <SeasonalLeaderboard />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
