# Firebase 무료 사용 가이드

## 🆓 Firebase 무료 플랜으로 사용하기

Firebase Firestore를 사용하려면 결제 정보 등록이 필요하지만, **무료 플랜(Spark Plan)으로 사용 가능**합니다!

## ✅ 단계별 가이드

### Step 1: 결제 정보 등록 (무료 플랜)

1. **Firebase Console 접속**
   - [사용량 및 결제 페이지](https://console.firebase.google.com/project/instapro-33c7b/usage/details)로 이동
   - 또는 프로젝트 설정(톱니바퀴) > "사용량 및 결제" 클릭

2. **"업그레이드" 또는 "결제 계정 연결" 클릭**

3. **Spark Plan (무료 플랜) 선택**
   - 화면에서 "Spark Plan" 또는 "무료 플랜" 선택
   - Blaze Plan(종량제)이 아닌 Spark Plan을 선택하세요

4. **결제 정보 입력**
   - 신용카드 또는 계좌 정보 입력
   - ⚠️ **중요**: 결제 정보를 등록해야 하지만, 무료 할당량 내에서는 요금이 부과되지 않습니다

5. **등록 완료**
   - 등록 후 Firestore Database를 생성할 수 있습니다

### Step 2: Firestore Database 생성

1. **Firestore Database 메뉴로 이동**
   - 좌측 메뉴에서 "Firestore Database" 클릭

2. **"데이터베이스 만들기" 클릭**

3. **테스트 모드 선택** (개발용 추천)
   - 30일간 모든 읽기/쓰기 허용
   - 개발 중에는 이 모드가 편리합니다

4. **위치 선택**
   - `asia-northeast3 (Seoul)` 추천 (한국에서 가장 가까움)
   - ⚠️ 위치는 나중에 변경할 수 없습니다

5. **"사용 설정" 클릭**
   - 이제 정상적으로 생성됩니다!

## 💰 무료 플랜 할당량

### 일일 할당량 (매일 리셋)
- **읽기**: 50,000회
- **쓰기**: 20,000회
- **삭제**: 20,000회
- **저장**: 1GB
- **네트워크 송신**: 10GB

### 이 앱 사용량 예상
- 로그인: 읽기 1회
- 프로필 저장: 쓰기 1회
- 커리큘럼 저장: 쓰기 1회
- **일반 사용자 1명당 약 10-20회 읽기/쓰기**
- **무료 할당량으로 수천 명의 사용자 지원 가능!**

## 🔒 보안 규칙 설정

Firestore Database 생성 후:

1. **"규칙" 탭 클릭**

2. **다음 규칙 복사하여 붙여넣기** (개발용):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 개발용: 모든 읽기/쓰기 허용
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. **"게시" 버튼 클릭**

## ⚠️ 주의사항

### 요금 부과 안 됨
- ✅ 무료 할당량 내에서는 **요금이 부과되지 않습니다**
- ✅ 할당량 초과 시 **자동 결제되지 않습니다** (서비스만 중단)
- ✅ 언제든지 프로젝트 삭제 가능

### 할당량 모니터링
- Firebase Console에서 사용량 확인 가능
- 할당량 초과 전에 알림 받을 수 있음

## 🆘 문제 해결

### "빌링 계정이 필요합니다" 오류
- **원인**: 결제 정보가 등록되지 않음
- **해결**: 위의 Step 1을 먼저 완료하세요

### "위치를 선택할 수 없습니다" 오류
- **원인**: 빌링 계정이 활성화되지 않음
- **해결**: 결제 정보 등록 후 다시 시도

### "권한이 없습니다" 오류
- **원인**: 보안 규칙이 너무 엄격함
- **해결**: 위의 보안 규칙을 설정하세요

## 📚 참고 링크

- [Firebase Console](https://console.firebase.google.com/)
- [Firestore 무료 할당량](https://firebase.google.com/docs/firestore/quotas)
- [사용량 및 결제](https://console.firebase.google.com/project/instapro-33c7b/usage/details)

## 💡 팁

1. **무료 플랜으로 시작**: 개발 및 테스트에는 무료 플랜으로 충분합니다
2. **사용량 모니터링**: Firebase Console에서 주기적으로 사용량 확인
3. **필요시 업그레이드**: 사용자가 많아지면 Blaze Plan으로 업그레이드 가능

