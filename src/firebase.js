// Firebase 설정 파일
// ⚠️ 보안 주의: 실제 프로덕션 환경에서는 환경변수로 관리하세요

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// 환경변수에서 가져오거나 기본값 사용
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDBDRT042h98U3TFzuWgPedwmgwfrwB41U",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "instapro-33c7b.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "instapro-33c7b",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "instapro-33c7b.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "759406377032",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:759406377032:web:099959715a914678b4c07d"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firestore 인스턴스
export const db = getFirestore(app);

// Storage 인스턴스 (이미지 업로드용)
export const storage = getStorage(app);

export default app;

