/**
 * Shared Icons — import จากที่เดียว ลดโค้ดซ้ำ
 * Usage: import { IconUser, IconPhone } from '../components/Icons'
 */

const S = { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, viewBox: "0 0 24 24" }

// ── General ──
export const IconUser = ({ className = "w-5 h-5" }) => (
  <svg className={className} {...S}><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5.523 0-10 3.477-10 6v2h20v-2c0-2.523-4.477-6-10-6Z" /></svg>
)
export const IconPhone = ({ className = "w-5 h-5" }) => (
  <svg className={className} {...S}><path d="M3 5.5C3 14.06 9.94 21 18.5 21c.386 0 .765-.014 1.138-.042.395-.03.593-.044.79-.162a1.035 1.035 0 0 0 .381-.381c.118-.197.191-.395.191-.79v-2.625a1 1 0 0 0-.715-.958l-3.167-.792a1 1 0 0 0-.949.22l-1.487 1.338a.75.75 0 0 1-.83.11 11.5 11.5 0 0 1-4.77-4.77.75.75 0 0 1 .11-.83l1.337-1.487a1 1 0 0 0 .22-.949l-.791-3.167A1 1 0 0 0 8.5 5H5.875c-.395 0-.593.073-.79.191a1.035 1.035 0 0 0-.381.381c-.118.197-.162.395-.162.79-.028.373-.042.752-.042 1.138Z" /></svg>
)
export const IconHash = ({ className = "w-5 h-5" }) => (
  <svg className={className} {...S}><path d="M4 10h16M4 14h16M9 4l-2 16M17 4l-2 16" /></svg>
)
export const IconLogout = ({ className = "w-5 h-5" }) => (
  <svg className={className} {...S}><path d="M16 12H4m12 0-4 4m4-4-4-4m3-4h2a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3h-2" /></svg>
)
export const IconBuilding = ({ className = "w-5 h-5" }) => (
  <svg className={className} {...S}><path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0H5m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4" /></svg>
)
export const IconTrash = ({ className = "w-5 h-5" }) => (
  <svg className={className} {...S}><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
)

// ── MyLoans ──
export const IconFile = ({ className = "w-5 h-5" }) => (
  <svg className={className} {...S}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></svg>
)
export const IconCalendar = ({ className = "w-5 h-5" }) => (
  <svg className={className} {...S}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
)
export const IconClock = ({ className = "w-5 h-5" }) => (
  <svg className={className} {...S}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
)
export const IconMapPin = ({ className = "w-5 h-5" }) => (
  <svg className={className} {...S}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0Z" /><circle cx="12" cy="10" r="3" /></svg>
)

// ── Chevron ──
export const IconChevronDown = ({ className = "w-5 h-5" }) => (
  <svg className={className} {...S}><path d="M19 9l-7 7-7-7" /></svg>
)
export const IconCheckList = ({ className = "w-5 h-5" }) => (
  <svg className={className} {...S}><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4" /></svg>
)

// ── Layout ──
export const IconCreditCard = ({ className = "w-5 h-5" }) => (
  <svg className={className} {...S}><path d="M3 10h18M7 15h2m4 0h2M6 5h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" /></svg>
)
export const IconMenu = ({ className = "w-6 h-6" }) => (
  <svg className={className} {...S}><path d="M4 6h16M4 12h16M4 18h16" /></svg>
)
export const IconClose = ({ className = "w-6 h-6" }) => (
  <svg className={className} {...S}><path d="M6 18L18 6M6 6l12 12" /></svg>
)

// ── Register ──
export const IconIdCard = ({ className = "w-5 h-5" }) => (
  <svg className={className} {...S}><path d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15A2.25 2.25 0 0 0 2.25 6.75v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" /></svg>
)
export const IconCheckCircle = ({ className = "w-5 h-5" }) => (
  <svg className={className} {...S}><path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
)
export const IconAlertCircle = ({ className = "w-5 h-5" }) => (
  <svg className={className} {...S}><path d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
)
export const IconShield = ({ className = "w-5 h-5" }) => (
  <svg className={className} {...S}><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016Z" /></svg>
)
export const IconKey = ({ className = "w-5 h-5" }) => (
  <svg className={className} {...S}><path d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" /></svg>
)
export const IconCopy = ({ className = "w-5 h-5" }) => (
  <svg className={className} {...S}><path d="M8 16H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2m-6 12h8a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2Z" /></svg>
)
export const IconPaste = ({ className = "w-5 h-5" }) => (
  <svg className={className} {...S}><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4" /></svg>
)

// ── Special (filled) ──
export const IconLine = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" /></svg>
)
export const IconSpinner = ({ className = "w-5 h-5" }) => (
  <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
)
