/**
 * Tabs Component
 *
 * Simple and accessible tabs component for navigation between different views.
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TabsContextType {
  value: string;
  onChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs({ value, onChange, children, className = '' }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onChange }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

interface TabListProps {
  children: ReactNode;
  className?: string;
}

export function TabList({ children, className = '' }: TabListProps) {
  return (
    <div className={`flex space-x-8 ${className}`} role="tablist">
      {children}
    </div>
  );
}

interface TabIndicatorProps {
  value: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export function TabIndicator({ value, children, className = '', disabled = false }: TabIndicatorProps) {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('TabIndicator must be used within a Tabs component');
  }

  const { value: selectedValue, onChange } = context;
  const isSelected = selectedValue === value;

  const handleClick = () => {
    if (!disabled) {
      onChange(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault();
      onChange(value);
    }
  };

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      aria-disabled={disabled}
      tabIndex={isSelected ? 0 : -1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={`
        ${className}
        ${isSelected ? 'text-blue-600 border-blue-500' : 'text-gray-700 border-transparent hover:text-gray-900 hover:bg-gray-50'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        focus:outline-none focus:text-gray-900 focus:border-blue-500
        data-[selected]:text-blue-600 data-[selected]:border-blue-500
      `}
    >
      {children}
    </button>
  );
}

interface TabPanelProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabPanel({ value, children, className = '' }: TabPanelProps) {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('TabPanel must be used within a Tabs component');
  }

  const { value: selectedValue } = context;
  const isSelected = selectedValue === value;

  if (!isSelected) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      aria-labelledby={`tab-${value}`}
      className={className}
    >
      {children}
    </div>
  );
}