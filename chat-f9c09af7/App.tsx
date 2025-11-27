import React, { useState, useEffect } from 'react';
import { Journal } from './pages/Journal';
import { ThemeProvider } from './components/ThemeProvider';
import './premium-dark-mode.css';

// Demo App to showcase the Calendar widget with dark mode fixes
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <div className="app-layout">
        {/* Main Content */}
        <main className="main-content">
          <header className="header">
            <h1 className="header-title">Productivity Hub</h1>
            <div className="header-actions">
              <div className="theme-toggle">
                <span className="theme-label">Dark Mode</span>
                <div className="theme-switch">
                  <input type="checkbox" id="theme-switch" defaultChecked />
                  <label htmlFor="theme-switch" className="switch">
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </header>

          <div className="content">
            <Journal />
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default App;