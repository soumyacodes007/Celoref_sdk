'use client';

import { useReadContract } from 'wagmi';
import { CONTRACTS, BADGE_TIERS } from '@/lib/config';
import { formatCurrency } from '@/lib/utils';
import { ReferralLinkCard } from './ReferralLinkCard';
import { Trophy, Users, DollarSign, TrendingUp } from 'lucide-react';
import { CELOREFER_ENHANCED_ABI } from '@/lib/abi';

interface DashboardProps {
  address: `0x${string}`;
}

export function Dashboard({ address }: DashboardProps) {
  const { data: userInfo } = useReadContract({
    address: CONTRACTS.CELOREFER,
    abi: CELOREFER_ENHANCED_ABI,
    functionName: 'getUserInfo',
    args: [address],
  });

  const { data: rewardRates } = useReadContract({
    address: CONTRACTS.CELOREFER,
    abi: CELOREFER_ENHANCED_ABI,
    functionName: 'getRewardRates',
    args: [address],
  });

  if (!userInfo) return null;

  const [referralInfo, stats, badgeTier] = userInfo as any[];
  const badge = BADGE_TIERS[badgeTier as keyof typeof BADGE_TIERS];
  const [level1Rate, level2Rate] = rewardRates || [0n, 0n];

  const badgeClasses = {
    0: 'badge-bronze',
    1: 'badge-silver',
    2: 'badge-gold',
    3: 'badge-platinum',
  };

  return (
    <div className="space-y-6">
      {/* Badge and Reward Rates */}
      <div className="card">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{badge.icon}</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {badge.name} Member
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {stats.referralCount.toString()} referrals •{' '}
                Next tier at {BADGE_TIERS[Math.min(badgeTier + 1, 3) as keyof typeof BADGE_TIERS]?.threshold || '∞'} referrals
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Your Reward Rates</p>
            <p className="text-2xl font-bold text-celo-green">
              {Number(level1Rate) / 100}% + {Number(level2Rate) / 100}%
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-3">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Referrals</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.referralCount.toString()}
          </p>
        </div>

        <div className="stat-card">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-3">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Earned</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(stats.totalEarned)} cUSD
          </p>
        </div>

        <div className="stat-card">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-3">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Actions</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.totalActions.toString()}
          </p>
        </div>

        <div className="stat-card">
          <div className={`badge ${badgeClasses[badgeTier as keyof typeof badgeClasses]} text-lg mb-3`}>
            {badge.icon} {badge.name}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Tier</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            Level {badgeTier + 1} of 4
          </p>
        </div>
      </div>

      {/* Referral Link Card */}
      {referralInfo.referralCode && (
        <ReferralLinkCard referralCode={referralInfo.referralCode} />
      )}
    </div>
  );
}
