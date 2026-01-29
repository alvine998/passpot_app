import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API Configuration
const API_BASE_URL = 'https://5253c5958be2.ngrok-free.app/api';

// Token storage key
const AUTH_TOKEN_KEY = '@passpot_auth_token';

// Custom headers type
interface RequestHeaders {
  [key: string]: string;
}

// API Response type
interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

// HTTP Methods
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// API Service Class
class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Get stored auth token
  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // Set auth token
  async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  }

  // Remove auth token (logout)
  async removeAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Error removing auth token:', error);
    }
  }

  // Build headers
  private async buildHeaders(
    endpoint: string,
    customHeaders?: RequestHeaders,
    isFormData: boolean = false,
  ): Promise<Headers> {
    const headers = new Headers();
    if (!isFormData) {
      headers.set('Content-Type', 'application/json');
    }
    headers.set('Accept', 'application/json');

    // Add auth token if available, except for verify-otp
    if (endpoint !== '/auth/verify-otp') {
      const token = await this.getAuthToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    // Add custom headers
    if (customHeaders) {
      Object.entries(customHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });
    }

    return headers;
  }

  // Generic request method
  private async request<T>(
    method: HttpMethod,
    endpoint: string,
    body?: any,
    customHeaders?: RequestHeaders,
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const isFormData = body instanceof FormData;
    const headers = await this.buildHeaders(
      endpoint,
      customHeaders,
      isFormData,
    );

    const config: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      config.body = isFormData ? body : JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);
      const responseClone = response.clone();

      let data;
      try {
        data = await response.json();
      } catch (jsonError: any) {
        const text = await responseClone.text();
        console.error(`API Parse Error for ${url}:`, text.substring(0, 200));
        throw {
          status: response.status,
          message: `JSON Parse error: ${jsonError.message}`,
          data: text,
        };
      }

      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message || 'An error occurred',
          data,
        };
      }

      return {
        data,
        status: response.status,
        message: data.message,
      };
    } catch (error: any) {
      if (error.status) {
        throw error;
      }
      throw {
        status: 0,
        message: error.message || 'Network error occurred',
        data: null,
      };
    }
  }

  // GET request
  async get<T>(
    endpoint: string,
    customHeaders?: RequestHeaders,
  ): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, customHeaders);
  }

  // POST request
  async post<T>(
    endpoint: string,
    body?: any,
    customHeaders?: RequestHeaders,
  ): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, body, customHeaders);
  }

  // PUT request
  async put<T>(
    endpoint: string,
    body?: any,
    customHeaders?: RequestHeaders,
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, body, customHeaders);
  }

  // PATCH request
  async patch<T>(
    endpoint: string,
    body?: any,
    customHeaders?: RequestHeaders,
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, body, customHeaders);
  }

  // DELETE request
  async delete<T>(
    endpoint: string,
    customHeaders?: RequestHeaders,
  ): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, customHeaders);
  }
}

// Export singleton instance
export const api = new ApiService();

// Export class for custom instances
export { ApiService, API_BASE_URL };

// Export types
export type { ApiResponse, RequestHeaders };
