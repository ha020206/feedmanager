# GitHub Pages 배포 가이드

## 📋 배포 전 체크리스트

### 1. Repository 설정
- GitHub에 `feedmanager` 이름으로 repository 생성
- 코드를 push

### 2. vite.config.js 설정
✅ 이미 설정 완료: `base: '/feedmanager/'`

### 3. GitHub Secrets 설정 (필수)
보안을 위해 API 키를 GitHub Secrets로 관리합니다:

1. **GitHub Repository 접속**
   - Repository → Settings → Secrets and variables → Actions

2. **다음 Secrets 추가** (New repository secret 클릭):
   
   **Gemini API:**
   - Name: `GEMINI_API_KEY`
   - Value: `AIzaSyAVfxac7gUFsri0JF76FoKGQXaGHAFgfoM`
   
   **Firebase 설정:**
   - Name: `FIREBASE_API_KEY`
   - Value: `AIzaSyDBDRT042h98U3TFzuWgPedwmgwfrwB41U`
   
   - Name: `FIREBASE_AUTH_DOMAIN`
   - Value: `instapro-33c7b.firebaseapp.com`
   
   - Name: `FIREBASE_PROJECT_ID`
   - Value: `instapro-33c7b`
   
   - Name: `FIREBASE_STORAGE_BUCKET`
   - Value: `instapro-33c7b.firebasestorage.app`
   
   - Name: `FIREBASE_MESSAGING_SENDER_ID`
   - Value: `759406377032`
   
   - Name: `FIREBASE_APP_ID`
   - Value: `1:759406377032:web:099959715a914678b4c07d`

3. **Secrets 추가 확인**
   - 총 7개의 Secrets가 추가되어야 합니다
   - 각 Secret의 이름이 정확히 일치해야 합니다 (대소문자 구분)

### 4. GitHub Pages 설정
1. Repository → Settings → Pages
2. Source: **"GitHub Actions"** 선택
3. Save 클릭
4. `.github/workflows/deploy.yml` 파일이 자동으로 실행됩니다

### 5. 코드 Push 및 자동 배포
```bash
# 변경사항 커밋 및 푸시
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

### 6. 배포 확인
1. **GitHub Actions 확인**
   - Repository → Actions 탭
   - "Deploy to GitHub Pages" 워크플로우가 실행되는지 확인
   - 초록색 체크 표시가 나타나면 배포 완료

2. **배포된 사이트 접속**
   - 배포 완료 후 약 1-2분 대기
   - `https://[your-username].github.io/feedmanager/` 접속
   - 예: `https://seungyeon.github.io/feedmanager/`

3. **문제 발생 시**
   - Actions 탭에서 실패한 워크플로우 클릭
   - 에러 로그 확인
   - Secrets 설정이 올바른지 재확인

## ⚠️ 주의사항

1. **API 키 보안**
   - ✅ GitHub Secrets를 사용하여 안전하게 관리합니다
   - 코드에 API 키가 하드코딩되어 있지만, 빌드 시 Secrets로 대체됩니다
   - Secrets가 설정되지 않으면 기본값이 사용됩니다

2. **Firebase 설정**
   - Firebase Console에서 도메인 허용 설정 필요
   - Firebase Console → Authentication → Settings → Authorized domains
   - 다음 도메인 추가:
     - `[your-username].github.io`
     - 예: `seungyeon.github.io`

3. **CORS 설정**
   - Firebase Storage 사용 시 CORS 설정 확인 필요
   - Firebase Console → Storage → Rules에서 CORS 설정 확인

4. **경로 문제**
   - ✅ `base: '/feedmanager/'`로 설정되어 있습니다
   - 모든 절대 경로(`/`)를 상대 경로(`./`)로 변경했습니다
   - 배포된 사이트는 `/feedmanager/` 경로에서 실행됩니다

## 🔧 문제 해결

### 빌드 실패
- `npm ci` 대신 `npm install` 사용 시도
- Node.js 버전 확인 (18 이상 권장)

### 페이지가 표시되지 않음
- `vite.config.js`의 `base` 설정 확인
- GitHub Pages 설정에서 Source 확인

### API 호출 실패
- Firebase 도메인 허용 설정 확인
- CORS 설정 확인

