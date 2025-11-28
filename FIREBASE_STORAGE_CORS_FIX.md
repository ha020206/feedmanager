# Firebase Storage CORS 오류 해결 방법

## 🔧 자동 해결 (코드에 적용됨)

코드가 이미 수정되어 Firebase Storage 업로드 실패 시 자동으로 base64로 변환하여 저장합니다.

## 📝 수동 해결 방법 (선택사항)

Firebase Storage를 정상적으로 사용하려면 다음 설정이 필요합니다:

### 1. Firebase Storage 활성화
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 `instapro-33c7b` 선택
3. 좌측 메뉴에서 **"Storage"** 클릭
4. **"시작하기"** 클릭
5. 보안 규칙 설정:
   - **테스트 모드** 선택 (개발용)
   - 또는 프로덕션 규칙 설정

### 2. Storage 보안 규칙 설정

**테스트 모드 (개발용):**
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.time < timestamp.date(2025, 12, 31);
    }
  }
}
```

**프로덕션 규칙 (권장):**
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /logos/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /posts/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.resource.size < 10 * 1024 * 1024;
    }
  }
}
```

### 3. CORS 설정 (필요한 경우)

Firebase Storage는 기본적으로 CORS를 지원하지만, 문제가 지속되면:
1. Google Cloud Console 접속
2. Cloud Storage > 버킷 선택
3. 권한 탭에서 CORS 설정 확인

## ✅ 현재 해결 방법

코드가 자동으로 다음을 수행합니다:

1. **Firebase Storage 업로드 시도**
2. **실패 시 자동으로 base64로 변환**
3. **base64 데이터를 Firestore에 직접 저장**

이 방법으로 Firebase Storage 설정 없이도 이미지를 저장할 수 있습니다.

## ⚠️ 주의사항

- base64 이미지는 Firestore 문서 크기 제한(1MB)에 영향을 줄 수 있습니다
- 큰 이미지는 Firebase Storage 사용을 권장합니다
- 현재는 자동으로 base64로 변환하여 저장하므로 즉시 사용 가능합니다

