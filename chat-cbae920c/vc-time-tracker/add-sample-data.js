// Script to add sample salary payment data
// This simulates existing salary history for Larina

const samplePayments = [
  {
    id: 'sample_payment_1',
    employeeId: 3,
    employeeName: 'Larina',
    amount: 32444,
    type: 'salary',
    period: 'December 2024',
    status: 'confirmed',
    sentBy: 1,
    sentByName: 'Ella',
    createdAt: '2024-12-01T09:00:00.000Z',
    confirmedAt: '2024-12-01T10:30:00.000Z'
  },
  {
    id: 'sample_payment_2',
    employeeId: 3,
    employeeName: 'Larina',
    amount: 32444,
    type: 'salary',
    period: 'November 2024',
    status: 'confirmed',
    sentBy: 2,
    sentByName: 'Paul',
    createdAt: '2024-11-01T09:00:00.000Z',
    confirmedAt: '2024-11-01T10:15:00.000Z'
  },
  {
    id: 'sample_payment_3',
    employeeId: 3,
    employeeName: 'Larina',
    amount: 15000,
    type: 'reimbursement',
    period: 'October 2024',
    status: 'confirmed',
    sentBy: 1,
    sentByName: 'Ella',
    createdAt: '2024-10-15T14:00:00.000Z',
    confirmedAt: '2024-10-15T16:45:00.000Z'
  },
  {
    id: 'sample_payment_4',
    employeeId: 3,
    employeeName: 'Larina',
    amount: 32444,
    type: 'salary',
    period: 'October 2024',
    status: 'confirmed',
    sentBy: 2,
    sentByName: 'Paul',
    createdAt: '2024-10-01T09:00:00.000Z',
    confirmedAt: '2024-10-01T11:20:00.000Z'
  }
];

console.log('Adding sample salary payment data to localStorage...');
console.log('This data will be visible to Ella, Paul, and Larina in the shared salary history.');

// Save to localStorage
if (typeof localStorage !== 'undefined') {
  const existingData = localStorage.getItem('salaryPayments');
  const payments = existingData ? JSON.parse(existingData) : [];

  // Add sample data (avoid duplicates)
  samplePayments.forEach(sample => {
    if (!payments.find(p => p.id === sample.id)) {
      payments.push(sample);
    }
  });

  localStorage.setItem('salaryPayments', JSON.stringify(payments));
  console.log(`Added ${samplePayments.length} sample payments. Total payments: ${payments.length}`);
} else {
  console.log('localStorage not available. Run this script in the browser console.');
}