// Firebase 데이터베이스 초기화 유틸리티
// ⚠️ 주의: 이 코드는 모든 데이터를 삭제합니다!

import { db } from '../firebase';
import { collection, getDocs, doc, deleteDoc, query, where } from 'firebase/firestore';

/**
 * 모든 사용자 데이터 삭제
 */
export async function resetUsers() {
  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    console.log(`✅ ${querySnapshot.docs.length}개의 사용자 데이터가 삭제되었습니다.`);
    return { success: true, count: querySnapshot.docs.length };
  } catch (error) {
    console.error('사용자 데이터 삭제 오류:', error);
    throw error;
  }
}

/**
 * 모든 커리큘럼 데이터 삭제
 */
export async function resetCurriculums() {
  try {
    const curriculumsRef = collection(db, 'curriculums');
    const querySnapshot = await getDocs(curriculumsRef);
    
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    console.log(`✅ ${querySnapshot.docs.length}개의 커리큘럼 데이터가 삭제되었습니다.`);
    return { success: true, count: querySnapshot.docs.length };
  } catch (error) {
    console.error('커리큘럼 데이터 삭제 오류:', error);
    throw error;
  }
}

/**
 * 모든 데이터 초기화 (사용자 + 커리큘럼)
 */
export async function resetAllData() {
  try {
    console.log('🗑️ 데이터베이스 초기화 시작...');
    
    const [usersResult, curriculumsResult] = await Promise.all([
      resetUsers(),
      resetCurriculums()
    ]);
    
    console.log('✅ 데이터베이스 초기화 완료!');
    return {
      success: true,
      usersDeleted: usersResult.count,
      curriculumsDeleted: curriculumsResult.count
    };
  } catch (error) {
    console.error('데이터베이스 초기화 오류:', error);
    throw error;
  }
}

/**
 * 특정 이메일의 사용자 데이터만 삭제
 */
export async function deleteUserByEmail(email) {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email.toLowerCase().trim()));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('해당 이메일의 사용자를 찾을 수 없습니다.');
      return { success: false, message: '사용자를 찾을 수 없습니다.' };
    }
    
    const deletePromises = querySnapshot.docs.map(doc => {
      // 관련 커리큘럼도 삭제
      return Promise.all([
        deleteDoc(doc.ref),
        deleteUserCurriculums(doc.id)
      ]);
    });
    
    await Promise.all(deletePromises);
    
    console.log(`✅ ${querySnapshot.docs.length}개의 사용자 데이터가 삭제되었습니다.`);
    return { success: true, count: querySnapshot.docs.length };
  } catch (error) {
    console.error('사용자 삭제 오류:', error);
    throw error;
  }
}

/**
 * 특정 사용자의 커리큘럼 삭제
 */
async function deleteUserCurriculums(userId) {
  try {
    const curriculumsRef = collection(db, 'curriculums');
    const q = query(curriculumsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    return querySnapshot.docs.length;
  } catch (error) {
    console.error('커리큘럼 삭제 오류:', error);
    return 0;
  }
}

