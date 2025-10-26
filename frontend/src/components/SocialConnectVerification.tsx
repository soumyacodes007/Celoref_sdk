'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { CONTRACTS } from '@/lib/config';
import { CELOREFER_ENHANCED_ABI } from '@/lib/abi';
import { Shield, CheckCircle, Phone, AlertCircle } from 'lucide-react';

interface SocialConnectVerificationProps {
  address: `0x${string}`;
}

export function SocialConnectVerification({ address }: SocialConnectVerificationProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code' | 'verified'>('phone');

  // Check if user is already verified
  const { data: userInfo } = useReadContract({
    address: CONTRACTS.CELOREFER,
    abi: CELOREFER_ENHANCED_ABI,
    functionName: 'getUserInfo',
    args: [address],
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  const isVerified = userInfo && (userInfo as any[])[3]; // The 4th element is 'verified'

  const handleRequestVerification = async () => {
    // In production, this would call SocialConnect's attestation service
    // For now, we'll show the flow and use the mock function
    console.log('Requesting verification for:', phoneNumber);
    setStep('code');
  };

  const handleVerifyCode = async () => {
    try {
      // In production, verify the code with SocialConnect
      // Then call the contract to mark as verified
      writeContract({
        address: CONTRACTS.CELOREFER,
        abi: CELOREFER_ENHANCED_ABI,
        functionName: 'mock_setUserAsVerified',
        args: [address],
      });
    } catch (error) {
      console.error('Verification error:', error);
    }
  };

  if (isVerified) {
    return (
      <div className="card border-2 border-green-500">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Phone Number Verified
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your account is verified with SocialConnect
            </p>
          </div>
          <Shield className="w-8 h-8 text-green-600 ml-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="card border-2 border-blue-500">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
          <Phone className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Verify with SocialConnect
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Link your phone number to unlock higher reward tiers and prevent fraud
          </p>

          {step === 'phone' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleRequestVerification}
                    disabled={!phoneNumber}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send Code
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-1">Why verify?</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Unlock 2x reward multiplier</li>
                      <li>Access to premium features</li>
                      <li>Prevent duplicate accounts</li>
                      <li>Build trust in the network</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'code' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Verification Code
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Enter the 6-digit code sent to {phoneNumber}
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleVerifyCode}
                  disabled={isPending || verificationCode.length !== 6}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? 'Verifying...' : 'Verify Phone'}
                </button>
                <button
                  onClick={() => setStep('phone')}
                  className="btn-secondary"
                >
                  Back
                </button>
              </div>

              {isSuccess && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Verification successful!</span>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              🔒 Powered by Celo SocialConnect - Your phone number is hashed and never stored on-chain
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
