import { useState, useEffect } from 'react';
import { ApiService, SystemHealthStatus } from '../services/api';

export interface ApiHealthStatus {
  isOnline: boolean;
  isLoading: boolean;
  lastChecked: Date | null;
  systemHealth: SystemHealthStatus | null;
}

export const useApiHealth = (checkInterval: number = 30000) => {
  const [healthStatus, setHealthStatus] = useState<ApiHealthStatus>({
    isOnline: false,
    isLoading: true,
    lastChecked: null,
    systemHealth: null,
  });

  const checkHealth = async () => {
    try {
      setHealthStatus(prev => ({ ...prev, isLoading: true }));
      
      const systemHealth = await ApiService.systemHealthCheck();
      
      setHealthStatus({
        isOnline: systemHealth.overall === 'online',
        isLoading: false,
        lastChecked: new Date(),
        systemHealth,
      });
    } catch (error) {
      setHealthStatus({
        isOnline: false,
        isLoading: false,
        lastChecked: new Date(),
        systemHealth: {
          backend: { status: 'offline', error: 'Check failed' },
          evolutionApi: { status: 'offline', error: 'Check failed' },
          overall: 'offline'
        },
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