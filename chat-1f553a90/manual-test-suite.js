#!/usr/bin/env node

/**
 * Manual Testing Suite for VC Time Tracker
 * This script provides a comprehensive checklist for manual testing
 */

const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const testSuites = [
  {
    name: 'Authentication Tests',
    tests: [
      {
        description: 'Test login with Maria (boss)',
        expected: 'Should redirect to dashboard, show Maria as logged in user',
        steps: [
          'Navigate to login page',
          'Enter email: maria@vc.com',
          'Enter password: maria123',
          'Click Sign In',
          'Verify redirect to /dashboard',
          'Check user is Maria Villanueva'
        ]
      },
      {
        description: 'Test login with Carlos (boss)',
        expected: 'Should redirect to dashboard, show Carlos as logged in user',
        steps: [
          'Navigate to login page',
          'Enter email: carlos@vc.com',
          'Enter password: carlos123',
          'Click Sign In',
          'Verify redirect to /dashboard',
          'Check user is Carlos Villanueva'
        ]
      },
      {
        description: 'Test login with Larina (employee)',
        expected: 'Should redirect to dashboard, show Larina as logged in user',
        steps: [
          'Navigate to login page',
          'Enter email: larina@vc.com',
          'Enter password: larina123',
          'Click Sign In',
          'Verify redirect to /dashboard',
          'Check user is Larina Villanueva'
        ]
      },
      {
        description: 'Test invalid login credentials',
        expected: 'Should show error message, not redirect',
        steps: [
          'Navigate to login page',
          'Enter invalid email or password',
          'Click Sign In',
          'Verify error message appears',
          'Verify no redirect occurs'
        ]
      },
      {
        description: 'Test logout functionality',
        expected: 'Should redirect to login page',
        steps: [
          'Login with any valid user',
          'Click logout button or dropdown option',
          'Verify redirect to login page',
          'Verify localStorage is cleared'
        ]
      },
      {
        description: 'Test session persistence',
        expected: 'Should stay logged in after page refresh',
        steps: [
          'Login with valid user',
          'Refresh the page (F5 or Cmd+R)',
          'Verify still logged in and on dashboard',
          'Verify user data persists'
        ]
      }
    ]
  },
  {
    name: 'UI/UX Tests',
    tests: [
      {
        description: 'Test responsive design - Mobile (375px)',
        expected: 'Layout should adapt to mobile screen',
        steps: [
          'Open developer tools',
          'Toggle device toolbar',
          'Select iPhone 12 or set width to 375px',
          'Verify all elements are visible',
          'Check navigation is mobile-friendly',
          'Verify text is readable'
        ]
      },
      {
        description: 'Test responsive design - Tablet (768px)',
        expected: 'Layout should adapt to tablet screen',
        steps: [
          'Set viewport width to 768px',
          'Verify layout adjustments',
          'Check component spacing',
          'Verify navigation adapts properly'
        ]
      },
      {
        description: 'Test responsive design - Desktop (1920px)',
        expected: 'Layout should scale properly on large screens',
        steps: [
          'Set viewport width to 1920px',
          'Verify content doesn\'t stretch too wide',
          'Check max-width constraints',
          'Verify proper spacing'
        ]
      },
      {
        description: 'Test dark mode toggle',
        expected: 'Theme should switch smoothly',
        steps: [
          'Click theme toggle button',
          'Verify dark mode applies',
          'Check text visibility in dark mode',
          'Toggle back to light mode',
          'Verify light mode restores'
        ]
      },
      {
        description: 'Test system theme preference',
        expected: 'Should respect system theme',
        steps: [
          'Set system to dark mode in OS settings',
          'Refresh page (no theme selected yet)',
          'Verify dark mode is applied automatically',
          'Test with system light mode'
        ]
      }
    ]
  },
  {
    name: 'Performance Tests',
    tests: [
      {
        description: 'Test page load performance',
        expected: 'Page should load within 2 seconds',
        steps: [
          'Clear browser cache',
          'Open Network tab in dev tools',
          'Load the application',
          'Check first contentful paint time',
          'Verify load time is under 2 seconds'
        ]
      },
      {
        description: 'Test animation smoothness',
        expected: 'Animations should run at 60fps',
        steps: [
          'Open Performance tab in dev tools',
          'Start recording',
          'Trigger various animations (hover, click)',
          'Stop recording',
          'Check for dropped frames',
          'Verify smooth 60fps animations'
        ]
      },
      {
        description: 'Test memory usage',
        expected: 'No significant memory leaks',
        steps: [
          'Open Memory tab in dev tools',
          'Take heap snapshot',
          'Use application for 5 minutes',
          'Take another heap snapshot',
          'Compare for memory leaks'
        ]
      },
      {
        description: 'Test bundle size',
        expected: 'JavaScript bundle should be reasonably sized',
        steps: [
          'Check Network tab for bundle sizes',
          'Verify JavaScript bundle under 500KB (gzipped)',
          'Check CSS bundle size',
          'Verify images are optimized'
        ]
      }
    ]
  },
  {
    name: 'Accessibility Tests',
    tests: [
      {
        description: 'Test keyboard navigation',
        expected: 'All interactive elements should be keyboard accessible',
        steps: [
          'Navigate using Tab key only',
          'Verify focus indicator is visible',
          'Check all buttons/links receive focus',
          'Test Enter/Space key activation',
          'Verify logical tab order'
        ]
      },
      {
        description: 'Test screen reader compatibility',
        expected: 'Content should be accessible via screen reader',
        steps: [
          'Enable screen reader (VoiceOver/NVDA)',
          'Navigate through page',
          'Check alt text for images',
          'Verify ARIA labels are present',
          'Check form field descriptions'
        ]
      },
      {
        description: 'Test color contrast',
        expected: 'Text should have sufficient contrast ratio',
        steps: [
          'Use browser contrast checker extension',
          'Check text against background colors',
          'Verify 4.5:1 ratio for normal text',
          'Verify 3:1 ratio for large text'
        ]
      },
      {
        description: 'Test focus management',
        expected: 'Focus should be properly managed',
        steps: [
          'Open modal/dialog',
          'Verify focus is trapped',
          'Close modal',
          'Verify focus returns to trigger',
          'Check dynamic content focus'
        ]
      }
    ]
  },
  {
    name: 'Edge Case Tests',
    tests: [
      {
        description: 'Test network connectivity issues',
        expected: 'Should handle network errors gracefully',
        steps: [
          'Disconnect from network',
          'Try to use application',
          'Verify graceful degradation',
          'Reconnect network',
          'Verify recovery'
        ]
      },
      {
        description: 'Test browser storage limitations',
        expected: 'Should handle localStorage being full/disabled',
        steps: [
          'Disable localStorage in browser settings',
          'Try to login',
          'Verify appropriate error handling',
          'Re-enable localStorage',
          'Verify normal operation'
        ]
      },
      {
        description: 'Test concurrent sessions',
        expected: 'Should handle multiple tabs',
        steps: [
          'Open application in multiple tabs',
          'Login in one tab',
          'Verify other tabs update',
          'Logout in one tab',
          'Verify other tabs update'
        ]
      },
      {
        description: 'Test browser back/forward buttons',
        expected: 'Navigation should work correctly',
        steps: [
          'Navigate through different pages',
          'Use browser back button',
          'Use browser forward button',
          'Verify page states are correct'
        ]
      }
    ]
  }
];

function displayMenu() {
  console.log('\n🧪 VC Time Tracker - Manual Testing Suite');
  console.log('=' .repeat(50));

  testSuites.forEach((suite, index) => {
    console.log(`${index + 1}. ${suite.name}`);
  });

  console.log(`${testSuites.length + 1}. Run all tests sequentially`);
  console.log(`${testSuites.length + 2}. Exit`);
  console.log('');
}

async function runTestSuite(suiteIndex) {
  const suite = testSuites[suiteIndex];
  console.log(`\n📋 Running: ${suite.name}`);
  console.log('-'.repeat(50));

  for (let i = 0; i < suite.tests.length; i++) {
    const test = suite.tests[i];
    console.log(`\n${i + 1}. ${test.description}`);
    console.log(`Expected: ${test.expected}`);
    console.log('\nSteps:');
    test.steps.forEach((step, stepIndex) => {
      console.log(`   ${stepIndex + 1}. ${step}`);
    });

    await new Promise(resolve => {
      rl.question('\nPress Enter to mark test as completed...', resolve);
    });

    const passed = await new Promise(resolve => {
      rl.question('Did this test pass? (y/n): ', (answer) => {
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });

    console.log(`✅ Test ${passed ? 'PASSED' : 'FAILED'}`);

    if (!passed) {
      const notes = await new Promise(resolve => {
        rl.question('Enter notes about failure: ', resolve);
      });
      test.failureNotes = notes;
    }
  }
}

async function runAllTests() {
  console.log('\n🚀 Running all test suites sequentially...');

  for (let i = 0; i < testSuites.length; i++) {
    await runTestSuite(i);

    if (i < testSuites.length - 1) {
      const continueTest = await new Promise(resolve => {
        rl.question('\nContinue to next test suite? (y/n): ', (answer) => {
          resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        });
      });

      if (!continueTest) {
        break;
      }
    }
  }

  generateReport();
}

function generateReport() {
  console.log('\n📊 Test Report Summary');
  console.log('=' .repeat(50));

  let totalTests = 0;
  let passedTests = 0;

  testSuites.forEach(suite => {
    console.log(`\n${suite.name}:`);
    suite.tests.forEach(test => {
      totalTests++;
      const passed = !test.failureNotes;
      if (passed) passedTests++;

      console.log(`  ${passed ? '✅' : '❌'} ${test.description}`);
      if (test.failureNotes) {
        console.log(`    Notes: ${test.failureNotes}`);
      }
    });
  });

  console.log('\n' + '=' .repeat(50));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Application is ready for production.');
  } else {
    console.log('\n⚠️  Some tests failed. Please address the issues before production.');
  }
}

function startApp() {
  console.log('\n🚀 Starting the application...');
  try {
    execSync('npm run dev', { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to start application:', error.message);
  }
}

async function main() {
  console.log('Before running tests, make sure the application is running.');
  console.log('Would you like to start the application now? (y/n)');

  const startAppNow = await new Promise(resolve => {
    rl.question('', resolve);
  });

  if (startAppNow.toLowerCase() === 'y' || startAppNow.toLowerCase() === 'yes') {
    startApp();
    return;
  }

  while (true) {
    displayMenu();

    const choice = await new Promise(resolve => {
      rl.question('Enter your choice: ', resolve);
    });

    const choiceNum = parseInt(choice);

    if (choiceNum === testSuites.length + 2) {
      console.log('\n👋 Exiting test suite. Goodbye!');
      break;
    } else if (choiceNum === testSuites.length + 1) {
      await runAllTests();
    } else if (choiceNum >= 1 && choiceNum <= testSuites.length) {
      await runTestSuite(choiceNum - 1);
    } else {
      console.log('Invalid choice. Please try again.');
    }
  }

  rl.close();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testSuites, runTestSuite, generateReport };