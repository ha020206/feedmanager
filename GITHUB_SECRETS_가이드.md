# GitHub에서 API 키 저장하는 곳 (배포용)

배포 시 키는 **GitHub 저장소의 Secrets**에만 넣으면 됩니다.  
코드나 `.env`를 푸시할 필요 없습니다.

---

## 1. 들어가는 위치

1. GitHub에서 **해당 저장소** 열기
2. 상단 메뉴 **Settings** 클릭
3. 왼쪽에서 **Secrets and variables** → **Actions** 클릭
4. **New repository secret** 버튼으로 아래 7개를 **이름 그대로** 만들어서 값 입력

---

## 2. 넣어야 할 Secret 목록 (이름 = Value 설명)

| Secret 이름 (정확히 이렇게) | 넣을 값 |
|---------------------------|--------|
| `GEMINI_API_KEY` | [AI Studio](https://aistudio.google.com/apikey)에서 발급한 Gemini API 키 |
| `FIREBASE_API_KEY` | Firebase Console → 프로젝트 설정 → 내 앱 → API 키 |
| `FIREBASE_AUTH_DOMAIN` | `프로젝트ID.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | Firebase 프로젝트 ID |
| `FIREBASE_STORAGE_BUCKET` | `프로젝트ID.firebasestorage.app` |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase 콘솔에 나오는 숫자 (메시징 발신자 ID) |
| `FIREBASE_APP_ID` | Firebase 앱 ID (예: `1:123456:web:abc...`) |

- **이름**을 틀리면 빌드 시 키가 안 들어가서 배포된 사이트에서 API 오류가 납니다.
- **값**은 본인 Firebase / Gemini 프로젝트에서 복사해서 넣으면 됩니다.

---

## 3. 동작 방식

- `.github/workflows/deploy.yml`에서 `main`에 푸시할 때마다 **Build** 단계에서  
  위 Secret들을 **환경 변수**(`VITE_GEMINI_API_KEY`, `VITE_FIREBASE_*`)로 넣고 `npm run build`를 실행합니다.
- 그래서 **키는 GitHub Secrets에만** 두고, **저장소 코드에는 키가 없어도** 배포가 됩니다.

---

## 4. 정리

- **로컬 개발**: PC의 **`.env`** 에 `VITE_GEMINI_API_KEY`, `VITE_FIREBASE_*` 넣기  
- **GitHub 배포**: 저장소 **Settings → Secrets and variables → Actions** 에 위 7개 Secret 넣기  
- **키는 코드나 문서에 붙여넣지 말고**, 위 두 곳에만 넣기
