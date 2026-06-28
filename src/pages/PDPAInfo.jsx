import { useState, useEffect, useCallback } from "react";
import { committeeAPI } from "../api/axios";
import { IconShield, IconSpinner } from "../components/Icons";

function PDPAInfo() {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchArticle = useCallback(async () => {
    try {
      const res = await committeeAPI.pdpaStatus();
      setArticle(res?.data?.data || null);
    } catch {
      setArticle(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  return (
    <div className="space-y-4 pb-6">
      <div className="relative bg-gradient-to-br from-teal-500 via-teal-400 to-cyan-400 rounded-2xl p-6 text-white shadow-lg shadow-teal-200/40">
        <div className="flex items-center gap-2 mb-1">
          <IconShield className="w-5 h-5" />
          <h1 className="font-bold">ข้อควรรู้: PDPA</h1>
        </div>
        <p className="text-sm text-teal-50">
          การคุ้มครองข้อมูลด้านสินเชื่อภายในสหกรณ์
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <IconSpinner className="w-8 h-8 text-teal-500 animate-spin" />
        </div>
      ) : !article?.article_content ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-12 px-6">
          <p className="text-gray-500">ยังไม่มีบทความ</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          {article.article_title && (
            <h2 className="font-bold text-gray-800 mb-3">
              {article.article_title}
            </h2>
          )}
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {article.article_content}
          </p>
        </div>
      )}
    </div>
  );
}

export default PDPAInfo;
