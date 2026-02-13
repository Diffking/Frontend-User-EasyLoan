import { useState, useEffect, useCallback } from "react";
import { mortgageAPI } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useAutoRefresh } from "../hooks/useAutoRefresh";
import PullToRefresh from "../components/PullToRefresh";
import {
  IconUser,
  IconFile,
  IconPhone,
  IconCalendar,
  IconClock,
  IconMapPin,
  IconChevronDown,
  IconCheckList,
} from "../components/Icons";

/* ═══════════════════════════════════════
   Step Config
   ═══════════════════════════════════════ */
const STEPS = {
  RECEIVED: {
    order: 1,
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  SURVEY: {
    order: 2,
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  PENDING_APPROVE: {
    order: 3,
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  APPROVED: {
    order: 4,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  REJECTED: {
    order: 5,
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  },
  COMPLETED: {
    order: 6,
    bg: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-200",
  },
};
const TOTAL_STEPS = 6;

/* ═══════════════════════════════════════
   เอกสารที่ต้องเตรียม (ชุดเดียว — ใช้ทุก step)
   ═══════════════════════════════════════ */
const REQUIRED_DOCS = [
  {
    category: "เอกสารส่วนตัว",
    icon: "👤",
    color: "teal",
    items: [
      "สำเนาบัตรประชาชน (ผู้กู้)",
      "สำเนาทะเบียนบ้าน (ผู้กู้)",
      "สำเนาทะเบียนสมรส / ใบหย่า / ใบมรณบัตรคู่สมรส (ถ้ามี)",
      "สำเนาบัตรประชาชน (คู่สมรส — ถ้ามี)",
    ],
  },
  {
    category: "เอกสารทางการเงิน",
    icon: "💰",
    color: "emerald",
    items: [
      "สลิปเงินเดือนย้อนหลัง 3 เดือน",
      "หนังสือรับรองเงินเดือน (ฉบับจริง)",
      "สำเนาบัญชีธนาคาร (Statement) ย้อนหลัง 6 เดือน",
      "หนังสือยินยอมให้หักเงินเดือน ณ ที่จ่าย",
    ],
  },
  {
    category: "เอกสารผู้ค้ำประกัน",
    icon: "🤝",
    color: "blue",
    items: [
      "สำเนาบัตรประชาชน (ผู้ค้ำประกัน)",
      "สำเนาทะเบียนบ้าน (ผู้ค้ำประกัน)",
      "สลิปเงินเดือนผู้ค้ำประกัน",
      "หนังสือยินยอมค้ำประกัน",
    ],
  },
  {
    category: "เอกสารหลักประกัน",
    icon: "🏠",
    color: "amber",
    items: [
      "โฉนดที่ดิน / นส.3 ก. (ฉบับจริง)",
      "สำเนาโฉนดที่ดินทุกหน้า",
      "แผนที่ตั้งหลักประกัน",
      "ภาพถ่ายหลักประกัน (ด้านหน้า, ด้านข้าง, ภายใน)",
    ],
  },
  {
    category: "เอกสารวันทำสัญญา",
    icon: "📝",
    color: "purple",
    items: [
      "บัตรประชาชนตัวจริง (ผู้กู้ + คู่สมรส + ผู้ค้ำ)",
      "สำเนาหน้าสมุดบัญชีธนาคารสำหรับรับเงินกู้",
      "โฉนดที่ดินฉบับจริง (กรณีจดจำนอง)",
      "อากรแสตมป์ตามวงเงินกู้",
    ],
  },
];

/* ═══════════════════════════════════════
   Color utility
   ═══════════════════════════════════════ */
const DOC_COLORS = {
  teal: {
    bg: "bg-teal-50",
    border: "border-teal-100",
    text: "text-teal-700",
    dot: "bg-teal-400",
  },
  emerald: {
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    text: "text-emerald-700",
    dot: "bg-emerald-400",
  },
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-100",
    text: "text-blue-700",
    dot: "bg-blue-400",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-100",
    text: "text-amber-700",
    dot: "bg-amber-400",
  },
  purple: {
    bg: "bg-purple-50",
    border: "border-purple-100",
    text: "text-purple-700",
    dot: "bg-purple-400",
  },
  cyan: {
    bg: "bg-cyan-50",
    border: "border-cyan-100",
    text: "text-cyan-700",
    dot: "bg-cyan-400",
  },
  red: {
    bg: "bg-red-50",
    border: "border-red-100",
    text: "text-red-700",
    dot: "bg-red-400",
  },
};

/* ── Documents Accordion ── */
const DocsAccordion = () => {
  const [open, setOpen] = useState(false);
  const totalItems = REQUIRED_DOCS.reduce(
    (sum, cat) => sum + cat.items.length,
    0,
  );

  return (
    <div className="rounded-xl border border-orange-100 overflow-hidden bg-gradient-to-br from-orange-50/80 to-amber-50/50">
      {/* Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-orange-100/60 transition-colors"
      >
        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
          <IconCheckList className="w-4 h-4 text-orange-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-bold text-gray-700">เอกสารที่ต้องเตรียม</p>
          <p className="text-xs text-gray-400">
            {REQUIRED_DOCS.length} หมวด · {totalItems} รายการ
          </p>
        </div>
        <div
          className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        >
          <IconChevronDown className="w-5 h-5 text-gray-400" />
        </div>
      </button>

      {/* Content */}
      <div
        className="overflow-hidden transition-all duration-400 ease-in-out"
        style={{ maxHeight: open ? "2000px" : "0", opacity: open ? 1 : 0 }}
      >
        <div className="px-4 pb-4 space-y-3">
          {REQUIRED_DOCS.map((cat, ci) => {
            const c = DOC_COLORS[cat.color] || DOC_COLORS.teal;
            return (
              <div
                key={ci}
                className={`rounded-lg border ${c.border} ${c.bg} p-3`}
              >
                {/* Category Header */}
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-base">{cat.icon}</span>
                  <p className={`text-xs font-bold ${c.text} tracking-wide`}>
                    {cat.category}
                  </p>
                </div>
                {/* Items */}
                <div className="space-y-2 ml-1">
                  {cat.items.map((item, ii) => (
                    <div key={ii} className="flex items-start gap-2.5">
                      <div
                        className={`w-1.5 h-1.5 ${c.dot} rounded-full mt-1.5 shrink-0`}
                      />
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Hint */}
          <div className="flex items-start gap-2 px-1 pt-1">
            <span className="text-xs text-amber-500 mt-0.5">💡</span>
            <p className="text-xs text-gray-400 leading-relaxed">
              เอกสารอาจแตกต่างตามประเภทสินเชื่อ
              สอบถามเพิ่มเติมได้ที่เจ้าหน้าที่ผู้ดูแล
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Appointment Card ── */
const AppointmentCard = ({ loan, formatDate }) => {
  if (!loan.appt_date) return null;
  return (
    <div className="p-4 bg-gradient-to-br from-cyan-50 to-sky-50 rounded-xl border border-cyan-100">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 bg-cyan-100 rounded-lg flex items-center justify-center">
          <IconCalendar className="w-3.5 h-3.5 text-cyan-600" />
        </div>
        <p className="text-xs font-bold text-cyan-700 tracking-wide">นัดหมาย</p>
      </div>
      <div className="space-y-1.5 ml-9">
        <div className="flex items-center gap-1.5">
          <IconClock className="w-3.5 h-3.5 text-cyan-400" />
          <p className="text-sm font-semibold text-cyan-800">
            {formatDate(loan.appt_date)}
            {loan.appt_time && ` เวลา ${loan.appt_time}`}
          </p>
        </div>
        {(loan.current_appt_name || loan.appt_location) && (
          <div className="flex items-center gap-1.5">
            <IconMapPin className="w-3.5 h-3.5 text-cyan-400" />
            <p className="text-xs text-cyan-600">
              {loan.current_appt_name}
              {loan.appt_location && ` — ${loan.appt_location}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Loan Card ── */
const LoanCard = ({ loan, formatDateShort, formatDate, onHide }) => {
  const step = STEPS[loan.current_step_code] || STEPS.RECEIVED;
  const isCompleted = loan.current_step_code === "COMPLETED";

  const [countdown, setCountdown] = useState(30);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!isCompleted) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setVisible(false);
          if (onHide) onHide(loan.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isCompleted]);

  // ── สิ้นสุด + หมดเวลา → ซ่อน ──
  if (isCompleted && !visible) return null;

  // ── สิ้นสุดแล้ว — แสดงข้อความสำเร็จ + นับถอยหลัง ──
  if (isCompleted) {
    return (
      <div
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-opacity duration-500"
        style={{ opacity: countdown <= 2 ? countdown / 2 : 1 }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex justify-end mb-2">
            <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-0.5 rounded-full">
              {formatDateShort(loan.created_at)}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-800 text-center leading-snug">
            {loan.loan_type_name}
          </h3>
        </div>

        {/* Success Message */}
        <div className="px-5 pb-5">
          <div className="relative bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl p-6 text-center border border-emerald-100 overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-emerald-100/40 rounded-full" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-teal-100/40 rounded-full" />

            <div className="relative">
              {/* Check icon */}
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200/50">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h4 className="text-lg font-bold text-emerald-700 mb-2">
                ดำเนินการสำเร็จ
              </h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                ธุรกรรมของคุณได้ดำเนินการสำเร็จแล้ว
              </p>
              <p className="text-sm text-gray-500 leading-relaxed mt-1">
                ตรวจสอบข้อมูลผ่าน
                <span className="font-semibold text-teal-600">แอปพลิเคชัน</span>
                หรือ
                <span className="font-semibold text-teal-600">
                  เว็บไซต์สอบถามข้อมูลสมาชิก
                </span>
              </p>

              {/* Countdown */}
              <div className="mt-4 text-xs text-gray-400">
                ข้อความนี้จะหายไปใน{" "}
                <span className="font-bold text-teal-500">{countdown}</span>{" "}
                วินาที
              </div>
            </div>
          </div>
        </div>

        {/* Officer */}
        <div className="px-5 py-3 bg-gray-50/80 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-teal-50 rounded-full flex items-center justify-center border border-teal-100">
              <IconUser className="w-3.5 h-3.5 text-teal-500" />
            </div>
            <p className="text-sm text-gray-500">
              เจ้าหน้าที่ :{" "}
              <span className="font-bold text-gray-700">
                {loan.officer_name || "-"}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── ปกติ — แสดงข้อมูลเต็ม ──
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex justify-end mb-2">
          <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-0.5 rounded-full">
            {formatDateShort(loan.created_at)}
          </span>
        </div>
        <h3 className="text-lg font-bold text-gray-800 text-center leading-snug">
          {loan.loan_type_name}
        </h3>
      </div>

      {/* Amount */}
      <div className="px-5 py-4 space-y-3">
        {/* วงเงินที่กู้ */}
        <div>
          <p className="text-xs text-gray-400 mb-1.5">วงเงินที่กู้</p>
          <div className="bg-gray-50/80 border border-gray-100 rounded-xl py-3 px-4 flex items-baseline justify-center">
            <span className="text-3xl font-extrabold text-teal-500 tracking-tight">
              {loan.amount?.toLocaleString()}
            </span>
            <span className="text-sm font-semibold text-teal-400 ml-1.5">
              บาท
            </span>
          </div>
        </div>

        {/* วงเงินอนุมัติ — แสดงเมื่อมีค่า */}
        {loan.approved_amount > 0 && step.order >= 4 && (
          <div className="pt-2 border-t border-gray-100">
            {/* Label + mini progress + % ในบรรทัดเดียว */}
            <div className="flex items-center gap-2.5 mb-1.5">
              <p className="text-xs text-gray-400">วงเงินอนุมัติ</p>
              {loan.amount > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        loan.approved_amount >= loan.amount
                          ? "bg-emerald-400"
                          : "bg-teal-400"
                      }`}
                      style={{
                        width: `${Math.min((loan.approved_amount / loan.amount) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      loan.approved_amount >= loan.amount
                        ? "text-emerald-500"
                        : "text-teal-500"
                    }`}
                  >
                    {((loan.approved_amount / loan.amount) * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
            <div className="bg-gray-50/80 border border-gray-100 rounded-xl py-3 px-4 flex items-baseline justify-center">
              <span className="text-3xl font-extrabold text-teal-600 tracking-tight">
                {loan.approved_amount?.toLocaleString()}
              </span>
              <span className="text-sm font-semibold text-teal-400 ml-1.5">
                บาท
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Step */}
      <div className="px-5 pb-4">
        <div className={`p-4 rounded-xl border ${step.bg} ${step.border}`}>
          <p className={`text-xs ${step.text} opacity-60 font-medium mb-0.5`}>
            ขั้นตอนปัจจุบัน
          </p>
          <p className={`font-bold ${step.text} leading-relaxed`}>
            {loan.current_step_name}
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-5 pb-4">
        <StepTimeline loan={loan} />
      </div>

      {/* Appointment + Documents — APPROVED only */}
      {loan.current_step_code === "APPROVED" && (
        <>
          {loan.appt_date && (
            <div className="px-5 pb-4">
              <AppointmentCard loan={loan} formatDate={formatDate} />
            </div>
          )}
          <div className="px-5 pb-4">
            <DocsAccordion />
          </div>
        </>
      )}

      {/* Officer */}
      <div className="px-5 py-3 bg-gray-50/80 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-teal-50 rounded-full flex items-center justify-center border border-teal-100">
            <IconUser className="w-3.5 h-3.5 text-teal-500" />
          </div>
          <p className="text-sm text-gray-500">
            เจ้าหน้าที่ :{" "}
            <span className="font-bold text-gray-700">
              {loan.officer_name || "-"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

/* ── Step Timeline ── */
const StepTimeline = ({ loan }) => {
  const [open, setOpen] = useState(false);
  const history = loan.step_history || loan.histories || [];
  
  // ถ้าไม่มี history data แสดง mini timeline จาก current step
  const currentStep = STEPS[loan.current_step_code] || STEPS.RECEIVED;
  const stepOrder = currentStep.order;

  const STEP_LIST = [
    { code: "RECEIVED", name: "รับเรื่อง", order: 1 },
    { code: "SURVEY", name: "สำรวจหลักทรัพย์", order: 2 },
    { code: "PENDING_APPROVE", name: "รออนุมัติ", order: 3 },
    { code: "APPROVED", name: "อนุมัติ", order: 4 },
    { code: "REJECTED", name: "ไม่อนุมัติ", order: 5 },
    { code: "COMPLETED", name: "สิ้นสุด", order: 6 },
  ].filter(s => {
    // ซ่อน REJECTED ถ้าไม่ได้ถูก reject
    if (s.code === "REJECTED" && loan.current_step_code !== "REJECTED") return false;
    // ซ่อน COMPLETED ถ้ายังไม่ถึง
    if (s.code === "COMPLETED" && loan.current_step_code !== "COMPLETED") return false;
    return true;
  });

  return (
    <div className="rounded-xl border border-teal-100 overflow-hidden bg-gradient-to-br from-teal-50/60 to-cyan-50/40">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 active:bg-teal-100/60 transition-colors"
      >
        <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center shrink-0">
          <IconClock className="w-4 h-4 text-teal-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-bold text-gray-700">ไทม์ไลน์</p>
          <p className="text-xs text-gray-400">ขั้นตอนที่ {Math.min(stepOrder, 4)} / {STEP_LIST.length}</p>
        </div>
        <div className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
          <IconChevronDown className="w-5 h-5 text-gray-400" />
        </div>
      </button>

      <div
        className="overflow-hidden transition-all duration-400 ease-in-out"
        style={{ maxHeight: open ? "800px" : "0", opacity: open ? 1 : 0 }}
      >
        <div className="px-5 pb-4 pt-1">
          {STEP_LIST.map((step, idx) => {
            const isPassed = step.order < stepOrder;
            const isCurrent = step.code === loan.current_step_code;
            const isFuture = step.order > stepOrder;
            const isLast = idx === STEP_LIST.length - 1;

            // หา date จาก history ถ้ามี
            const historyEntry = history.find(h => h.step_code === step.code || h.step_id === step.order);
            const dateStr = historyEntry?.created_at || historyEntry?.date;

            return (
              <div key={step.code} className="flex gap-3">
                {/* Timeline line + dot */}
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full border-2 shrink-0 ${
                    isCurrent 
                      ? "border-teal-500 bg-teal-500 shadow-md shadow-teal-200" 
                      : isPassed 
                        ? "border-teal-400 bg-teal-400" 
                        : "border-gray-200 bg-white"
                  }`}>
                    {isPassed && (
                      <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  {!isLast && (
                    <div className={`w-0.5 flex-1 min-h-[28px] ${isPassed ? "bg-teal-300" : "bg-gray-100"}`} />
                  )}
                </div>

                {/* Content */}
                <div className={`pb-4 ${isLast ? "pb-1" : ""}`}>
                  <p className={`text-sm font-semibold leading-tight ${
                    isCurrent ? "text-teal-700" : isPassed ? "text-gray-600" : "text-gray-300"
                  }`}>
                    {step.name}
                    {isCurrent && (
                      <span className="ml-2 text-xs bg-teal-100 text-teal-600 px-2 py-0.5 rounded-full font-bold">
                        ปัจจุบัน
                      </span>
                    )}
                  </p>
                  {dateStr && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ── Empty ── */
const EmptyState = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-16 px-6">
    <div className="w-20 h-20 mx-auto bg-teal-50 rounded-2xl flex items-center justify-center mb-4">
      <IconFile className="w-10 h-10 text-teal-200" />
    </div>
    <p className="text-gray-500 font-semibold">ยังไม่มีรายการสินเชื่อ</p>
    <p className="text-sm text-gray-400 mt-1">
      ติดต่อเจ้าหน้าที่เพื่อยื่นขอสินเชื่อ
    </p>
  </div>
);

/* ═══════════════════════════════════════
   Main: MyLoans Page
   ═══════════════════════════════════════ */
const MyLoans = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleHideLoan = (loanId) => {
    setLoans((prev) => prev.filter((l) => l.id !== loanId));
  };

  // ฟังก์ชันดึงข้อมูล
  const fetchMyLoans = useCallback(async () => {
    try {
      const response = await mortgageAPI.myLoans();
      setLoans(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch loans:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto refresh ทุก 15 วินาที + visibility-aware + offline detection
  const { refreshing, online, manualRefresh } = useAutoRefresh(fetchMyLoans, {
    intervalMs: 15_000,
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = d.getDate();
      const months = [
        "ม.ค.",
        "ก.พ.",
        "มี.ค.",
        "เม.ย.",
        "พ.ค.",
        "มิ.ย.",
        "ก.ค.",
        "ส.ค.",
        "ก.ย.",
        "ต.ค.",
        "พ.ย.",
        "ธ.ค.",
      ];
      return `${day} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
    } catch {
      return dateStr;
    }
  };

  const formatDateShort = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = d.getDate();
      const months = [
        "ม.ค.",
        "ก.พ.",
        "มี.ค.",
        "เม.ย.",
        "พ.ค.",
        "มิ.ย.",
        "ก.ค.",
        "ส.ค.",
        "ก.ย.",
        "ต.ค.",
        "พ.ย.",
        "ธ.ค.",
      ];
      const shortYear = String(d.getFullYear() + 543).slice(-2);
      return `${day} ${months[d.getMonth()]} ${shortYear}`;
    } catch {
      return dateStr;
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-10 h-10 border-3 border-teal-200 border-t-teal-500 rounded-full animate-spin" />
        <p className="text-sm text-gray-400">กำลังโหลด...</p>
      </div>
    );

  return (
    <PullToRefresh onRefresh={manualRefresh} refreshing={refreshing}>
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-teal-500 via-teal-400 to-cyan-400 rounded-2xl p-6 text-white shadow-lg shadow-teal-200/40 overflow-hidden">
        <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/10 rounded-full" />
        <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white/10 rounded-full" />
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 shrink-0">
            <IconUser className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <p className="text-teal-100 text-xs font-medium">สวัสดี</p>
            <h1 className="text-xl font-bold leading-tight truncate">
              {user?.full_name || "สมาชิก"}
            </h1>
            <p className="text-teal-100 text-sm mt-0.5">
              เลขสมาชิก: {user?.memb_no}
            </p>
          </div>
        </div>
      </div>

      {/* Section Title */}
      <div className="flex items-center gap-2 px-1">
        <div className="w-7 h-7 bg-teal-100 rounded-lg flex items-center justify-center">
          <IconFile className="w-4 h-4 text-teal-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-800">สินเชื่อของฉัน</h2>
        {/* Auto Refresh Indicator */}
        {refreshing && (
          <div className="w-4 h-4 border-2 border-teal-200 border-t-teal-500 rounded-full animate-spin" />
        )}
        {/* Offline badge */}
        {!online && (
          <span className="text-xs bg-red-50 text-red-500 font-medium px-2 py-0.5 rounded-full border border-red-100">
            ออฟไลน์
          </span>
        )}
        {loans.length > 0 && (
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-xs text-gray-400">ติดตามสัญญา</span>
            <span className="text-xs bg-teal-50 text-teal-600 font-bold px-2.5 py-0.5 rounded-full border border-teal-100">
              {loans.length}
            </span>
          </div>
        )}
      </div>

      {/* Cards */}
      {loans.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {loans.map((loan) => (
            <LoanCard
              key={loan.id}
              loan={loan}
              formatDateShort={formatDateShort}
              formatDate={formatDate}
              onHide={handleHideLoan}
            />
          ))}
        </div>
      )}
    </div>
    </PullToRefresh>
  );
};

export default MyLoans;