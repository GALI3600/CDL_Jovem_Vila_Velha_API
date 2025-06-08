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

export interface CsvUploadResponse {
  message: string;
  imported_count: number;
  total_rows: number;
  warnings?: string[];
  failed_count?: number;
}

export interface CsvUploadError {
  detail: {
    message?: string;
    errors?: string[];
    valid_rows?: number;
    total_rows?: number;
  } | Array<{
    loc: string[];
    msg: string;
    type: string;
  }>;
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

  static async uploadCsv(file: File): Promise<CsvUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/users/upload-csv`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let the browser set it with boundary for multipart/form-data
      });

      if (!response.ok) {
        const errorData: CsvUploadError = await response.json();
        
        // Handle different error formats
        if (Array.isArray(errorData.detail)) {
          // Validation error format
          const validationErrors = errorData.detail.map(err => `${err.loc.join('.')}: ${err.msg}`);
          throw new Error(`Validation error: ${validationErrors.join(', ')}`);
        } else if (errorData.detail && typeof errorData.detail === 'object' && 'message' in errorData.detail) {
          // Custom error format with validation details
          const detail = errorData.detail;
          let errorMessage = detail.message || 'Upload failed';
          if (detail.errors && detail.errors.length > 0) {
            errorMessage += '\n\nErros encontrados:\n' + detail.errors.join('\n');
          }
          throw new Error(errorMessage);
        } else {
          throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
        }
      }

      return await response.json();
    } catch (error) {
      console.error('CSV upload failed:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to upload CSV file');
    }
  }
} 