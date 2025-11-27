'use client'
import { USERS, CURRENT_USER_ID } from './constants/users'
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [theme, setTheme] = useState('light')
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'light'
    setTheme(saved)
    if (saved === 'dark') document.documentElement.classList.add('dark')
  }, [])

  function toggleTheme() {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark')
  }

  const handleUserClick = (userId: number) => {
    router.push(`/user/${userId}`)
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* NAVBAR */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-2xl font-bold text-blue-600">VC</div>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
              L
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold mb-2 dark:text-white">Team Overview</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">View and manage time tracking for all team members</p>

        {/* CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {USERS.map(user => (
            <div
              key={user.id}
              className={`
                bg-white dark:bg-gray-800 rounded-2xl p-8 cursor-pointer
                transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl
                ${user.id === CURRENT_USER_ID
                  ? 'border-2 border-green-500 shadow-lg'
                  : 'border border-gray-200 dark:border-gray-700 shadow-md'
                }
              `}
              onClick={() => handleUserClick(user.id)}
            >
              {/* Avatar */}
              <div className="flex justify-center mb-6">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white ${user.role === 'boss' ? 'bg-blue-500' : 'bg-green-500'}`}>
                  {user.firstName[0]}
                </div>
              </div>

              {/* Name */}
              <h3 className="text-2xl font-bold text-center mb-6 dark:text-white">
                {user.firstName}
              </h3>

              {/* Status */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Clocked Out</span>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700 mb-6" />

              {/* Stats */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Today</span>
                  <span className="font-bold dark:text-white">0h 0m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">This Week</span>
                  <span className="font-bold dark:text-white">0h 0m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">This Month</span>
                  <span className="font-bold dark:text-white">0h 0m</span>
                </div>
              </div>

              {/* View Profile Button */}
              <div className="mt-6 text-center">
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  View Profile →
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}