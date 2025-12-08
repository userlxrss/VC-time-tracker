// Script to add Larina's salary payment data so Ella and Paul can see it
// This creates sample salary history for Larina that all users (including bosses) can see

const larinaSalaryPayments = [
  {
    id: 'larina_salary_dec_2024',
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
    id: 'larina_salary_nov_2024',
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
    id: 'larina_salary_oct_2024',
    employeeId: 3,
    employeeName: 'Larina',
    amount: 32444,
    type: 'salary',
    period: 'October 2024',
    status: 'confirmed',
    sentBy: 1,
    sentByName: 'Ella',
    createdAt: '2024-10-01T09:00:00.000Z',
    confirmedAt: '2024-10-01T11:20:00.000Z'
  },
  {
    id: 'larina_reimbursement_oct_2024',
    employeeId: 3,
    employeeName: 'Larina',
    amount: 5000,
    type: 'reimbursement',
    period: 'October 2024',
    status: 'confirmed',
    sentBy: 2,
    sentByName: 'Paul',
    createdAt: '2024-10-15T14:00:00.000Z',
    confirmedAt: '2024-10-15T16:45:00.000Z'
  },
  {
    id: 'larina_salary_sep_2024',
    employeeId: 3,
    employeeName: 'Larina',
    amount: 32444,
    type: 'salary',
    period: 'September 2024',
    status: 'confirmed',
    sentBy: 1,
    sentByName: 'Ella',
    createdAt: '2024-09-01T09:00:00.000Z',
    confirmedAt: '2024-09-01T10:45:00.000Z'
  }
];

console.log('Adding Larina salary payment data...');
console.log('This will make Larina\'s salary history visible to Ella, Paul, and Larina.');

// Save to localStorage
if (typeof localStorage !== 'undefined') {
  const existingData = localStorage.getItem('salaryPayments');
  const payments = existingData ? JSON.parse(existingData) : [];

  // Add Larina's salary data (avoid duplicates)
  larinaSalaryPayments.forEach(payment => {
    if (!payments.find(p => p.id === payment.id)) {
      payments.push(payment);
      console.log(`Added payment: ${payment.employeeName} - ${payment.period} - ${payment.type} - ₱${payment.amount}`);
    }
  });

  localStorage.setItem('salaryPayments', JSON.stringify(payments));
  console.log(`Total payments in localStorage: ${payments.length}`);
  console.log('✅ Larina salary data added successfully!');
  console.log('Now Ella and Paul can see Larina\'s salary history.');
} else {
  console.log('localStorage not available. Run this script in the browser console.');
}