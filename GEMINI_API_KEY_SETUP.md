# 🔑 Gemini API 키 설정 방법

## 📝 API 키 입력 (환경 변수 사용)

코드에는 API 키를 넣지 않습니다. **.env** 파일에서만 관리합니다.

1. [Google AI Studio](https://aistudio.google.com/apikey)에서 **Create API key**로 새 키 발급
2. 프로젝트 루트에 **.env** 파일 생성 (없으면)
3. 다음 한 줄 추가 (실제 발급받은 키로 교체):

   ```
   VITE_GEMINI_API_KEY=여기에_발급받은_API_키
   ```

4. `npm run dev` 다시 실행

참고: `.env.example`에 예시 형식이 있습니다. `.env`는 Git에 올리지 마세요.

## ✅ 확인 사항

- [ ] `.env`에 `VITE_GEMINI_API_KEY`가 설정되어 있음
- [ ] Generative Language API가 활성화된 프로젝트에서 키를 발급했음

## ⚠️ 보안

- API 키는 **절대** GitHub 등 공개 저장소에 커밋하지 마세요.
- `.env`는 `.gitignore`에 포함되어 있어야 합니다.

