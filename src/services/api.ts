const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface HealthCheckResponse {
  status: string;
  service: string;
}

export class ApiService {
  static async healthCheck(): Promise<HealthCheckResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
} 