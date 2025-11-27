// Test file to verify the premium navigation components work correctly
// This can be removed after testing

import React from 'react'
import { PremiumNav } from './components/navigation/premium-nav'
import { PremiumDashboardLayout } from './components/layout/premium-dashboard-layout'
import { PremiumDashboardOverview } from './components/dashboard/premium-dashboard-overview'

export default function TestPage() {
  return (
    <PremiumDashboardLayout
      userName="Larina"
      userRole="Partner"
      showWelcome={true}
    >
      <div className="space-y-6">
        <div className="enterprise-card p-6">
          <h2 className="text-2xl font-bold mb-4">Premium Navigation Test</h2>
          <p className="text-muted-foreground">
            If you can see this page with a premium navigation bar at the top,
            glassmorphism effects, smooth animations, and proper theme switching,
            then the components are working correctly.
          </p>
        </div>

        <PremiumDashboardOverview />
      </div>
    </PremiumDashboardLayout>
  )
}