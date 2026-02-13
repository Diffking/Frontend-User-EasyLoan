import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { IconUser, IconPhone, IconBuilding, IconLogout, IconLine, IconHash, IconTrash, IconSpinner } from '../components/Icons'

const Profile = () => {
  const { user, lineProfile, logout, clearCache } = useAuth()
  const [showClearCacheConfirm, setShowClearCacheConfirm] = useState(false)
  const [clearingCache, setClearingCache] = useState(false)

  const getRoleBadge = (role) => {
    const roles = {
      ADMIN: { bg: 'bg-red-100 text-red-700 border-red-200', label: 'ผู้ดูแลระบบ' },
      OFFICER: { bg: 'bg-cyan-100 text-cyan-700 border-cyan-200', label: 'เจ้าหน้าที่' },
      USER: { bg: 'bg-teal-100 text-teal-700 border-teal-200', label: 'สมาชิก' },
    }
    const r = roles[role] || roles.USER
    return <span className={`px-3 py-1 rounded-full text-sm font-medium border ${r.bg}`}>{r.label}</span>
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Profile Card */}
      <div className="bg-white/80 backdrop-blur-sm border border-teal-100 rounded-2xl shadow-xl shadow-teal-100/50 p-6">
        <div className="text-center">
          {/* Avatar */}
          <div className="inline-block relative">
            {lineProfile?.pictureUrl ? (
              <img 
                src={lineProfile.pictureUrl} 
                alt={lineProfile.displayName}
                className="w-24 h-24 rounded-full border-4 border-teal-200 shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-white">
                  {user?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
            )}
          </div>

          {/* Name & Role */}
          <h2 className="text-xl font-bold text-gray-800 mt-4">
            {user?.full_name || lineProfile?.displayName || 'ผู้ใช้'}
          </h2>
          <div className="mt-3">
            {getRoleBadge(user?.role)}
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center space-x-3 p-4 bg-teal-50 rounded-xl border border-teal-100">
            <IconHash className="w-5 h-5 text-teal-500" />
            <div>
              <p className="text-xs text-teal-600">เลขสมาชิก</p>
              <p className="font-medium text-gray-800">{user?.memb_no || '-'}</p>
            </div>
          </div>

          {user?.dept_name && (
            <div className="flex items-center space-x-3 p-4 bg-cyan-50 rounded-xl border border-cyan-100">
              <IconBuilding className="w-5 h-5 text-cyan-500" />
              <div>
                <p className="text-xs text-cyan-600">หน่วยงาน</p>
                <p className="font-medium text-gray-800">{user.dept_name}</p>
              </div>
            </div>
          )}

          {user?.phone && (
            <div className="flex items-center space-x-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <IconPhone className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-xs text-emerald-600">เบอร์โทร</p>
                <p className="font-medium text-gray-800">{user.phone}</p>
              </div>
            </div>
          )}
        </div>

        {/* LINE Connected */}
        <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#00B900] rounded-full flex items-center justify-center">
              <IconLine className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">เชื่อมต่อ LINE แล้ว</p>
              <p className="text-green-800">{lineProfile?.displayName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Clear Cache Button */}
      <button
        onClick={() => setShowClearCacheConfirm(true)}
        className="w-full flex items-center justify-center space-x-2 py-4 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 font-medium rounded-xl transition-all duration-200"
      >
        <IconTrash className="w-5 h-5" />
        <span>ล้างแคชเบราว์เซอร์</span>
      </button>

      {/* Logout Button */}
      <button
        onClick={logout}
        className="w-full flex items-center justify-center space-x-2 py-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-red-200"
      >
        <IconLogout className="w-5 h-5" />
        <span>ออกจากระบบ</span>
      </button>

      {/* ✅ Clear Cache Confirmation Modal */}
      {showClearCacheConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowClearCacheConfirm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
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
    </div>
  )
}

export default Profile
