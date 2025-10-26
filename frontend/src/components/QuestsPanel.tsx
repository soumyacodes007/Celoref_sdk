'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '@/lib/config';
import { CELOREFER_ENHANCED_ABI } from '@/lib/abi';
import { formatCurrency } from '@/lib/utils';
import { Target, CheckCircle, Trophy } from 'lucide-react';

interface QuestsPanelProps {
  address: `0x${string}`;
}

export function QuestsPanel({ address }: QuestsPanelProps) {
  const { data: questCount } = useReadContract({
    address: CONTRACTS.CELOREFER,
    abi: CELOREFER_ENHANCED_ABI,
    functionName: 'questCount',
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  // For demo, showing 3 example quests
  const quests = [
    {
      id: 1,
      name: 'First Steps',
      description: 'Refer your first 5 users to the platform',
      targetReferrals: 5,
      rewardAmount: 10000000000000000000n, // 10 cUSD
      progress: 3,
      completed: false,
      claimed: false,
    },
    {
      id: 2,
      name: 'Rising Star',
      description: 'Reach 15 referrals and unlock Gold tier',
      targetReferrals: 15,
      rewardAmount: 50000000000000000000n, // 50 cUSD
      progress: 3,
      completed: false,
      claimed: false,
    },
    {
      id: 3,
      name: 'Elite Network',
      description: 'Build a network of 50 referrals',
      targetReferrals: 50,
      rewardAmount: 200000000000000000000n, // 200 cUSD
      progress: 3,
      completed: false,
      claimed: false,
    },
  ];

  const handleClaimReward = (questId: number) => {
    writeContract({
      address: CONTRACTS.CELOREFER,
      abi: CELOREFER_ENHANCED_ABI,
      functionName: 'claimQuestReward',
      args: [BigInt(questId)],
    });
  };

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
          <Target className="w-5 h-5 text-yellow-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Active Quests</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Complete challenges to earn bonus rewards</p>
        </div>
      </div>

      <div className="space-y-4">
        {quests.map((quest) => {
          const progressPercentage = (quest.progress / quest.targetReferrals) * 100;

          return (
            <div
              key={quest.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-celo-green transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {quest.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {quest.description}
                  </p>
                </div>
                {quest.completed && !quest.claimed && (
                  <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    Ready
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">
                    Progress: {quest.progress} / {quest.targetReferrals} referrals
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Math.min(progressPercentage, 100).toFixed(0)}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Reward and Action */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-600" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(quest.rewardAmount)} cUSD
                  </span>
                </div>

                {quest.claimed ? (
                  <span className="text-sm text-gray-500 dark:text-gray-400">Claimed</span>
                ) : quest.completed ? (
                  <button
                    onClick={() => handleClaimReward(quest.id)}
                    disabled={isPending}
                    className="btn-primary text-sm py-2 px-4 disabled:opacity-50"
                  >
                    {isPending ? 'Claiming...' : 'Claim Reward'}
                  </button>
                ) : (
                  <span className="text-sm text-gray-500 dark:text-gray-400">In Progress</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {quests.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No active quests at the moment</p>
        </div>
      )}
    </div>
  );
}
