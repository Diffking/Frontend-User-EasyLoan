/**
 * PullToRefresh - ดึงลงเพื่อรีเฟรชข้อมูล
 * ใช้ touch events สำหรับ mobile/LIFF
 * 
 * Usage:
 * <PullToRefresh onRefresh={fetchData} refreshing={isRefreshing}>
 *   <YourContent />
 * </PullToRefresh>
 */

import { useState, useRef, useCallback } from 'react';

const THRESHOLD = 80;   // ดึงกี่ px ถึงจะ trigger
const MAX_PULL = 120;   // ดึงได้สูงสุดกี่ px

const PullToRefresh = ({ children, onRefresh, refreshing = false }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [pulling, setPulling] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef(null);

  const handleTouchStart = useCallback((e) => {
    // เริ่ม pull ได้เฉพาะตอนอยู่บนสุดของ scroll
    if (window.scrollY === 0 && !refreshing) {
      startY.current = e.touches[0].clientY;
      setPulling(true);
    }
  }, [refreshing]);

  const handleTouchMove = useCallback((e) => {
    if (!pulling || refreshing) return;
    
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY.current);
    
    if (distance > 0) {
      // ใช้ diminishing return effect (ยิ่งดึงยิ่งหนืด)
      const dampened = Math.min(distance * 0.5, MAX_PULL);
      setPullDistance(dampened);
    }
  }, [pulling, refreshing]);

  const handleTouchEnd = useCallback(() => {
    if (!pulling) return;
    setPulling(false);

    if (pullDistance >= THRESHOLD && onRefresh && !refreshing) {
      onRefresh();
    }
    setPullDistance(0);
  }, [pulling, pullDistance, onRefresh, refreshing]);

  const progress = Math.min(pullDistance / THRESHOLD, 1);
  const isReady = pullDistance >= THRESHOLD;

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull indicator */}
      <div
        className="flex flex-col items-center justify-end overflow-hidden transition-all duration-150 ease-out"
        style={{ height: refreshing ? 56 : pullDistance > 5 ? pullDistance : 0 }}
      >
        {refreshing ? (
          <div className="flex items-center gap-2 pb-3">
            <div className="w-5 h-5 border-2 border-teal-200 border-t-teal-500 rounded-full animate-spin" />
            <span className="text-xs text-teal-500 font-medium">กำลังอัพเดท...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center pb-3">
            {/* Arrow icon */}
            <div
              className="transition-transform duration-200"
              style={{ transform: `rotate(${isReady ? 180 : 0}deg)` }}
            >
              <svg className={`w-5 h-5 ${isReady ? 'text-teal-500' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
            <span className={`text-xs mt-1 font-medium ${isReady ? 'text-teal-500' : 'text-gray-300'}`}>
              {isReady ? 'ปล่อยเพื่อรีเฟรช' : 'ดึงลงเพื่อรีเฟรช'}
            </span>
            {/* Progress bar */}
            {pullDistance > 10 && (
              <div className="w-16 h-1 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${isReady ? 'bg-teal-400' : 'bg-gray-300'}`}
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {children}
    </div>
  );
};

export default PullToRefresh;
