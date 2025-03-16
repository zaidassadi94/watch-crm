
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createSampleDataForUser } from './data-initialization/createSampleData';

export function useInitializeUserData() {
  const { user } = useAuth();
  const [isInitializing, setIsInitializing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const createSampleData = async () => {
    if (!user || isInitialized || isInitializing) return;
    
    try {
      setIsInitializing(true);
      
      const success = await createSampleDataForUser(user.id);
      if (success) {
        setIsInitialized(true);
      }
    } finally {
      setIsInitializing(false);
    }
  };
  
  return {
    isInitializing,
    isInitialized,
    createSampleData
  };
}
