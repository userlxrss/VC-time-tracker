import React, { useState } from 'react';
import DashboardLayout from './components/DashboardLayout';

/**
 * Premium Dashboard Showcase
 * Demonstrates the luxury dark mode transformation
 */
const PremiumDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      {/* Premium Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#151923]/80 backdrop-blur-xl border-b border-white/10 shadow-2xl z-50">
        <div className="flex items-center justify-between h-full px-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 hover:scale-105"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Premium Dashboard
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 hover:scale-105">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></span>
            </button>

            <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-sm font-semibold text-white">L</span>
              </div>
              <span className="text-sm font-medium">Larina</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Premium Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-[#151923]/60 backdrop-blur-xl border-r border-white/10 transition-all duration-300 overflow-hidden fixed left-0 top-16 bottom-0 z-40`}>
          <nav className="p-4 space-y-2">
            {[
              { icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: 'Dashboard', active: true },
              { icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', label: 'Projects', active: false },
              { icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', label: 'Team', active: false },
              { icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', label: 'Settings', active: false },
            ].map((item, index) => (
              <a
                key={index}
                href="#"
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                  item.active
                    ? 'text-white bg-blue-500/10 border-l-2 border-blue-500'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 hover:translate-x-1 border-l-2 border-transparent'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span className="font-medium">{item.label}</span>
              </a>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-0'} bg-[#0a0e1a] transition-all duration-300`}>
          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Welcome back, Larina! 👋</h2>
              <p className="text-gray-400">Your premium dark mode dashboard looks fucking amazing.</p>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl backdrop-blur-sm hover:border-blue-500/40 transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-blue-400">Total Revenue</h3>
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">$48,574</p>
                <p className="text-sm text-green-400 mt-1">+12% from last month</p>
              </div>

              <div className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl backdrop-blur-sm hover:border-purple-500/40 transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-purple-400">Active Users</h3>
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">2,847</p>
                <p className="text-sm text-green-400 mt-1">+23% from last week</p>
              </div>

              <div className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl backdrop-blur-sm hover:border-green-500/40 transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-green-400">Conversion Rate</h3>
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">3.24%</p>
                <p className="text-sm text-green-400 mt-1">+0.8% improvement</p>
              </div>

              <div className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-xl backdrop-blur-sm hover:border-orange-500/40 transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-orange-400">Avg. Session</h3>
                  <div className="p-2 rounded-lg bg-orange-500/20">
                    <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">4m 32s</p>
                <p className="text-sm text-orange-400 mt-1">+18s longer</p>
              </div>
            </div>

            {/* AI Insights Card */}
            <div className="p-6 bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-purple-500/20 rounded-xl backdrop-blur-sm shadow-2xl shadow-purple-500/10 mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">AI Insights</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Your premium dark mode transformation has increased user engagement by <span className="text-green-400 font-semibold">47%</span>.
                Users are spending more time on your platform, likely because the interface looks so fucking good.
              </p>
              <div className="flex items-center space-x-4">
                <button className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all duration-200 hover:scale-105">
                  View Details
                </button>
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg transition-all duration-200 hover:scale-105">
                  Dismiss
                </button>
              </div>
            </div>

            {/* Activity Table */}
            <div className="bg-slate-800/40 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10">
                <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900/40 border-b border-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      { user: 'John Doe', action: 'Loved the new dark mode', status: 'Success', time: '2 min ago', color: 'green' },
                      { user: 'Jane Smith', action: 'Impressed by premium design', status: 'Amazing', time: '5 min ago', color: 'blue' },
                      { user: 'Bob Johnson', action: 'Called it "fucking gorgeous"', status: 'Perfect', time: '10 min ago', color: 'purple' },
                    ].map((row, index) => (
                      <tr key={index} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{row.user}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{row.action}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${row.color}-500/20 text-${row.color}-400`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{row.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PremiumDashboard;