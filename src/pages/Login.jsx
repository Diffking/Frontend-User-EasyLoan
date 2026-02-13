import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { IconLine, IconSpinner } from '../components/Icons'

const Login = () => {
  const {
    loginWithLine,
    loading,
    liffReady,
    isLoggedIn,
    networkType,
    recheckNetwork,
    clearCache,
  } = useAuth()
  const autoLoginTriggered = useRef(false)

  // ✅ WiFi warning
  const [showWifiBanner, setShowWifiBanner] = useState(false)
  const wifiBannerTimerRef = useRef(null)

  // ✅ Clear Cache
  const [showClearCacheConfirm, setShowClearCacheConfirm] = useState(false)
  const [clearingCache, setClearingCache] = useState(false)

  // ✅ Inline progress (แถบบางๆ ด้านบน — ไม่ใช่ full-screen)
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState("")
  const [showProgress, setShowProgress] = useState(false)
  const [showRetry, setShowRetry] = useState(false)

  // ✅ Progress simulation — เมื่อ loading
  useEffect(() => {
    if (!loading) {
      if (showProgress) {
        setProgress(100)
        setStatusText("✅ พร้อมใช้งาน")
        const hideTimer = setTimeout(() => setShowProgress(false), 800)
        return () => clearTimeout(hideTimer)
      }
      return
    }

    setShowProgress(true)
    setProgress(0)
    setStatusText("กำลังเตรียมระบบ...")
    setShowRetry(false)

    const steps = [
      { target: 25, delay: 400, text: "เชื่อมต่อ LINE..." },
      { target: 50, delay: 1200, text: "ตรวจสอบข้อมูล..." },
      { target: 75, delay: 2500, text: "โหลดข้อมูลสมาชิก..." },
      { target: 90, delay: 4000, text: "เกือบเสร็จแล้ว..." },
      { target: 98, delay: 6000, text: "กำลังเข้าสู่ระบบ..." },
    ]

    const timers = steps.map((step) =>
      setTimeout(() => {
        setProgress(step.target)
        setStatusText(step.text)
      }, step.delay)
    )

    const retryTimer = setTimeout(() => setShowRetry(true), 15000)

    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(retryTimer)
    }
  }, [loading])

  // ✅ WiFi banner
  useEffect(() => {
    if (networkType === "wifi") {
      setShowWifiBanner(true)
      if (wifiBannerTimerRef.current) clearTimeout(wifiBannerTimerRef.current)
      wifiBannerTimerRef.current = setTimeout(() => setShowWifiBanner(false), 3000)
    } else {
      setShowWifiBanner(false)
      if (wifiBannerTimerRef.current) clearTimeout(wifiBannerTimerRef.current)
    }
    return () => {
      if (wifiBannerTimerRef.current) clearTimeout(wifiBannerTimerRef.current)
    }
  }, [networkType])

  // ✅ Auto-login: LIFF login อยู่แล้ว → เรียก loginWithLine อัตโนมัติ
  useEffect(() => {
    if (!loading && liffReady && isLoggedIn && !autoLoginTriggered.current) {
      console.log("[Login] Auto-triggering loginWithLine...")
      autoLoginTriggered.current = true

      setShowProgress(true)
      setProgress(0)
      setStatusText("กำลังเข้าสู่ระบบ...")
      const t1 = setTimeout(() => { setProgress(40); setStatusText("ตรวจสอบข้อมูล...") }, 300)
      const t2 = setTimeout(() => { setProgress(70); setStatusText("โหลดข้อมูลสมาชิก...") }, 1000)
      const t3 = setTimeout(() => { setProgress(90); setStatusText("เกือบเสร็จแล้ว...") }, 2000)

      loginWithLine()

      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
    }
  }, [loading, liffReady, isLoggedIn])

  // ============================================================
  // ✅ แสดงหน้า Login เสมอ — ไม่มี full-screen loading
  //    → ป๊อบอัพ LIFF จะแสดงทับบนหน้าสวยๆ (ไม่ใช่จอดำ)
  //    → Logout กลับมาเห็นหน้า Login ทันที
  // ============================================================
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50">

      {/* ============================================================ */}
      {/* ✅ Top Progress Banner — แถบจางๆ ด้านบนสุด                   */}
      {/* ============================================================ */}
      {showProgress && !showRetry && (
        <div className="fixed top-0 left-0 right-0 z-50" style={{ animation: 'slideDown 0.3s ease-out' }}>
          {/* Progress bar เส้นบาง */}
          <div className="h-1 bg-teal-100 w-full">
            <div
              className="h-full rounded-r-full"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #0d9488, #14b8a6, #06b6d4)',
                boxShadow: '0 0 8px rgba(20,184,166,0.4)',
                transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            />
          </div>
          {/* Status */}
          <div className="bg-white/90 backdrop-blur-sm border-b border-teal-100/50 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
              </div>
              <span className="text-teal-600 text-xs">{statusText}</span>
            </div>
            <span className="text-teal-500 text-xs font-semibold tabular-nums">{progress}%</span>
          </div>
        </div>
      )}

      {/* ✅ Retry banner — แสดงเมื่อค้างนาน */}
      {showRetry && (
        <div className="fixed top-0 left-0 right-0 z-50" style={{ animation: 'slideDown 0.3s ease-out' }}>
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center justify-between">
            <span className="text-amber-700 text-sm">⏳ ใช้เวลานาน...</span>
            <div className="flex space-x-2">
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 rounded-lg active:scale-95 transition-all"
              >
                🔄 ลองใหม่
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("access_token")
                  localStorage.removeItem("refresh_token")
                  localStorage.removeItem("user")
                  window.location.href = "/"
                }}
                className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-100 rounded-lg active:scale-95 transition-all"
              >
                รีเซ็ต
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* Main Content — แสดงเสมอ                                     */}
      {/* ============================================================ */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md" style={{ paddingTop: (showProgress || showRetry) ? '28px' : '0', transition: 'padding 0.3s ease' }}>

          {/* WiFi Warning */}
          {showWifiBanner && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center space-x-3 animate-pulse">
              <span className="text-amber-500 text-lg flex-shrink-0">⚠️</span>
              <p className="text-amber-700 text-sm">
                ตรวจพบ WiFi — แนะนำใช้เน็ตมือถือ (4G/5G) เพื่อความปลอดภัย
              </p>
            </div>
          )}

          {/* Cellular OK */}
          {networkType === "cellular" && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3">
              <span className="text-green-500 text-lg flex-shrink-0">✅</span>
              <p className="text-green-700 text-sm">เชื่อมต่อ 4G/5G แล้ว พร้อมเข้าสู่ระบบ</p>
            </div>
          )}

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-white rounded-full shadow-xl shadow-teal-200/50 mb-4 p-3 border border-teal-100">
              <img 
                src="/assets/images/logo.png" 
                alt="EasyLoan Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
              <div className="hidden w-full h-full items-center justify-center text-4xl font-bold text-teal-600">
                SPSC
              </div>
            </div>
            <h1 className="text-3xl font-bold text-teal-800">EasyLoan</h1>
            <p className="text-teal-600 mt-2">ระบบสินเชื่อสหกรณ์ออมทรัพย์<br/>สาธารณสุขสงขลา</p>
          </div>

          {/* Login Box */}
          <div className="bg-white/80 backdrop-blur-sm border border-teal-100 rounded-2xl shadow-xl shadow-teal-100/50 p-8">
            <h2 className="text-xl font-semibold text-teal-800 text-center mb-6">
              เข้าสู่ระบบ
            </h2>

            <p className="text-gray-600 text-center mb-6">
              เข้าสู่ระบบด้วยบัญชี LINE ของคุณ
            </p>

            {/* LINE Login Button */}
            <button
              onClick={loginWithLine}
              disabled={loading}
              className={`w-full py-4 px-6 text-white text-lg font-semibold rounded-xl flex items-center justify-center 
                       space-x-3 transition-all duration-200 shadow-lg
                       ${loading 
                         ? 'bg-gray-400 shadow-gray-200 cursor-wait' 
                         : 'bg-[#00B900] hover:bg-[#00A000] shadow-green-200 hover:shadow-green-300 active:scale-[0.98]'}`}
            >
              {loading ? (
                <>
                  <IconSpinner className="w-6 h-6" />
                  <span>กำลังเตรียมระบบ...</span>
                </>
              ) : (
                <>
                  <IconLine className="w-7 h-7" />
                  <span>เข้าสู่ระบบด้วย LINE</span>
                </>
              )}
            </button>
          </div>

          {/* Info */}
          <div className="mt-6 text-center text-teal-600 text-sm">
            <p>สำหรับสมาชิกสหกรณ์ออมทรัพย์สาธารณสุขสงขลา</p>
            <p className="mt-1 text-teal-500">หากยังไม่เคยลงทะเบียน ระบบจะให้ลงทะเบียนอัตโนมัติ</p>
          </div>

          {/* ✅ Clear Cache — ปุ่มสวยๆ */}
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowClearCacheConfirm(true)}
              className="inline-flex items-center space-x-2 px-5 py-2.5 text-sm text-teal-600/70 hover:text-red-500 
                       bg-white/60 hover:bg-red-50 border border-teal-200/50 hover:border-red-200 
                       rounded-full transition-all duration-200 active:scale-[0.97]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
              </svg>
              <span>หากเข้าไม่ได้ กดปุ่มนี้</span>
            </button>
          </div>

          {/* Clear Cache Confirmation Modal */}
          {showClearCacheConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowClearCacheConfirm(false)}>
              <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-[fadeIn_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 rounded-full mb-3">
                    <span className="text-3xl">🧹</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">ล้างแคชเบราว์เซอร์</h3>
                </div>
                <div className="space-y-2 mb-5 text-sm text-gray-600">
                  <p>ระบบจะดำเนินการดังนี้:</p>
                  <ul className="space-y-1.5 ml-1">
                    <li className="flex items-start space-x-2">
                      <span className="text-green-500 flex-shrink-0">✓</span>
                      <span>ล้างข้อมูลล็อกอินที่เก็บไว้</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-500 flex-shrink-0">✓</span>
                      <span>ล้างแคชของเว็บเบราว์เซอร์</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-500 flex-shrink-0">✓</span>
                      <span>ออกจากระบบ LINE แล้วโหลดใหม่</span>
                    </li>
                  </ul>
                  <p className="text-amber-600 text-xs mt-2 bg-amber-50 p-2 rounded-lg">
                    ⚠️ หลังล้างแคชจะต้องเข้าสู่ระบบใหม่อีกครั้ง
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowClearCacheConfirm(false)}
                    disabled={clearingCache}
                    className="flex-1 py-3 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={async () => {
                      setClearingCache(true)
                      await clearCache({ keepDeviceId: true, doReload: true, doLogout: true })
                    }}
                    disabled={clearingCache}
                    className="flex-1 py-3 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:bg-red-300 rounded-xl transition-all flex items-center justify-center space-x-2"
                  >
                    {clearingCache ? (
                      <><IconSpinner className="w-4 h-4" /><span>กำลังล้าง...</span></>
                    ) : (
                      <span>🗑️ ล้างแคช</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <p className="text-center text-teal-600/70 text-sm mt-8">
            © 2026 EasyLoan
          </p>
        </div>
      </div>

      {/* ✅ CSS Animations */}
      <style>{`
        @keyframes slideDown {
          0% { opacity: 0; transform: translateY(-100%); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default Login
