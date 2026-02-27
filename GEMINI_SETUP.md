# Gemini API 설정 가이드

## 🔧 필수 설정 단계

### 1. Google Cloud Console 접속
1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 프로젝트 번호 `379712789818` 선택

### 2. Gemini API 활성화
1. [API 및 서비스 > 라이브러리](https://console.cloud.google.com/apis/library)로 이동
2. 검색창에 "Generative Language API" 또는 "Gemini API" 검색
3. **"Generative Language API"** 선택
4. **"사용 설정"** 버튼 클릭
5. 활성화 완료까지 몇 분 소요될 수 있습니다

### 3. API 키 발급 (권장: Google AI Studio)
1. **[Google AI Studio - API 키](https://aistudio.google.com/apikey)** 접속
2. **"Create API key"** 클릭 → 프로젝트 선택 또는 새로 만들기
3. 생성된 API 키 복사
4. 프로젝트 루트(`feedmanager-main`)에 **`.env`** 파일 생성 후 한 줄 입력:
   ```
   VITE_GEMINI_API_KEY=여기에_복사한_API_키
   ```
5. 터미널에서 `npm run dev` 다시 실행

### 4. 할당량 확인
1. [API 및 서비스 > 할당량](https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas)로 이동
2. 할당량이 충분한지 확인
3. 필요시 할당량 증가 요청

## ✅ 확인 사항

- [ ] Generative Language API가 활성화되어 있음
- [ ] API 키가 올바른 프로젝트에 연결되어 있음
- [ ] API 키에 Generative Language API 권한이 부여되어 있음
- [ ] 할당량이 충분함

## 🔍 문제 해결

### 404 오류가 계속 발생하는 경우:
1. API 활성화 후 몇 분 기다려보기
2. 브라우저 캐시 삭제 후 다시 시도
3. API 키를 새로 생성해보기
4. 다른 브라우저에서 테스트

### 403 "Your API key was reported as leaked" 오류:
- 기존 키가 유출로 차단된 상태입니다. **새 API 키를 발급**해야 합니다.
1. [Google AI Studio](https://aistudio.google.com/apikey) 에서 **Create API key** 로 새 키 발급
2. 프로젝트 루트에 `.env` 파일 만들고 `VITE_GEMINI_API_KEY=새키` 입력
3. **npm run dev** 다시 실행 (환경변수 적용을 위해 서버 재시작 필수)

### 권한 오류가 발생하는 경우:
1. API 키의 API 제한사항 확인
2. 서비스 계정 권한 확인
3. 프로젝트의 결제 계정이 활성화되어 있는지 확인

## 📚 참고 링크

- [Gemini API 문서](https://ai.google.dev/docs)
- [Google Cloud Console](https://console.cloud.google.com/)
- [API 활성화 가이드](https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com)

