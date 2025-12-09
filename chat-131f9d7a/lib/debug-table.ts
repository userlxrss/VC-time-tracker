import { supabase } from './supabase';

export async function debugTableStructure() {
  console.log('🔍 DEBUGGING salary_records table...');

  try {
    // Test 1: Try to select from the table
    console.log('\n📊 Test 1: Basic table access...');
    const { data: testData, error: testError } = await supabase
      .from('salary_records')
      .select('*')
      .limit(1);

    if (testError) {
      console.error('❌ Table access error:', testError);
      console.error('Error details:', testError.details);
      console.error('Error hint:', testError.hint);
      console.error('Error code:', testError.code);
    } else {
      console.log('✅ Table access successful');
      console.log('Sample data:', testData);
      if (testData && testData.length > 0) {
        console.log('Available columns:', Object.keys(testData[0]));
      }
    }

    // Test 2: Check row count
    console.log('\n📈 Test 2: Row count...');
    const { count, error: countError } = await supabase
      .from('salary_records')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Count error:', countError);
    } else {
      console.log(`✅ Table has ${count} rows`);
    }

    // Test 3: Try to insert a test record
    console.log('\n🧪 Test 3: Insert test record...');
    const testRecord = {
      id: 'test_' + Date.now(),
      employee_id: 3,
      employee_name: 'Test Employee',
      amount: 1000,
      currency: 'PHP',
      payment_month: 'December 2024',
      work_period_start: '2024-12-01',
      work_period_end: '2024-12-31',
      status: 'pending',
      paid_date: null,
      paid_by: null,
      auto_generated: false,
      generated_date: new Date().toISOString(),
      due_date: '2024-12-31',
      reminder_sent: false,
      employee_notified: false,
      confirmed_by_employee: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: insertData, error: insertError } = await supabase
      .from('salary_records')
      .insert(testRecord)
      .select();

    if (insertError) {
      console.error('❌ Insert error:', insertError);
      console.error('Error details:', insertError.details);
      console.error('Error hint:', insertError.hint);
      console.error('Error code:', insertError.code);
    } else {
      console.log('✅ Insert successful:', insertData);
    }

    // Test 4: Get table schema using information_schema
    console.log('\n📋 Test 4: Table schema...');
    const { data: schema, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'salary_records')
      .eq('table_schema', 'public');

    if (schemaError) {
      console.error('❌ Schema error:', schemaError);
    } else {
      console.log('✅ Table schema:', schema);
    }

  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}