const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const EVOLUTION_API_URL = import.meta.env.VITE_EVOLUTION_API_URL || 'https://evolution-estruturar.namastex.ai';

export interface HealthCheckResponse {
  status: string;
  service: string;
}

export interface SystemHealthStatus {
  backend: {
    status: 'online' | 'offline';
    error?: string;
  };
  evolutionApi: {
    status: 'online' | 'offline';
    error?: string;
  };
  overall: 'online' | 'offline';
}

export class ApiService {
  static async checkBackendHealth(): Promise<{ status: 'online' | 'offline'; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (!response.ok) {
        return {
          status: 'offline',
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      return {
        status: data.status === 'online' ? 'online' : 'offline'
      };
    } catch (error) {
      return {
        status: 'offline',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async checkEvolutionApiHealth(): Promise<{ status: 'online' | 'offline'; error?: string }> {
    try {
      const response = await fetch(`${EVOLUTION_API_URL}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (!response.ok) {
        return {
          status: 'offline',
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      return {
        status: 'online'
      };
    } catch (error) {
      return {
        status: 'offline',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async systemHealthCheck(): Promise<SystemHealthStatus> {
    try {
      // Check both services in parallel
      const [backendResult, evolutionResult] = await Promise.all([
        this.checkBackendHealth(),
        this.checkEvolutionApiHealth()
      ]);

      const overall: 'online' | 'offline' = 
        backendResult.status === 'online' && evolutionResult.status === 'online' 
          ? 'online' 
          : 'offline';

      return {
        backend: backendResult,
        evolutionApi: evolutionResult,
        overall
      };
    } catch (error) {
      console.error('System health check failed:', error);
      return {
        backend: { status: 'offline', error: 'System check failed' },
        evolutionApi: { status: 'offline', error: 'System check failed' },
        overall: 'offline'
      };
    }
  }

  // Keep the old method for backwards compatibility
  static async healthCheck(): Promise<HealthCheckResponse> {
    const systemHealth = await this.systemHealthCheck();
    return {
      status: systemHealth.overall,
      service: 'CDL Jovem Vila Velha System'
    };
  }
} 