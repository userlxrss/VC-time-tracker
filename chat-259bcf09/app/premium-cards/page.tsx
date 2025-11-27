/**
 * Premium Cards Demo Page
 * Complete showcase of the premium user card system
 */

import { Metadata } from 'next';
import { PremiumUserCardsDemo } from '@/components/dashboard/premium-user-cards-demo';

export const metadata: Metadata = {
  title: 'Premium User Cards - VC Time Tracker',
  description: 'Enterprise-grade user card components with advanced functionality and real-time updates',
  keywords: ['time tracking', 'user cards', 'premium components', 'enterprise'],
};

export default function PremiumCardsPage() {
  return <PremiumUserCardsDemo />;
}