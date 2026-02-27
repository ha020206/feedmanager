import { useState, useRef } from 'react';
import { Loader2, Check, Upload, X, Sparkles } from 'lucide-react';
import { generateBranding, generateLogoImage } from '../api/gemini';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

// 기본 추천 (페이지 진입 시 Gemini 호출 없이 바로 표시 → 사용량 절약)
const DEFAULT_RECOMMENDATIONS = {
  username: ['brand.new', 'daily_archive', 'studio_log'],
  bio: ['나만의 기록\n공간을 채우는 이야기', 'Daily Inspiration\n당신의 일상에 영감을 줍니다.', 'Creator\n성장하는 과정을 공유해요'],
  logoKeyword: 'minimalist modern icon logo design, clean vector art, white background'
};

export default function Branding({ userData, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(DEFAULT_RECOMMENDATIONS);
  const [selected, setSelected] = useState({
    username: DEFAULT_RECOMMENDATIONS.username[0],
    bio: DEFAULT_RECOMMENDATIONS.bio[0],
    logoUrl: null
  });
  const [customUsername, setCustomUsername] = useState('');
  const [customBio, setCustomBio] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [generatedLogoUrl, setGeneratedLogoUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [generatingLogo, setGeneratingLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const isLoadingRef = useRef(false);

  const loadRecommendations = async () => {
    // 이미 로딩 중이면 중복 호출 방지
    if (isLoadingRef.current) {
      console.log('이미 로딩 중입니다. 중복 호출 방지');
      return;
    }
    
    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);
      
      console.log('브랜딩 생성 시작...', userData);
      
      // 타임아웃 설정 (30초)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('요청 시간이 초과되었습니다. 다시 시도해주세요.')), 30000);
      });
      
      const result = await Promise.race([
        generateBranding(userData),
        timeoutPromise
      ]);
      
      console.log('브랜딩 생성 완료:', result);
      
      if (!result || !result.recommendations) {
        throw new Error('응답 데이터가 올바르지 않습니다.');
      }
      
      setRecommendations(result.recommendations);
      // 기본 선택
      setSelected({
        username: result.recommendations.username?.[0] || null,
        bio: result.recommendations.bio?.[0] || null,
        logoUrl: null
      });
    } catch (error) {
      const msg = error?.message || '';
      const isQuotaError = msg.includes('사용량이 초과') || msg.includes('429');
      if (isQuotaError) {
        setError('무료 사용량이 초과되어 기본 추천을 보여드립니다. 잠시 후 아래 "다시 시도"를 눌러보세요.');
      } else {
        setError(msg || '브랜딩 생성 중 오류가 발생했습니다.');
      }
      // 에러 발생 시에도 기본값으로 진행
      setRecommendations({
        username: ["brand.new", "daily_archive", "studio_log"],
        bio: ["나만의 기록\n공간을 채우는 이야기", "Daily Inspiration\n당신의 일상에 영감을 줍니다.", "Creator\n성장하는 과정을 공유해요"],
        logoKeyword: "minimalist modern icon logo design, clean vector art, white background"
      });
      setSelected({
        username: "brand.new",
        bio: "나만의 기록\n공간을 채우는 이야기",
        logoUrl: null
      });
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
      console.log('로딩 완료');
    }
  };

  const generateAutoLogo = async () => {
    const logoKeywordToUse = recommendations?.logoKeyword;
    if (!logoKeywordToUse) {
      alert('로고 키워드를 생성할 수 없습니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    
    try {
      setGeneratingLogo(true);
      setGeneratedLogoUrl(null); // 이전 이미지 제거
      setLogoFile(null);
      setLogoPreview(null);
      
      // userData를 전달하여 스타일과 설명 기반으로 로고 생성 (Promise 반환)
      const logoUrl = await generateLogoImage(logoKeywordToUse, userData);
      
      // URL 설정 (로딩은 실제 이미지가 DOM에 로드될 때까지 유지)
      setGeneratedLogoUrl(logoUrl);
      setSelected({ ...selected, logoUrl });
      
      // 이미지 프리로드로 검증만 수행 (로딩 상태는 유지)
      await new Promise((resolve, reject) => {
        const img = new Image();
        let resolved = false;
        
        img.onload = () => {
          if (!resolved) {
            resolved = true;
            // 이미지가 로드 가능한 것을 확인했지만, generatingLogo는 img 태그의 onLoad에서 끔
            resolve();
          }
        };
        
        img.onerror = () => {
          if (!resolved) {
            resolved = true;
            // 재시도
            generateLogoImage(logoKeywordToUse, userData)
              .then(retryUrl => {
                setGeneratedLogoUrl(retryUrl);
                setSelected({ ...selected, logoUrl: retryUrl });
                // generatingLogo는 img 태그의 onLoad에서 끔
                resolve();
              })
              .catch(() => {
                setGeneratingLogo(false);
                alert('로고 이미지 생성에 실패했습니다. 다시 시도해주세요.');
                reject(new Error('Logo image generation failed'));
              });
          }
        };
        
        img.src = logoUrl;
        
        // 타임아웃 설정 (30초) - Pollinations API는 시간이 걸릴 수 있음
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            // 타임아웃이어도 URL은 설정되어 있으므로, 실제 로드될 때까지 기다림
            resolve();
          }
        }, 30000);
      });
    } catch (error) {
      console.error('로고 생성 오류:', error);
      setGeneratingLogo(false);
      if (error.message !== 'Logo image generation failed') {
        alert('로고 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        setGeneratedLogoUrl(null); // 업로드 시 생성된 이미지 제거
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setGeneratedLogoUrl(null);
    setSelected({ ...selected, logoUrl: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // 제거 후 자동 생성
    if (recommendations?.logoKeyword) {
      generateAutoLogo();
    }
  };

  const uploadLogo = async () => {
    if (!logoFile) return null;

    // Firebase Storage CORS 문제로 인해 바로 base64로 변환하여 사용
    // Firebase Storage는 설정이 복잡하므로 base64로 저장하는 것이 더 안정적
    return new Promise((resolve) => {
      setUploading(true);
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setUploading(false);
        resolve(reader.result); // base64 데이터 URL 반환
      };
      
      reader.onerror = () => {
        setUploading(false);
        console.error('로고 읽기 오류');
        // base64 변환 실패 시 AI 생성 이미지로 폴백
        if (recommendations?.logoKeyword) {
          generateLogoImage(recommendations.logoKeyword, userData)
            .then(fallbackUrl => resolve(fallbackUrl))
            .catch(() => resolve(null));
        } else {
          resolve(null);
        }
      };
      
      reader.readAsDataURL(logoFile);
    });
  };

  const handleSave = async () => {
    const finalUsername = selected.username === '기타' ? customUsername.trim() : selected.username;
    const finalBio = selected.bio === '기타' ? customBio.trim() : selected.bio;
    
    if (!finalUsername || !finalBio) {
      alert('계정명과 프로필 소개글을 입력해주세요.');
      return;
    }

    try {
      setSaving(true);
      
      let logoUrl = null;
      
      // 1. 파일 업로드 시도
      if (logoFile) {
        try {
          logoUrl = await uploadLogo();
        } catch (uploadError) {
          console.warn('업로드 실패, 자동 생성 사용:', uploadError);
          // 업로드 실패 시 자동 생성
          if (recommendations?.logoKeyword) {
            logoUrl = await generateLogoImage(recommendations.logoKeyword, userData);
          }
        }
      } 
      // 2. 업로드하지 않은 경우 자동 생성
      else if (generatedLogoUrl) {
        logoUrl = generatedLogoUrl;
      } 
      // 3. 둘 다 없으면 새로 생성
      else if (recommendations?.logoKeyword) {
        logoUrl = await generateLogoImage(recommendations.logoKeyword, userData);
      }

      if (!logoUrl) {
        alert('로고 이미지를 생성할 수 없습니다. 다시 시도해주세요.');
        return;
      }

      const profileData = {
        ...userData,
        username: finalUsername,
        bio: finalBio,
        logoUrl: logoUrl,
        createdAt: new Date().toISOString()
      };

      // Firebase에 저장
      const docRef = await addDoc(collection(db, 'users'), profileData);
      
      onComplete({ ...profileData, id: docRef.id });
    } catch (error) {
      console.error('저장 오류:', error);
      alert('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-700 text-lg font-medium">AI 맞춤형 데이터를 생성합니다</p>
          <p className="text-gray-500 text-sm mt-2">잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  const displayLogo = logoPreview || generatedLogoUrl;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">AI 브랜딩 추천</h1>
              <p className="text-gray-600">마음에 드는 조합을 선택해주세요</p>
            </div>
            <button
              type="button"
              onClick={() => loadRecommendations()}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all shrink-0"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {loading ? '생성 중…' : 'AI 맞춤 추천 받기'}
            </button>
          </div>
          {error && (
            <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-6 text-sm">{error}</p>
          )}

          {/* 계정명 선택 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">계정명 설정</h2>
            {loading && !recommendations ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600">AI가 추천을 생성하고 있습니다...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {recommendations?.username?.map((username, index) => (
                <button
                  key={index}
                  onClick={() => setSelected({ ...selected, username })}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selected.username === username
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">@{username}</span>
                    {selected.username === username && (
                      <Check className="w-5 h-5 text-purple-500" />
                    )}
                  </div>
                </button>
              ))}
              <button
                onClick={() => setSelected({ ...selected, username: '기타' })}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selected.username === '기타'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">기타 (직접 입력)</span>
                  {selected.username === '기타' && (
                    <Check className="w-5 h-5 text-purple-500" />
                  )}
                </div>
              </button>
              </div>
            )}
            {selected.username === '기타' && (
              <input
                type="text"
                value={customUsername}
                onChange={(e) => setCustomUsername(e.target.value)}
                placeholder="계정명을 입력해주세요 (예: my_instagram_account)"
                className="w-full px-4 py-3 border-2 border-purple-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mt-3"
              />
            )}
          </div>

          {/* 바이오 선택 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">프로필 소개글 설정</h2>
            {loading && !recommendations ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600">AI가 추천을 생성하고 있습니다...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {recommendations?.bio?.map((bio, index) => (
                <button
                  key={index}
                  onClick={() => setSelected({ ...selected, bio })}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selected.bio === bio
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-gray-700 whitespace-pre-line">{bio}</p>
                    {selected.bio === bio && (
                      <Check className="w-5 h-5 text-purple-500 flex-shrink-0 ml-2" />
                    )}
                  </div>
                </button>
              ))}
              <button
                onClick={() => setSelected({ ...selected, bio: '기타' })}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selected.bio === '기타'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">기타 (직접 입력)</span>
                  {selected.bio === '기타' && (
                    <Check className="w-5 h-5 text-purple-500 flex-shrink-0 ml-2" />
                  )}
                </div>
              </button>
              </div>
            )}
            {selected.bio === '기타' && (
              <textarea
                value={customBio}
                onChange={(e) => setCustomBio(e.target.value)}
                placeholder="프로필 소개글을 입력해주세요 (줄바꿈 가능)"
                rows="4"
                className="w-full px-4 py-3 border-2 border-purple-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mt-3"
              />
            )}
          </div>

          {/* 로고 이미지 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">로고 이미지</h2>
            
            {displayLogo || generatingLogo ? (
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg mx-auto relative">
                  {generatingLogo && !displayLogo ? (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-2" />
                        <p className="text-xs text-gray-600">로고 생성 중...</p>
                      </div>
                    </div>
                  ) : displayLogo ? (
                    <>
                      {generatingLogo && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center z-10">
                          <div className="text-center text-white">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                            <p className="text-xs">로고 생성 중...</p>
                          </div>
                        </div>
                      )}
                      <img
                        src={displayLogo}
                        alt="Logo preview"
                        className="w-full h-full object-cover"
                        onLoad={() => {
                          // 이미지가 실제로 DOM에 로드되었을 때만 로딩 종료
                          setGeneratingLogo(false);
                        }}
                        onError={(e) => {
                          setGeneratingLogo(false);
                          // 이미지 로드 실패 시 다시 생성 시도
                          if (recommendations?.logoKeyword && !logoFile) {
                            setGeneratingLogo(true);
                            generateLogoImage(recommendations.logoKeyword, userData)
                              .then(fallbackUrl => {
                                e.target.src = fallbackUrl;
                              })
                              .catch(() => {
                                setGeneratingLogo(false);
                                console.error('로고 재생성 실패');
                              });
                          }
                        }}
                      />
                    </>
                  ) : null}
                </div>
                {logoFile && (
                  <button
                    onClick={handleRemoveLogo}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {!generatingLogo && (
                  <p className="text-center text-sm text-gray-500 mt-2">
                    {logoFile ? '업로드된 로고' : 'AI 생성 로고'}
                  </p>
                )}
                {!logoFile && !generatingLogo && (
                  <div className="text-center mt-2">
                    <button
                      onClick={() => {
                        setGeneratedLogoUrl(null);
                        generateAutoLogo();
                      }}
                      className="text-sm text-purple-600 hover:text-purple-700"
                    >
                      다른 이미지 생성
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-4 justify-center">
                {/* 업로드 버튼 */}
                <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors cursor-pointer">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">업로드하기</p>
                      <p className="text-sm text-gray-500 mt-1">PNG, JPG 최대 5MB</p>
                    </div>
                  </label>
                </div>
                
                {/* 로고 만들기 버튼 */}
                <div className="flex-1 border-2 border-dashed border-purple-300 rounded-lg p-6 text-center hover:border-purple-500 hover:bg-purple-50 transition-all">
                  <button
                    onClick={generateAutoLogo}
                    disabled={generatingLogo || !recommendations?.logoKeyword}
                    className="w-full flex flex-col items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">로고 만들기</p>
                      <p className="text-sm text-gray-500 mt-1">AI로 자동 생성</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 저장 버튼 */}
          <button
            onClick={handleSave}
            disabled={saving || uploading || generatingLogo}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {saving || uploading || generatingLogo ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {uploading ? '업로드 중...' : generatingLogo ? '생성 중...' : '저장 중...'}
              </>
            ) : (
              '선택 완료'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
