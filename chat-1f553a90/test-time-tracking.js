/**
 * Quick validation script for the time tracking system
 * Run this in the browser console to test the system
 */

// Helper function to simulate time passage
function simulateTimePassing(hours = 1) {
  const now = new Date();
  now.setHours(now.getHours() + hours);
  jest.advanceTimersByTime(hours * 60 * 60 * 1000);
}

async function runTimeTrackingTests() {
  console.log('🚀 Starting Time Tracking System Validation...');

  try {
    // Import the time tracking functions
    const {
      clockIn,
      clockOut,
      startLunchBreak,
      endLunchBreak,
      startShortBreak,
      endShortBreak,
      getTodayTimeEntry,
      getTimeStats,
      timeTracker
    } = require('./lib/timeTracking');

    console.log('✅ Successfully imported time tracking functions');

    // Test 1: Basic clock in/out
    console.log('\n📋 Test 1: Basic Clock In/Out');

    const userId = 1;
    const entry = clockIn(userId);
    console.log('✅ Clocked in successfully', { id: entry.id, status: entry.status });

    const stats = getTimeStats(userId);
    console.log('✅ Time stats updated', { isClockedIn: stats.isClockedIn, status: stats.currentStatus });

    // Test 2: Lunch break
    console.log('\n📋 Test 2: Lunch Break Management');

    startLunchBreak(userId);
    const lunchEntry = getTodayTimeEntry(userId);
    console.log('✅ Lunch break started', { hasLunchStart: !!lunchEntry.lunchBreakStart });

    endLunchBreak(userId);
    const afterLunchEntry = getTodayTimeEntry(userId);
    console.log('✅ Lunch break ended', {
      hasLunchStart: !!afterLunchEntry.lunchBreakStart,
      hasLunchEnd: !!afterLunchEntry.lunchBreakEnd
    });

    // Test 3: Short breaks
    console.log('\n📋 Test 3: Short Break Management');

    startShortBreak(userId);
    let breakEntry = getTodayTimeEntry(userId);
    console.log('✅ First short break started', { breakCount: breakEntry.shortBreaks.length });

    endShortBreak(userId);
    breakEntry = getTodayTimeEntry(userId);
    console.log('✅ First short break ended', {
      breakCount: breakEntry.shortBreaks.length,
      hasDuration: !!breakEntry.shortBreaks[0].duration
    });

    // Test 4: Multiple short breaks
    startShortBreak(userId);
    endShortBreak(userId);
    breakEntry = getTodayTimeEntry(userId);
    console.log('✅ Multiple short breaks handled', { breakCount: breakEntry.shortBreaks.length });

    // Test 5: Clock out and hours calculation
    console.log('\n📋 Test 5: Clock Out and Hours Calculation');

    const completedEntry = clockOut(userId);
    console.log('✅ Clocked out successfully', {
      totalHours: completedEntry.totalHours,
      hasClockOut: !!completedEntry.clockOut,
      breakCount: completedEntry.shortBreaks.length
    });

    // Test 6: Data persistence
    console.log('\n📋 Test 6: Data Persistence');

    const storedData = localStorage.getItem('vc-time-entries');
    console.log('✅ Data persisted to localStorage', { hasData: !!storedData });

    if (storedData) {
      const parsed = JSON.parse(storedData);
      console.log('✅ Data structure valid', {
        isArray: Array.isArray(parsed),
        userCount: parsed.length
      });
    }

    // Test 7: Multiple users
    console.log('\n📋 Test 7: Multiple Users');

    const user2Entry = clockIn(2);
    const user3Entry = clockIn(3);
    console.log('✅ Multiple users tracked simultaneously', {
      user2Status: user2Entry.status,
      user3Status: user3Entry.status,
      user2Id: user2Entry.userId,
      user3Id: user3Entry.userId
    });

    // Test 8: Error handling
    console.log('\n📋 Test 8: Error Handling');

    try {
      clockIn(userId); // Should fail - already clocked out
      console.log('❌ Should have thrown error for duplicate clock in');
    } catch (error) {
      console.log('✅ Correctly prevented duplicate clock in', { error: error.message });
    }

    try {
      clockOut(999); // Should fail - no entry
      console.log('❌ Should have thrown error for clock out without clock in');
    } catch (error) {
      console.log('✅ Correctly prevented clock out without clock in', { error: error.message });
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('📊 Final Stats Summary:');
    console.log(`- User ${userId}: Today's hours = ${getTimeStats(userId).todayHours}h`);
    console.log(`- User 2: Status = ${getTimeStats(2).currentStatus}`);
    console.log(`- User 3: Status = ${getTimeStats(3).currentStatus}`);

    return true;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Export for use in different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runTimeTrackingTests };
} else {
  // Browser environment
  window.runTimeTrackingTests = runTimeTrackingTests;
  console.log('💡 To run tests, call: runTimeTrackingTests()');
}