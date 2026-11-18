import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('civiclens_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error normalization
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If unauthorized and not on login pages, clear token
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register') && !currentPath.includes('/authority/invitation')) {
        // localStorage.removeItem('civiclens_token');
        // localStorage.removeItem('civiclens_user');
      }
    }
    return Promise.reject(error);
  }
);

// API Service Methods
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  logout: () => API.post('/auth/logout'),
  getMe: () => API.get('/auth/me'),
  forgotPassword: (data) => API.post('/auth/forgot-password', data),
  resetPassword: (data) => API.post('/auth/reset-password', data)
};

export const authorityAPI = {
  login: (data) => API.post('/authority/login', data),
  acceptInvitation: (data) => API.post('/authority/accept-invitation', data),
  getDashboard: () => API.get('/authority/dashboard'),
  getReports: (params) => API.get('/authority/reports', { params }),
  updateStatus: (id, data) => API.patch(`/authority/reports/${id}/status`, data),
  assignReport: (id, data) => API.patch(`/authority/reports/${id}/assign`, data),
  addNote: (id, data) => API.post(`/authority/reports/${id}/notes`, data),
  uploadEvidence: (id, formData) =>
    API.post(`/authority/reports/${id}/resolution-evidence`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
};

export const adminAPI = {
  createInvitation: (data) => API.post('/admin/authority-invitations', data),
  getInvitations: () => API.get('/admin/authority-invitations'),
  revokeInvitation: (id) => API.delete(`/admin/authority-invitations/${id}`),
  getAuthorities: (params) => API.get('/admin/authorities', { params }),
  updateAuthority: (id, data) => API.patch(`/admin/authorities/${id}`, data),
  getAuditLogs: (params) => API.get('/admin/audit-logs', { params }),
  getSystemHealth: () => API.get('/admin/system-health')
};

export const reportAPI = {
  create: (formData) =>
    API.post('/reports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getMyReports: (params) => API.get('/reports/my-reports', { params }),
  getPublicReports: (params) => API.get('/reports', { params }),
  getById: (id) => API.get(`/reports/${id}`),
  verifyResolution: (id, data) => API.post(`/reports/${id}/verify-resolution`, data),
  reopen: (id, data) => API.post(`/reports/${id}/reopen`, data)
};

export const aiAPI = {
  analyzeReport: (formData) =>
    API.post('/ai/analyze-report', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
};

export const analyticsAPI = {
  getOverview: () => API.get('/analytics/overview'),
  getCategories: () => API.get('/analytics/categories'),
  getStatus: () => API.get('/analytics/status'),
  getDepartments: () => API.get('/analytics/departments'),
  getTrends: () => API.get('/analytics/trends'),
  getAreas: () => API.get('/analytics/areas')
};

export const notificationAPI = {
  getAll: () => API.get('/notifications'),
  markRead: (id) => API.patch(`/notifications/${id}/read`),
  markAllRead: () => API.patch('/notifications/mark-all-read')
};

export const departmentAPI = {
  getAll: (params) => API.get('/departments', { params }),
  create: (data) => API.post('/departments', data),
  update: (id, data) => API.patch(`/departments/${id}`, data)
};

export default API;
