import { apiClient } from '../api';

export async function testBackendConnection(): Promise<boolean> {
  try {
    // Test the root endpoint (health check)
    const response = await fetch('https://h-deets-ai-backend.vercel.app/');
    const data = await response.json();

    if (data.status === 'H-Deets AI backend is running') {
      console.log('✅ Backend connection successful');
      return true;
    }

    console.log('❌ Backend returned unexpected response:', data);
    return false;
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    return false;
  }
}

export async function testAPIEndpoint(endpoint: string): Promise<any> {
  try {
    const response = await apiClient.get(endpoint);
    console.log(`✅ API endpoint ${endpoint} working:`, response);
    return response;
  } catch (error) {
    console.error(`❌ API endpoint ${endpoint} failed:`, error);
    throw error;
  }
}
