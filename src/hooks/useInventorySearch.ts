
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ProductSuggestion } from '@/types/inventory';

export function useInventorySearch() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!user || !searchTerm || searchTerm.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('inventory')
          .select('id, name, brand, sku, price, cost_price, stock_level, stock_status, category')
          .eq('user_id', user.id)
          .or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%`)
          .order('name', { ascending: true })
          .limit(10);

        if (error) throw error;
        
        // Cast the data to the correct type
        const typedData: ProductSuggestion[] = data.map(item => ({
          id: item.id,
          name: item.name,
          brand: item.brand,
          sku: item.sku,
          price: item.price,
          cost_price: item.cost_price || 0,
          stock_level: item.stock_level,
          stock_status: item.stock_status,
          category: item.category
        }));
        
        setSuggestions(typedData);
      } catch (error) {
        console.error('Error fetching inventory suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimeout = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, user]);

  return {
    searchTerm,
    setSearchTerm,
    loading,
    suggestions
  };
}
