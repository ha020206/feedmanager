# 🔑 Gemini API 키 설정 방법

## ⚠️ 현재 문제
에러 메시지에서 `YOUR_GEMINI_API_KEY_HERE`가 그대로 사용되고 있어서 400 에러가 발생합니다.
실제 API 키를 입력해야 합니다.

## 📝 API 키 입력 방법

### 방법 1: 기존 API 키 사용 (빠른 해결)
이전에 사용했던 API 키: `AIzaSyAVfxac7gUFsri0JF76FoKGQXaGHAFgfoM`

1. `src/api/gemini.js` 파일 열기
2. 5번째 줄 찾기:
   ```javascript
   const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";
   ```
3. 다음과 같이 수정:
   ```javascript
   const GEMINI_API_KEY = "AIzaSyAVfxac7gUFsri0JF76FoKGQXaGHAFgfoM";
   ```
4. 파일 저장

### 방법 2: 새 API 키 생성

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 선택 (프로젝트 번호: 379712789818)
3. [API 및 서비스 > 사용자 인증 정보](https://console.cloud.google.com/apis/credentials)로 이동
4. **"+ 사용자 인증 정보 만들기"** 클릭
5. **"API 키"** 선택
6. 생성된 API 키 복사
7. `src/api/gemini.js` 파일의 5번째 줄에 붙여넣기

## ✅ 확인 사항

API 키 입력 후:
- [ ] `src/api/gemini.js` 파일에 실제 API 키가 입력되어 있음
- [ ] Generative Language API가 활성화되어 있음
- [ ] API 키에 Generative Language API 권한이 부여되어 있음

## 🔍 API 키 확인 방법

브라우저 콘솔에서 다음 명령어로 확인:
```javascript
// 이 명령어는 작동하지 않습니다 (보안상 API 키는 숨겨져 있음)
// 대신 파일을 직접 확인하세요
```

## ⚠️ 보안 주의사항

- API 키는 절대 공개 저장소(GitHub 등)에 올리지 마세요
- `.gitignore`에 `src/api/gemini.js`가 포함되어 있는지 확인하세요
- 프로덕션 환경에서는 환경 변수 사용을 권장합니다

