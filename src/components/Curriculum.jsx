import { useState, useEffect, useRef } from 'react';
import { Loader2, Sparkles, Target, TrendingUp, Check, RefreshCw } from 'lucide-react';
import { generateCurriculum } from '../api/gemini';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import PostGenerator from './PostGenerator';

export default function Curriculum({ profileData, userId, onPostSaved }) {
  const [curriculum, setCurriculum] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStep, setSelectedStep] = useState(null);
  const [curriculumDocId, setCurriculumDocId] = useState(null);
  const isGeneratingRef = useRef(false); // 중복 생성 방지 플래그
  const abortControllerRef = useRef(null); // 취소 컨트롤러

  useEffect(() => {
    loadCurriculum();
    
    // cleanup: 컴포넌트 언마운트 시 진행 중인 작업 취소
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [userId]);

  const loadCurriculum = async () => {
    try {
      // Firebase에서 기존 커리큘럼 확인
      const q = query(collection(db, 'curriculums'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // 기존 커리큘럼 사용
        const docData = querySnapshot.docs[0];
        const data = docData.data();
        setCurriculum(data.steps);
        setCompletedSteps(data.completedSteps || []);
        setCurriculumDocId(docData.id);
      } else {
        // 새 커리큘럼 생성
        const steps = await generateCurriculum(profileData);
        setCurriculum(steps);

        // Firebase에 저장
        const docRef = await addDoc(collection(db, 'curriculums'), {
          userId,
          steps,
          completedSteps: [],
          createdAt: new Date().toISOString()
        });
        setCurriculumDocId(docRef.id);
      }
    } catch (error) {
      console.error('커리큘럼 로드 오류:', error);
      alert('커리큘럼을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleStepComplete = async (completedStep) => {
    try {
      // 완료된 스텝 추가
      const newCompletedSteps = [...completedSteps, completedStep.step];
      setCompletedSteps(newCompletedSteps);

      // Firebase에 완료 상태 저장
      if (curriculumDocId) {
        await updateDoc(doc(db, 'curriculums', curriculumDocId), {
          completedSteps: newCompletedSteps
        });
      }

      // 모든 스텝이 완료되었는지 확인
      const allStepsCompleted = curriculum && curriculum.length > 0 && curriculum.every(step => 
        newCompletedSteps.includes(step.step)
      );

      console.log('스텝 완료 체크:', {
        completedStep: completedStep.step,
        newCompletedSteps,
        curriculumLength: curriculum?.length,
        allStepsCompleted
      });

      // 자동 생성 제거: 사용자가 완료된 커리큘럼을 클릭할 때만 새 커리큘럼 생성
      // 모든 스텝이 완료되면 사용자에게 알림만 표시
      if (allStepsCompleted) {
        console.log('✅ 모든 스텝 완료! 완료된 커리큘럼을 클릭하면 새 로드맵이 생성됩니다.');
      }
    } catch (error) {
      console.error('스텝 완료 처리 오류:', error);
      alert('스텝 완료 처리 중 오류가 발생했습니다.');
    }
  };

  // 완료된 커리큘럼 클릭 시 새 커리큘럼 생성
  const handleCompletedStepClick = async () => {
    // 이미 생성 중이면 중복 호출 방지
    if (loading) {
      console.log('⚠️ 이미 커리큘럼 생성 중입니다.');
      return;
    }

    // 모든 스텝이 완료되었는지 확인
    const allStepsCompleted = curriculum && curriculum.length > 0 && curriculum.every(step => 
      completedSteps.includes(step.step)
    );

    if (allStepsCompleted && completedSteps.length > 0) {
      console.log('✅ 완료된 커리큘럼 클릭! 새 커리큘럼 생성 시작');
      await generateNewCurriculum(completedSteps);
    }
  };

  const generateNewCurriculum = async (allCompletedSteps = []) => {
    // 중복 생성 방지
    if (isGeneratingRef.current) {
      console.log('⚠️ 이미 커리큘럼 생성 중입니다. 중복 호출 무시.');
      return;
    }

    // AbortController 생성
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      isGeneratingRef.current = true;
      console.log('🔄 새 커리큘럼 생성 시작');
      console.log('완료된 스텝:', allCompletedSteps);
      console.log('프로필 데이터:', profileData);
      
      setLoading(true);
      
      // 이전에 완료한 스텝들을 고려하여 새 커리큘럼 생성
      // completedSteps를 전달하면 다음 번호부터 시작 (예: 1-5 완료 시 6부터 시작)
      const newSteps = await generateCurriculum(profileData, allCompletedSteps);
      
      // 취소되었는지 확인
      if (signal.aborted) {
        console.log('⚠️ 커리큘럼 생성이 취소되었습니다.');
        return;
      }
      
      console.log('✅ 생성된 새 커리큘럼:', newSteps);
      
      if (!newSteps || newSteps.length === 0) {
        throw new Error('커리큘럼 생성 실패: 빈 배열 반환');
      }

      // Firebase 업데이트를 먼저 완료 (중요: 상태 업데이트 전에 Firebase 저장)
      if (curriculumDocId) {
        await updateDoc(doc(db, 'curriculums', curriculumDocId), {
          steps: newSteps,
          completedSteps: [],
          updatedAt: new Date().toISOString()
        });
        console.log('✅ Firebase에 새 커리큘럼 저장 완료');
      } else {
        // curriculumDocId가 없으면 새로 생성
        console.log('⚠️ curriculumDocId가 없어 새 문서 생성');
        const docRef = await addDoc(collection(db, 'curriculums'), {
          userId,
          steps: newSteps,
          completedSteps: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        setCurriculumDocId(docRef.id);
        console.log('✅ 새 커리큘럼 문서 생성 완료:', docRef.id);
      }
      
      // 취소되었는지 다시 확인
      if (signal.aborted) {
        console.log('⚠️ Firebase 저장 후 취소되었습니다.');
        return;
      }
      
      // Firebase 저장 완료 후 상태 업데이트
      setCurriculum(newSteps);
      setCompletedSteps([]);
      
      alert('모든 스텝을 완료했습니다! 새로운 로드맵이 생성되었습니다.');
      console.log('🎉 새 커리큘럼 생성 및 저장 완료!');
    } catch (error) {
      // 취소된 경우는 에러로 처리하지 않음
      if (signal.aborted) {
        console.log('⚠️ 작업이 취소되었습니다.');
        return;
      }
      
      console.error('❌ 새 커리큘럼 생성 오류:', error);
      console.error('에러 상세:', error.stack);
      alert(`새 커리큘럼 생성 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setLoading(false);
      isGeneratingRef.current = false; // 생성 완료 후 플래그 해제
      abortControllerRef.current = null;
    }
  };

  const handlePostSave = () => {
    if (selectedStep) {
      handleStepComplete(selectedStep);
    }
    if (onPostSaved) {
      onPostSaved();
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">포트폴리오 로드맵을 생성하고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Target className="w-6 h-6 text-purple-500" />
          <h2 className="text-2xl font-bold text-gray-800">포트폴리오 로드맵</h2>
        </div>
        <p className="text-gray-600 mb-6">
          {profileData.interest} 분야의 전문성을 보여주는 단계별 포트폴리오 구축 가이드
        </p>

        <div className="space-y-3">
          {curriculum && curriculum.map((step, index) => {
            const isCompleted = completedSteps.includes(step.step);
            const allStepsCompleted = curriculum && curriculum.length > 0 && curriculum.every(s => 
              completedSteps.includes(s.step)
            );
            
            // 완료된 스텝 클릭 핸들러: 모든 스텝이 완료되었을 때만 새 커리큘럼 생성
            const handleClick = () => {
              if (isCompleted && allStepsCompleted) {
                handleCompletedStepClick();
              } else if (!isCompleted) {
                setSelectedStep(step);
              }
            };
            
            return (
              <div
                key={step.step}
                onClick={handleClick}
                className={`group relative p-5 bg-gradient-to-r from-gray-50 to-white border-l-4 rounded-lg transition-all ${
                  isCompleted 
                    ? allStepsCompleted
                      ? 'border-green-500 cursor-pointer hover:shadow-md hover:opacity-80' 
                      : 'border-green-500 opacity-60 cursor-not-allowed'
                    : 'border-purple-500 cursor-pointer hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white shadow-lg">
                        <Check className="w-6 h-6" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {step.step}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg font-bold mb-1 transition-colors ${
                      isCompleted ? 'text-gray-400 line-through' : 'text-gray-800 group-hover:text-purple-600'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm ${
                      isCompleted ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                  {!isCompleted && (
                    <TrendingUp className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors flex-shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 모든 스텝 완료 시 새 로드맵 생성 버튼 */}
        {curriculum && curriculum.length > 0 && curriculum.every(step => 
          completedSteps.includes(step.step)
        ) && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleCompletedStepClick}
              disabled={loading || isGeneratingRef.current}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading || isGeneratingRef.current ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>새 로드맵 생성 중...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  <span>새 로드맵 생성하기</span>
                </>
              )}
            </button>
            <p className="text-sm text-gray-500 text-center mt-3">
              모든 스텝을 완료했습니다! 새로운 로드맵을 생성하시겠어요?
            </p>
          </div>
        )}
      </div>

      {selectedStep && (
        <PostGenerator
          step={selectedStep}
          profileData={profileData}
          userId={userId}
          onClose={() => setSelectedStep(null)}
          onSave={handlePostSave}
        />
      )}
    </div>
  );
}
