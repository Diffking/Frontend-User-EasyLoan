import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://api.loanspsc.com'

// ============================================================
// Session: ใช้ httpOnly cookie ที่ backend ตั้งให้ (JS อ่านไม่ได้ → XSS ขโมย token ไม่ได้)
// access token สำรองเก็บ "ในหน่วยความจำ" เท่านั้น (ไม่ลง localStorage) เผื่อ browser บางตัวไม่ส่ง cookie
// ============================================================
let memoryAccessToken = null
export const setSessionToken = (token) => {
  memoryAccessToken = token || null
}

// ล้าง token เก่าที่เคยเก็บใน localStorage (ก่อนย้ายไปใช้ cookie)
try {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
} catch (e) {
  /* ignore */
}

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - แนบ token สำรองจากหน่วยความจำ (ถ้ามี)
api.interceptors.request.use(
  (config) => {
    if (memoryAccessToken) {
      config.headers.Authorization = `Bearer ${memoryAccessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// refresh ทีละครั้ง: refresh token ใช้ได้ครั้งเดียว (rotate) ถ้ายิงพร้อมกันหลายตัวจะโดนเตะออก
let refreshPromise = null
const refreshSession = () => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_URL}/api/v1/auth/refresh`, {}, { withCredentials: true })
      .then((res) => {
        setSessionToken(res.data?.data?.access_token)
        return res
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

// กัน redirect วนถ้า session ใช้ไม่ได้ซ้ำๆ
const AUTH_REDIRECT_KEY = 'auth_redirect_at'
const redirectToLogin = () => {
  try {
    const last = Number(sessionStorage.getItem(AUTH_REDIRECT_KEY) || 0)
    if (Date.now() - last < 10000) return
    sessionStorage.setItem(AUTH_REDIRECT_KEY, String(Date.now()))
  } catch (e) {
    /* ignore */
  }
  localStorage.clear()
  window.location.href = '/'
}

// Response interceptor - access token หมดอายุ → refresh ผ่าน cookie แล้วลองใหม่
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const isAuthCall = originalRequest?.url?.startsWith('/auth/')

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthCall) {
      originalRequest._retry = true

      try {
        await refreshSession()
        return api(originalRequest)
      } catch (refreshError) {
        setSessionToken(null)
        redirectToLogin()
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
