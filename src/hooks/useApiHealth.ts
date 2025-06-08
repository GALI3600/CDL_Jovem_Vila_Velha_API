import { useState, useEffect } from 'react';
import { ApiService } from '../services/api';

export interface ApiHealthStatus {
  isOnline: boolean;
  isLoading: boolean;
  lastChecked: Date | null;
}

export const useApiHealth = (checkInterval: number = 30000) => {
  const [healthStatus, setHealthStatus] = useState<ApiHealthStatus>({
    isOnline: false,
    isLoading: true,
    lastChecked: null,
  });

  const checkHealth = async () => {
    try {
      setHealthStatus(prev => ({ ...prev, isLoading: true }));
      
      const response = await ApiService.healthCheck();
      
      setHealthStatus({
        isOnline: response.status === 'online',
        isLoading: false,
        lastChecked: new Date(),
      });
    } catch (error) {
      setHealthStatus({
        isOnline: false,
        isLoading: false,
        lastChecked: new Date(),
      });
    }
  };

  useEffect(() => {
    // Initial check
    checkHealth();

    // Set up periodic checks
    const interval = setInterval(checkHealth, checkInterval);

    return () => clearInterval(interval);
  }, [checkInterval]);

  return { ...healthStatus, checkHealth };
}; 