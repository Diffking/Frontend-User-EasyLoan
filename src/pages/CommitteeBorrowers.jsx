import { useState, useEffect, useCallback } from "react";
import { committeeAPI } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import PullToRefresh from "../components/PullToRefresh";
import {
  IconUser,
  IconHash,
  IconCalendar,
  IconShield,
  IconAlertCircle,
  IconSpinner,
} from "../components/Icons";

const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

function formatAmount(n) {
  if (n === null || n === undefined) return null;
  return Number(n).toLocaleString("th-TH");
}

function CommitteeBorrowers() {
  const { isCommitteeMember } = useAuth();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [borrowers, setBorrowers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBorrowers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await committeeAPI.borrowers({ year, month, limit: 100 });
      setBorrowers(res?.data?.data?.borrowers || []);
      setTotal(res?.data?.data?.total || 0);
    } catch (e) {
      setError(
        e.response?.data?.error || "ไม่สามารถโหลดรายชื่อผู้กู้ได้",
      );
      setBorrowers([]);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    if (isCommitteeMember) fetchBorrowers();
  }, [isCommitteeMember, fetchBorrowers]);

  const changeMonth = (delta) => {
    let m = month + delta;
    let y = year;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    setMonth(m);
    setYear(y);
  };

  if (!isCommitteeMember) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-16 px-6">
        <IconShield className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">หน้านี้สำหรับคณะกรรมการเท่านั้น</p>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={fetchBorrowers} refreshing={loading}>
      <div className="space-y-4">
        <div className="relative bg-gradient-to-br from-teal-500 via-teal-400 to-cyan-400 rounded-2xl p-5 text-white shadow-lg shadow-teal-200/40">
          <div className="flex items-center gap-2 mb-1">
            <IconShield className="w-5 h-5" />
            <h1 className="font-bold">รายชื่อผู้กู้</h1>
          </div>
          <p className="text-sm text-teal-50">สำหรับคณะกรรมการ — ดูได้ทุกเดือน</p>
        </div>

        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
          <button
            onClick={() => changeMonth(-1)}
            className="px-3 py-1.5 rounded-lg text-teal-600 hover:bg-teal-50 font-medium"
          >
            ◀
          </button>
          <span className="font-semibold text-gray-700 flex items-center gap-2">
            <IconCalendar className="w-4 h-4 text-teal-500" />
            {THAI_MONTHS[month - 1]} {year + 543}
          </span>
          <button
            onClick={() => changeMonth(1)}
            className="px-3 py-1.5 rounded-lg text-teal-600 hover:bg-teal-50 font-medium"
          >
            ▶
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <IconSpinner className="w-8 h-8 text-teal-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
            <IconAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        ) : borrowers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-16 px-6">
            <IconUser className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">ไม่มีผู้กู้ในเดือนนี้</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-500 px-1">พบ {total} รายการ</p>
            <div className="space-y-3">
              {borrowers.map((b) => (
                <div
                  key={b.mortgage_id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800 flex items-center gap-2">
                      <IconUser className="w-4 h-4 text-teal-500" />
                      {b.borrower_name ?? "ไม่แสดงข้อมูล"}
                    </span>
                    {b.memb_no && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <IconHash className="w-3 h-3" />
                        {b.memb_no}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm">
                    {b.amount !== null && b.amount !== undefined && (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {formatAmount(b.amount)} บาท
                      </span>
                    )}
                    {b.loan_type_name && (
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                        {b.loan_type_name}
                      </span>
                    )}
                    {b.step_name && (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-100">
                        {b.step_name}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </PullToRefresh>
  );
}

export default CommitteeBorrowers;
