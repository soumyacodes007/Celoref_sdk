'use client';

import { useState } from 'react';
import { Copy, Share2, CheckCircle, Twitter, Facebook } from 'lucide-react';
import { generateReferralLink, copyToClipboard } from '@/lib/utils';
import { APP_CONFIG } from '@/lib/config';

interface ReferralLinkCardProps {
  referralCode: string;
}

export function ReferralLinkCard({ referralCode }: ReferralLinkCardProps) {
  const [copied, setCopied] = useState(false);
  const referralLink = generateReferralLink(referralCode, APP_CONFIG.url);

  const handleCopy = async () => {
    await copyToClipboard(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: 'twitter' | 'facebook') => {
    const text = `Join CeloRefer and start earning rewards! Use my referral link: ${referralLink}`;
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
    };
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <div className="card bg-gradient-to-br from-celo-green/10 to-celo-gold/10 border-2 border-celo-green">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-celo-green rounded-lg flex items-center justify-center flex-shrink-0">
          <Share2 className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Your Referral Link
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Share this link to start earning rewards from your referrals
          </p>

          <div className="space-y-3">
            {/* Referral Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Referral Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralCode}
                  readOnly
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
                />
              </div>
            </div>

            {/* Referral Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Share Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
                <button
                  onClick={handleCopy}
                  className="btn-secondary flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Share on Social Media
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
