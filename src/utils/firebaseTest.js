// Firebase 연결 테스트 유틸리티
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';

/**
 * Firebase 연결 테스트
 */
export async function testFirebaseConnection() {
  try {
    console.log('🔍 Firebase 연결 테스트 시작...');
    
    // 1. Firestore 인스턴스 확인
    if (!db) {
      throw new Error('Firestore 인스턴스가 초기화되지 않았습니다.');
    }
    console.log('✅ Firestore 인스턴스 확인됨');

    // 2. 테스트 컬렉션 읽기 시도
    try {
      const testQuery = query(collection(db, 'users'), limit(1));
      await getDocs(testQuery);
      console.log('✅ Firestore 읽기 권한 확인됨');
    } catch (error) {
      if (error.code === 'permission-denied') {
        console.error('❌ Firestore 읽기 권한이 없습니다.');
        console.error('💡 해결 방법: Firebase Console > Firestore Database > 규칙 탭에서 보안 규칙을 확인하세요.');
        throw new Error('Firestore 읽기 권한이 없습니다. 보안 규칙을 확인해주세요.');
      }
      throw error;
    }

    // 3. 테스트 데이터 쓰기 시도 (선택적)
    try {
      const testData = {
        test: true,
        timestamp: new Date().toISOString()
      };
      await addDoc(collection(db, 'test'), testData);
      console.log('✅ Firestore 쓰기 권한 확인됨');
    } catch (error) {
      if (error.code === 'permission-denied') {
        console.warn('⚠️ Firestore 쓰기 권한이 없습니다. (보안 규칙 확인 필요)');
      } else {
        console.warn('⚠️ 테스트 데이터 쓰기 실패:', error.message);
      }
    }

    console.log('✅ Firebase 연결 테스트 완료!');
    return { success: true, message: 'Firebase 연결이 정상입니다.' };
  } catch (error) {
    console.error('❌ Firebase 연결 테스트 실패:', error);
    return { 
      success: false, 
      message: error.message || 'Firebase 연결에 실패했습니다.',
      error: error
    };
  }
}

