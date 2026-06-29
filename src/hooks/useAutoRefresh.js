/**
 * useAutoRefresh - Visibility-aware Auto Refresh Hook
 * 
 * ฟีเจอร์:
 * - Auto refresh ตามความถี่ที่กำหนด
 * - หยุด refresh เมื่อ tab ไม่ active (ประหยัด server)
 * - Refresh ทันทีเมื่อกลับมา active
 * - หยุด refresh เมื่อ offline
 * - Expose online/offline status
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export function useAutoRefresh(fetchFn, options = {}) {
  const {
    intervalMs = 15_000,    // ความถี่ refresh (default 15 วินาที)
    enabled = true,          // เปิด/ปิด auto refresh
    refreshOnFocus = true,   // refresh ทันทีเมื่อกลับมา active
  } = options;

  const [refreshing, setRefreshing] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const isFirstLoad = useRef(true);
  const intervalRef = useRef(null);
  const fetchRef = useRef(fetchFn);

  // เก็บ fetchFn ล่าสุดไว้ใน ref (ไม่ trigger re-render)
  useEffect(() => {
    fetchRef.current = fetchFn;
  }, [fetchFn]);

  // Silent refresh (ไม่แสดง full loading)
  const silentRefresh = useCallback(async () => {
    if (!navigator.onLine) return; // ไม่ fetch ถ้า offline
    try {
      if (!isFirstLoad.current) setRefreshing(true);
      await fetchRef.current();
    } catch (err) {
      console.error('Auto refresh error:', err);
    } finally {
      setRefreshing(false);
      isFirstLoad.current = false;
    }
  }, []);

  // Manual refresh (สำหรับ pull-to-refresh หรือปุ่ม refresh)
  const manualRefresh = useCallback(async () => {
    if (!navigator.onLine) return;
    try {
      setRefreshing(true);
      await fetchRef.current();
    } catch (err) {
      console.error('Manual refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // จัดการ interval
  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (intervalMs > 0) {
      intervalRef.current = setInterval(silentRefresh, intervalMs);
    }
  }, [intervalMs, silentRefresh]);

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      // กลับ online → refresh ทันที + เริ่ม interval ใหม่
      if (enabled) {
        silentRefresh();
        startInterval();
      }
    };
    const handleOffline = () => {
      setOnline(false);
      stopInterval(); // หยุด polling เมื่อ offline
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enabled, silentRefresh, startInterval, stopInterval]);

  // Visibility change detection (tab active/inactive)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        // กลับมา active → refresh ทันที + เริ่ม interval
        if (enabled && navigator.onLine) {
          if (refreshOnFocus) silentRefresh();
          startInterval();
        }
      } else {
        // ไม่ active → หยุด interval
        stopInterval();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [enabled, refreshOnFocus, silentRefresh, startInterval, stopInterval]);

  // Initial fetch + start interval
  useEffect(() => {
    if (enabled) {
      silentRefresh();
      startInterval();
    }
    return stopInterval;
  }, [enabled, silentRefresh, startInterval, stopInterval]);

  return {
    refreshing,
    online,
    manualRefresh,
    isFirstLoad: isFirstLoad.current,
  };
}

export default useAutoRefresh;
