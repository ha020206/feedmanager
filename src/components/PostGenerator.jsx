import { useState, useEffect, useRef } from 'react';
import { X, Loader2, Sparkles, Image as ImageIcon, Copy, Check, Upload, Lightbulb } from 'lucide-react';
import { refinePostText, generateImagePrompt, generatePostExample } from '../api/gemini';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function PostGenerator({ step, profileData, onClose, userId, onSave }) {
  const [rawText, setRawText] = useState('');
  const [refinedText, setRefinedText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [exampleLoading, setExampleLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageGenerating, setImageGenerating] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const fileInputRef = useRef(null);
  const imageLoadRef = useRef(false);

  // 예시 생성은 버튼 클릭 시에만 실행
  const loadExample = async () => {
    try {
      setExampleLoading(true);
      const example = await generatePostExample(step, profileData);
      setRawText(example);
    } catch (error) {
      console.error('예시 생성 오류:', error);
      alert('예시 생성 중 오류가 발생했습니다. 직접 입력해주세요.');
    } finally {
      setExampleLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('파일 크기는 10MB 이하여야 합니다.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }
      setImageFile(file);
      setImageUrl(''); // AI 생성 이미지 제거
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRefine = async () => {
    if (!rawText.trim()) {
      alert('게시물 내용을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      const refined = await refinePostText(rawText, profileData);
      setRefinedText(refined);
    } catch (error) {
      console.error('텍스트 다듬기 오류:', error);
      alert('게시물 다듬기 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    try {
      setImageGenerating(true);
      setImageLoaded(false);
      imageLoadRef.current = false;
      setImageFile(null);
      setImagePreview(null);
      
      const prompt = await generateImagePrompt(
        refinedText || rawText,
        profileData
      );
      
      // Pollinations API를 사용한 이미지 생성
      const encodedPrompt = encodeURIComponent(prompt);
      const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=800&enhance=true&seed=${Math.floor(Math.random() * 1000)}`;
      
      // URL 설정 (로딩은 실제 이미지가 DOM에 로드될 때까지 유지)
      setImageUrl(url);
      
      // 이미지 프리로드로 검증만 수행 (로딩 상태는 유지)
      await new Promise((resolve, reject) => {
        const img = new Image();
        let resolved = false;
        
        img.onload = () => {
          if (!resolved) {
            resolved = true;
            // 이미지가 로드 가능한 것을 확인했지만, 실제 DOM 로드는 img 태그의 onLoad에서 확인
            resolve();
          }
        };
        
        img.onerror = () => {
          if (!resolved) {
            resolved = true;
            // 재시도 (다른 seed로)
            const retryUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=800&enhance=true&seed=${Math.floor(Math.random() * 10000)}`;
            setImageUrl(retryUrl);
            const retryImg = new Image();
            retryImg.onload = () => {
              resolve();
            };
            retryImg.onerror = () => {
              setImageGenerating(false);
              setImageLoaded(false);
              imageLoadRef.current = false;
              alert('이미지 생성에 실패했습니다. 다시 시도해주세요.');
              reject(new Error('Image generation failed'));
            };
            retryImg.src = retryUrl;
          }
        };
        
        img.src = url;
        
        // 타임아웃 설정 (30초)
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            resolve();
          }
        }, 30000);
      });
    } catch (error) {
      console.error('이미지 생성 오류:', error);
      setImageGenerating(false);
      setImageLoaded(false);
      imageLoadRef.current = false;
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    // Firebase Storage CORS 문제로 인해 바로 base64로 변환하여 사용
    // Firebase Storage는 설정이 복잡하므로 base64로 저장하는 것이 더 안정적
    return new Promise((resolve) => {
      setImageLoading(true);
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setImageLoading(false);
        resolve(reader.result); // base64 데이터 URL 반환
      };
      
      reader.onerror = () => {
        setImageLoading(false);
        console.error('이미지 읽기 오류');
        // base64 변환 실패 시 AI 생성 이미지로 폴백
        if (refinedText || rawText) {
          handleGenerateImage().then(() => {
            resolve(imageUrl);
          }).catch(() => {
            resolve(null);
          });
        } else {
          resolve(null);
        }
      };
      
      reader.readAsDataURL(imageFile);
    });
  };

  const handleSave = async () => {
    if (!refinedText && !rawText) {
      alert('게시물 내용을 입력해주세요.');
      return;
    }

    // 이미지가 아직 생성 중이거나 로드되지 않았으면 저장 불가
    if (imageGenerating || (imageUrl && !imageLoaded)) {
      alert('이미지가 완전히 로드될 때까지 기다려주세요.');
      return;
    }

    try {
      setSaving(true);
      
      let finalImageUrl = null;
      
      // 이미지 처리: 업로드 파일 > base64 변환 (Firebase Storage 사용 안 함)
      if (imageFile) {
        finalImageUrl = await uploadImage();
        // base64 변환 실패 시 AI 생성 이미지로 폴백
        if (!finalImageUrl && (refinedText || rawText) && !imageUrl) {
          await handleGenerateImage();
          // 이미지가 완전히 로드될 때까지 대기
          await new Promise((resolve) => {
            const checkImage = setInterval(() => {
              if (imageLoadRef.current && !imageGenerating) {
                clearInterval(checkImage);
                resolve();
              }
            }, 100);
            // 최대 30초 대기
            setTimeout(() => {
              clearInterval(checkImage);
              resolve();
            }, 30000);
          });
          finalImageUrl = imageUrl;
        }
      } else if (imageUrl) {
        // AI 생성 이미지가 완전히 로드되었는지 확인
        if (!imageLoaded) {
          await new Promise((resolve) => {
            const checkImage = setInterval(() => {
              if (imageLoadRef.current && !imageGenerating) {
                clearInterval(checkImage);
                resolve();
              }
            }, 100);
            // 최대 30초 대기
            setTimeout(() => {
              clearInterval(checkImage);
              resolve();
            }, 30000);
          });
        }
        finalImageUrl = imageUrl;
      }

      const postData = {
        userId: userId,
        step: step.step,
        stepTitle: step.title,
        stepDescription: step.description,
        text: refinedText || rawText,
        imageUrl: finalImageUrl,
        createdAt: new Date().toISOString(),
        timestamp: Date.now() // 정렬용 타임스탬프 추가
      };

      // Firebase에 저장
      await addDoc(collection(db, 'posts'), postData);
      
      // 저장 완료 콜백 호출
      if (onSave) {
        onSave();
      }
      
      alert('게시물이 저장되었습니다!');
      onClose();
    } catch (error) {
      console.error('저장 오류:', error);
      alert('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(refinedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayImage = imagePreview || imageUrl;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800">{step.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{step.description}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="p-6 space-y-6">
          {/* 입력 섹션 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                게시물 내용 입력
              </label>
              {exampleLoading && (
                <span className="text-xs text-purple-600 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  예시 생성 중...
                </span>
              )}
            </div>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="게시물 내용을 입력하거나 아래 버튼으로 예시를 생성하세요..."
              rows="5"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={loadExample}
                disabled={exampleLoading}
                className="px-4 py-2 text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50 font-medium"
              >
                {exampleLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    예시 생성 중...
                  </>
                ) : (
                  <>
                    <Lightbulb className="w-4 h-4" />
                    예시 생성하기
                  </>
                )}
              </button>
              <button
                onClick={handleRefine}
                disabled={loading || !rawText.trim()}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    AI가 다듬는 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    AI로 다듬기
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 다듬어진 텍스트 */}
          {refinedText && (
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  다듬어진 게시물
                </label>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      복사됨
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      복사
                    </>
                  )}
                </button>
              </div>
              <div className="text-gray-800 whitespace-pre-wrap bg-white rounded p-3 border border-gray-200">
                {refinedText}
              </div>
            </div>
          )}

          {/* 이미지 섹션 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              게시물 이미지
            </label>
            
            {displayImage || imageGenerating ? (
              <div className="relative">
                {imageGenerating && !displayImage ? (
                  <div className="w-full aspect-square rounded-lg border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-2" />
                      <p className="text-xs text-gray-600">이미지 생성 중...</p>
                    </div>
                  </div>
                ) : displayImage ? (
                  <>
                    {imageGenerating && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center z-10">
                        <div className="text-center text-white">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                          <p className="text-xs">이미지 생성 중...</p>
                        </div>
                      </div>
                    )}
                    <img
                      src={displayImage}
                      alt="Post"
                      className="w-full rounded-lg border border-gray-200"
                      onLoad={() => {
                        setImageGenerating(false);
                        setImageLoaded(true);
                        imageLoadRef.current = true;
                      }}
                      onError={(e) => {
                        setImageGenerating(false);
                        setImageLoaded(false);
                        imageLoadRef.current = false;
                        e.target.src = 'https://placehold.co/800x800?text=Image+Error';
                      }}
                    />
                  </>
                ) : null}
                {displayImage && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleRemoveImage}
                      className="flex-1 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      이미지 제거
                    </button>
                    {!imageFile && (
                      <button
                        onClick={handleGenerateImage}
                        disabled={imageGenerating}
                        className="flex-1 py-2 text-sm text-purple-600 hover:text-purple-700 border border-purple-300 rounded-lg hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        다른 이미지 생성
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-4">
                {/* 업로드 버튼 */}
                <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors cursor-pointer">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="post-image-upload"
                  />
                  <label
                    htmlFor="post-image-upload"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">업로드하기</p>
                      <p className="text-sm text-gray-500 mt-1">PNG, JPG 최대 10MB</p>
                    </div>
                  </label>
                </div>

                {/* 이미지 만들기 버튼 */}
                <div className="flex-1 border-2 border-dashed border-purple-300 rounded-lg p-6 text-center hover:border-purple-500 hover:bg-purple-50 transition-all cursor-pointer">
                  <button
                    onClick={handleGenerateImage}
                    disabled={imageGenerating || (!refinedText && !rawText)}
                    className="w-full flex flex-col items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">이미지 만들기</p>
                      <p className="text-sm text-gray-500 mt-1">AI로 자동 생성</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 푸터 */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            닫기
          </button>
          <button
            onClick={handleSave}
            disabled={saving || imageLoading || imageGenerating}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                저장 중...
              </>
            ) : (
              '저장하기'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
