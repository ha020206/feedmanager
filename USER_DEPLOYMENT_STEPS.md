# 🚀 GitHub Pages 배포 - 사용자 작업 가이드

## ✅ 해야 할 작업들

### 1단계: GitHub Repository 생성
1. GitHub에 로그인
2. 우측 상단 `+` 버튼 → `New repository` 클릭
3. Repository 이름: **`feedmanager`** (정확히 이 이름으로!)
4. Public 또는 Private 선택
5. `Create repository` 클릭

### 2단계: 코드 Push
```bash
# 터미널에서 프로젝트 폴더로 이동
cd "C:\Users\seungyeon\Desktop\바이브코딩\insta_pro"

# Git 초기화 (이미 되어있다면 생략)
git init

# 원격 저장소 추가 (your-username을 본인 GitHub 사용자명으로 변경)
git remote add origin https://github.com/your-username/feedmanager.git

# 모든 파일 추가
git add .

# 커밋
git commit -m "Initial commit: Feed Manager"

# 메인 브랜치로 Push
git branch -M main
git push -u origin main
```

### 3단계: GitHub Secrets 설정 (⚠️ 매우 중요!)

1. **GitHub Repository 페이지 접속**
   - `https://github.com/your-username/feedmanager` 접속

2. **Settings 메뉴 클릭**
   - Repository 상단 메뉴에서 `Settings` 클릭

3. **Secrets 메뉴로 이동**
   - 왼쪽 사이드바에서 `Secrets and variables` → `Actions` 클릭

4. **Secrets 추가** (총 7개)
   - `New repository secret` 버튼 클릭
   - 아래 목록을 하나씩 추가:

   **Secret 1: Gemini API Key**
   - Name: `GEMINI_API_KEY`
   - Secret: **(본인 Gemini API 키 – [AI Studio](https://aistudio.google.com/apikey)에서 발급, 공개 저장소에 붙여넣지 말 것)**
   - `Add secret` 클릭

   **Secret 2: Firebase API Key**
   - Name: `FIREBASE_API_KEY`
   - Secret: **(본인 Firebase 프로젝트 API 키 – Firebase Console에서 확인)**
   - `Add secret` 클릭

   **Secret 3: Firebase Auth Domain**
   - Name: `FIREBASE_AUTH_DOMAIN`
   - Secret: **(예: your-project.firebaseapp.com)**
   - `Add secret` 클릭

   **Secret 4: Firebase Project ID**
   - Name: `FIREBASE_PROJECT_ID`
   - Secret: **(본인 Firebase 프로젝트 ID)**

   **Secret 5: Firebase Storage Bucket**
   - Name: `FIREBASE_STORAGE_BUCKET`
   - Secret: **(예: your-project.firebasestorage.app)**

   **Secret 6: Firebase Messaging Sender ID**
   - Name: `FIREBASE_MESSAGING_SENDER_ID`
   - Secret: **(Firebase Console > 프로젝트 설정에서 확인)**

   **Secret 7: Firebase App ID**
   - Name: `FIREBASE_APP_ID`
   - Secret: **(Firebase Console > 프로젝트 설정 > 내 앱에서 확인)**
   - `Add secret` 클릭

5. **Secrets 확인**
   - 총 7개의 Secrets가 목록에 표시되어야 합니다
   - 각 이름이 정확히 일치하는지 확인 (대소문자 구분!)

### 4단계: GitHub Pages 설정

1. **Settings 메뉴에서 Pages 클릭**
   - 왼쪽 사이드바에서 `Pages` 클릭

2. **Source 설정**
   - Source: `Deploy from a branch` → **`GitHub Actions`** 선택
   - (또는 `None`에서 `GitHub Actions`로 변경)

3. **Save 클릭**

### 5단계: Firebase 도메인 허용 설정

1. **Firebase Console 접속**
   - https://console.firebase.google.com/ 접속
   - 프로젝트 선택: `instapro-33c7b`

2. **Authentication 설정**
   - 왼쪽 메뉴: `Authentication` → `Settings` 탭
   - `Authorized domains` 섹션 찾기

3. **도메인 추가**
   - `Add domain` 버튼 클릭
   - 도메인 입력: `[your-username].github.io`
     - 예: `seungyeon.github.io`
   - `Add` 클릭

### 6단계: 배포 확인

1. **GitHub Actions 확인**
   - Repository → `Actions` 탭 클릭
   - "Deploy to GitHub Pages" 워크플로우가 실행되는지 확인
   - 초록색 체크 표시(✅)가 나타나면 배포 완료!

2. **배포된 사이트 접속**
   - 배포 완료 후 1-2분 대기
   - 브라우저에서 접속: `https://[your-username].github.io/feedmanager/`
   - 예: `https://seungyeon.github.io/feedmanager/`

3. **문제 발생 시**
   - Actions 탭에서 실패한 워크플로우 클릭
   - 빨간색 X 표시가 있으면 에러 로그 확인
   - Secrets 설정이 올바른지 재확인

## 📝 체크리스트

배포 전 다음 항목을 모두 확인하세요:

- [ ] GitHub에 `feedmanager` repository 생성 완료
- [ ] 코드를 repository에 push 완료
- [ ] GitHub Secrets 7개 모두 추가 완료
  - [ ] GEMINI_API_KEY
  - [ ] FIREBASE_API_KEY
  - [ ] FIREBASE_AUTH_DOMAIN
  - [ ] FIREBASE_PROJECT_ID
  - [ ] FIREBASE_STORAGE_BUCKET
  - [ ] FIREBASE_MESSAGING_SENDER_ID
  - [ ] FIREBASE_APP_ID
- [ ] GitHub Pages 설정에서 Source를 "GitHub Actions"로 설정 완료
- [ ] Firebase Console에서 GitHub Pages 도메인 허용 완료
- [ ] Actions 탭에서 배포 워크플로우 실행 확인
- [ ] 배포된 사이트 접속 테스트 완료

## ⚠️ 중요 사항

1. **Repository 이름은 반드시 `feedmanager`여야 합니다**
   - 다른 이름을 사용하면 `vite.config.js`의 `base` 설정도 변경해야 합니다

2. **Secrets 이름은 정확히 일치해야 합니다**
   - 대소문자 구분: `GEMINI_API_KEY` (O) / `gemini_api_key` (X)

3. **Firebase 도메인 허용은 필수입니다**
   - 허용하지 않으면 Firebase 인증이 작동하지 않습니다

4. **배포는 자동으로 실행됩니다**
   - `main` 브랜치에 push하면 자동으로 배포가 시작됩니다

## 🎉 배포 완료 후

배포가 완료되면:
- 사이트가 `https://[username].github.io/feedmanager/`에서 접속 가능합니다
- 코드를 수정하고 push하면 자동으로 재배포됩니다
- Actions 탭에서 배포 상태를 확인할 수 있습니다

