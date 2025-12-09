import { supabase } from './supabase';
import { SalaryRecord } from './types';

export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('salary_records')
      .select('*')
      .eq('employee_id', 3);

    if (error) {
      console.error('Supabase error:', error);
      return { success: false, error: error.message };
    }

    console.log('Supabase data:', data);
    return { success: true, data: data };
  } catch (error) {
    console.error('Connection failed:', error);
    return { success: false, error: String(error) };
  }
}