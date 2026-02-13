import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { IconUser, IconHash, IconPhone, IconIdCard, IconCheckCircle, IconAlertCircle, IconLine, IconSpinner, IconShield, IconKey, IconCopy, IconPaste } from '../components/Icons'

const Register = () => {
  const { lineProfile, register, requestOTP, verifyOTP, loading, networkType, wifiDismissed, dismissWifiWarning, recheckNetwork } = useAuth()

  // Steps: 1=กรอกข้อมูล, 2=กรอก OTP, 3=สำเร็จ
  const [step, setStep] = useState(1)

  // Form data
  const [membNo, setMembNo] = useState('')
  const [phone, setPhone] = useState('')
  const [cardLast4, setCardLast4] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpVerified, setOtpVerified] = useState(false)

  // ✅ OTP Display (ได้จาก backend response)
  const [displayOtp, setDisplayOtp] = useState('')
  const [copied, setCopied] = useState(false)
  const [autoFilled, setAutoFilled] = useState(false)

  // State
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [otpTimer, setOtpTimer] = useState(0)
  const [otpSent, setOtpSent] = useState(false)
  const timerRef = useRef(null)
  const otpInputRef = useRef(null)

  // OTP Timer countdown
  useEffect(() => {
    if (otpTimer > 0) {
      timerRef.current = setTimeout(() => setOtpTimer(otpTimer - 1), 1000)
    }
    return () => clearTimeout(timerRef.current)
  }, [otpTimer])

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const t = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(t)
    }
  }, [copied])

  const formatPhone = (value) => {
    return value.replace(/\D/g, '').slice(0, 10)
  }

  const formatCardLast4 = (value) => {
    return value.replace(/\D/g, '').slice(0, 4)
  }

  // ✅ เติม 0 ข้างหน้าให้ครบ 5 หลัก (เช่น 7337 → 07337, 25 → 00025)
  const formatMembNo = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 5)
    return digits
  }
  const padMembNo = (value) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length === 0) return ''
    return digits.padStart(5, '0')
  }

  // ============================================================
  // ✅ Copy OTP to clipboard
  // ============================================================
  const handleCopyOtp = async () => {
    if (!displayOtp) return
    try {
      await navigator.clipboard.writeText(displayOtp)
      setCopied(true)
    } catch (err) {
      // Fallback สำหรับ LINE browser ที่ไม่ support clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = displayOtp
      textArea.style.position = 'fixed'
      textArea.style.left = '-9999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        setCopied(true)
      } catch (e) {
        console.error('Copy failed:', e)
      }
      document.body.removeChild(textArea)
    }
  }

  // ============================================================
  // ✅ Auto-fill OTP into input
  // ============================================================
  const handleAutoFill = () => {
    if (!displayOtp) return
    setOtpCode(displayOtp)
    setAutoFilled(true)
    setTimeout(() => setAutoFilled(false), 2000)
    // Focus input
    if (otpInputRef.current) {
      otpInputRef.current.focus()
    }
  }

  // ============================================================
  // Step 1: ขอ OTP
  // ============================================================
  const handleRequestOTP = async (e) => {
    e.preventDefault()
    setError('')

    if (!membNo.trim()) { setError('กรุณากรอกเลขสมาชิก'); return }

    // ✅ เติม 0 ข้างหน้าให้ครบ 5 หลัก อัตโนมัติ
    const paddedMembNo = padMembNo(membNo)
    setMembNo(paddedMembNo)

    if (!phone.trim()) { setError('กรุณากรอกเบอร์โทรศัพท์'); return }
    if (phone.length !== 10) { setError('เบอร์โทรศัพท์ต้องมี 10 หลัก'); return }
    if (!phone.startsWith('0')) { setError('เบอร์โทรศัพท์ต้องขึ้นต้นด้วย 0'); return }

    if (!cardLast4.trim()) { setError('กรุณากรอกเลขบัตรประชาชน 4 หลักสุดท้าย'); return }
    if (cardLast4.length !== 4) { setError('กรุณากรอกเลขบัตรประชาชนให้ครบ 4 หลัก'); return }

    setSubmitting(true)
    const result = await requestOTP(paddedMembNo, phone.trim(), cardLast4.trim())
    setSubmitting(false)

    if (result.success) {
      setOtpSent(true)
      setOtpTimer(300) // 5 minutes

      // ✅ เก็บ OTP ที่ได้จาก backend เพื่อแสดงในหน้าเว็บ
      if (result.data?.otp_code) {
        setDisplayOtp(result.data.otp_code)
      }

      setStep(2)
    } else if (result.error) {
      setError(result.error)
    }
  }

  // ============================================================
  // Step 2: ยืนยัน OTP แล้วลงทะเบียน
  // ============================================================
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault()
    setError('')

    if (!otpCode.trim()) { setError('กรุณากรอกรหัส OTP'); return }
    if (otpCode.length !== 6) { setError('OTP ต้องมี 6 หลัก'); return }

    setSubmitting(true)

    // ลงทะเบียน (backend จะ verify OTP ด้วย)
    const result = await register(padMembNo(membNo), phone.trim(), otpCode.trim(), cardLast4.trim())
    setSubmitting(false)

    if (!result.success && result.error) {
      setError(result.error)
    }
  }

  // ขอ OTP ใหม่
  const handleResendOTP = async () => {
    if (otpTimer > 0) return
    setError('')
    setOtpCode('')
    setDisplayOtp('')
    setCopied(false)
    setAutoFilled(false)
    setSubmitting(true)
    const result = await requestOTP(padMembNo(membNo), phone.trim(), cardLast4.trim())
    setSubmitting(false)

    if (result.success) {
      setOtpTimer(300)
      // ✅ อัพเดท OTP ใหม่
      if (result.data?.otp_code) {
        setDisplayOtp(result.data.otp_code)
      }
    }
  }

  // กลับไปขั้นตอนก่อนหน้า
  const handleBack = () => {
    setStep(1)
    setOtpCode('')
    setOtpSent(false)
    setOtpVerified(false)
    setDisplayOtp('')
    setCopied(false)
    setAutoFilled(false)
    setError('')
    setOtpTimer(0)
  }

  // Format timer
  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50">
        <div className="text-center">
          <IconSpinner className="w-10 h-10 text-teal-600 mx-auto" />
          <p className="text-teal-700 mt-4">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-2xl shadow-lg shadow-teal-200/50 mb-4 p-3 border border-teal-100">
            <img src="/assets/images/logo.png" alt="SPSC Logo" className="w-full h-full object-contain"
              onError={(e) => { e.target.style.display = 'none' }} />
          </div>
          <h1 className="text-2xl font-bold text-teal-800">ลงทะเบียนเข้าใช้งาน</h1>
          <p className="text-teal-600 mt-1">สหกรณ์ออมทรัพย์สาธารณสุขสงขลา จำกัด</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${step >= 1 ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
          <div className={`w-12 h-1 ${step >= 2 ? 'bg-teal-500' : 'bg-gray-200'}`} />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${step >= 2 ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
        </div>

        {/* Registration Box */}
        <div className="bg-white/80 backdrop-blur-sm border border-teal-100 rounded-2xl shadow-xl shadow-teal-100/50 p-6">
          {/* ✅ WiFi Warning (dismissible) */}
          {networkType === "wifi" && !wifiDismissed && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm font-medium mb-2">⚠️ ตรวจพบ WiFi — แนะนำให้ใช้เน็ตมือถือ</p>
              <div className="flex space-x-2">
                <button type="button" onClick={recheckNetwork}
                  className="flex-1 py-2 text-xs bg-white border border-red-200 text-red-700 rounded-lg active:scale-95">
                  🔄 ตรวจสอบอีกครั้ง
                </button>
                <button type="button" onClick={dismissWifiWarning}
                  className="flex-1 py-2 text-xs bg-red-600 text-white rounded-lg active:scale-95">
                  ✅ ปิด WiFi แล้ว
                </button>
              </div>
            </div>
          )}

          {/* LINE Profile */}
          {lineProfile && (
            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl mb-6 border border-green-200">
              <img src={lineProfile.pictureUrl} alt={lineProfile.displayName}
                className="w-14 h-14 rounded-full border-2 border-green-400 shadow-md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <IconLine className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">เชื่อมต่อ LINE แล้ว</span>
                </div>
                <p className="font-semibold text-gray-800 truncate">{lineProfile.displayName}</p>
              </div>
              <IconCheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start">
              <IconAlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-red-600 text-sm">{error}</span>
            </div>
          )}

          {/* ============================================================ */}
          {/* Step 1: กรอกเลขสมาชิก + เบอร์โทร → ขอ OTP */}
          {/* ============================================================ */}
          {step === 1 && (
            <>
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <IconShield className="w-5 h-5 text-teal-600" />
                  <h3 className="font-semibold text-teal-800">ขั้นตอนที่ 1: ยืนยันตัวตน</h3>
                </div>
                <p className="text-sm text-gray-600 pl-7">
                  กรอกเลขสมาชิก เบอร์โทร และเลขบัตรประชาชน 4 หลักสุดท้าย เพื่อรับ OTP
                </p>
              </div>

              <form onSubmit={handleRequestOTP} className="space-y-5">
                {/* เลขสมาชิก */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <IconHash className="w-4 h-4 mr-2 text-teal-600" />
                    เลขสมาชิก
                  </label>
                  <input type="text" inputMode="numeric" value={membNo}
                    onChange={(e) => setMembNo(formatMembNo(e.target.value))}
                    onBlur={() => { if (membNo.trim()) setMembNo(padMembNo(membNo)) }}
                    className="w-full px-4 py-3 bg-white border-2 border-teal-100 rounded-xl text-gray-800 text-center text-xl tracking-widest placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all"
                    placeholder="00025" disabled={submitting} autoFocus />
                  <p className="text-xs text-gray-500 mt-2 text-center">เลขสมาชิก เช่น 25 → ระบบจะเติมเป็น 00025 ให้อัตโนมัติ</p>
                </div>

                {/* เบอร์โทร */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <IconPhone className="w-4 h-4 mr-2 text-teal-600" />
                    เบอร์โทรศัพท์
                  </label>
                  <input type="tel" inputMode="numeric" value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    className="w-full px-4 py-3 bg-white border-2 border-teal-100 rounded-xl text-gray-800 text-center text-xl tracking-widest placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all"
                    placeholder="0812345678" disabled={submitting} maxLength={10} />
                  <p className="text-xs text-gray-500 mt-2 text-center">เบอร์โทรที่ลงทะเบียนกับสหกรณ์</p>
                </div>

                {/* เลขบัตรประชาชน 4 หลักสุดท้าย */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <IconIdCard className="w-4 h-4 mr-2 text-teal-600" />
                    เลขบัตรประชาชน 4 หลักสุดท้าย
                  </label>
                  <input type="text" inputMode="numeric" value={cardLast4}
                    onChange={(e) => setCardLast4(formatCardLast4(e.target.value))}
                    className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-gray-800 text-center text-xl tracking-[0.5em] placeholder-gray-400 focus:outline-none focus:ring-2 transition-all
                      ${cardLast4.length === 4
                        ? 'border-green-400 focus:border-green-400 focus:ring-green-100'
                        : 'border-teal-100 focus:border-teal-400 focus:ring-teal-100'
                      }`}
                    placeholder="●●●●" disabled={submitting} maxLength={4} />
                  {cardLast4.length === 4 && (
                    <p className="text-xs text-green-600 mt-2 text-center flex items-center justify-center space-x-1">
                      <IconCheckCircle className="w-3.5 h-3.5" />
                      <span>กรอกครบ 4 หลักแล้ว</span>
                    </p>
                  )}
                  {cardLast4.length > 0 && cardLast4.length < 4 && (
                    <p className="text-xs text-gray-500 mt-2 text-center">กรอกอีก {4 - cardLast4.length} หลัก</p>
                  )}
                </div>

                <button type="submit" disabled={submitting || !membNo.trim() || phone.length !== 10 || cardLast4.length !== 4}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-teal-200">
                  {submitting ? (
                    <><IconSpinner className="w-5 h-5" /><span>กำลังส่ง OTP...</span></>
                  ) : (
                    <><IconKey className="w-5 h-5" /><span>ขอรหัส OTP</span></>
                  )}
                </button>
              </form>
            </>
          )}

          {/* ============================================================ */}
          {/* Step 2: กรอก OTP → ลงทะเบียน */}
          {/* ============================================================ */}
          {step === 2 && (
            <>
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <IconKey className="w-5 h-5 text-teal-600" />
                  <h3 className="font-semibold text-teal-800">ขั้นตอนที่ 2: กรอก OTP</h3>
                </div>
                <p className="text-sm text-gray-600 pl-7">
                  กรอกรหัส OTP 6 หลัก หรือกดปุ่มกรอกอัตโนมัติด้านล่าง
                </p>
              </div>

              {/* OTP Timer */}
              {otpTimer > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
                  <p className="text-sm text-blue-700">
                    OTP หมดอายุใน <span className="font-bold text-blue-800">{formatTimer(otpTimer)}</span>
                  </p>
                </div>
              )}
              {otpTimer === 0 && otpSent && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                  <p className="text-sm text-amber-700">OTP หมดอายุแล้ว กรุณาขอรหัสใหม่</p>
                </div>
              )}

              {/* ============================================================ */}
              {/* ✅ OTP Display Card - แสดง OTP พร้อมปุ่ม Copy + Auto-fill */}
              {/* ============================================================ */}
              {displayOtp && otpTimer > 0 && (
                <div className="mb-5 p-4 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-2 border-teal-200 rounded-2xl relative overflow-hidden">
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-teal-100/50 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-emerald-100/50 rounded-full translate-y-1/2 -translate-x-1/2" />
                  
                  <div className="relative">
                    {/* Header */}
                    <div className="flex items-center justify-center space-x-2 mb-3">
                      <IconLine className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                        ส่ง OTP ไปที่ LINE แล้ว
                      </span>
                    </div>

                    {/* OTP Digits */}
                    <div className="flex items-center justify-center space-x-2 mb-3">
                      {displayOtp.split('').map((digit, idx) => (
                        <div key={idx}
                          className="w-11 h-14 flex items-center justify-center bg-white border-2 border-teal-300 rounded-xl text-2xl font-bold text-teal-800 font-mono shadow-sm">
                          {digit}
                        </div>
                      ))}
                    </div>

                    <p className="text-center text-xs text-gray-500 mb-3">
                      รหัส OTP ของคุณ (ส่งไปที่ LINE กลุ่มแล้วด้วย)
                    </p>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      {/* Copy Button */}
                      <button
                        type="button"
                        onClick={handleCopyOtp}
                        className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                          ${copied 
                            ? 'bg-green-500 text-white' 
                            : 'bg-white border-2 border-teal-200 text-teal-700 hover:bg-teal-50 active:scale-95'
                          }`}
                      >
                        {copied ? (
                          <><IconCheckCircle className="w-4 h-4" /><span>คัดลอกแล้ว!</span></>
                        ) : (
                          <><IconCopy className="w-4 h-4" /><span>คัดลอก OTP</span></>
                        )}
                      </button>

                      {/* Auto-fill Button */}
                      <button
                        type="button"
                        onClick={handleAutoFill}
                        className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                          ${autoFilled 
                            ? 'bg-green-500 text-white' 
                            : 'bg-teal-500 text-white hover:bg-teal-600 active:scale-95 shadow-md shadow-teal-200'
                          }`}
                      >
                        {autoFilled ? (
                          <><IconCheckCircle className="w-4 h-4" /><span>กรอกแล้ว!</span></>
                        ) : (
                          <><IconPaste className="w-4 h-4" /><span>กรอกอัตโนมัติ</span></>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleVerifyAndRegister} className="space-y-5">
                {/* OTP Input */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <IconKey className="w-4 h-4 mr-2 text-teal-600" />
                    รหัส OTP
                  </label>
                  <input
                    ref={otpInputRef}
                    type="text" inputMode="numeric" value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className={`w-full px-4 py-4 bg-white border-2 rounded-xl text-gray-800 text-center text-3xl tracking-[0.5em] placeholder-gray-300 focus:outline-none focus:ring-2 transition-all font-mono
                      ${otpCode.length === 6 
                        ? 'border-green-400 focus:border-green-400 focus:ring-green-100' 
                        : 'border-teal-100 focus:border-teal-400 focus:ring-teal-100'
                      }`}
                    placeholder="000000" disabled={submitting} maxLength={6} autoFocus />
                  {otpCode.length === 6 && (
                    <p className="text-xs text-green-600 mt-2 text-center flex items-center justify-center space-x-1">
                      <IconCheckCircle className="w-3.5 h-3.5" />
                      <span>กรอก OTP ครบแล้ว กดปุ่มยืนยันด้านล่าง</span>
                    </p>
                  )}
                </div>

                {/* ลงทะเบียน Button */}
                <button type="submit" disabled={submitting || otpCode.length !== 6}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-teal-200">
                  {submitting ? (
                    <><IconSpinner className="w-5 h-5" /><span>กำลังลงทะเบียน...</span></>
                  ) : (
                    <><IconUser className="w-5 h-5" /><span>ยืนยันและลงทะเบียน</span></>
                  )}
                </button>

                {/* ขอ OTP ใหม่ / กลับ */}
                <div className="flex items-center justify-between">
                  <button type="button" onClick={handleBack}
                    className="text-sm text-gray-500 hover:text-gray-700 underline">
                    ← กลับแก้ไขข้อมูล
                  </button>
                  <button type="button" onClick={handleResendOTP}
                    disabled={otpTimer > 0 || submitting}
                    className="text-sm text-teal-600 hover:text-teal-800 disabled:text-gray-400 underline">
                    {otpTimer > 0 ? `ขอ OTP ใหม่ (${formatTimer(otpTimer)})` : 'ขอ OTP ใหม่'}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Help Note */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start">
              <IconAlertCircle className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                <strong>หากพบปัญหา:</strong> กรุณาตรวจสอบว่าเลขสมาชิก เบอร์โทร และเลขบัตรประชาชน 4 หลักสุดท้าย ตรงกับที่ลงทะเบียนไว้กับสหกรณ์ หากยังไม่สามารถลงทะเบียนได้ กรุณาติดต่อเจ้าหน้าที่
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-teal-600/70 text-sm mt-6">© 2026 SPSC LoanEasy</p>
      </div>
    </div>
  )
}

export default Register
