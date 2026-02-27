# Firestore vs Realtime Database 차이점

## ⚠️ 중요: 이 앱은 Firestore를 사용합니다!

현재 앱은 **Firestore Database**를 사용하도록 설정되어 있습니다.
**Realtime Database**가 아닙니다!

## 🔍 차이점 확인

### Realtime Database (현재 만드신 것)
- URL: `https://instapro-33c7b-default-rtdb.firebaseio.com/`
- JSON 기반 NoSQL 데이터베이스
- 실시간 동기화에 최적화
- **이 앱에서는 사용하지 않습니다**

### Firestore Database (필요한 것)
- NoSQL 문서 데이터베이스
- 더 구조화된 데이터 저장
- 더 나은 쿼리 기능
- **이 앱에서 사용하는 데이터베이스**

## ✅ 해결 방법: Firestore Database 생성

### Step 1: Firestore Database 생성
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 `instapro-33c7b` 선택
3. 좌측 메뉴에서 **"Firestore Database"** 클릭
   - ⚠️ "Realtime Database"가 아닌 **"Firestore Database"**입니다!
4. **"데이터베이스 만들기"** 버튼 클릭
5. **테스트 모드** 선택 (개발용)
6. **위치 선택**: `asia-northeast3 (Seoul)` 추천
7. **"사용 설정"** 클릭

### Step 2: 보안 규칙 설정
1. Firestore Database 페이지에서 **"규칙"** 탭 클릭
2. 다음 규칙 복사하여 붙여넣기:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. **"게시"** 버튼 클릭

## 📍 확인 방법

Firestore Database가 생성되면:
- Firestore Database 페이지에 "컬렉션 시작" 버튼이 보입니다
- URL이 `firestore`로 시작합니다 (realtime이 아님)

## 🎯 현재 앱 구조

앱에서 사용하는 Firestore 컬렉션:
- `users` - 사용자 프로필 정보
- `curriculums` - 커리큘럼 정보

이 컬렉션들은 Firestore Database에서 자동으로 생성됩니다.

## 💡 참고

- Realtime Database는 그대로 두셔도 됩니다 (사용하지 않으므로)
- Firestore Database를 별도로 생성해야 합니다
- 두 데이터베이스는 독립적으로 작동합니다

