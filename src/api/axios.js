import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://api.loanspsc.com'

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          })

          const { access_token, refresh_token: newRefreshToken } = response.data.data
          localStorage.setItem('access_token', access_token)
          localStorage.setItem('refresh_token', newRefreshToken)

          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        localStorage.clear()
        window.location.href = '/'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// ============================================================
// LIFF Auth API - ✅ อัพเดทใช้ line_access_token แทน line_user_id
// ============================================================
export const liffAuthAPI = {
  // ตรวจสอบว่า LINE User มีในระบบหรือยัง (ส่ง access token)
  checkLineUser: (lineAccessToken) =>
    api.post('/auth/liff/check', {
      line_access_token: lineAccessToken,
    }),

  // ขอ OTP
  requestOTP: (data) => api.post('/auth/liff/otp/request', data),

  // ยืนยัน OTP
  verifyOTP: (data) => api.post('/auth/liff/otp/verify', data),

  // ลงทะเบียน (ต้อง verify OTP ก่อน)
  register: (data) => api.post('/auth/liff/register', data),

  // Login ด้วย LINE Access Token + Device ID
  loginWithLiff: (data) => api.post('/auth/liff/login', data),

  // ขอเปลี่ยนเครื่อง (ต้อง OTP)
  changeDevice: (data) => api.post('/auth/liff/device/change', data),

  // ดูข้อมูล device
  deviceInfo: (data) => api.post('/auth/liff/device/info', data),
}

// Auth API
export const authAPI = {
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
}

// Mortgage API
export const mortgageAPI = {
  // สำหรับ Member
  myLoans: () => api.get('/mortgages/my'),
  setConsent: (id, consent) => api.put(`/mortgages/${id}/consent`, { consent }),

  // สำหรับ Officer/Admin
  list: (params) => api.get('/mortgages', { params }),
  get: (id) => api.get(`/mortgages/${id}`),
  create: (data) => api.post('/mortgages', data),
  changeStep: (id, data) => api.put(`/mortgages/${id}/step`, data),
  approve: (id, data) => api.put(`/mortgages/${id}/approve`, data),
  reject: (id, data) => api.put(`/mortgages/${id}/reject`, data),
}

// Dashboard API
export const dashboardAPI = {
  get: () => api.get('/dashboard'),
}

// User API (Admin)
export const userAPI = {
  list: (params) => api.get('/users', { params }),
  get: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  setRole: (id, role) => api.put(`/users/${id}/role`, { role }),
}

// Master Data API (Admin)
export const masterAPI = {
  loanTypes: {
    list: () => api.get('/master/loan-types'),
    create: (data) => api.post('/master/loan-types', data),
    update: (id, data) => api.put(`/master/loan-types/${id}`, data),
    delete: (id) => api.delete(`/master/loan-types/${id}`),
  },
  loanSteps: {
    list: () => api.get('/master/loan-steps'),
    create: (data) => api.post('/master/loan-steps', data),
    update: (id, data) => api.put(`/master/loan-steps/${id}`, data),
    delete: (id) => api.delete(`/master/loan-steps/${id}`),
  },
}

// Committee API (คณะกรรมการ — ดูรายชื่อผู้กู้รายเดือน)
export const committeeAPI = {
  me: () => api.get('/committee/me'),
  borrowers: (params) => api.get('/committee/borrowers', { params }), // params: year, month, page, limit
  pdpaStatus: () => api.get('/committee/pdpa-status'),
}

// Profile API
export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
}

export default api
