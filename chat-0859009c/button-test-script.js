#!/usr/bin/env node

/**
 * Comprehensive Button Functionality Testing Script
 * VC Time Tracker Application
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

const TEST_RESULTS = {
  working: [],
  broken: [],
  partial: [],
  skipped: []
};

class ButtonTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testStartTime = Date.now();
  }

  async init() {
    console.log('🚀 Starting VC Time Tracker Button Testing...');
    console.log('=' .repeat(60));

    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized', '--no-sandbox']
    });

    this.page = await this.browser.newPage();
    await this.page.goto('http://localhost:3002', { waitUntil: 'networkidle2' });

    // Wait for the app to fully load
    await this.page.waitForSelector('#root', { timeout: 10000 });

    console.log('✅ Application loaded successfully');
  }

  async testButton(selector, actionName, testFn = null) {
    try {
      console.log(`\n🔍 Testing: ${actionName}`);

      // Check if button exists
      const exists = await this.page.$(selector) !== null;
      if (!exists) {
        console.log(`❌ Button not found: ${selector}`);
        TEST_RESULTS.broken.push({
          action: actionName,
          selector: selector,
          issue: 'Button element not found',
          fix: 'Check if button is rendered conditionally'
        });
        return false;
      }

      // Check if button is visible
      const isVisible = await this.page.evaluate((sel) => {
        const el = document.querySelector(sel);
        return el && el.offsetParent !== null;
      }, selector);

      if (!isVisible) {
        console.log(`⚠️  Button exists but not visible: ${selector}`);
        TEST_RESULTS.partial.push({
          action: actionName,
          selector: selector,
          issue: 'Button exists but not visible',
          fix: 'Check visibility conditions or CSS display'
        });
        return false;
      }

      // Check if button is enabled
      const isEnabled = await this.page.evaluate((sel) => {
        const el = document.querySelector(sel);
        return el && !el.disabled;
      }, selector);

      if (!isEnabled && !actionName.includes('disabled')) {
        console.log(`⚠️  Button exists but disabled: ${selector}`);
        TEST_RESULTS.partial.push({
          action: actionName,
          selector: selector,
          issue: 'Button is disabled',
          fix: 'Check button state logic'
        });
        return false;
      }

      // Click the button and test functionality
      const beforeClick = Date.now();
      await this.page.click(selector);
      const clickTime = Date.now() - beforeClick;

      // Custom test function if provided
      if (testFn) {
        await testFn(this.page);
      } else {
        // Default wait for any response
        await this.page.waitForTimeout(500);
      }

      // Check for console errors
      const consoleErrors = await this.page.evaluate(() => {
        return window.consoleErrors || [];
      });

      if (consoleErrors.length > 0) {
        console.log(`❌ Console errors detected after clicking ${actionName}:`);
        consoleErrors.forEach(error => console.log(`   - ${error}`));
        TEST_RESULTS.broken.push({
          action: actionName,
          selector: selector,
          issue: `Console error: ${consoleErrors.join(', ')}`,
          fix: 'Fix JavaScript errors in button handler'
        });
        return false;
      }

      console.log(`✅ ${actionName} - Working (${clickTime}ms)`);
      TEST_RESULTS.working.push({
        action: actionName,
        selector: selector,
        responseTime: clickTime
      });

      return true;

    } catch (error) {
      console.log(`❌ ${actionName} - Error: ${error.message}`);
      TEST_RESULTS.broken.push({
        action: actionName,
        selector: selector,
        issue: `Exception: ${error.message}`,
        fix: 'Check button implementation and error handling'
      });
      return false;
    }
  }

  async testMainDashboard() {
    console.log('\n📊 Testing Main Dashboard Buttons...');

    // Setup console error capture
    await this.page.evaluateOnNewDocument(() => {
      window.consoleErrors = [];
      const originalError = console.error;
      console.error = function(...args) {
        window.consoleErrors.push(args.join(' '));
        originalError.apply(console, args);
      };
    });

    // Test header navigation buttons
    await this.testButton('button[title="Reports"]', 'Reports Button');
    await this.testButton('button[title="Settings"]', 'Settings Button');
    await this.testButton('button[title="Logout"]', 'Logout Button');

    // Test user dropdown
    await this.testButton('[data-user-dropdown] button', 'User Dropdown Button');

    // Test table actions
    await this.testButton('.filter-btn', 'Filter Button');
    await this.testButton('.export-btn', 'Export Button');

    // Test calendar navigation
    await this.testButton('.calendar-nav-btn', 'Calendar Previous Button', async (page) => {
      // Test previous month button
      const buttons = await page.$$('.calendar-nav-btn');
      if (buttons.length > 0) {
        await buttons[0].click();
        await page.waitForTimeout(300);
      }
    });

    // Test export menu items (need to open menu first)
    await this.page.click('.export-btn');
    await this.page.waitForTimeout(200);

    await this.testButton('[onclick*="handleExport(\'csv\')"]', 'Export CSV Button');
    await this.testButton('[onclick*="handleExport(\'excel\')"]', 'Export Excel Button');
    await this.testButton('[onclick*="handleExport(\'pdf\')"]', 'Export PDF Button');

    // Test settings modal (open it first)
    await this.page.click('button[title="Settings"]');
    await this.page.waitForTimeout(300);

    await this.testButton('.fixed button svg', 'Settings Close Button');
    await this.testButton('button[onclick*="setIsSettingsModalOpen(false)"]', 'Settings Cancel Button');
    await this.testButton('button[onclick*="saveSettings"]', 'Settings Save Button');
  }

  async testUserPage() {
    console.log('\n👤 Testing User Page Buttons...');

    // Navigate to a user page (try current user first)
    try {
      await this.page.goto('http://localhost:3002/user/3', { waitUntil: 'networkidle2' });
      await this.page.waitForSelector('#root', { timeout: 10000 });
    } catch (error) {
      console.log('⚠️  Could not access user page, skipping user page tests');
      return;
    }

    // Test navigation
    await this.testButton('button[onclick*="router.push(\'/\')"]', 'Back to Dashboard Button');

    // Test time tracking buttons
    await this.testButton('[onclick*="clock_in"]', 'Clock In Button');
    await this.testButton('[onclick*="clock_out"]', 'Clock Out Button');
    await this.testButton('[onclick*="start_break"]', 'Start Break Button');
    await this.testButton('[onclick*="end_break"]', 'End Break Button');

    // Test tab navigation
    await this.testButton('[onclick*="setActiveTab"]', 'Tab Navigation Buttons');

    // Test timesheet view buttons
    await this.testButton('[onclick*="setTimesheetView(\'daily\')"]', 'Daily View Button');
    await this.testButton('[onclick*="setTimesheetView(\'weekly\')"]', 'Weekly View Button');
    await this.testButton('[onclick*="setTimesheetView(\'monthly\')"]', 'Monthly View Button');
  }

  async testButtonSequences() {
    console.log('\n🔄 Testing Button Sequences...');

    // Test Clock In → Clock Out flow
    try {
      await this.page.goto('http://localhost:3002/user/3', { waitUntil: 'networkidle2' });
      await this.page.waitForTimeout(1000);

      // Check if user is clocked out
      const status = await this.page.evaluate(() => {
        const statusElement = document.querySelector('.row-status');
        return statusElement ? statusElement.textContent : '';
      });

      if (status.includes('Clocked Out')) {
        console.log('🔍 Testing Clock In → Clock Out sequence...');

        // Clock in
        const clockInBtn = await this.page.$('[onclick*="clock_in"]');
        if (clockInBtn) {
          await clockInBtn.click();
          await this.page.waitForTimeout(1000);

          // Verify status changed
          const newStatus = await this.page.evaluate(() => {
            const statusElement = document.querySelector('.row-status');
            return statusElement ? statusElement.textContent : '';
          });

          if (newStatus.includes('Clocked In')) {
            console.log('✅ Clock In → Clock Out sequence: Clock In working');

            // Clock out
            const clockOutBtn = await this.page.$('[onclick*="clock_out"]');
            if (clockOutBtn) {
              await clockOutBtn.click();
              await this.page.waitForTimeout(1000);

              const finalStatus = await this.page.evaluate(() => {
                const statusElement = document.querySelector('.row-status');
                return statusElement ? statusElement.textContent : '';
              });

              if (finalStatus.includes('Clocked Out')) {
                console.log('✅ Clock In → Clock Out sequence: Complete flow working');
                TEST_RESULTS.working.push({
                  action: 'Clock In → Clock Out Sequence',
                  selector: 'sequence',
                  responseTime: 0
                });
              } else {
                console.log('❌ Clock In → Clock Out sequence: Clock Out failed');
                TEST_RESULTS.broken.push({
                  action: 'Clock In → Clock Out Sequence',
                  selector: 'sequence',
                  issue: 'Clock Out not working after Clock In',
                  fix: 'Check status update logic'
                });
              }
            }
          } else {
            console.log('❌ Clock In → Clock Out sequence: Clock In failed');
            TEST_RESULTS.broken.push({
              action: 'Clock In → Clock Out Sequence',
              selector: 'sequence',
              issue: 'Clock In not working',
              fix: 'Check clock in implementation'
            });
          }
        }
      } else {
        console.log('⚠️  User already clocked in, skipping clock in/out sequence');
      }
    } catch (error) {
      console.log(`❌ Button sequence test failed: ${error.message}`);
    }
  }

  async generateReport() {
    const testDuration = Date.now() - this.testStartTime;

    console.log('\n' + '='.repeat(60));
    console.log('📋 COMPREHENSIVE BUTTON TESTING REPORT');
    console.log('='.repeat(60));

    console.log(`\n⏱️  Test Duration: ${(testDuration / 1000).toFixed(2)} seconds`);
    console.log(`📊 Total Buttons Tested: ${TEST_RESULTS.working.length + TEST_RESULTS.broken.length + TEST_RESULTS.partial.length + TEST_RESULTS.skipped.length}`);

    // Working buttons
    console.log(`\n✅ WORKING BUTTONS (${TEST_RESULTS.working.length}):`);
    if (TEST_RESULTS.working.length === 0) {
      console.log('   None working properly');
    } else {
      TEST_RESULTS.working.forEach((btn, index) => {
        console.log(`   ${index + 1}. ${btn.action} (${btn.responseTime}ms)`);
      });
    }

    // Broken buttons
    console.log(`\n❌ BROKEN BUTTONS (${TEST_RESULTS.broken.length}):`);
    if (TEST_RESULTS.broken.length === 0) {
      console.log('   🎉 No broken buttons found!');
    } else {
      TEST_RESULTS.broken.forEach((btn, index) => {
        console.log(`   ${index + 1}. ${btn.action}`);
        console.log(`      Issue: ${btn.issue}`);
        console.log(`      Fix: ${btn.fix}`);
        console.log(`      Selector: ${btn.selector}`);
        console.log('');
      });
    }

    // Partially working buttons
    console.log(`\n🟡 PARTIALLY WORKING BUTTONS (${TEST_RESULTS.partial.length}):`);
    if (TEST_RESULTS.partial.length === 0) {
      console.log('   None partially working');
    } else {
      TEST_RESULTS.partial.forEach((btn, index) => {
        console.log(`   ${index + 1}. ${btn.action}`);
        console.log(`      Issue: ${btn.issue}`);
        console.log(`      Fix: ${btn.fix}`);
        console.log(`      Selector: ${btn.selector}`);
        console.log('');
      });
    }

    // Skipped buttons
    console.log(`\n⚪ SKIPPED BUTTONS (${TEST_RESULTS.skipped.length}):`);
    if (TEST_RESULTS.skipped.length === 0) {
      console.log('   No buttons skipped');
    } else {
      TEST_RESULTS.skipped.forEach((btn, index) => {
        console.log(`   ${index + 1}. ${btn.action}: ${btn.reason}`);
      });
    }

    // Summary
    const successRate = ((TEST_RESULTS.working.length / (TEST_RESULTS.working.length + TEST_RESULTS.broken.length + TEST_RESULTS.partial.length)) * 100).toFixed(1);
    console.log(`\n📈 SUCCESS RATE: ${successRate}%`);

    if (TEST_RESULTS.broken.length === 0 && TEST_RESULTS.partial.length === 0) {
      console.log('🎉 EXCELLENT: All buttons are working perfectly!');
    } else if (successRate >= 80) {
      console.log('👍 GOOD: Most buttons are working, but some fixes needed');
    } else if (successRate >= 60) {
      console.log('⚠️  FAIR: Some critical buttons need attention');
    } else {
      console.log('🚨 POOR: Many buttons are broken and need immediate fixes');
    }

    // Save detailed report
    const reportData = {
      timestamp: new Date().toISOString(),
      duration: testDuration,
      summary: {
        total: TEST_RESULTS.working.length + TEST_RESULTS.broken.length + TEST_RESULTS.partial.length + TEST_RESULTS.skipped.length,
        working: TEST_RESULTS.working.length,
        broken: TEST_RESULTS.broken.length,
        partial: TEST_RESULTS.partial.length,
        skipped: TEST_RESULTS.skipped.length,
        successRate: parseFloat(successRate)
      },
      results: TEST_RESULTS
    };

    fs.writeFileSync('/Users/larstuesca/Documents/agent-girl/chat-0859009c/button-test-report.json', JSON.stringify(reportData, null, 2));
    console.log('\n💾 Detailed report saved to: button-test-report.json');
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Main execution
async function runTests() {
  const tester = new ButtonTester();

  try {
    await tester.init();
    await tester.testMainDashboard();
    await tester.testUserPage();
    await tester.testButtonSequences();
    await tester.generateReport();
  } catch (error) {
    console.error('❌ Test execution failed:', error);
  } finally {
    await tester.cleanup();
  }
}

// Run if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = ButtonTester;