/**
 * OfflineIndicator - แจ้งเตือนเมื่อไม่มีอินเทอร์เน็ต (User Theme)
 * แสดง banner สีแดงด้านบนสุด พร้อม auto-hide เมื่อกลับ online
 */

import { useState, useEffect } from 'react';

const OfflineIndicator = () => {
  const [online, setOnline] = useState(navigator.onLine);
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      setShowBack(true);
      // ซ่อน "กลับ online แล้ว" หลัง 3 วินาที
      setTimeout(() => setShowBack(false), 3000);
    };
    const handleOffline = () => {
      setOnline(false);
      setShowBack(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ไม่แสดงอะไรเลย
  if (online && !showBack) return null;

  // กลับ online แล้ว
  if (online && showBack) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[100] animate-slide-down">
        <div className="bg-emerald-500 text-white text-center py-2 px-4 text-sm font-medium flex items-center justify-center gap-2 shadow-lg">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" />
          </svg>
          กลับออนไลน์แล้ว — ข้อมูลกำลังอัพเดท
        </div>
      </div>
    );
  }

  // Offline
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] animate-slide-down">
      <div className="bg-red-500 text-white text-center py-2 px-4 text-sm font-medium flex items-center justify-center gap-2 shadow-lg">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 11-12.728 0M12 9v4m0 4h.01" />
        </svg>
        ไม่มีการเชื่อมต่ออินเทอร์เน็ต — ข้อมูลอาจไม่เป็นปัจจุบัน
      </div>
    </div>
  );
};

export default OfflineIndicator;
