
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Generate an invoice number for a new sale
 */
export async function generateInvoiceNumber(supabase: SupabaseClient) {
  try {
    const { data, error } = await supabase.rpc('nextval', { seq_name: 'invoice_number_seq' });
    
    if (error) throw error;
    
    // Format the number as a 4-digit string with leading zeros
    const invoiceNumber = `#${String(data).padStart(4, '0')}`;
    return invoiceNumber;
  } catch (error) {
    console.error('Error generating invoice number:', error);
    // Fallback invoice number in case of error
    return `#${Date.now().toString().substr(-4)}`;
  }
}
