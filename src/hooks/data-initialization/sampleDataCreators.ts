
import { supabase } from '@/integrations/supabase/client';

export async function createUserSettings(userId: string) {
  const { error: settingsError } = await supabase
    .from('user_settings')
    .upsert({
      user_id: userId,
      company_name: 'My Watch Shop'
    });
    
  if (settingsError) throw settingsError;
}

export async function createSampleInventory(userId: string) {
  const inventoryItems = [
    {
      user_id: userId,
      name: 'Diver Pro',
      brand: 'Seiko',
      category: 'Diving',
      sku: 'SK-DIV-001',
      stock_level: 5,
      price: 250.00,
      cost_price: 175.00,
      description: 'Professional automatic diving watch with 200m water resistance'
    },
    {
      user_id: userId,
      name: 'Classic Chronograph',
      brand: 'Citizen',
      category: 'Chronograph',
      sku: 'CIT-CHR-002',
      stock_level: 3,
      price: 350.00,
      cost_price: 230.00,
      description: 'Solar powered chronograph with date function'
    },
    {
      user_id: userId,
      name: 'Elegance Automatic',
      brand: 'Orient',
      category: 'Dress',
      sku: 'OR-DRS-003',
      stock_level: 7,
      price: 180.00,
      cost_price: 110.00,
      description: 'Elegant automatic dress watch with exhibition case back'
    },
    {
      user_id: userId,
      name: 'Sport Digital',
      brand: 'Casio',
      category: 'Sports',
      sku: 'CAS-SPT-004',
      stock_level: 10,
      price: 75.00,
      cost_price: 45.00,
      description: 'Multi-function digital watch with stopwatch and alarm'
    }
  ];
  
  const { data: createdInventory, error: inventoryError } = await supabase
    .from('inventory')
    .insert(inventoryItems)
    .select();
  
  if (inventoryError) throw inventoryError;
  
  return createdInventory;
}

export async function createSampleCustomers(userId: string) {
  const customers = [
    {
      user_id: userId,
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+1234567890',
      type: 'Regular',
      status: 'Active'
    },
    {
      user_id: userId,
      name: 'Emily Johnson',
      email: 'emily.j@example.com',
      phone: '+1987654321',
      type: 'VIP',
      status: 'Active'
    },
    {
      user_id: userId,
      name: 'Michael Wong',
      email: 'mike.wong@example.com',
      phone: '+1122334455',
      type: 'Regular',
      status: 'Active'
    }
  ];
  
  const { data: createdCustomers, error: customersError } = await supabase
    .from('customers')
    .insert(customers)
    .select();
    
  if (customersError) throw customersError;
  
  return createdCustomers;
}

export async function createSampleSales(userId: string, inventoryData: any[]) {
  // Create first sale
  const sale1 = {
    user_id: userId,
    customer_name: 'John Smith',
    customer_email: 'john.smith@example.com',
    customer_phone: '+1234567890',
    status: 'completed',
    payment_method: 'credit_card',
    total_amount: 250.00,
    total_profit: 75.00,
    invoice_number: 'INV-2023-001'
  };
  
  const { data: sale1Data, error: sale1Error } = await supabase
    .from('sales')
    .insert(sale1)
    .select()
    .single();
    
  if (sale1Error) throw sale1Error;
  
  // Add sale items using inventory data
  if (inventoryData && inventoryData.length > 0) {
    await supabase
      .from('sale_items')
      .insert({
        sale_id: sale1Data.id,
        inventory_id: inventoryData[0].id,
        product_name: 'Diver Pro',
        sku: 'SK-DIV-001',
        quantity: 1,
        price: 250.00,
        cost_price: 175.00,
        subtotal: 250.00
      });
  }
  
  // Create a second sale
  const sale2 = {
    user_id: userId,
    customer_name: 'Emily Johnson',
    customer_email: 'emily.j@example.com',
    customer_phone: '+1987654321',
    status: 'completed',
    payment_method: 'cash',
    total_amount: 425.00,
    total_profit: 140.00,
    invoice_number: 'INV-2023-002'
  };
  
  const { data: sale2Data, error: sale2Error } = await supabase
    .from('sales')
    .insert(sale2)
    .select()
    .single();
    
  if (sale2Error) throw sale2Error;
  
  // Add sale items for second sale
  if (inventoryData && inventoryData.length > 1) {
    await supabase
      .from('sale_items')
      .insert([
        {
          sale_id: sale2Data.id,
          inventory_id: inventoryData[1].id,
          product_name: 'Classic Chronograph',
          sku: 'CIT-CHR-002',
          quantity: 1,
          price: 350.00,
          cost_price: 230.00,
          subtotal: 350.00
        },
        {
          sale_id: sale2Data.id,
          inventory_id: inventoryData[3].id,
          product_name: 'Sport Digital',
          sku: 'CAS-SPT-004',
          quantity: 1,
          price: 75.00,
          cost_price: 45.00,
          subtotal: 75.00
        }
      ]);
  }
}

export async function createSampleServiceRequest(userId: string) {
  await supabase
    .from('service_requests')
    .insert({
      user_id: userId,
      customer_name: 'Michael Wong',
      customer_email: 'mike.wong@example.com',
      customer_phone: '+1122334455',
      watch_brand: 'Omega',
      watch_model: 'Seamaster',
      service_type: 'Battery Replacement',
      description: 'Replace battery and check water resistance',
      status: 'in_progress',
      price: 45.00,
      payment_status: 'unpaid',
      estimated_completion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
}
