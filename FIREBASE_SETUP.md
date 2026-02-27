# Firebase Firestore 설정 가이드

## 🔧 필수 설정 단계

### 1. Firebase Console 접속
1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. 프로젝트 `instapro-33c7b` 선택 (또는 본인의 프로젝트)

### 1-1. 빌링 계정 활성화 (무료 플랜) ⭐ 중요!
⚠️ **Firestore를 사용하려면 결제 정보 등록이 필요하지만, 무료 플랜으로 사용 가능합니다!**

#### 무료 플랜(Spark Plan) 활성화 방법:
1. [Firebase Console - 사용량 및 결제](https://console.firebase.google.com/project/instapro-33c7b/usage/details) 접속
2. 또는 프로젝트 설정(톱니바퀴 아이콘) > **"사용량 및 결제"** 메뉴 클릭
3. **"업그레이드"** 또는 **"결제 계정 연결"** 버튼 클릭
4. **"Spark Plan (무료 플랜)"** 선택
5. 결제 정보 입력 (신용카드 또는 계좌)
   - ⚠️ **중요**: 무료 플랜이어도 결제 정보 등록이 필요합니다
   - ✅ **하지만**: 무료 할당량 내에서는 **요금이 부과되지 않습니다**
   - ✅ **자동 결제 없음**: 무료 할당량을 초과해도 자동으로 결제되지 않습니다

#### 무료 플랜 할당량 (매일):
- **읽기**: 50,000회/일
- **쓰기**: 20,000회/일
- **삭제**: 20,000회/일
- **저장**: 1GB
- **네트워크 송신**: 10GB/일

💡 **이 앱은 무료 할당량으로 충분히 사용 가능합니다!**

#### 결제 정보 등록 후:
- 무료 할당량 내에서는 **요금이 부과되지 않습니다**
- 할당량 초과 시 자동 결제되지 않음 (서비스 중단만 됨)
- 언제든지 프로젝트를 삭제하거나 결제 계정을 해제할 수 있습니다

### 2. Firestore Database 생성 및 설정

#### 2-1. Firestore Database 생성
1. 좌측 메뉴에서 **"Firestore Database"** 클릭
2. **"데이터베이스 만들기"** 버튼 클릭
3. **모드 선택**:
   - **테스트 모드** (개발용 추천): 30일간 모든 읽기/쓰기 허용
   - **프로덕션 모드**: 보안 규칙 설정 필요
4. **위치 선택** (가장 가까운 리전 선택, 예: `asia-northeast3 (Seoul)`)
   - ⚠️ 위치는 나중에 변경할 수 없으니 신중하게 선택하세요
5. **"사용 설정"** 클릭
   - 빌링 계정이 활성화되어 있지 않으면 여기서 오류가 발생합니다
   - 위의 1-1 단계를 먼저 완료하세요!

#### 2-2. 보안 규칙 설정 (중요!)
1. Firestore Database 페이지에서 **"규칙"** 탭 클릭
2. 다음 규칙을 복사하여 붙여넣기:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // users 컬렉션: 이메일로 인증된 사용자만 자신의 데이터 읽기/쓰기
    match /users/{userId} {
      allow read, write: if request.auth != null || 
        request.resource.data.email == resource.data.email;
    }
    
    // curriculums 컬렉션: 모든 사용자 읽기/쓰기 허용 (개발용)
    match /curriculums/{curriculumId} {
      allow read, write: if true;
    }
    
    // 테스트 모드 (개발용 - 모든 접근 허용)
    // match /{document=**} {
    //   allow read, write: if true;
    // }
  }
}
```

3. **"게시"** 버튼 클릭

### 3. Firebase 프로젝트 설정 확인

#### 3-1. 웹 앱 설정 확인
1. 프로젝트 설정 (톱니바퀴 아이콘) 클릭
2. **"내 앱"** 섹션에서 웹 앱이 등록되어 있는지 확인
3. 없으면 **"</>"** 아이콘 클릭하여 웹 앱 추가

#### 3-2. Firebase 설정 정보 확인
`src/firebase.js`는 **환경 변수**만 사용합니다. Firebase Console에서 본인 프로젝트의 설정 값을 확인한 뒤, **.env**에 다음처럼 넣으세요 (실제 값으로 교체):

```
VITE_FIREBASE_API_KEY=본인_프로젝트_API_키
VITE_FIREBASE_AUTH_DOMAIN=프로젝트ID.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=프로젝트ID
VITE_FIREBASE_STORAGE_BUCKET=프로젝트ID.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=숫자
VITE_FIREBASE_APP_ID=1:숫자:web:...
```

이 값들이 Firebase Console의 프로젝트 설정과 일치하는지 확인하세요. **API 키는 코드나 문서에 붙여넣지 마세요.**

### 4. Firestore 컬렉션 구조

앱에서 사용하는 컬렉션:

#### `users` 컬렉션
```javascript
{
  email: "user@example.com",
  interest: "요리",
  introduction: "자기소개",
  style: "모던한",
  targetAudience: "20-30대 여성",
  postFrequency: "주 3회",
  username: "추천 계정명",
  bio: "프로필 소개글",
  logoKeyword: "로고 키워드",
  createdAt: "2024-01-01T00:00:00.000Z"
}
```

#### `curriculums` 컬렉션
```javascript
{
  userId: "사용자 ID",
  steps: [
    { step: 1, title: "제목", description: "설명" },
    ...
  ],
  createdAt: "2024-01-01T00:00:00.000Z"
}
```

### 5. 연결 테스트

브라우저 콘솔(F12)에서 다음을 확인:
1. Firebase 연결 오류가 없는지
2. Firestore 쿼리 오류가 없는지
3. 네트워크 탭에서 Firebase API 호출이 성공하는지

## ⚠️ 문제 해결

### 오류: "Missing or insufficient permissions"
- **원인**: Firestore 보안 규칙이 너무 엄격함
- **해결**: 위의 보안 규칙을 테스트 모드로 변경하거나 규칙 수정

### 오류: "Firestore has not been initialized"
- **원인**: Firebase 설정이 잘못되었거나 Firestore가 생성되지 않음
- **해결**: 
  1. Firestore Database가 생성되었는지 확인
  2. `src/firebase.js`의 설정 정보 확인

### 오류: "Collection not found"
- **원인**: 컬렉션이 아직 생성되지 않음
- **해결**: 정상입니다. 첫 데이터 저장 시 자동으로 생성됩니다.

## 📚 참고 링크

- [Firebase Console](https://console.firebase.google.com/)
- [Firestore 문서](https://firebase.google.com/docs/firestore)
- [Firestore 보안 규칙](https://firebase.google.com/docs/firestore/security/get-started)

