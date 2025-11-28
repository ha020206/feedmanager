# 로고 변경 가이드

## 📍 로고 파일 위치

앱 상단에 표시되는 로고(파비콘)를 변경하려면 다음 단계를 따르세요:

### 1. public 폴더 생성
프로젝트 루트 디렉토리에 `public` 폴더를 생성하세요.

```
insta_pro/
  ├── public/          ← 이 폴더를 생성하세요
  │   └── favicon.ico  ← 로고 파일을 여기에 넣으세요
  ├── src/
  ├── index.html
  └── ...
```

### 2. 로고 파일 준비
- **파일 형식**: `.ico`, `.png`, `.svg` 모두 가능
- **권장 크기**: 
  - `.ico`: 16x16, 32x32, 48x48 (다중 크기 지원)
  - `.png`: 32x32 또는 64x64
  - `.svg`: 벡터 형식 (모든 크기에서 선명함)

### 3. 파일 이름 및 위치
로고 파일을 다음 중 하나의 이름으로 `public` 폴더에 저장하세요:
- `favicon.ico` (가장 일반적)
- `favicon.png`
- `logo.svg`
- 또는 원하는 이름 (아래 index.html 수정 필요)

### 4. index.html 수정
`index.html` 파일의 5번째 줄을 수정하세요:

**현재:**
```html
<link rel="icon" type="image/svg+xml" href="/vite.svg" />
```

**변경 예시:**

`.ico` 파일인 경우:
```html
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
```

`.png` 파일인 경우:
```html
<link rel="icon" type="image/png" href="/favicon.png" />
```

`.svg` 파일인 경우:
```html
<link rel="icon" type="image/svg+xml" href="/logo.svg" />
```

### 5. 브라우저 캐시 클리어
변경 후 브라우저 캐시를 클리어하거나 시크릿 모드에서 확인하세요.

## 💡 팁

- **온라인 도구**: [Favicon Generator](https://favicon.io/) 또는 [RealFaviconGenerator](https://realfavicongenerator.net/)를 사용하여 다양한 크기의 파비콘을 생성할 수 있습니다.
- **파일 크기**: 작을수록 좋습니다 (일반적으로 10KB 이하 권장)
- **테스트**: 변경 후 개발 서버를 재시작하고 브라우저를 새로고침하세요.

## 📝 현재 설정

현재 `index.html`은 `/vite.svg`를 참조하고 있습니다. 
이 파일은 Vite의 기본 로고이며, `public` 폴더에 있는 파일로 교체하면 됩니다.

