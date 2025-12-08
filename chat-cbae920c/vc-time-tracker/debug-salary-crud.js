// Debug script to test salary payment CRUD operations
// Run this in the browser console on http://localhost:3002

console.log('🔍 Testing Salary Payment CRUD Operations...');

// Test 1: Check if we can access the CRUD operations
if (typeof window !== 'undefined' && window.SalaryPaymentCRUD) {
  console.log('✅ SalaryPaymentCRUD is available');

  // Test 2: Try to get all payments
  try {
    const allPayments = window.SalaryPaymentCRUD.getAllPayments();
    console.log('📊 All payments:', allPayments.length, 'items');
    console.log('Payments:', allPayments);

    // Test 3: Try to get confirmed payments
    const confirmedPayments = window.SalaryPaymentCRUD.getConfirmedSalaryPaymentsForAll();
    console.log('✅ Confirmed payments:', confirmedPayments.length, 'items');
    console.log('Confirmed:', confirmedPayments);

    // Test 4: Check localStorage directly
    const localStorageData = localStorage.getItem('salaryPayments');
    console.log('💾 Raw localStorage data:', localStorageData);

    // Test 5: Force re-initialization
    if (allPayments.length === 0) {
      console.log('🔄 No payments found, forcing re-initialization...');
      localStorage.removeItem('salaryPayments');
      const reinitializedPayments = window.SalaryPaymentCRUD.getAllPayments();
      console.log('📊 After re-initialization:', reinitializedPayments.length, 'items');
    }

  } catch (error) {
    console.error('❌ Error testing CRUD operations:', error);
  }
} else {
  console.log('❌ SalaryPaymentCRUD not available. Make sure the app is loaded.');
}

console.log('🔍 Debug complete');