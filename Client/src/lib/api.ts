// src/lib/api.ts

// Must be full backend URL (e.g. http://localhost:5000/api)
const raw = import.meta.env.VITE_API_URL ?? '';
const API_BASE_URL =
  raw.startsWith('/') && import.meta.env.DEV
    ? 'http://localhost:5000/api'
    : raw || 'http://localhost:5000/api';

if (import.meta.env.DEV) {
  console.log(
    '[API] Base URL:',
    API_BASE_URL,
    '— backend must be running at this address'
  );
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp?: string;
}

class ApiClient {
  private baseUrl: string;
  private getToken?: () => Promise<string | null>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // 🔑 Clerk token injector (set once in App.tsx)
  setTokenGetter(getToken: () => Promise<string | null>) {
    this.getToken = getToken;
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken ? await this.getToken() : null;

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);

      if (!response.ok) {
        const err = await response.json().catch(() => ({
          message: response.statusText,
        }));
        throw new Error(err.message || `HTTP ${response.status}`);
      }

      const json = (await response.json()) as ApiResponse<T>;

      if (json.success === false) {
        throw new Error(json.message || json.error || 'Request failed');
      }

      // Standard backend format: { success, message, data }
      return json.data as T;
    } catch (error) {
      console.error(
        `[API ERROR] ${options.method || 'GET'} ${endpoint}`,
        error
      );
      throw error;
    }
  }

  /* ============================
     STUDENTS
     ============================ */

  getStudents() {
    return this.request('/students');
  }

  getStudent(id: number) {
    return this.request(`/students/${id}`);
  }

  createStudent(data: any) {
    return this.request('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateStudent(id: number, data: any) {
    return this.request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteStudent(id: number) {
    return this.request(`/students/${id}`, {
      method: 'DELETE',
    });
  }

  /* ============================
     HOSTELS
     ============================ */

  getHostels() {
    return this.request('/hostels');
  }

  getHostel(id: number) {
    return this.request(`/hostels/${id}`);
  }

  /* ============================
     ROOMS
     ============================ */

  getRooms(hostelId?: number) {
    const q = hostelId ? `?hostel_id=${hostelId}` : '';
    return this.request(`/rooms${q}`);
  }

  getRoom(id: number) {
    return this.request(`/rooms/${id}`);
  }

  /* ============================
     APPLICATIONS
     ============================ */

  getApplications(studentId?: number, status?: string) {
    const params = new URLSearchParams();
    if (studentId) params.append('student_id', String(studentId));
    if (status) params.append('status', status);
    return this.request(`/applications?${params.toString()}`);
  }

  getApplication(id: number) {
    return this.request(`/applications/${id}`);
  }

  createApplication(data: any) {
    // ❌ NO manual application_id
    return this.request('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateApplication(id: number, data: any) {
    return this.request(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteApplication(id: number) {
    return this.request(`/applications/${id}`, {
      method: 'DELETE',
    });
  }

  /* ============================
     ALLOTMENTS
     ============================ */

  getAllotments(studentId?: number, status?: string) {
    const params = new URLSearchParams();
    if (studentId) params.append('student_id', String(studentId));
    if (status) params.append('status', status);
    return this.request(`/allotments?${params.toString()}`);
  }

  getAllotment(id: number) {
    return this.request(`/allotments/${id}`);
  }

  createAllotment(data: any) {
    return this.request('/allotments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateAllotment(id: number, data: any) {
    return this.request(`/allotments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteAllotment(id: number) {
    return this.request(`/allotments/${id}`, {
      method: 'DELETE',
    });
  }

  /* ============================
     COMPLAINTS
     ============================ */

  getComplaints(studentId?: number, status?: string) {
    const params = new URLSearchParams();
    if (studentId) params.append('student_id', String(studentId));
    if (status) params.append('status', status);
    return this.request(`/complaints?${params.toString()}`);
  }

  getComplaint(id: number) {
    return this.request(`/complaints/${id}`);
  }

  createComplaint(data: any) {
    return this.request('/complaints', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateComplaint(id: number, data: any) {
    return this.request(`/complaints/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /* ============================
     PAYMENTS
     ============================ */

  getPayments(studentId?: number, status?: string) {
    const params = new URLSearchParams();
    if (studentId) params.append('student_id', String(studentId));
    if (status) params.append('status', status);
    return this.request(`/payments?${params.toString()}`);
  }

  getPayment(id: number) {
    return this.request(`/payments/${id}`);
  }

  createPayment(data: any) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updatePayment(id: number, data: any) {
    return this.request(`/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /* ============================
     FEES
     ============================ */

  getFees() {
    return this.request('/fees');
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;
