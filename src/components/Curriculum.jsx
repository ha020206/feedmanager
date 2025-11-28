import { useState, useEffect } from 'react';
import { Loader2, Sparkles, Target, TrendingUp, Check } from 'lucide-react';
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

  useEffect(() => {
    loadCurriculum();
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

      // 모든 스텝이 완료되면 새 커리큘럼 생성
      if (allStepsCompleted) {
        console.log('✅ 모든 스텝 완료! 새 커리큘럼 생성 시작');
        // 완료된 스텝 정보를 전달하여 새 커리큘럼 생성 (다음 번호부터 시작)
        await generateNewCurriculum(newCompletedSteps);
      }
    } catch (error) {
      console.error('스텝 완료 처리 오류:', error);
      alert('스텝 완료 처리 중 오류가 발생했습니다.');
    }
  };

  const generateNewCurriculum = async (allCompletedSteps = []) => {
    try {
      console.log('🔄 새 커리큘럼 생성 시작');
      console.log('완료된 스텝:', allCompletedSteps);
      console.log('프로필 데이터:', profileData);
      
      setLoading(true);
      
      // 이전에 완료한 스텝들을 고려하여 새 커리큘럼 생성
      // completedSteps를 전달하면 다음 번호부터 시작 (예: 1-5 완료 시 6부터 시작)
      const newSteps = await generateCurriculum(profileData, allCompletedSteps);
      
      console.log('✅ 생성된 새 커리큘럼:', newSteps);
      
      if (!newSteps || newSteps.length === 0) {
        throw new Error('커리큘럼 생성 실패: 빈 배열 반환');
      }
      
      // 상태 업데이트
      setCurriculum(newSteps);
      setCompletedSteps([]);

      // Firebase 업데이트
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
      
      alert('모든 스텝을 완료했습니다! 새로운 로드맵이 생성되었습니다.');
      console.log('🎉 새 커리큘럼 생성 및 저장 완료!');
    } catch (error) {
      console.error('❌ 새 커리큘럼 생성 오류:', error);
      console.error('에러 상세:', error.stack);
      alert(`새 커리큘럼 생성 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setLoading(false);
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
            
            return (
              <div
                key={step.step}
                onClick={() => !isCompleted && setSelectedStep(step)}
                className={`group relative p-5 bg-gradient-to-r from-gray-50 to-white border-l-4 rounded-lg transition-all ${
                  isCompleted 
                    ? 'border-green-500 opacity-60 cursor-not-allowed' 
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
