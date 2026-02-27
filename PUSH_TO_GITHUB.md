# GitHub에 올리는 방법

## ⚠️ 푸시 전 확인 (보안)

- **`.env` 파일이 `git add` 되지 않았는지 확인하세요.** (키가 들어 있는 파일입니다.)
- 아래 명령어로 확인: `.env`가 목록에 **없어야** 합니다.
  ```powershell
  git status
  ```
- 만약 `.env`가 나오면: `git reset HEAD .env` 후 다시 커밋하세요.

---

## 1. 처음 저장소를 만들 때

PowerShell에서 **이 폴더**(`feedmanager-main`)로 이동한 뒤:

```powershell
cd "c:\Users\seungyeon\Desktop\feedmanager-main\feedmanager-main"

# Git 초기화
git init

# .env는 올리지 않음 (이미 .gitignore에 있음)
git add .
git status
# 목록에 .env 가 없어야 함!

git commit -m "보안 정리: API 키 제거, 환경변수 사용으로 변경"

# GitHub에서 저장소 생성 후 (예: your-username/feedmanager)
git remote add origin https://github.com/your-username/feedmanager.git
git branch -M main
git push -u origin main
```

`your-username`과 `feedmanager`를 본인 계정·저장소 이름으로 바꾸세요.

---

## 2. 이미 원격이 있고, 변경분만 올릴 때

```powershell
cd "c:\Users\seungyeon\Desktop\feedmanager-main\feedmanager-main"

git add .
git status
# .env 가 없어야 함

git commit -m "보안 정리: API 키 제거, 환경변수 사용"
git push origin main
```

---

## 3. 이미 .env를 커밋해 버렸다면

1. `.env`를 커밋에서 제거:  
   `git rm --cached .env`  
   그다음 커밋:  
   `git commit -m "Remove .env from repo"`
2. Firebase/Gemini 키는 **폐기 후 새로 발급**하고, 새 키만 로컬 `.env`와 GitHub Secrets에 사용하세요.
