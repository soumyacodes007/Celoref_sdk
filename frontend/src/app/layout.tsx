import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Web3Provider } from '@/providers/Web3Provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CeloRefer - Decentralized Referral System',
  description: 'Earn rewards by referring users to the Celo ecosystem',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
