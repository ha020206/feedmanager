# Firebase 데이터베이스 초기화 가이드

## 🔄 데이터베이스 초기화 방법

### 방법 1: Firebase Console에서 직접 삭제 (추천)

#### 1-1. Firestore Database에서 삭제
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 `instapro-33c7b` 선택
3. 좌측 메뉴에서 **"Firestore Database"** 클릭
4. **"데이터"** 탭 클릭
5. 컬렉션별로 삭제:
   - `users` 컬렉션 클릭 → 문서 선택 → 삭제
   - `curriculums` 컬렉션 클릭 → 문서 선택 → 삭제
6. 또는 컬렉션 전체 삭제:
   - 컬렉션 옆 "..." 메뉴 → "컬렉션 삭제"

#### 1-2. Storage에서 이미지 삭제 (선택사항)
1. 좌측 메뉴에서 **"Storage"** 클릭
2. `logos` 폴더 선택
3. 이미지 파일들 삭제

### 방법 2: 브라우저 콘솔에서 코드로 삭제

#### 2-1. 개발자 도구 열기
1. 브라우저에서 F12 키 누르기
2. **"Console"** 탭 클릭

#### 2-2. 초기화 코드 실행
다음 코드를 복사하여 콘솔에 붙여넣고 Enter:

```javascript
// 모든 데이터 삭제
import { db } from './src/firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';

async function resetDB() {
  try {
    // users 컬렉션 삭제
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    usersSnapshot.docs.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
    
    // curriculums 컬렉션 삭제
    const curriculumsRef = collection(db, 'curriculums');
    const curriculumsSnapshot = await getDocs(curriculumsRef);
    curriculumsSnapshot.docs.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
    
    console.log('✅ 데이터베이스 초기화 완료!');
    alert('데이터베이스가 초기화되었습니다. 페이지를 새로고침하세요.');
  } catch (error) {
    console.error('초기화 오류:', error);
    alert('초기화 중 오류가 발생했습니다.');
  }
}

resetDB();
```

### 방법 3: 앱에 초기화 버튼 추가 (개발용)

개발 중에는 앱에 초기화 버튼을 추가할 수 있습니다.

## 🔍 현재 데이터 확인

### Firebase Console에서 확인
1. Firestore Database → 데이터 탭
2. 컬렉션 목록 확인:
   - `users`: 사용자 프로필 데이터
   - `curriculums`: 커리큘럼 데이터

### 브라우저 콘솔에서 확인
```javascript
// 사용자 데이터 확인
import { db } from './src/firebase';
import { collection, getDocs } from 'firebase/firestore';

const usersRef = collection(db, 'users');
const snapshot = await getDocs(usersRef);
console.log('사용자 수:', snapshot.size);
snapshot.docs.forEach(doc => {
  console.log('사용자:', doc.id, doc.data());
});
```

## ⚠️ 주의사항

- **데이터 삭제는 되돌릴 수 없습니다!**
- 프로덕션 환경에서는 신중하게 사용하세요
- 개발/테스트 환경에서만 사용하는 것을 권장합니다

## 🆘 문제 해결

### "프로필을 찾을 수 없습니다" 오류

이 오류가 발생하는 경우:

1. **로컬 스토리지 확인**
   - 브라우저 개발자 도구(F12) → Application → Local Storage
   - `profileId` 키 삭제
   - 페이지 새로고침

2. **Firebase 데이터 확인**
   - Firebase Console에서 `users` 컬렉션에 데이터가 있는지 확인
   - 이메일로 검색하여 사용자 데이터 확인

3. **로그인 다시 시도**
   - 로그아웃 후 다시 로그인
   - 새 계정으로 가입

## 📝 초기화 후 재시작

1. 데이터베이스 초기화 완료
2. 브라우저 로컬 스토리지 삭제 (F12 → Application → Clear Storage)
3. 페이지 새로고침 (F5)
4. 새 계정으로 가입 시작

