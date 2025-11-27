import React, { useState } from 'react';

/**
 * Dashboard Layout Component
 * Demonstrates the refined dark mode color system with proper layering
 */
const DashboardLayout = ({ children, sidebar, header }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Header - Elevated surface with distinct color */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#151923] border-b border-white/10 shadow-2xl z-50 backdrop-blur-sm">
        <div className="flex items-center justify-between h-full px-6">
          <div className="flex items-center space-x-4">
            {/* Hamburger menu with refined colors */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg bg-bg-elevated hover:bg-bg-interactive border border-border-light transition-all duration-200 group"
              aria-label="Toggle sidebar"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-white">Dashboard</h1>
          </div>

          {/* User menu with refined styling */}
          <div className="flex items-center space-x-4">
            <button className="relative p-2 rounded-lg bg-bg-elevated hover:bg-bg-interactive border border-border-light transition-all duration-200">
              <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent-primary rounded-full shadow-glow"></span>
            </button>

            <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-surface-elevated border border-border-light">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-primary to-accent-hover flex items-center justify-center">
                <span className="text-sm font-semibold text-text-inverse">U</span>
              </div>
              <span className="text-sm font-medium text-text-primary">User</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar - Distinct from content area */}
        <aside className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-[#151923] border-r border-white/10 transition-all duration-300 overflow-hidden fixed left-0 top-16 bottom-0 z-40 backdrop-blur-sm`}>
          <nav className="p-4 space-y-2">
            {/* Sidebar navigation items with refined colors */}
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
                    ? 'text-white bg-blue-500/10 border-l-2 border-blue-500 shadow-none'
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

        {/* Main Content Area */}
        <main className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-0'} bg-[#0a0e1a] transition-all duration-300`}>
          <div className="p-6">
            {/* Content Cards with Refined Color System */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Stat Cards */}
              <div className="p-6 bg-slate-800/50 border border-white/5 shadow-2xl hover:border-blue-500/30 hover:shadow-blue-500/10 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">Total Revenue</h3>
                  <div className="p-2 rounded-lg bg-success bg-opacity-10">
                    <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-bold text-text-primary">$48,574</p>
                <p className="text-sm text-text-secondary mt-1">+12% from last month</p>
              </div>

              {/* Feature Card with Glass Effect */}
              <div className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/5 shadow-2xl hover:border-purple-500/30 hover:shadow-purple-500/10 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] rounded-xl group cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg bg-accent-primary bg-opacity-10 group-hover:bg-opacity-20 transition-colors">
                    <svg className="w-6 h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">Quick Actions</h3>
                    <p className="text-sm text-text-secondary">Manage your tasks</p>
                  </div>
                </div>
              </div>

              {/* Interactive Card */}
              <div className="p-6 bg-slate-800/60 border border-white/5 shadow-2xl hover:border-green-500/30 hover:shadow-green-500/10 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] rounded-xl">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Performance</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-text-secondary">CPU Usage</span>
                      <span className="text-text-primary">67%</span>
                    </div>
                    <div className="w-full bg-bg-primary rounded-full h-2 border border-border-light">
                      <div className="bg-accent-primary h-2 rounded-full" style={{ width: '67%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-text-secondary">Memory</span>
                      <span className="text-text-primary">82%</span>
                    </div>
                    <div className="w-full bg-bg-primary rounded-full h-2 border border-border-light">
                      <div className="bg-warning h-2 rounded-full" style={{ width: '82%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Table with Refined Colors */}
            <div className="mt-8 bg-slate-800/40 backdrop-blur-sm border border-white/5 shadow-2xl rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border-light bg-bg-elevated">
                <h2 className="text-xl font-semibold text-text-primary">Recent Activity</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-bg-elevated border-b border-border-light">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light">
                    {[
                      { user: 'John Doe', action: 'Created project', status: 'Success', time: '2 min ago', color: 'success' },
                      { user: 'Jane Smith', action: 'Updated settings', status: 'Warning', time: '5 min ago', color: 'warning' },
                      { user: 'Bob Johnson', action: 'Deleted file', status: 'Error', time: '10 min ago', color: 'error' },
                    ].map((row, index) => (
                      <tr key={index} className="hover:bg-bg-interactive transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{row.user}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{row.action}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${row.color} bg-opacity-10 text-${row.color}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-tertiary">{row.time}</td>
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

export default DashboardLayout;