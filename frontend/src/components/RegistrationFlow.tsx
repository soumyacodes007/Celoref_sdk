'use client';

import { useState, useEffect } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '@/lib/config';
import { CELOREFER_ENHANCED_ABI } from '@/lib/abi';
import { UserPlus, CheckCircle } from 'lucide-react';

interface RegistrationFlowProps {
  address: `0x${string}`;
}

export function RegistrationFlow({ address }: RegistrationFlowProps) {
  const [referralCode, setReferralCode] = useState('');
  const [isGenesis, setIsGenesis] = useState(false);

  // Check if user is registered
  const { data: userInfo, refetch } = useReadContract({
    address: CONTRACTS.CELOREFER,
    abi: CELOREFER_ENHANCED_ABI,
    functionName: 'getUserInfo',
    args: [address],
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    // Get referral code from URL
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) setReferralCode(ref);
  }, []);

  useEffect(() => {
    if (isSuccess) {
      refetch();
    }
  }, [isSuccess, refetch]);

  const isRegistered = userInfo && (userInfo as any[])[0]?.isRegistered;

  if (isRegistered) return null;

  const handleRegister = async () => {
    if (!referralCode && !isGenesis) return;

    try {
      if (isGenesis) {
        writeContract({
          address: CONTRACTS.CELOREFER,
          abi: CELOREFER_ENHANCED_ABI,
          functionName: 'registerGenesis',
          args: [referralCode || `USER${address.slice(2, 8)}`],
        });
      } else {
        writeContract({
          address: CONTRACTS.CELOREFER,
          abi: CELOREFER_ENHANCED_ABI,
          functionName: 'register',
          args: [referralCode],
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="card mb-8 border-2 border-celo-green">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-celo-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <UserPlus className="w-6 h-6 text-celo-green" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Register to Get Started
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Join the CeloRefer network to start earning rewards from referrals.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isGenesis ? 'Your Referral Code' : 'Referral Code (Required)'}
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder={isGenesis ? 'Choose your code' : 'Enter referral code'}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-celo-green"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="genesis"
                checked={isGenesis}
                onChange={(e) => setIsGenesis(e.target.checked)}
                className="w-4 h-4 text-celo-green rounded"
              />
              <label htmlFor="genesis" className="text-sm text-gray-600 dark:text-gray-400">
                I'm the first user (Genesis registration)
              </label>
            </div>

            <button
              onClick={handleRegister}
              disabled={isPending || (!referralCode && !isGenesis)}
              className="btn-primary w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Registering...' : 'Register Now'}
            </button>

            {isSuccess && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Registration successful!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
