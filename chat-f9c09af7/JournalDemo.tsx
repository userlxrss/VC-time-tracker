import React from 'react';
import { JournalPage } from './JournalPage';
import { ThemeProvider } from './components/ThemeProvider';
import './premium-dark-mode.css';
import './journal-dark-mode-enhanced.css';

// Simple Theme Provider implementation
const SimpleThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  return <>{children}</>;
};

export const JournalDemo: React.FC = () => {
  return (
    <SimpleThemeProvider>
      <div className="app-layout">
        <JournalPage />
      </div>
    </SimpleThemeProvider>
  );
};

export default JournalDemo;