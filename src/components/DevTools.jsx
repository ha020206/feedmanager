// 개발용 데이터베이스 초기화 도구
// ⚠️ 개발 중에만 사용하세요!

import { useState } from 'react';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { resetAllData, resetUsers, resetCurriculums } from '../utils/dbReset';

export default function DevTools() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleResetAll = async () => {
    if (!confirm('⚠️ 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      setLoading(true);
      setResult(null);
      const result = await resetAllData();
      setResult({
        success: true,
        message: `✅ 초기화 완료! (사용자: ${result.usersDeleted}개, 커리큘럼: ${result.curriculumsDeleted}개 삭제)`
      });
      // 로컬 스토리지도 초기화
      localStorage.clear();
      alert('데이터베이스가 초기화되었습니다. 페이지를 새로고침하세요.');
      window.location.reload();
    } catch (error) {
      setResult({
        success: false,
        message: `❌ 오류: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetUsers = async () => {
    if (!confirm('사용자 데이터만 삭제하시겠습니까?')) {
      return;
    }

    try {
      setLoading(true);
      setResult(null);
      const result = await resetUsers();
      setResult({
        success: true,
        message: `✅ ${result.count}개의 사용자 데이터가 삭제되었습니다.`
      });
    } catch (error) {
      setResult({
        success: false,
        message: `❌ 오류: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  // 개발 환경에서만 표시
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-red-300 rounded-lg shadow-xl p-4 max-w-sm z-50">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-5 h-5 text-red-500" />
        <h3 className="font-bold text-gray-800">개발자 도구</h3>
      </div>
      
      <div className="space-y-2">
        <button
          onClick={handleResetAll}
          disabled={loading}
          className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              초기화 중...
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              전체 데이터 초기화
            </>
          )}
        </button>
        
        <button
          onClick={handleResetUsers}
          disabled={loading}
          className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          사용자 데이터만 삭제
        </button>
      </div>

      {result && (
        <div className={`mt-3 p-2 rounded text-sm ${
          result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {result.message}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-3">
        ⚠️ 개발 환경에서만 표시됩니다
      </p>
    </div>
  );
}

