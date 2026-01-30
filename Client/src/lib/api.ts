const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

class ApiClient {
  private baseUrl: string;
  private getToken?: () => Promise<string | null>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setTokenGetter(getToken: () => Promise<string | null>) {
    this.getToken = getToken;
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken ? await this.getToken() : null;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`,
          error: 'Network error'
        })) as ApiResponse;
        
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json().catch(() => ({})) as ApiResponse<T>;
      
      if (data && typeof data === 'object' && data.success === false) {
        throw new Error(data.message || data.error || 'Request failed');
      }
      
      // Standardized format: { success, message, data }; legacy: { message, token, user } or { message, complaint }
      if (data && typeof data === 'object' && 'data' in data && data.data !== undefined) {
        return data.data as T;
      }
      return data as T;
    } catch (error) {
      console.error(`API Error [${options.method || 'GET'} ${endpoint}]:`, error);
      throw error;
    }
  }

  // Students
  async getStudents() {
    return this.request('/students');
  }

  async getStudent(id: number) {
    return this.request(`/students/${id}`);
  }

  async createStudent(data: any) {
    return this.request('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStudent(id: number, data: any) {
    return this.request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteStudent(id: number) {
    return this.request(`/students/${id}`, {
      method: 'DELETE',
    });
  }

  // Hostels
  async getHostels() {
    return this.request('/hostels');
  }

  async getHostel(id: number) {
    return this.request(`/hostels/${id}`);
  }

  // Rooms
  async getRooms(hostelId?: number) {
    const query = hostelId ? `?hostel_id=${hostelId}` : '';
    return this.request(`/rooms${query}`);
  }

  async getRoom(id: number) {
    return this.request(`/rooms/${id}`);
  }

  // Applications
  async getApplications(studentId?: number, status?: string) {
    const params = new URLSearchParams();
    if (studentId) params.append('student_id', studentId.toString());
    if (status) params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/applications${query}`);
  }

  async getApplication(id: number) {
    return this.request(`/applications/${id}`);
  }

  async createApplication(data: any) {
    // Generate application ID
    const application_id = Date.now();
    return this.request('/applications', {
      method: 'POST',
      body: JSON.stringify({ ...data, application_id }),
    });
  }

  async updateApplication(id: number, data: any) {
    return this.request(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteApplication(id: number) {
    return this.request(`/applications/${id}`, {
      method: 'DELETE',
    });
  }

  // Allotments
  async getAllotments(studentId?: number, status?: string) {
    const params = new URLSearchParams();
    if (studentId) params.append('student_id', studentId.toString());
    if (status) params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/allotments${query}`);
  }

  async getAllotment(id: number) {
    return this.request(`/allotments/${id}`);
  }

  async createAllotment(data: any) {
    return this.request('/allotments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAllotment(id: number, data: any) {
    return this.request(`/allotments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Complaints
  async getComplaints(studentId?: number, status?: string) {
    const params = new URLSearchParams();
    if (studentId) params.append('student_id', studentId.toString());
    if (status) params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/complaints${query}`);
  }

  async getComplaint(id: number) {
    return this.request(`/complaints/${id}`);
  }

  async createComplaint(data: any) {
    // Generate complaint ID
    const complaint_id = Date.now();
    return this.request('/complaints', {
      method: 'POST',
      body: JSON.stringify({ ...data, complaint_id }),
    });
  }

  async updateComplaint(id: number, data: any) {
    return this.request(`/complaints/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Payments
  async getPayments(studentId?: number, status?: string) {
    const params = new URLSearchParams();
    if (studentId) params.append('student_id', studentId.toString());
    if (status) params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/payments${query}`);
  }

  async getPayment(id: number) {
    return this.request(`/payments/${id}`);
  }

  async createPayment(data: any) {
    // Generate payment ID
    const payment_id = Date.now();
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify({ ...data, payment_id }),
    });
  }

  async updatePayment(id: number, data: any) {
    return this.request(`/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Fees
  async getFees() {
    return this.request('/fees');
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;
