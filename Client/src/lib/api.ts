const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

if (import.meta.env.DEV) {
  console.log('[API] Base URL:', API_BASE_URL);
}

const TOKEN_KEY = 'hostel_token';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);
    const json = (await response.json()) as ApiResponse<T>;

    if (!response.ok || json.success === false) {
      throw new Error(json.message || json.error || `HTTP ${response.status}`);
    }

    return json.data as T;
  }

  /* AUTH */
  signup(data: any) {
    return this.request('/auth/signup', { method: 'POST', body: JSON.stringify(data) });
  }

  login(data: { email: string; password: string }) {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getMe() {
    return this.request('/auth/me');
  }

  forgotPassword(email: string) {
    return this.request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
  }

  resetPassword(token: string, password: string) {
    return this.request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) });
  }

  resendVerification(email: string) {
    return this.request('/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email }) });
  }

  /* STUDENTS */
  getStudents() { return this.request('/students'); }
  getStudent(id: number) { return this.request(`/students/${id}`); }
  updateStudent(id: number, data: any) {
    return this.request(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  deleteStudent(id: number) { return this.request(`/students/${id}`, { method: 'DELETE' }); }

  /* HOSTELS */
  getHostels() { return this.request('/hostels'); }
  getHostel(id: number) { return this.request(`/hostels/${id}`); }
  createHostel(data: any) {
    return this.request('/hostels', { method: 'POST', body: JSON.stringify(data) });
  }
  updateHostel(id: number, data: any) {
    return this.request(`/hostels/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  /* ROOMS */
  getRooms(hostelId?: number) {
    const q = hostelId ? `?hostel_id=${hostelId}` : '';
    return this.request(`/rooms${q}`);
  }
  getRoom(id: number) { return this.request(`/rooms/${id}`); }
  getRoomGrid(hostelId: number) { return this.request(`/rooms/hostel/${hostelId}/grid`); }
  createRoom(data: any) {
    return this.request('/rooms', { method: 'POST', body: JSON.stringify(data) });
  }
  updateRoom(id: number, data: any) {
    return this.request(`/rooms/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  deleteRoom(id: number) { return this.request(`/rooms/${id}`, { method: 'DELETE' }); }

  /* ALLOTMENTS */
  getAllotments(studentId?: number) {
    const q = studentId ? `?student_id=${studentId}` : '';
    return this.request(`/allotments${q}`);
  }
  getMyAllotment() { return this.request('/allotments/me'); }

  /* ROUNDS */
  getRounds() { return this.request('/rounds'); }
  getRound(id: number) { return this.request(`/rounds/${id}`); }
  createRound(data: any) {
    return this.request('/rounds', { method: 'POST', body: JSON.stringify(data) });
  }
  activateRound(id: number) {
    return this.request(`/rounds/${id}/activate`, { method: 'POST' });
  }
  processRound(id: number) {
    return this.request(`/rounds/${id}/process`, { method: 'POST' });
  }
  getRoundStudents(id: number) { return this.request(`/rounds/${id}/students`); }
  getMyRoundStatus() { return this.request('/rounds/my-status'); }

  /* PREFERENCES */
  submitPreferences(data: { round_id: number; priority_1: number; priority_2?: number; priority_3?: number; priority_4?: number; priority_5?: number }) {
    return this.request('/preferences', { method: 'POST', body: JSON.stringify(data) });
  }
  getMyPreferences() { return this.request('/preferences/me'); }

  /* COMPLAINTS */
  getComplaints(studentId?: number) {
    const q = studentId ? `?student_id=${studentId}` : '';
    return this.request(`/complaints${q}`);
  }
  createComplaint(data: any) {
    return this.request('/complaints', { method: 'POST', body: JSON.stringify(data) });
  }
  updateComplaint(id: number, data: any) {
    return this.request(`/complaints/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  /* ADMIN CSV */
  uploadCsvPreview(formData: FormData) {
    const token = this.getToken();
    return fetch(`${this.baseUrl}/admin/csv/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(async (r) => {
      const json = await r.json();
      if (!r.ok || json.success === false) throw new Error(json.message || 'Upload failed');
      return json.data;
    });
  }

  confirmCsvImport(students: any[]) {
    return this.request('/admin/csv/confirm', { method: 'POST', body: JSON.stringify({ students }) });
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;
