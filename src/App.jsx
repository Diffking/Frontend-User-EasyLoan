import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyLoans from "./pages/MyLoans";
import Profile from "./pages/Profile";
import CommitteeBorrowers from "./pages/CommitteeBorrowers";
import PDPAInfo from "./pages/PDPAInfo";


// ============================================================
// ✅ Loading Screen — Progress Bar + Percentage Counter
// ============================================================
const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("กำลังเชื่อมต่อ...");
  const [showRetry, setShowRetry] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  // ✅ Progress simulation — จำลองขั้นตอนการโหลด
  useEffect(() => {
    const steps = [
      { target: 15, delay: 200, text: "กำลังเชื่อมต่อ LINE..." },
      { target: 35, delay: 600, text: "ตรวจสอบข้อมูลผู้ใช้..." },
      { target: 55, delay: 1200, text: "โหลดข้อมูลสมาชิก..." },
      { target: 75, delay: 2000, text: "เตรียมข้อมูลสินเชื่อ..." },
      { target: 90, delay: 3000, text: "เกือบเสร็จแล้ว..." },
      { target: 98, delay: 5000, text: "กำลังเข้าสู่ระบบ..." },
    ];

    const timers = steps.map((step) =>
      setTimeout(() => {
        setProgress(step.target);
        setStatusText(step.text);
      }, step.delay)
    );

    // Safety: ถ้า 12 วินาทียังไม่เสร็จ → แสดงปุ่ม retry
    const retryTimer = setTimeout(() => setShowRetry(true), 12000);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(retryTimer);
    };
  }, []);

  // ✅ เมื่อ loading จบจริง (component จะ unmount) ให้ progress ไป 100%
  useEffect(() => {
    return () => setProgress(100);
  }, []);

  const handleRetry = () => window.location.reload();
  const handleForceLogin = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-800 via-teal-900 to-emerald-950 p-6 relative overflow-hidden">
      {/* ✨ Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/95 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl shadow-teal-500/20 mb-4 p-3"
               style={{ animation: 'float 3s ease-in-out infinite' }}>
            <img src="/assets/images/logo.png" alt="EasyLoan" className="w-full h-full object-contain"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
            <div className="hidden w-full h-full items-center justify-center text-2xl font-bold text-teal-700">SPSC</div>
          </div>
          <h1 className="text-xl font-bold text-white/90 tracking-wide">EasyLoan</h1>
        </div>

        {/* ======================================== */}
        {/* Progress Bar */}
        {/* ======================================== */}
        <div className="mb-4">
          {/* Bar container */}
          <div className="relative w-full h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
            {/* Animated fill */}
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #14b8a6, #06b6d4, #10b981)',
                boxShadow: '0 0 20px rgba(20, 184, 166, 0.5), 0 0 40px rgba(20, 184, 166, 0.2)',
              }}
            />
            {/* Shimmer effect */}
            <div
              className="absolute inset-y-0 left-0 rounded-full overflow-hidden transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  animation: 'shimmer 1.5s infinite',
                }}
              />
            </div>
          </div>
        </div>

        {/* Percentage */}
        <div className="mb-3">
          <span className="text-4xl font-bold text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(135deg, #5eead4, #22d3ee, #6ee7b7)' }}>
            {progress}
          </span>
          <span className="text-lg text-teal-300/70 font-medium ml-0.5">%</span>
        </div>

        {/* Status text */}
        <div className="flex items-center justify-center space-x-2 mb-6">
          <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
          <p className="text-sm text-teal-200/80 transition-all duration-300">{statusText}</p>
        </div>

        {/* ✅ Loading dots animation */}
        {!showRetry && (
          <div className="flex items-center justify-center space-x-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-teal-400/60 rounded-full"
                style={{
                  animation: 'bounce 1.4s ease-in-out infinite',
                  animationDelay: `${i * 0.16}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* ✅ Retry buttons — แสดงเมื่อค้างนาน */}
        {showRetry && (
          <div className="mt-4 space-y-3" style={{ animation: 'fadeSlideUp 0.5s ease-out' }}>
            <div className="p-3 bg-amber-500/20 border border-amber-400/30 rounded-xl backdrop-blur-sm">
              <p className="text-amber-200 text-sm">⏳ ดูเหมือนจะใช้เวลานาน...</p>
            </div>
            <button
              onClick={handleRetry}
              className="w-full px-6 py-3.5 bg-white text-teal-700 font-semibold rounded-xl shadow-lg shadow-white/10 hover:bg-gray-50 active:scale-[0.98] transition-all"
            >
              🔄 ลองใหม่อีกครั้ง
            </button>
            <button
              onClick={handleForceLogin}
              className="w-full px-6 py-3 bg-white/10 text-white/80 font-medium rounded-xl border border-white/20 hover:bg-white/20 active:scale-[0.98] transition-all text-sm"
            >
              กลับหน้าเข้าสู่ระบบ
            </button>
          </div>
        )}
      </div>

      {/* ✅ CSS Animations */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fadeSlideUp {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// ============================================================
// ✅ Protected Route — requires login (USER only)
// ============================================================
const ProtectedRoute = ({ children }) => {
  const { user, loading, isLoggedIn, needsRegistration } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isLoggedIn && needsRegistration) {
    return <Navigate to="/register" replace />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Layout>{children}</Layout>;
};

// ============================================================
// ✅ Public Route — redirect ถ้า login แล้ว
// ============================================================
const PublicRoute = ({ children }) => {
  const { user, loading, needsRegistration } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (needsRegistration) {
    return <Navigate to="/register" replace />;
  }

  // ✅ ถ้ามี user อยู่แล้ว → ไป /my-loans เลย (ไม่โชว์ popup)
  if (user) {
    if (["ADMIN", "OFFICER"].includes(user.role)) {
      return children; // Show login page with message for staff
    }
    return <Navigate to="/my-loans" replace />;
  }

  return children;
};

// ============================================================
// ✅ Registration Route
// ============================================================
const RegisterRoute = ({ children }) => {
  const { loading, needsRegistration, user } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (user && !needsRegistration) {
    if (["ADMIN", "OFFICER"].includes(user.role)) {
      return <Navigate to="/" replace />;
    }
    return <Navigate to="/my-loans" replace />;
  }

  if (!needsRegistration) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// ============================================================
// ✅ App
// ============================================================
function App() {
  return (
    <Routes>
      {/* Public */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Registration */}
      <Route
        path="/register"
        element={
          <RegisterRoute>
            <Register />
          </RegisterRoute>
        }
      />

      {/* Member Routes */}
      <Route
        path="/my-loans"
        element={
          <ProtectedRoute>
            <MyLoans />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Committee — auto-gated inside the page by isCommitteeMember */}
      <Route
        path="/committee-borrowers"
        element={
          <ProtectedRoute>
            <CommitteeBorrowers />
          </ProtectedRoute>
        }
      />

      {/* PDPA info — gated inside Layout's nav by pdpaInfoPageEnabled */}
      <Route
        path="/pdpa-info"
        element={
          <ProtectedRoute>
            <PDPAInfo />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
