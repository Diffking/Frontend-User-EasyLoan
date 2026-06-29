import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import liff from "@line/liff";
import { liffAuthAPI, authAPI, committeeAPI } from "../api/axios";
import toast from "react-hot-toast";

const LIFF_ID = "2008944602-9ZeFomU2";

// ============================================================
// ✅ Timeout (ms)
// ============================================================
const LIFF_INIT_TIMEOUT = 8000;
const API_CALL_TIMEOUT = 10000;
const NETWORK_POLL_INTERVAL = 3000;

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

// ============================================================
// ✅ Helper: สร้าง Device ID (fingerprint)
// ============================================================
const getDeviceId = async () => {
  let deviceId = localStorage.getItem("device_id");
  if (deviceId) return deviceId;

  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || "unknown",
    navigator.platform,
  ].join("|");

  const encoder = new TextEncoder();
  const data = encoder.encode(fingerprint + Date.now());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  deviceId =
    "DEV-" +
    hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .substring(0, 32);

  localStorage.setItem("device_id", deviceId);
  return deviceId;
};

// ============================================================
// ✅ Helper: ตรวจว่าอยู่ใน LINE In-App Browser
// ============================================================
const isLineBrowser = () => {
  return (
    navigator.userAgent.includes("Line") || navigator.userAgent.includes("LIFF")
  );
};

// ============================================================
// ✅ Helper: ตรวจ Network Type (สำหรับ UI — อ่านค่าจริง)
//    ใช้แสดง WiFi warning บนหน้าจอ
// ============================================================
const getNetworkType = () => {
  const conn =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  if (!conn) return "unknown";

  const type = conn.type || "";
  if (type === "wifi") return "wifi";
  if (type === "cellular") return "cellular";
  if (type === "ethernet") return "ethernet";
  if (type === "none") return "none";

  return "unknown";
};

// ============================================================
// ✅ Helper: ตรวจ Network Type (สำหรับ API — ส่งให้ backend)
//    LINE browser: cache ค่า conn.type="wifi" แม้ปิด WiFi แล้ว
//    → ส่ง "cellular" แทน เพื่อไม่ให้ backend reject
//    Chrome/Safari: ส่งค่าจริง
// ============================================================
const getNetworkTypeForAPI = () => {
  if (isLineBrowser()) {
    return "cellular"; // ✅ LINE browser → ส่ง cellular เสมอ (backend เช็คจาก IP)
  }
  return getNetworkType(); // ✅ Browser อื่น → ส่งค่าจริง
};

// ============================================================
// ✅ Helper: Promise with Timeout
// ============================================================
const withTimeout = (promise, ms, errorMsg = "Timeout") => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(errorMsg)), ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [lineProfile, setLineProfile] = useState(null);
  const [lineAccessToken, setLineAccessToken] = useState(null);
  const [liffReady, setLiffReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // ★ ถ้าเพิ่ง logout มา → ข้าม loading screen ไปเลย
  const [loading, setLoading] = useState(() => {
    if (localStorage.getItem("just_logged_out")) {
      localStorage.removeItem("just_logged_out");
      return false;
    }
    return true;
  });
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const [networkType, setNetworkType] = useState("unknown"); // ✅ ค่าจริง (สำหรับ UI)
  const [wifiDismissed, setWifiDismissed] = useState(false);
  const [isInLineBrowser] = useState(isLineBrowser()); // ✅ export ให้ Login.jsx ใช้
  const [isCommitteeMember, setIsCommitteeMember] = useState(false);
  const [pdpaConsentRequired, setPdpaConsentRequired] = useState(false);
  const [pdpaInfoPageEnabled, setPdpaInfoPageEnabled] = useState(false);
  const navigate = useNavigate();

  const initStarted = useRef(false);
  const loginInProgress = useRef(false);
  const pollTimerRef = useRef(null);

  // ============================================================
  // ✅ Recheck Network
  // ============================================================
  const recheckNetwork = useCallback(() => {
    const newType = getNetworkType();
    console.log("[Network] Recheck:", newType);
    setNetworkType(newType);

    if (newType === "wifi") {
      toast.error("ยังเชื่อมต่อ WiFi อยู่ กรุณาปิด WiFi", {
        id: "wifi-warning",
        duration: 4000,
      });
      setWifiDismissed(false);
      return false;
    } else {
      toast.dismiss("wifi-warning");
      if (newType === "cellular") {
        toast.success("เชื่อมต่อ 4G/5G แล้ว พร้อมเข้าสู่ระบบ", {
          id: "cellular-ok",
          duration: 3000,
        });
      }
      setWifiDismissed(false);
      return true;
    }
  }, []);

  const dismissWifiWarning = useCallback(() => {
    setWifiDismissed(true);
    toast.dismiss("wifi-warning");
    toast.success("ปิดการแจ้งเตือน WiFi แล้ว", { duration: 2000 });
  }, []);

  // ============================================================
  // ✅ Network Polling
  // ============================================================
  useEffect(() => {
    const conn =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    const handleNetworkChange = () => {
      const newType = getNetworkType();
      console.log("[Network Event] Changed to:", newType);
      setNetworkType(newType);

      if (newType === "wifi" && !wifiDismissed && needsRegistration) {
        toast.error("กรุณาใช้อินเทอร์เน็ตมือถือ (Cellular) ในการลงทะเบียน", {
          id: "wifi-warning",
          duration: 8000,
        });
      } else if (newType !== "wifi") {
        toast.dismiss("wifi-warning");
        if (newType === "cellular") {
          toast.success("เชื่อมต่อ 4G/5G แล้ว", {
            id: "cellular-ok",
            duration: 2000,
          });
        }
      }
    };

    if (conn) {
      conn.addEventListener("change", handleNetworkChange);
    }

    pollTimerRef.current = setInterval(() => {
      const currentType = getNetworkType();
      setNetworkType((prev) => {
        if (prev !== currentType) {
          console.log("[Network Poll] Changed:", prev, "→", currentType);
          if (currentType !== "wifi" && prev === "wifi") {
            toast.dismiss("wifi-warning");
            if (currentType === "cellular") {
              toast.success("เชื่อมต่อ 4G/5G แล้ว พร้อมเข้าสู่ระบบ", {
                id: "cellular-ok",
                duration: 3000,
              });
            }
          } else if (
            currentType === "wifi" &&
            prev !== "wifi" &&
            !wifiDismissed &&
            needsRegistration
          ) {
            toast.error("กรุณาใช้อินเทอร์เน็ตมือถือ (Cellular)", {
              id: "wifi-warning",
              duration: 8000,
            });
          }
        }
        return currentType;
      });
    }, NETWORK_POLL_INTERVAL);

    return () => {
      if (conn) conn.removeEventListener("change", handleNetworkChange);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [wifiDismissed, needsRegistration]);

  // ============================================================
  // ✅ Main Init
  // ============================================================
  useEffect(() => {
    if (initStarted.current) return;
    initStarted.current = true;
    initializeLiff();
  }, []);

  // ============================================================
  // ✅ Committee status — เช็คทุกครั้งที่ user login/เปลี่ยน
  //    เพื่อโชว์/ซ่อนแท็บ "รายชื่อผู้กู้" (auto-detect, ไม่ต้องตั้งค่าเอง)
  // ============================================================
  useEffect(() => {
    if (!user) {
      setIsCommitteeMember(false);
      return;
    }
    committeeAPI
      .me()
      .then((res) => setIsCommitteeMember(!!res?.data?.data?.is_committee_member))
      .catch(() => setIsCommitteeMember(false));

    committeeAPI
      .pdpaStatus()
      .then((res) => {
        setPdpaConsentRequired(!!res?.data?.data?.consent_required);
        setPdpaInfoPageEnabled(!!res?.data?.data?.info_page_enabled);
      })
      .catch(() => {
        setPdpaConsentRequired(false);
        setPdpaInfoPageEnabled(false);
      });
  }, [user]);

  const initializeLiff = async () => {
    console.log("[Init] Starting... LINE Browser:", isLineBrowser());

    try {
      // Step 1: Device ID + Network
      const devId = await getDeviceId();
      setDeviceId(devId);

      const netType = getNetworkType(); // ✅ UI: ค่าจริง
      setNetworkType(netType);

      // ★ WiFi warning: ไม่แสดง toast ตรงนี้แล้ว
      //   - Login → มี banner สีเหลือง 3 วิ อยู่แล้ว
      //   - Register → hard block WiFi เอง

      const apiNetType = getNetworkTypeForAPI(); // ✅ API: LINE→cellular

      // Step 2: เช็ค stored session
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("access_token");

      // Step 3: LIFF init (พร้อม timeout)
      try {
        await withTimeout(
          liff.init({ liffId: LIFF_ID }),
          LIFF_INIT_TIMEOUT,
          "LIFF init timeout",
        );
        setLiffReady(true);
        console.log("[Init] LIFF ready, isLoggedIn:", liff.isLoggedIn());
      } catch (liffErr) {
        console.warn("[Init] LIFF init issue:", liffErr.message);
        if (liff.ready) {
          setLiffReady(true);
        }
      }

      // ===========================================================
      // ✅ Decision Tree
      // ===========================================================

      // Case A: มี stored session → ใช้เลย
      if (storedUser && storedToken) {
        console.log("[Init] Case A: Restoring stored session");
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsLoggedIn(true);
          setNeedsRegistration(false);

          if (liff.isLoggedIn?.()) {
            const token = liff.getAccessToken();
            if (token) setLineAccessToken(token);
            try {
              const profile = await liff.getProfile();
              setLineProfile(profile);
            } catch (e) {
              console.warn("[Init] Could not get LINE profile:", e.message);
            }
          }

          setLoading(false);
          console.log("[Init] ✅ Session restored");
          // Only redirect to /my-loans if on login page, otherwise stay on current route
          if (
            window.location.pathname === "/" ||
            window.location.pathname === ""
          ) {
            navigate("/my-loans", { replace: true });
          }
          return;
        } catch (e) {
          console.warn("[Init] Stored session invalid, clearing...");
          localStorage.removeItem("user");
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      }

      // Case B: LIFF login อยู่ → ทำ login flow
      if (liff.isLoggedIn?.()) {
        console.log("[Init] Case B: LIFF logged in → login flow");
        setIsLoggedIn(true);
        const token = liff.getAccessToken();
        setLineAccessToken(token);
        await handleLiffLogin(token, devId, apiNetType); // ✅ ส่ง apiNetType
        return;
      }

      // Case C: ยังไม่ login → แสดงหน้า Login
      console.log("[Init] Case C: Not logged in → show login page");
      setLoading(false);
    } catch (error) {
      console.error("[Init] Fatal error:", error);

      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("access_token");
      if (storedUser && storedToken) {
        try {
          setUser(JSON.parse(storedUser));
          setIsLoggedIn(true);
          setLoading(false);
          if (
            window.location.pathname === "/" ||
            window.location.pathname === ""
          ) {
            navigate("/my-loans", { replace: true });
          }
          return;
        } catch (e) {
          /* ignore */
        }
      }

      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
      setLoading(false);
    }
  };

  // ============================================================
  // ✅ Handle LIFF Login
  // ============================================================
  const handleLiffLogin = async (accessToken, devId, netType) => {
    if (loginInProgress.current) {
      console.log("[Login] Already in progress, skipping");
      return;
    }
    loginInProgress.current = true;

    try {
      let profile;
      try {
        profile = await withTimeout(
          liff.getProfile(),
          5000,
          "Get profile timeout",
        );
        setLineProfile(profile);
      } catch (e) {
        console.warn("[Login] Could not get profile:", e.message);
        profile = { displayName: "LINE User", pictureUrl: "" };
      }

      console.log("[Login] Checking if LINE user exists...");
      const response = await withTimeout(
        liffAuthAPI.checkLineUser(accessToken),
        API_CALL_TIMEOUT,
        "Check user timeout",
      );

      if (response.data.data.exists) {
        console.log("[Login] User exists → logging in");
        const loginResponse = await withTimeout(
          liffAuthAPI.loginWithLiff({
            line_access_token: accessToken,
            line_display_name: profile.displayName,
            line_picture_url: profile.pictureUrl || "",
            device_id: devId,
            network_type: netType, // ✅ ใช้ค่าที่ส่งมา (apiNetType)
          }),
          API_CALL_TIMEOUT,
          "Login timeout",
        );

        const {
          access_token,
          refresh_token,
          user: userData,
        } = loginResponse.data.data;

        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);
        localStorage.setItem("user", JSON.stringify(userData));

        setUser(userData);
        setNeedsRegistration(false);

        console.log("[Login] ✅ Success → /my-loans");
        navigate("/my-loans", { replace: true });
      } else {
        console.log("[Login] User not found → /register");
        setNeedsRegistration(true);
        navigate("/register", { replace: true });
      }
    } catch (error) {
      console.error("[Login] Error:", error);
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "";

      if (
        error.response?.status === 404 ||
        message.includes("ไม่พบผู้ใช้") ||
        message.includes("ลงทะเบียน")
      ) {
        setNeedsRegistration(true);
        navigate("/register", { replace: true });
      } else if (message.includes("เครื่องนี้ไม่ตรง")) {
        toast.error(
          "เครื่องนี้ไม่ตรงกับที่ลงทะเบียน กรุณาติดต่อสหกรณ์เพื่อเปลี่ยนเครื่อง",
          { duration: 6000 },
        );
      } else if (message.includes("Cellular") || message.includes("WiFi")) {
        toast.error(message, { duration: 5000 });
      } else if (message.includes("LINE Token")) {
        // ✅ FIX: ไม่ liff.logout() → ป้องกัน LIFF consent loop
        toast.error("เซสชันหมดอายุ กรุณาเปิดลิงก์ใหม่", {
          duration: 5000,
        });
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
      } else if (message.includes("imeout")) {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
            setIsLoggedIn(true);
            navigate("/my-loans", { replace: true });
            return;
          } catch (e) {
            /* ignore */
          }
        }
        toast.error("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่", {
          duration: 5000,
        });
      } else {
        toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
      }
    } finally {
      loginInProgress.current = false;
      setLoading(false);
    }
  };

  // Navigate by role
  const navigateByRole = (role) => {
    switch (role) {
      case "ADMIN":
      case "OFFICER":
        navigate("/dashboard");
        break;
      case "USER":
      default:
        navigate("/my-loans");
        break;
    }
  };

  // ============================================================
  // ✅ LINE Login (กดปุ่ม)
  // ============================================================
  const loginWithLine = async () => {
    // ✅ เช็ค Network Type แบบ real-time (สำหรับแสดง UI เท่านั้น)
    const currentNetType = getNetworkType();
    setNetworkType(currentNetType);

    // ✅ Login: อนุญาตให้ใช้ WiFi ได้ (แค่แจ้งเตือนสีเหลือง 3 วินาที บนหน้า Login)
    //    ไม่ block การ login

    if (!liffReady) {
      toast.loading("กำลังเชื่อมต่อ LINE...", { id: "liff-retry" });
      try {
        await withTimeout(
          liff.init({ liffId: LIFF_ID }),
          LIFF_INIT_TIMEOUT,
          "LIFF retry timeout",
        );
        setLiffReady(true);
        toast.dismiss("liff-retry");
      } catch (err) {
        console.error("[loginWithLine] LIFF retry failed:", err);
        if (err.code === "INIT_FAILED" || liff.ready) {
          setLiffReady(true);
          toast.dismiss("liff-retry");
        } else {
          toast.error("ไม่สามารถเชื่อมต่อ LINE ได้ กรุณา refresh หน้า", {
            id: "liff-retry",
            duration: 5000,
          });
          return;
        }
      }
    }

    if (liff.isLoggedIn()) {
      setLoading(true);
      const token = liff.getAccessToken();
      setLineAccessToken(token);
      const devId = deviceId || (await getDeviceId());
      const apiNetType = getNetworkTypeForAPI(); // ✅ ส่ง cellular ใน LINE browser
      await handleLiffLogin(token, devId, apiNetType);
    } else {
      liff.login();
    }
  };

  // ============================================================
  // ✅ OTP Functions
  // ============================================================
  const requestOTP = async (membNo, phone, cardLast4) => {
    if (!lineAccessToken) {
      toast.error("ไม่พบ LINE Token กรุณาเข้าสู่ระบบใหม่");
      return { success: false };
    }

    try {
      const response = await liffAuthAPI.requestOTP({
        line_access_token: lineAccessToken,
        memb_no: membNo,
        phone: phone,
        card_last4: cardLast4,
      });

      if (response.data.success) {
        toast.success(`ส่ง OTP ไปที่ ${response.data.data.phone_masked} แล้ว`);
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "ขอ OTP ไม่สำเร็จ";

      if (
        message.includes("ลงทะเบียนแล้ว") ||
        message.includes("ถูกใช้แล้ว") ||
        message.includes("เชื่อมต่อแล้ว") ||
        message.includes("already")
      ) {
        toast.error("บัญชี LINE นี้ลงทะเบียนแล้ว กำลังเข้าสู่ระบบ...", {
          duration: 3000,
        });
        setTimeout(async () => {
          const devId = deviceId || (await getDeviceId());
          const netType = getNetworkTypeForAPI(); // ✅ API
          setLoading(true);
          await handleLiffLogin(lineAccessToken, devId, netType);
        }, 1000);
        return { success: false, error: message, alreadyRegistered: true };
      }

      toast.error(message);
      return { success: false, error: message };
    }
  };

  const verifyOTP = async (otpCode) => {
    if (!lineAccessToken) {
      toast.error("ไม่พบ LINE Token");
      return { success: false };
    }

    try {
      const response = await liffAuthAPI.verifyOTP({
        line_access_token: lineAccessToken,
        otp_code: otpCode,
      });

      if (response.data.success) {
        toast.success("ยืนยัน OTP สำเร็จ");
        return { success: true };
      }
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "OTP ไม่ถูกต้อง";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // ============================================================
  // ✅ Register + ป้องกันลงทะเบียนซ้ำ
  // ⚠️ FIX: ถ้า register สำเร็จแต่ auto-login fail
  //    → ห้าม liff.logout() (ป้องกัน consent popup loop)
  //    → reload หน้า → LIFF ยัง login → Case B auto-login
  // ============================================================
  const register = async (membNo, phone, otpCode, cardLast4) => {
    if (!lineProfile || !lineAccessToken) {
      toast.error("ไม่พบข้อมูล LINE");
      return { success: false };
    }

    try {
      const devId = deviceId || (await getDeviceId());
      const netType = getNetworkTypeForAPI(); // ✅ API: LINE→cellular

      // Pre-check
      try {
        const checkRes = await liffAuthAPI.checkLineUser(lineAccessToken);
        if (checkRes.data.data.exists) {
          console.log("[Register] Already registered → auto-login");
          toast.success("บัญชีนี้ลงทะเบียนแล้ว กำลังเข้าสู่ระบบ...", {
            duration: 3000,
          });
          setLoading(true);
          await handleLiffLogin(lineAccessToken, devId, netType);
          return { success: true, alreadyRegistered: true };
        }
      } catch (checkErr) {
        if (checkErr.response?.status !== 404) {
          console.warn("[Register] Pre-check failed:", checkErr.message);
        }
      }

      const response = await liffAuthAPI.register({
        line_access_token: lineAccessToken,
        line_display_name: lineProfile.displayName,
        line_picture_url: lineProfile.pictureUrl || "",
        memb_no: membNo,
        phone: phone,
        card_last4: cardLast4,
        otp_code: otpCode,
        device_id: devId,
        network_type: netType, // ✅ API: LINE→cellular
      });

      if (response.data.success) {
        toast.success("ลงทะเบียนสำเร็จ! กำลังเข้าสู่ระบบ...");

        try {
          const loginResponse = await withTimeout(
            liffAuthAPI.loginWithLiff({
              line_access_token: lineAccessToken,
              line_display_name: lineProfile.displayName,
              line_picture_url: lineProfile.pictureUrl || "",
              device_id: devId,
              network_type: netType, // ✅ API: LINE→cellular
            }),
            API_CALL_TIMEOUT,
            "Auto-login timeout",
          );

          const {
            access_token,
            refresh_token,
            user: userData,
          } = loginResponse.data.data;

          localStorage.setItem("access_token", access_token);
          localStorage.setItem("refresh_token", refresh_token);
          localStorage.setItem("user", JSON.stringify(userData));

          setUser(userData);
          setNeedsRegistration(false);

          toast.success("เข้าสู่ระบบสำเร็จ!", { duration: 2000 });
          navigate("/my-loans", { replace: true });

          return { success: true };
        } catch (loginErr) {
          // ⚠️ CRITICAL FIX: register สำเร็จ + login fail
          //    ห้าม liff.logout() → ห้าม clear session
          //    reload → LIFF ยัง login → Case B → สำเร็จ
          console.error("[Register] Auto-login failed:", loginErr);
          toast.success("ลงทะเบียนสำเร็จ! กำลังเข้าสู่ระบบอัตโนมัติ...", {
            duration: 3000,
          });
          setNeedsRegistration(false);
          setTimeout(() => {
            window.location.reload();
          }, 1500);
          return { success: true };
        }
      }
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "ลงทะเบียนไม่สำเร็จ";

      if (
        message.includes("ลงทะเบียนแล้ว") ||
        message.includes("ถูกใช้แล้ว") ||
        message.includes("เชื่อมต่อแล้ว") ||
        message.includes("already") ||
        message.includes("duplicate")
      ) {
        toast.success("ลงทะเบียนแล้ว กำลังเข้าสู่ระบบอัตโนมัติ...", {
          duration: 3000,
        });
        try {
          const devId = deviceId || (await getDeviceId());
          const netType = getNetworkTypeForAPI(); // ✅ API
          setLoading(true);
          await handleLiffLogin(lineAccessToken, devId, netType);
          return { success: true, alreadyRegistered: true };
        } catch (e) {
          console.error("[Register] Auto-login after duplicate failed:", e);
          setTimeout(() => {
            window.location.reload();
          }, 1500);
          return { success: true, alreadyRegistered: true };
        }
      } else if (message.includes("เครื่องนี้ลงทะเบียน")) {
        toast.error("เครื่องนี้ลงทะเบียนกับบัญชีอื่นแล้ว กรุณาติดต่อสหกรณ์", {
          duration: 5000,
        });
      } else if (
        message.includes("ไม่ตรง") ||
        message.includes("ไม่ถูกต้อง") ||
        message.includes("not match")
      ) {
        toast.error("เลขสมาชิก เบอร์โทร หรือเลขบัตรประชาชนไม่ตรงกับข้อมูลในระบบ", {
          duration: 5000,
        });
      } else {
        toast.error(message);
      }

      return { success: false, error: message };
    }
  };

  // ============================================================
  // ✅ Clear Cache — ล้างแคชของ Web Browser / LINE Browser
  //    ล้าง localStorage, sessionStorage, Cache API, Service Workers
  //    แล้ว reload หน้าใหม่
  // ============================================================
  const clearCache = useCallback(async (options = {}) => {
    const { keepDeviceId = false, doReload = true, doLogout = true } = options;

    console.log("[ClearCache] Starting...", {
      keepDeviceId,
      doReload,
      doLogout,
    });

    try {
      // 1) LIFF logout (ถ้าต้องการ)
      if (doLogout) {
        try {
          if (liff.isLoggedIn?.()) {
            liff.logout();
            console.log("[ClearCache] LIFF logged out");
          }
        } catch (e) {
          console.warn("[ClearCache] LIFF logout error:", e);
        }
      }

      // 2) สำรอง device_id ถ้าต้องการเก็บไว้
      const savedDeviceId = keepDeviceId
        ? localStorage.getItem("device_id")
        : null;

      // 3) ล้าง localStorage
      localStorage.clear();
      console.log("[ClearCache] localStorage cleared");

      // 4) คืน device_id (ถ้าเก็บไว้)
      if (savedDeviceId) {
        localStorage.setItem("device_id", savedDeviceId);
        console.log("[ClearCache] device_id restored");
      }

      // 5) ล้าง sessionStorage
      sessionStorage.clear();
      console.log("[ClearCache] sessionStorage cleared");

      // 6) ล้าง Cache API (Service Worker Caches)
      if ("caches" in window) {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map((name) => caches.delete(name)));
          console.log(
            "[ClearCache] Cache API cleared:",
            cacheNames.length,
            "caches",
          );
        } catch (e) {
          console.warn("[ClearCache] Cache API error:", e);
        }
      }

      // 7) Unregister Service Workers
      if ("serviceWorker" in navigator) {
        try {
          const registrations =
            await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((reg) => reg.unregister()));
          console.log(
            "[ClearCache] Service Workers unregistered:",
            registrations.length,
          );
        } catch (e) {
          console.warn("[ClearCache] SW unregister error:", e);
        }
      }

      // 8) Clear React state
      setUser(null);
      setLineProfile(null);
      setLineAccessToken(null);
      setIsLoggedIn(false);
      setNeedsRegistration(false);

      console.log("[ClearCache] ✅ All done!");

      // 9) Reload with cache-busting
      if (doReload) {
        localStorage.setItem("just_logged_out", "true"); // ★ skip loading screen
        toast.success("ล้างแคชสำเร็จ! กำลังโหลดใหม่...", { duration: 2000 });
        setTimeout(() => {
          // cache-busting: เพิ่ม query param เพื่อบังคับ reload ใหม่
          const url = new URL(window.location.href);
          url.searchParams.set("_cb", Date.now());
          window.location.href = url.origin + "/?_cb=" + Date.now();
        }, 1000);
      }

      return true;
    } catch (error) {
      console.error("[ClearCache] Error:", error);
      toast.error("ล้างแคชไม่สำเร็จ กรุณาลองใหม่");
      return false;
    }
  }, []);

  // ============================================================
  // ✅ Logout
  // ============================================================
  const logout = () => {
    try {
      if (liff.isLoggedIn?.()) {
        liff.logout();
      }
    } catch (e) {
      console.warn("[Logout] LIFF error:", e);
    }

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.setItem("just_logged_out", "true"); // ★ skip loading screen
    setUser(null);
    setLineProfile(null);
    setLineAccessToken(null);
    setIsLoggedIn(false);
    setNeedsRegistration(false);

    window.location.href = "/";
  };

  const isAdmin = () => user?.role === "ADMIN";
  const isOfficer = () => user?.role === "OFFICER";
  const isUser = () => user?.role === "USER";
  const isStaff = () => ["ADMIN", "OFFICER"].includes(user?.role);

  const value = {
    user,
    lineProfile,
    lineAccessToken,
    liffReady,
    isLoggedIn,
    loading,
    needsRegistration,
    deviceId,
    networkType, // ✅ ค่าจริง (สำหรับ UI)
    wifiDismissed,
    isInLineBrowser, // ✅ ให้ Login.jsx ใช้
    isCommitteeMember,
    pdpaConsentRequired,
    pdpaInfoPageEnabled,
    loginWithLine,
    register,
    requestOTP,
    verifyOTP,
    logout,
    recheckNetwork,
    dismissWifiWarning,
    clearCache,
    isAdmin,
    isOfficer,
    isUser,
    isStaff,
    navigateByRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
