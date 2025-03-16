
import { supabase } from '@/integrations/supabase/client';

export async function checkIfDataExists(userId: string | undefined) {
  if (!userId) return false;
  
  try {
    // Check if user has any inventory items
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory')
      .select('id')
      .eq('user_id', userId)
      .limit(1);
      
    if (inventoryError) throw inventoryError;
    
    // If we have inventory items, we assume the user is already set up
    return inventoryData && inventoryData.length > 0;
  } catch (error) {
    console.error('Error checking if user data exists:', error);
    return false;
  }
}
