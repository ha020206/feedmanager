import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

export default function Onboarding({ email, onComplete }) {
  const [formData, setFormData] = useState({
    interest: '',
    interestOther: '',
    introduction: '',
    style: '',
    styleOther: '',
    targetAudience: '',
    targetAudienceOther: '',
    goal: '',
    goalOther: '',
    usp: '',
    uspOther: ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;

  // 선택 옵션들
  const interestOptions = [
    'F&B (식음료/카페)', 
    '패션/뷰티', 
    '헬스/웰니스', 
    '라이프스타일/리빙', 
    '교육/지식정보', 
    'IT/테크/스타트업', 
    '예술/디자인', 
    '부동산/재테크', 
    '기타'
  ];

  // 2. 스타일 -> '브랜드 무드'로 전문화
  const styleOptions = [
    '깔끔한', 
    '고급진', 
    '감성적인', 
    '개성있는', 
    '단정한', 
    '편안한', 
    '유행하는', 
    '기타'
  ];

  // 3. 타겟 독자 -> '마케팅 타겟 그룹'으로 일반화
  const targetAudienceOptions = [
    '2030 MZ 세대', 
    '3040 직장인/전문직', 
    '영유아 부모/주부', 
    'CEO/사업가/자영업자', 
    '취준생/학생', 
    '특정 취미 동호인', 
    '자기계발 러너', 
    '기타'
  ];

  // 4. 목표 -> '비즈니스 KPI' 관점으로 변경
  const goalOptions = [
    '브랜드 인지도 상승', 
    '제품/서비스 매출 증대', 
    '퍼스널 브랜딩 (강연/출판)', 
    '포트폴리오/아카이빙', 
    '커뮤니티/팬덤 형성', 
    '정보 공유 및 교육', 
    '기타'
  ];

  // 5. USP (차별점) -> '브랜드 페르소나' 유형으로 변경
  const uspOptions = [
    '검증된 전문가 (권위)', 
    '친근한 소통왕 (공감)', 
    '트렌드 세터 (감각)', 
    '정보 큐레이터 (분석)', 
    '성장하는 챌린저 (동기부여)', 
    '스토리텔러 (감성)', 
    '기타'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectChange = (field, value) => {
    if (value === '기타') {
      setFormData({
        ...formData,
        [field]: '기타',
        [`${field}Other`]: ''
      });
    } else {
      setFormData({
        ...formData,
        [field]: value,
        [`${field}Other`]: ''
      });
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // 최종 데이터 정리
      const finalData = {
        email: email,
        interest: formData.interest === '기타' ? formData.interestOther : formData.interest,
        introduction: formData.introduction,
        style: formData.style === '기타' ? formData.styleOther : formData.style,
        targetAudience: formData.targetAudience === '기타' ? formData.targetAudienceOther : formData.targetAudience,
        goal: formData.goal === '기타' ? formData.goalOther : formData.goal,
        usp: formData.usp === '기타' ? formData.uspOther : formData.usp
      };
      onComplete(finalData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.interest.trim() !== '' && (formData.interest !== '기타' || formData.interestOther.trim() !== '');
      case 2:
        return formData.introduction.trim() !== '';
      case 3:
        return formData.style.trim() !== '' && (formData.style !== '기타' || formData.styleOther.trim() !== '');
      case 4:
        return formData.targetAudience.trim() !== '' && (formData.targetAudience !== '기타' || formData.targetAudienceOther.trim() !== '');
      case 5:
        return formData.goal.trim() !== '' && (formData.goal !== '기타' || formData.goalOther.trim() !== '');
      case 6:
        return formData.usp.trim() !== '' && (formData.usp !== '기타' || formData.uspOther.trim() !== '');
      case 7:
        return true; // 마지막 단계는 확인만
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">관심 분야를 알려주세요</h2>
            <p className="text-gray-600">어떤 주제로 인스타그램을 운영하고 싶으신가요?</p>
            <div className="grid grid-cols-2 gap-3">
              {interestOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelectChange('interest', option)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    formData.interest === option
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {formData.interest === '기타' && (
              <input
                type="text"
                name="interestOther"
                value={formData.interestOther}
                onChange={handleChange}
                placeholder="관심 분야를 입력해주세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mt-2"
              />
            )}
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">간단한 자기소개</h2>
            <p className="text-gray-600">자신에 대해 간단히 소개해주세요.</p>
            <textarea
              name="introduction"
              value={formData.introduction}
              onChange={handleChange}
              placeholder="예: 커피를 좋아하는 프리랜서 디자이너입니다."
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">선호하는 스타일</h2>
            <p className="text-gray-600">어떤 스타일의 콘텐츠를 원하시나요?</p>
            <div className="grid grid-cols-2 gap-3">
              {styleOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelectChange('style', option)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    formData.style === option
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {formData.style === '기타' && (
              <input
                type="text"
                name="styleOther"
                value={formData.styleOther}
                onChange={handleChange}
                placeholder="스타일을 입력해주세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mt-2"
              />
            )}
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">타겟 독자</h2>
            <p className="text-gray-600">누가 내 글을 읽었으면 좋겠나요?</p>
            <div className="grid grid-cols-2 gap-3">
              {targetAudienceOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelectChange('targetAudience', option)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    formData.targetAudience === option
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {formData.targetAudience === '기타' && (
              <input
                type="text"
                name="targetAudienceOther"
                value={formData.targetAudienceOther}
                onChange={handleChange}
                placeholder="타겟 독자를 입력해주세요 (예: 30대 직장인, 다이어트에 실패한 사람들)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mt-2"
              />
            )}
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">구체적인 목표</h2>
            <p className="text-gray-600">계정을 통해 얻고 싶은 것이 무엇인가요?</p>
            <div className="grid grid-cols-2 gap-3">
              {goalOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelectChange('goal', option)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    formData.goal === option
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {formData.goal === '기타' && (
              <input
                type="text"
                name="goalOther"
                value={formData.goalOther}
                onChange={handleChange}
                placeholder="목표를 입력해주세요 (예: 내 서비스/상품 판매, 퍼스널 브랜딩)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mt-2"
              />
            )}
          </div>
        );
      case 6:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">나의 정체성/차별점</h2>
            <p className="text-gray-600">나는 어떤 사람인가요?</p>
            <div className="grid grid-cols-2 gap-3">
              {uspOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelectChange('usp', option)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    formData.usp === option
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {formData.usp === '기타' && (
              <input
                type="text"
                name="uspOther"
                value={formData.uspOther}
                onChange={handleChange}
                placeholder="정체성/차별점을 입력해주세요 (예: 10년 차 현직 개발자, 자취 5년 차 프로 자취러)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mt-2"
              />
            )}
          </div>
        );
      case 7:
        return (
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-bold text-gray-800">입력 완료!</h2>
            <p className="text-gray-600">정보를 확인하고 완료 버튼을 눌러주세요.</p>
            <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2 max-h-96 overflow-y-auto">
              <p><span className="font-semibold">관심 분야:</span> {formData.interest === '기타' ? formData.interestOther : formData.interest}</p>
              <p><span className="font-semibold">자기소개:</span> {formData.introduction}</p>
              <p><span className="font-semibold">스타일:</span> {formData.style === '기타' ? formData.styleOther : formData.style}</p>
              <p><span className="font-semibold">타겟 독자:</span> {formData.targetAudience === '기타' ? formData.targetAudienceOther : formData.targetAudience}</p>
              <p><span className="font-semibold">구체적인 목표:</span> {formData.goal === '기타' ? formData.goalOther : formData.goal}</p>
              <p><span className="font-semibold">나의 정체성/차별점:</span> {formData.usp === '기타' ? formData.uspOther : formData.usp}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* 진행 바 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Step {currentStep} / {totalSteps}</span>
            <span className="text-sm text-gray-600">{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* 스텝 컨텐츠 */}
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              이전
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!isStepValid()}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              isStepValid()
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {currentStep === totalSteps ? '완료' : '다음'}
            {currentStep < totalSteps && <ArrowRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}
