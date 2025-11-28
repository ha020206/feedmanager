# InstaManager - Firebase Ver.

사용자 맞춤형 인스타그램 계정 설계부터 콘텐츠 생성까지 도와주는 AI 에이전트 서비스

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. Firebase 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. Firestore Database 활성화
3. `src/firebase.js` 파일을 열어 Firebase 설정 정보 입력:

```javascript
const firebaseConfig = {
  apiKey: "여기에_입력",
  authDomain: "여기에_입력",
  projectId: "여기에_입력",
  storageBucket: "여기에_입력",
  messagingSenderId: "여기에_입력",
  appId: "여기에_입력"
};
```

### 3. Gemini API 설정

1. [Google AI Studio](https://makersuite.google.com/app/apikey)에서 API 키 발급
2. `src/api/gemini.js` 파일을 열어 API 키 입력:

```javascript
const GEMINI_API_KEY = "여기에_입력";
```

### 4. 개발 서버 실행

```bash
npm run dev
```

## 📁 프로젝트 구조

```
insta_pro/
├── src/
│   ├── api/
│   │   └── gemini.js          # Gemini API 호출 로직
│   ├── components/
│   │   ├── Onboarding.jsx     # 온보딩 폼
│   │   ├── Branding.jsx       # AI 브랜딩 추천
│   │   ├── Profile.jsx        # 마이페이지 (인스타그램 스타일)
│   │   ├── Curriculum.jsx    # 커리큘럼 추천
│   │   └── PostGenerator.jsx # 게시물 생성기
│   ├── firebase.js            # Firebase 설정
│   ├── App.jsx                # 메인 앱 컴포넌트
│   ├── main.jsx               # 진입점
│   └── index.css              # 전역 스타일
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## ✨ 주요 기능

1. **온보딩**: 사용자 정보 수집 (관심 분야, 소개, 스타일, 타겟 고객층, 업로드 주기)
2. **AI 브랜딩**: Gemini를 활용한 계정명, 바이오, 로고 키워드 추천
3. **마이페이지**: 인스타그램 스타일의 프로필 화면
4. **커리큘럼 추천**: Step 1-5 단계별 게시물 주제 추천
5. **게시물 생성기**: 텍스트 다듬기 및 AI 이미지 생성

## 🛠 기술 스택

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **AI**: Google Gemini API
- **Icons**: Lucide React

## 📝 사용 방법

1. 앱 실행 시 온보딩 폼에서 정보 입력
2. AI가 추천한 브랜딩 옵션 중 선택
3. 마이페이지에서 커리큘럼 확인
4. 각 Step을 클릭하여 게시물 생성

## ⚠️ 주의사항

- Firebase와 Gemini API 키를 반드시 설정해야 합니다
- 이미지 생성은 Pollinations.ai API를 사용합니다
- 프로필 데이터는 로컬 스토리지에 저장되어 다음 방문 시 자동으로 복원됩니다

