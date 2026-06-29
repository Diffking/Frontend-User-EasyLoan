/**
 * ConsentPopup - PDPA: ขอความยินยอมให้คณะกรรมการดูข้อมูลคำขอกู้
 * แสดงทีละรายการ (loan ที่ committee_consent ยังเป็น null) จนกว่าจะตอบครบ
 */
import { useState } from "react";
import { mortgageAPI } from "../api/axios";
import toast from "react-hot-toast";
import { IconShield } from "./Icons";

const ConsentPopup = ({ loan, onAnswered }) => {
  const [submitting, setSubmitting] = useState(false);

  const handleAnswer = async (consent) => {
    try {
      setSubmitting(true);
      await mortgageAPI.setConsent(loan.id, consent);
      toast.success(consent ? "บันทึกความยินยอมแล้ว" : "บันทึกการไม่ยินยอมแล้ว");
      onAnswered(loan.id, consent);
    } catch (e) {
      toast.error(e.response?.data?.error || "บันทึกไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm p-6 text-center">
        <div className="w-14 h-14 mx-auto mb-3 bg-teal-50 rounded-2xl flex items-center justify-center">
          <IconShield className="w-7 h-7 text-teal-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">ขอความยินยอม</h3>
        <p className="text-sm text-gray-600 text-left leading-relaxed mb-3">
          สหกรณ์ฯ ขอความยินยอมจากท่านในการให้คณะกรรมการ (ที่ได้รับมอบหมาย)
          เข้าดูข้อมูลคำขอกู้ของท่าน เพื่อการตรวจสอบ/ติดตามตามระเบียบสหกรณ์
          ภายใต้ พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)
        </p>
        <p className="text-xs text-gray-500 text-left bg-gray-50 rounded-xl p-3 mb-4">
          ข้อมูลที่จะแสดง: ชื่อ-สกุล, เลขสมาชิก, ยอดกู้, ประเภท/สถานะคำขอกู้
        </p>
        <p className="text-sm font-medium text-gray-700 mb-4">
          ท่านยินยอมหรือไม่?
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => handleAnswer(false)}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium disabled:opacity-50"
          >
            ไม่ยินยอม
          </button>
          <button
            onClick={() => handleAnswer(true)}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium shadow-md shadow-teal-200/50 disabled:opacity-50"
          >
            ยินยอม ✓
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentPopup;
