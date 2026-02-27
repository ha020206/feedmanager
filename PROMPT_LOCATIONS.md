# 프롬프트 코드 위치 가이드

## 📍 프롬프트가 있는 파일 위치

### 1. 포트폴리오 로드맵 프롬프트
**파일**: `src/api/gemini.js`  
**함수**: `generateCurriculum()`  
**라인**: 약 233-261줄

```javascript
export async function generateCurriculum(profileData) {
  const prompt = `
  다음 인스타그램 계정 정보를 바탕으로 ${profileData.interest} 분야의 포트폴리오를 구축할 수 있는 단계별 로드맵을 만들어주세요.
  
  계정명: ${profileData.username}
  바이오: ${profileData.bio}
  관심 분야: ${profileData.interest}
  스타일: ${profileData.style}
  
  요구사항:
  - ${profileData.interest} 분야의 전문성을 보여주는 포트폴리오 형식
  - 각 단계는 실력 향상과 포트폴리오 구축에 도움이 되는 주제
  - 설명은 간결하고 핵심만 담기 (한 문장 이내)
  - 초보자부터 전문가로 성장하는 로드맵
  
  Step 1부터 Step 5까지 다음 JSON 형식으로 응답:
  {
    "steps": [
      {"step": 1, "title": "게시물 주제 (간결하게)", "description": "한 문장 설명"},
      ...
    ]
  }
  `;
  // ...
}
```

**수정 방법**: 
1. `src/api/gemini.js` 파일 열기
2. `generateCurriculum` 함수 찾기 (233줄 근처)
3. `prompt` 변수의 내용 수정

---

### 2. 브랜딩 추천 프롬프트
**파일**: `src/api/gemini.js`  
**함수**: `generateBranding()`  
**라인**: 약 142-164줄

```javascript
export async function generateBranding(userData) {
  const prompt = `
  다음 정보를 바탕으로 트렌디하고 세련된 인스타그램 계정 브랜딩을 추천해주세요.
  
  관심 분야: ${userData.interest || ''}
  사용자 소개: ${userData.introduction || ''}
  선호 스타일: ${userData.style || ''}
  ...
  `;
  // ...
}
```

---

### 3. 로고 이미지 생성 프롬프트
**파일**: `src/api/gemini.js`  
**함수**: `generateLogoImage()`  
**라인**: 약 216-226줄

```javascript
export function generateLogoImage(logoKeyword, userData = {}) {
  // 프롬프트 생성 로직
  const prompt = `${logoKeyword}, ${interest} logo, ${styleKeywords}, ...`;
  // ...
}
```

---

### 4. 게시물 텍스트 다듬기 프롬프트
**파일**: `src/api/gemini.js`  
**함수**: `refinePostText()`  
**라인**: 약 272-291줄

---

### 5. 게시물 이미지 프롬프트 생성
**파일**: `src/api/gemini.js`  
**함수**: `generateImagePrompt()`  
**라인**: 약 308-321줄

---

## 🔧 프롬프트 수정 팁

### 포트폴리오 로드맵 프롬프트 커스터마이징 예시

```javascript
// 예시: 더 구체적인 요구사항 추가
요구사항:
- ${profileData.interest} 분야의 전문성을 보여주는 포트폴리오 형식
- 각 단계는 실력 향상과 포트폴리오 구축에 도움이 되는 주제
- 설명은 간결하고 핵심만 담기 (한 문장 이내)
- 초보자부터 전문가로 성장하는 로드맵
- 실제 인스타그램에서 인기 있는 콘텐츠 유형 포함
- 사용자의 스타일(${profileData.style})을 반영한 주제
```

### 로고 이미지 프롬프트 개선 예시

```javascript
// 예시: 더 상세한 스타일 키워드
if (style.includes('모던') || style.includes('미니멀')) {
  styleKeywords = 'minimalist, modern, clean, simple, geometric, flat design';
} else if (style.includes('키치') || style.includes('컬러풀')) {
  styleKeywords = 'colorful, vibrant, playful, kitsch, bold colors, fun design';
}
```

## 📝 참고사항

- 프롬프트 수정 후 저장하면 즉시 반영됩니다
- 변경사항을 테스트하려면 앱을 새로고침하세요
- 프롬프트가 너무 길면 Gemini 응답이 느려질 수 있습니다
- JSON 형식이 필요한 프롬프트는 형식을 정확히 지켜야 합니다

