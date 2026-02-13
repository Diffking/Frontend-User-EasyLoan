# 📋 SPSC LoanEasy — Frontend_User Handoff

> **วันที่อัปเดต:** 11 ก.พ. 2569 (v9)  
> **Branch:** `fix/separate-queueeasy-from-loaneasy`  
> **GitHub:** `Diffking/loanhub-backend-production`

---

## 1. Project Overview

**SPSC LoanEasy** คือระบบสินเชื่อสำหรับสหกรณ์ออมทรัพย์สาธารณสุขสงขลา  
Frontend แยกเป็น 2 ส่วน:

| ส่วน | สถานะ | รายละเอียด |
|------|--------|------------|
| **Frontend_User** (ไฟล์นี้) | ✅ เสร็จแล้ว | หน้า LIFF สำหรับสมาชิก — Login, Register, MyLoans, Profile |
| **Frontend_Admin** | 🔜 ยังไม่แก้ | Dashboard, จัดการสินเชื่อ, จัดการ user สำหรับ ADMIN/OFFICER |

---

## 2. Tech Stack

| เทคโนโลยี | เวอร์ชัน | หมายเหตุ |
|-----------|---------|---------|
| React | 18.2 | Vite build |
| Tailwind CSS | 3.3.5 | Design system หลัก |
| React Router | 6.20 | SPA routing |
| Axios | 1.6 | API client + interceptor |
| LINE LIFF SDK | 2.23 | `LIFF_ID: 2008944602-9ZeFomU2` |
| react-hot-toast | 2.4.1 | Toast notification |
| Google Font | Sarabun | ฟอนต์ภาษาไทย |

---

## 3. File Structure (Optimized)

```
src/
├── main.jsx                    # Entry point (BrowserRouter + AuthProvider + Toaster)
├── App.jsx                     # Routes + LoadingScreen + ProtectedRoute/PublicRoute
├── index.css                   # Tailwind directives + utility classes
├── api/
│   └── axios.js                # Axios instance + interceptors + API modules
├── components/
│   ├── Icons.jsx               # ✅ SVG icons รวมศูนย์ (24 icons)
│   └── Layout.jsx              # Header + Bottom Nav + Side Menu
├── context/
│   └── AuthContext.jsx          # LIFF auth, OTP, device, network, session
└── pages/
    ├── Login.jsx                # LINE Login + WiFi warning + progress bar
    ├── Register.jsx             # 3-step: กรอกข้อมูล → OTP → สำเร็จ
    ├── MyLoans.jsx              # ✅ v9 — Animated progress + DocsAccordion + APPROVED visibility
    └── Profile.jsx              # ข้อมูลสมาชิก + LINE + logout
```

**Line Count (หลัง optimize):**

| ไฟล์ | บรรทัด |
|------|-------|
| AuthContext.jsx | 945 |
| Register.jsx | 532 |
| MyLoans.jsx | 396 |
| Login.jsx | 345 |
| App.jsx | 311 |
| Profile.jsx | 176 |
| Layout.jsx | 146 |
| Icons.jsx | 90 |
| **รวม src/** | **~2,941** |

---

## 4. Design System / Theme

### 4.1 Color Palette (USER role = Teal/Cyan)

```
Primary Gradient : from-teal-500 to-cyan-500
Background       : from-teal-50 via-cyan-50 to-emerald-50
Card             : bg-white/80 backdrop-blur-sm border-teal-100
Accent           : emerald-500 (amounts), cyan (appointments)
Docs Accordion   : orange-50/amber-50 gradient, orange-100 border
Danger           : red-500
Warning          : amber-500
```

### 4.2 Tailwind Custom Config

```js
// tailwind.config.js
colors: {
  line: { DEFAULT: '#00B900', dark: '#009900' },
  primary: { 50-900 emerald scale }
}
fontFamily: { sarabun: ['Sarabun', 'sans-serif'] }
```

### 4.3 CSS Utility Classes (index.css)

| Class | ใช้งาน |
|-------|-------|
| `.btn` `.btn-primary` `.btn-line` | ปุ่มกลาง |
| `.input` | Input field with focus ring |
| `.card` | White card with shadow |
| `.badge` `.badge-success` etc. | Status badges |
| `.table` `.table-container` | ตาราง (สำหรับ Admin) |
| `.loading-spinner` | Spinner animation |

---

## 5. Component Details

### 5.1 Icons.jsx (Shared — 24 icons)

**Import pattern:**
```jsx
import { IconUser, IconPhone, IconLine } from '../components/Icons'
```

**24 icons ที่มี:**
```
General  : IconUser, IconPhone, IconHash, IconLogout, IconBuilding, IconTrash
MyLoans  : IconFile, IconCalendar, IconClock, IconMapPin, IconChevronDown, IconCheckList
Layout   : IconCreditCard, IconMenu, IconClose
Register : IconIdCard, IconCheckCircle, IconAlertCircle, IconShield, IconKey, IconCopy, IconPaste
Special  : IconLine (filled), IconSpinner (animated)
```

> **หมายเหตุ:** ใช้ shared SVG attribute object `S` เพื่อลดโค้ดซ้ำ  
> ถ้า Frontend_Admin ต้องการ icon เพิ่ม → เพิ่มใน Icons.jsx ไฟล์เดียว

---

### 5.2 Layout.jsx

- **Header:** Fixed top, gradient teal→cyan, logo + avatar + hamburger menu
- **Side Menu:** Slide-in from right, 2 nav items (สินเชื่อ, โปรไฟล์) + logout
- **Bottom Nav:** Fixed bottom tab bar (สินเชื่อ, โปรไฟล์) — active = teal highlight
- **Content area:** `pt-20 pb-24 px-4 max-w-lg mx-auto`

> ⚠️ Layout ใช้เฉพาะ USER role — **Admin layout ต้องแยกไฟล์ใหม่**

---

### 5.3 App.jsx — Routes & Guards

```
/              → PublicRoute  → Login.jsx
/register      → RegisterRoute → Register.jsx
/my-loans      → ProtectedRoute → MyLoans.jsx  (ห่อด้วย Layout)
/profile       → ProtectedRoute → Profile.jsx  (ห่อด้วย Layout)
/dashboard     → ❌ ยังไม่มี (navigateByRole ชี้ไปแต่ยังไม่มี route)
*              → redirect /
```

**Route Guards:**

| Guard | Logic |
|-------|-------|
| `PublicRoute` | ถ้า login แล้ว + USER → redirect `/my-loans`; ถ้า ADMIN/OFFICER → แสดง Login page |
| `ProtectedRoute` | ถ้าไม่ login → redirect `/`; ถ้า needsRegistration → redirect `/register`; ห่อด้วย `<Layout>` |
| `RegisterRoute` | ถ้า login + ไม่ต้อง register → redirect; ถ้ายังไม่ needsRegistration → redirect `/` |

**LoadingScreen:** Full-screen dark gradient + animated progress bar + retry after 12s

---

### 5.4 AuthContext.jsx (945 lines)

**Core State:**

| State | Type | คำอธิบาย |
|-------|------|---------|
| `user` | object | `{ id, memb_no, full_name, phone, role, dept_name }` |
| `lineProfile` | object | `{ displayName, pictureUrl, userId }` |
| `lineAccessToken` | string | LINE LIFF access token |
| `liffReady` | bool | LIFF SDK initialized |
| `isLoggedIn` | bool | LINE session active |
| `loading` | bool | Initial auth flow running |
| `needsRegistration` | bool | LINE user ยังไม่ลงทะเบียน |
| `deviceId` | string | Browser fingerprint `DEV-xxxxx` |
| `networkType` | string | `wifi` / `cellular` / `unknown` |
| `wifiDismissed` | bool | User dismissed WiFi warning |
| `isInLineBrowser` | bool | Running inside LINE app |

**Exported Functions:**

| Function | คำอธิบาย |
|----------|---------|
| `loginWithLine()` | เปิด LIFF login popup → check user → login API → navigate by role |
| `register(membNo, phone, otpCode, cardLast4)` | ลงทะเบียนสมาชิกใหม่ |
| `requestOTP(membNo, phone, cardLast4)` | ขอ OTP ผ่าน LINE / แสดงบนหน้าเว็บ |
| `verifyOTP(otpCode)` | ตรวจสอบ OTP |
| `logout()` | LIFF logout + clear localStorage + redirect `/` |
| `clearCache(options)` | ล้าง localStorage, sessionStorage, caches, service workers |
| `recheckNetwork()` | ตรวจ network type ใหม่ |
| `dismissWifiWarning()` | ปิด WiFi warning |
| `navigateByRole(role)` | ADMIN/OFFICER → `/dashboard`, USER → `/my-loans` |
| `isAdmin()` `isOfficer()` `isUser()` `isStaff()` | Role checkers |

**Auth Flow:**
```
LIFF Init → LIFF Login → checkLineUser API
  ├── user exists → loginWithLiff API → set token → navigateByRole
  └── user not found → setNeedsRegistration(true) → /register
```

**Timeout Config:**
```
LIFF_INIT_TIMEOUT   = 8000ms
API_CALL_TIMEOUT    = 10000ms
NETWORK_POLL_INTERVAL = 3000ms
```

---

### 5.5 MyLoans.jsx (v9 — Production)

**Features:**
- **Animated Progress Bar:** 0% → 100% (0.7s) → settle ที่ actual step (0.5s) → step box fade-in
- **Date format:** `formatDateShort()` → `"11 ก.พ. 69"` (2-digit Buddhist year)
- **Loan name:** centered, bold, `text-lg`
- **Amount:** centered `4xl emerald` + "บาท" suffix
- **🆕 DocsAccordion:** เอกสารที่ต้องเตรียม — collapsible, 5 หมวด 20 รายการ
- **🆕 APPROVED-only visibility:** นัดหมาย + เอกสาร แสดงเฉพาะ step APPROVED

**Step Config (ตรงกับ DB — loan_steps table):**

| id | Code | step_order | Color | Progress | is_final |
|----|------|-----------|-------|----------|----------|
| 1 | `DRAFT` | 1 | gray #9E9E9E | 20% | 0 |
| 2 | `RECEIVED` | 2 | blue #2196F3 | 40% | 0 |
| 3 | `SURVEY` | 3 | amber #FF9800 | 60% | 0 |
| 4 | `PENDING_APPROVE` | 4 | purple #9C27B0 | 80% | 0 |
| 5 | `APPROVED` | 5 | emerald #4CAF50 | 100% ✅ | 1 |
| 6 | `REJECTED` | 6 | red #F44336 | แถบแดง 100% | 1 |

**Progress calculation:** `(step.order / 5) * 100`  
**Rejected:** bar สีแดง 100% แยกต่างหาก

**การแสดง/ซ่อน ตาม Step:**

| Step | นัดหมาย | เอกสารที่ต้องเตรียม |
|------|---------|-------------------|
| DRAFT | ❌ ซ่อน | ❌ ซ่อน |
| RECEIVED | ❌ ซ่อน | ❌ ซ่อน |
| SURVEY | ❌ ซ่อน | ❌ ซ่อน |
| PENDING_APPROVE | ❌ ซ่อน | ❌ ซ่อน |
| **APPROVED** | ✅ แสดง (ถ้ามี appt_date) | ✅ แสดง |
| REJECTED | ❌ ซ่อน | ❌ ซ่อน |

**🆕 DocsAccordion — เอกสารที่ต้องเตรียม (5 หมวด):**

ข้อมูลเอกสารเก็บใน `REQUIRED_DOCS` array (static, ชุดเดียว ไม่เปลี่ยนตาม step)  
แสดงเป็น accordion ย่อ/ขยาย — กดคำว่า "เอกสารที่ต้องเตรียม" เพื่อเปิดดูรายละเอียด

| หมวด | icon | สี | รายการ |
|------|------|----|--------|
| เอกสารส่วนตัว | 👤 | teal | สำเนาบัตร, ทะเบียนบ้าน, ทะเบียนสมรส, บัตรคู่สมรส |
| เอกสารทางการเงิน | 💰 | emerald | สลิปเงินเดือน 3 เดือน, รับรองเงินเดือน, Statement 6 เดือน, ยินยอมหักเงิน |
| เอกสารผู้ค้ำประกัน | 🤝 | blue | สำเนาบัตร, ทะเบียนบ้าน, สลิปเงินเดือน, ยินยอมค้ำ |
| เอกสารหลักประกัน | 🏠 | amber | โฉนด, สำเนาโฉนด, แผนที่, ภาพถ่าย |
| เอกสารวันทำสัญญา | 📝 | purple | บัตรตัวจริง, สมุดบัญชี, โฉนดจริง, อากรแสตมป์ |

> แก้ข้อมูลเอกสาร → แก้ที่ `REQUIRED_DOCS` array ใน MyLoans.jsx ที่เดียว

**Component Tree:**
```
MyLoans
├── Header (gradient card with user info + decorative circles)
├── Section Title ("สินเชื่อของฉัน" + count badge)
├── LoanCard (per loan)
│   ├── Date badge (top-right, formatDateShort)
│   ├── Loan type name (centered bold)
│   ├── AnimatedProgress
│   ├── Amount display (4xl emerald centered)
│   ├── Step box (fade-in after progress)
│   ├── 🆕 [APPROVED only] AppointmentCard (ถ้ามี appt_date)
│   ├── 🆕 [APPROVED only] DocsAccordion (collapsible เอกสาร 5 หมวด)
│   └── Officer footer
├── EmptyState (ถ้าไม่มี loans)
└── ContactCard (เบอร์โทร 074-313-229)
```

**API Call:**
```js
mortgageAPI.myLoans() → GET /api/v1/mortgages/my
// Response: { data: [ { id, loan_type_name, amount, current_step_code, 
//   current_step_name, officer_name, appt_date, appt_time, 
//   current_appt_name, appt_location, created_at } ] }
```

---

### 5.6 Login.jsx

- LINE Login button (green `#00B900`)
- Progress bar แถบบาง top (simulated steps: เชื่อมต่อ → ตรวจสอบ → โหลด → เข้าระบบ)
- WiFi warning banner (auto-dismiss 3s)
- Cellular OK banner
- Auto-login: ถ้า LIFF logged in → trigger `loginWithLine()` อัตโนมัติ
- Retry banner after 15s
- Clear cache button + confirmation modal

---

### 5.7 Register.jsx

**3-step wizard:**

| Step | หน้าจอ |
|------|-------|
| 1 | กรอกเลขสมาชิก (5 หลัก, auto-pad 0) + เบอร์โทร + 4 หลักท้ายบัตร + OTP |
| 2 | กรอก OTP (แสดง OTP บนหน้าเว็บถ้าไม่ใช่ LINE) |
| 3 | สำเร็จ → auto-navigate |

**OTP Logic:**
- ส่ง OTP ผ่าน LINE (ฟรี) — ถ้าไม่ได้อยู่ใน LINE browser จะแสดง OTP บนหน้าเว็บ
- SMS OTP ผ่าน SMSMKT (ปิดอยู่ — code พร้อมแต่ disabled)
- OTP timer countdown 120s
- Copy/Paste OTP buttons

---

### 5.8 Profile.jsx

- Avatar (LINE picture or initial)
- ชื่อ + Role badge (ADMIN=red, OFFICER=cyan, USER=teal)
- เลขสมาชิก, หน่วยงาน, เบอร์โทร
- LINE connected status
- Clear cache button + confirmation modal
- Logout button

---

## 6. API Configuration (axios.js)

### 6.1 Base Config
```
API_URL = VITE_API_URL || 'https://api.loanspsc.com'
Base    = {API_URL}/api/v1
Auth    = Bearer token from localStorage('access_token')
```

### 6.2 Token Refresh
- Auto-refresh on 401 response
- Uses `refresh_token` from localStorage
- Retries original request with new token
- On refresh fail → `localStorage.clear()` → redirect `/`

### 6.3 API Modules

| Module | Endpoints | ใช้โดย |
|--------|-----------|-------|
| `liffAuthAPI` | `/auth/liff/*` (check, otp, register, login, device) | AuthContext |
| `authAPI` | `/auth/me`, `/auth/logout` | AuthContext |
| `mortgageAPI` | `/mortgages/my`, `/mortgages`, CRUD, step/approve/reject | MyLoans, **Admin** |
| `dashboardAPI` | `/dashboard` | **Admin** |
| `userAPI` | `/users` CRUD + setRole | **Admin** |
| `masterAPI` | `/master/loan-types`, `/master/loan-steps` | **Admin** |
| `profileAPI` | `/profile` get/update | Profile |

> **สำหรับ Admin:** `mortgageAPI`, `dashboardAPI`, `userAPI`, `masterAPI` พร้อมใช้แล้ว

---

## 7. Backend Integration Notes

### 7.1 Officer Name Fix (เพิ่งแก้)

**ไฟล์ที่แก้ (Go backend):**
- `mortgage_repository.go` line 48: เพิ่ม `Preload("Officer")` ใน `GetByMembNo()`
- `models.go` → `ToResponse()`: ใช้ `m.Officer.FullName` fallback `m.Officer.Username`

**VPS Deploy (ยังไม่ได้ deploy):**
```bash
cd /var/www/loaneasy
git stash
git pull origin fix/separate-queueeasy-from-loaneasy
docker compose up -d --build
```

### 7.2 OTP Config

| ช่องทาง | สถานะ | หมายเหตุ |
|---------|--------|---------|
| LINE OTP | ✅ ใช้งาน | ส่งฟรีผ่าน LINE messaging |
| Web OTP | ✅ Fallback | แสดง OTP บนหน้าเว็บถ้าไม่ได้อยู่ใน LIFF |
| SMS (SMSMKT) | ❌ ปิดอยู่ | Code พร้อม, account: rahanmay@gmail.com |

### 7.3 Device ID

- `device_id` validation ถูก **ปิด** แล้ว (เคยทำให้ login มีปัญหา)
- ยังสร้าง fingerprint เก็บ localStorage แต่ backend ไม่บังคับ match

---

## 8. Build & Deploy

### Dev
```bash
npm install
npm run dev        # http://localhost:5173
```

### Production Build
```bash
npm run build      # output → dist/
```

### Environment
```env
VITE_API_URL=https://api.loanspsc.com
```

### Paths
| Environment | Path |
|-------------|------|
| Windows Dev | `C:\Users\rahan\Downloads\loaneasy` |
| VPS | `/var/www/loaneasy` (Docker) |

---

## 9. สิ่งที่ต้องทำ Frontend_Admin

### 9.1 Route ที่ต้องเพิ่ม
```
/dashboard           → Dashboard (stats, charts)
/admin/mortgages     → รายการสินเชื่อทั้งหมด
/admin/mortgages/:id → รายละเอียด + เปลี่ยน step/approve/reject
/admin/users         → จัดการ users + set role
/admin/master        → จัดการ loan types + loan steps
```

### 9.2 สิ่งที่พร้อมแล้ว
- ✅ **API modules** ใน axios.js (`mortgageAPI`, `dashboardAPI`, `userAPI`, `masterAPI`)
- ✅ **Icons.jsx** — เพิ่ม icon ได้ตามต้องการ (24 icons พร้อมใช้)
- ✅ **AuthContext** — `isAdmin()`, `isOfficer()`, `isStaff()`, `navigateByRole()`
- ✅ **CSS utilities** — `.table`, `.badge`, `.stat-card`, `.btn-danger`

### 9.3 สิ่งที่ต้องสร้างใหม่
- 🔜 **AdminLayout.jsx** — Sidebar navigation สำหรับ ADMIN/OFFICER
- 🔜 **AdminRoute guard** — check `isStaff()` ใน App.jsx
- 🔜 **Dashboard pages** — ใช้ recharts (อยู่ใน dependencies แล้ว)
- 🔜 **Theme:** ADMIN = dark/black, OFFICER = teal/cyan (ตาม role)

### 9.4 Theme Guideline ตาม Role

| Role | Header/Sidebar | Accent |
|------|---------------|--------|
| ADMIN | bg-gray-900 / dark | red-500 |
| OFFICER | bg-teal-600 / teal-cyan | cyan-500 |
| USER | bg-teal-500→cyan-500 gradient | emerald-500 |

> ⚠️ **ปัญหาเดิม:** OFFICER เคยเห็น element สี dark ของ ADMIN ปนมา — ต้องแยก theme ชัดเจนตาม role

---

## 10. Known Issues / Pending

| รายการ | สถานะ | หมายเหตุ |
|--------|--------|---------|
| VPS deploy backend (officer name fix) | ⏳ Pending | `git pull` + `docker compose up -d --build` |
| MyLoans v9 deploy to frontend | ⏳ Pending | Copy MyLoans.jsx + Icons.jsx → `npm run build` |
| Mobile device testing | ⏳ Pending | ทดสอบ DocsAccordion + animation บนมือถือจริง |
| ADMIN/OFFICER login → ยังไม่มี dashboard | ⏳ Pending | navigateByRole ชี้ `/dashboard` แต่ route ยังไม่มี |
| Queue system (queueeasy) | 🔜 Phase ถัดไป | แยกออกจาก loaneasy — design เสร็จแล้ว |

---

## 11. Changelog

### v9 (11 ก.พ. 2569 — ล่าสุด)
- 🆕 **DocsAccordion** — ฟีเจอร์ "เอกสารที่ต้องเตรียม" แบบย่อ/ขยาย (5 หมวด, 20 รายการ)
- 🆕 **APPROVED-only visibility** — นัดหมาย + เอกสาร แสดงเฉพาะ step `APPROVED` เท่านั้น
- ✏️ **เปลี่ยนชื่อ** "นัดหมายถัดไป" → "นัดหมาย"
- ✏️ **Step Config ตรง DB จริง** — 6 steps (DRAFT→RECEIVED→SURVEY→PENDING_APPROVE→APPROVED→REJECTED)
- ✏️ **Progress คำนวณถูก** — `TOTAL_STEPS = 5`, APPROVED = 100%, REJECTED = แถบแดง 100%
- 🆕 **Icons เพิ่ม 2 ตัว** — `IconChevronDown` (accordion toggle), `IconCheckList` (เอกสาร header)

### v8 (ก่อนหน้า)
- Animated progress bar 3-phase (0→100%→settle→fade-in)
- Date badge format "11 ก.พ. 69"
- Centered bold loan name + 4xl emerald amount
- Icon consolidation (67 duplicates → 22 shared icons)

---

*สร้างโดย Claude — 11 ก.พ. 2569*
