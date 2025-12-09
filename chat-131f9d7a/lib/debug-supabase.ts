import { supabase } from './supabase';

export async function debugSupabaseData() {
  console.log('🔍 DEBUG: Checking Supabase data...');

  try {
    // Check ALL records in salary_records
    const { data: allRecords, error: allError } = await supabase
      .from('salary_records')
      .select('*')
      .order('created_at', { ascending: false });

    if (allError) {
      console.error('❌ All records error:', allError);
      return;
    }

    console.log('📊 ALL RECORDS:', allRecords);
    console.log('📊 Total records:', allRecords?.length);

    // Check specifically for employee 3
    const { data: emp3Records, error: emp3Error } = await supabase
      .from('salary_records')
      .select('*')
      .eq('employee_id', 3)
      .order('created_at', { ascending: false });

    if (emp3Error) {
      console.error('❌ Employee 3 records error:', emp3Error);
      return;
    }

    console.log('👤 EMPLOYEE 3 RECORDS:', emp3Records);

    // Check for pending status
    const { data: pendingRecords, error: pendingError } = await supabase
      .from('salary_records')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (pendingError) {
      console.error('❌ Pending records error:', pendingError);
      return;
    }

    console.log('⏳ PENDING RECORDS:', pendingRecords);

    // Check the table schema
    const { data: schema, error: schemaError } = await supabase
      .from('salary_records')
      .select('*')
      .limit(1);

    console.log('📋 SCHEMA SAMPLE:', schema);
    console.log('📋 COLUMN NAMES:', schema ? Object.keys(schema[0]) : 'No data');

  } catch (error) {
    console.error('❌ DEBUG ERROR:', error);
  }
}