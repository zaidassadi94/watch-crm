
import { toast } from '@/components/ui/use-toast';
import { checkIfDataExists } from './useDataExistenceCheck';
import { 
  createUserSettings,
  createSampleInventory,
  createSampleCustomers,
  createSampleSales,
  createSampleServiceRequest 
} from './sampleDataCreators';

export async function createSampleDataForUser(userId: string | undefined) {
  if (!userId) return false;
  
  try {
    // Check if the user already has data
    const hasData = await checkIfDataExists(userId);
    if (hasData) {
      return true;
    }
    
    // Create user settings
    await createUserSettings(userId);
    
    // Create sample inventory items
    const createdInventory = await createSampleInventory(userId);
    
    // Create sample customers
    await createSampleCustomers(userId);
    
    // Create sales with items
    await createSampleSales(userId, createdInventory);
    
    // Create a sample service request
    await createSampleServiceRequest(userId);
    
    toast({
      title: "Setup complete",
      description: "Sample data has been created for your account",
    });
    
    return true;
  } catch (error: any) {
    console.error('Error creating sample data:', error);
    toast({
      title: "Error initializing data",
      description: error.message || "Failed to create sample data",
      variant: "destructive",
    });
    return false;
  }
}
