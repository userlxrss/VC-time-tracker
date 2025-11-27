'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'pill';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  size = 'md',
  variant = 'default'
}) => {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'minimal':
        return 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400';
      case 'pill':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full';
      default:
        return 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-lg shadow-sm hover:shadow-md';
    }
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className={`${sizeClasses[size]} ${getVariantClasses()} flex items-center justify-center transition-all duration-300 ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 180 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="relative"
      >
        <Sun
          size={iconSizes[size]}
          className="absolute inset-0 m-auto transition-opacity duration-300"
          style={{ opacity: theme === 'dark' ? 0 : 1 }}
        />
        <Moon
          size={iconSizes[size]}
          className="absolute inset-0 m-auto transition-opacity duration-300"
          style={{ opacity: theme === 'dark' ? 1 : 0 }}
        />
      </motion.div>
    </motion.button>
  );
};

// Advanced theme toggle with sliding animation
export const ThemeToggleSlider: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className={`relative w-14 h-7 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors duration-300 ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center"
        animate={{ x: theme === 'dark' ? 28 : 4 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <motion.div
          initial={false}
          animate={{ rotate: theme === 'dark' ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {theme === 'dark' ? (
            <Moon size={12} className="text-gray-700" />
          ) : (
            <Sun size={12} className="text-yellow-500" />
          )}
        </motion.div>
      </motion.div>
    </motion.button>
  );
};