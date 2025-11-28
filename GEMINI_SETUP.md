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

### 3. API 키 확인 및 권한 설정
1. [API 및 서비스 > 사용자 인증 정보](https://console.cloud.google.com/apis/credentials)로 이동
2. API 키 `AIzaSyAVfxac7gUFsri0JF76FoKGQXaGHAFgfoM` 찾기
3. API 키 클릭하여 편집
4. **API 제한사항** 섹션에서:
   - "키 제한" 선택
   - "API 선택" 선택
   - "Generative Language API" 체크
   - 저장

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

### 권한 오류가 발생하는 경우:
1. API 키의 API 제한사항 확인
2. 서비스 계정 권한 확인
3. 프로젝트의 결제 계정이 활성화되어 있는지 확인

## 📚 참고 링크

- [Gemini API 문서](https://ai.google.dev/docs)
- [Google Cloud Console](https://console.cloud.google.com/)
- [API 활성화 가이드](https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com)

