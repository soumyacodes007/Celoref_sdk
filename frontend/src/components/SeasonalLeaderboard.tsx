'use client';

import { useReadContract } from 'wagmi';
import { CONTRACTS, BADGE_TIERS } from '@/lib/config';
import { CELOREFER_ENHANCED_ABI } from '@/lib/abi';
import { formatCurrency, shortenAddress } from '@/lib/utils';
import { Trophy, Clock, DollarSign, Medal } from 'lucide-react';

export function SeasonalLeaderboard() {
  const { data: currentSeason } = useReadContract({
    address: CONTRACTS.CELOREFER,
    abi: CELOREFER_ENHANCED_ABI,
    functionName: 'getCurrentSeason',
  });

  // Demo leaderboard data
  const leaderboard = [
    {
      rank: 1,
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      referrals: 127,
      earnings: 15420000000000000000n,
      badge: 3,
    },
    {
      rank: 2,
      address: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
      referrals: 89,
      earnings: 9870000000000000000n,
      badge: 3,
    },
    {
      rank: 3,
      address: '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
      referrals: 67,
      earnings: 7230000000000000000n,
      badge: 3,
    },
    {
      rank: 4,
      address: '0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB',
      referrals: 54,
      earnings: 5680000000000000000n,
      badge: 3,
    },
    {
      rank: 5,
      address: '0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb',
      referrals: 42,
      earnings: 4120000000000000000n,
      badge: 2,
    },
  ];

  const season = currentSeason as any;
  const isActive = season?.isActive || false;
  const prizePool = season?.totalPrizePool || 0n;
  const endTime = season?.endTime ? Number(season.endTime) * 1000 : Date.now() + 86400000 * 30;

  const daysRemaining = Math.ceil((endTime - Date.now()) / (1000 * 60 * 60 * 24));

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
          <Trophy className="w-5 h-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Seasonal Leaderboard
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Compete for the prize pool
          </p>
        </div>
      </div>

      {/* Season Info */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Prize Pool</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(prizePool)} cUSD
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Time Left</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {daysRemaining} days
          </p>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-4">
        <span
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
            isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-500'}`} />
          {isActive ? 'Season Active' : 'Season Ended'}
        </span>
      </div>

      {/* Leaderboard */}
      <div className="space-y-2">
        {leaderboard.map((entry) => {
          const badge = BADGE_TIERS[entry.badge as keyof typeof BADGE_TIERS];

          return (
            <div
              key={entry.rank}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                entry.rank <= 3
                  ? 'border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="text-2xl font-bold w-12 text-center">
                {getRankIcon(entry.rank)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-mono text-sm text-gray-900 dark:text-white truncate">
                    {shortenAddress(entry.address)}
                  </p>
                  <span className={`badge badge-${badge.name.toLowerCase()} text-xs`}>
                    {badge.icon}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                  <span>{entry.referrals} referrals</span>
                  <span className="font-medium text-celo-green">
                    {formatCurrency(entry.earnings)} cUSD
                  </span>
                </div>
              </div>

              {entry.rank <= 3 && (
                <Medal className={`w-5 h-5 ${
                  entry.rank === 1
                    ? 'text-yellow-500'
                    : entry.rank === 2
                    ? 'text-gray-400'
                    : 'text-orange-500'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {leaderboard.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No leaderboard data yet</p>
          <p className="text-sm">Start referring to get on the board!</p>
        </div>
      )}
    </div>
  );
}
