import React from 'react';
import { BreakProvider } from './contexts/BreakContext';

const TestComponent: React.FC = () => {
  console.log('TestComponent rendered');

  return (
    <BreakProvider>
      <div>
        <h1>Break Context Test</h1>
        <p>If you see this message without infinite re-renders, the fixes worked!</p>
      </div>
    </BreakProvider>
  );
};

export default TestComponent;