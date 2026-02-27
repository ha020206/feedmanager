import { useEffect, useState } from 'react';
import { Settings, Grid, BookOpen, LogOut, UserX, X } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import Curriculum from './Curriculum';
import PostDetail from './PostDetail';

export default function Profile({ userId, onLogout }) {
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'curriculum'
  const [selectedPost, setSelectedPost] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadProfile();
    loadPosts();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setProfileData(docSnap.data());
      } else {
        console.error('프로필 데이터를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('프로필 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      setPostsLoading(true);
      const postsRef = collection(db, 'posts');
      // orderBy를 제거하고 클라이언트에서 정렬 (인덱스 불필요)
      const q = query(
        postsRef, 
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      
      const postsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // 클라이언트에서 타임스탬프 기준으로 정렬
      postsData.sort((a, b) => {
        const timeA = a.timestamp || new Date(a.createdAt).getTime();
        const timeB = b.timestamp || new Date(b.createdAt).getTime();
        return timeB - timeA; // 내림차순 (최신순)
      });
      
      setPosts(postsData);
    } catch (error) {
      console.error('게시물 로드 오류:', error);
      // 인덱스 오류인 경우 사용자에게 안내
      if (error.code === 'failed-precondition') {
        console.warn('Firestore 인덱스가 필요합니다. 게시물은 저장되지만 정렬이 안 될 수 있습니다.');
      }
    } finally {
      setPostsLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      localStorage.clear();
      if (onLogout) {
        onLogout();
      } else {
        window.location.href = '/';
      }
    }
  };

  const handleDeleteAccount = async () => {
    const confirmMessage = '정말 회원탈퇴를 하시겠습니까?\n\n모든 데이터(프로필, 커리큘럼, 게시물)가 영구적으로 삭제되며 복구할 수 없습니다.';
    if (!window.confirm(confirmMessage)) {
      return;
    }

    const finalConfirm = window.confirm('마지막 확인입니다.\n\n정말로 모든 데이터를 삭제하고 탈퇴하시겠습니까?');
    if (!finalConfirm) {
      return;
    }

    try {
      setDeleting(true);

      // 1. 사용자 게시물 삭제
      const postsRef = collection(db, 'posts');
      const postsQuery = query(postsRef, where('userId', '==', userId));
      const postsSnapshot = await getDocs(postsQuery);
      const deletePostsPromises = postsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePostsPromises);
      console.log(`✅ ${postsSnapshot.docs.length}개의 게시물 삭제 완료`);

      // 2. 사용자 커리큘럼 삭제
      const curriculumsRef = collection(db, 'curriculums');
      const curriculumsQuery = query(curriculumsRef, where('userId', '==', userId));
      const curriculumsSnapshot = await getDocs(curriculumsQuery);
      const deleteCurriculumsPromises = curriculumsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deleteCurriculumsPromises);
      console.log(`✅ ${curriculumsSnapshot.docs.length}개의 커리큘럼 삭제 완료`);

      // 3. 사용자 프로필 삭제
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
      console.log('✅ 사용자 프로필 삭제 완료');

      // 4. 로컬 스토리지 클리어
      localStorage.clear();

      alert('회원탈퇴가 완료되었습니다. 모든 데이터가 삭제되었습니다.');
      
      if (onLogout) {
        onLogout();
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('회원탈퇴 오류:', error);
      alert('회원탈퇴 중 오류가 발생했습니다. 다시 시도해주세요.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">프로필을 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-6">
            저장된 프로필 데이터가 없습니다. 로그인 화면으로 돌아가서 다시 시작해주세요.
          </p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            로그인 화면으로 이동
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 인스타그램 스타일 헤더 */}
      <div className="bg-white border-b border-gray-300 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Feed Manager</h1>
          <button
            onClick={() => setShowSettings(true)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Settings className="w-6 h-6 text-gray-800 cursor-pointer hover:text-gray-600" />
          </button>
        </div>
      </div>

      {/* 설정 모달 */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">설정</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                disabled={deleting}
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-3">
              <button
                onClick={handleLogout}
                disabled={deleting}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut className="w-5 h-5 text-gray-700" />
                <span className="text-gray-800 font-medium">로그아웃</span>
              </button>
              
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-red-700 font-medium">삭제 중...</span>
                  </>
                ) : (
                  <>
                    <UserX className="w-5 h-5 text-red-700" />
                    <span className="text-red-700 font-medium">회원탈퇴</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="p-6 pt-0">
              <p className="text-xs text-gray-500 text-center">
                회원탈퇴 시 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 프로필 섹션 */}
      <div className="max-w-3xl mx-auto bg-white">
        <div className="px-4 py-6">
          <div className="flex items-start gap-8">
            {/* 프로필 이미지 */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300">
                <img
                  src={profileData.logoUrl || `https://placehold.co/150?text=${encodeURIComponent(profileData.interest || 'LOGO')}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = `https://placehold.co/150?text=${encodeURIComponent(profileData.interest || 'LOGO')}`;
                  }}
                />
              </div>
            </div>

            {/* 프로필 정보 */}
            <div className="flex-1">
              <div className="mb-4">
                <h2 className="text-2xl font-light text-gray-800 mb-2">
                  {profileData.username}
                </h2>
                <p className="text-gray-800 mb-3 whitespace-pre-line">{profileData.bio}</p>
              </div>

              {/* 통계 (인스타그램 스타일) */}
              <div className="flex gap-6 mb-4">
                <div className="text-center">
                  <div className="font-semibold text-gray-800">{posts.length}</div>
                  <div className="text-sm text-gray-600">게시물</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-800">0</div>
                  <div className="text-sm text-gray-600">팔로워</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-800">0</div>
                  <div className="text-sm text-gray-600">팔로잉</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div className="border-t border-gray-300 flex">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 font-semibold transition-colors ${
              activeTab === 'posts'
                ? 'border-t-2 border-gray-900 text-gray-900'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Grid className="w-5 h-5" />
            <span>게시물</span>
          </button>
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 font-semibold transition-colors ${
              activeTab === 'curriculum'
                ? 'border-t-2 border-gray-900 text-gray-900'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span>커리큘럼</span>
          </button>
        </div>
      </div>

      {/* 컨텐츠 섹션 */}
      {activeTab === 'posts' ? (
        <div className="max-w-3xl mx-auto px-4 py-6">
          {postsLoading ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">게시물을 불러오는 중...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600 mb-4">아직 게시물이 없습니다.</p>
              <p className="text-sm text-gray-500">커리큘럼 탭에서 게시물을 만들어보세요!</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow aspect-square relative group"
                >
                  {/* 게시물 이미지 */}
                  {post.imageUrl ? (
                    <div className="w-full h-full relative">
                      <img
                        src={post.imageUrl}
                        alt={post.stepTitle}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onLoad={(e) => {
                          e.target.style.opacity = '1';
                        }}
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/400x400?text=Image+Error';
                        }}
                        style={{ opacity: 0, transition: 'opacity 0.3s' }}
                      />
                      {/* 호버 오버레이 */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-center px-4">
                          <p className="font-semibold text-sm mb-1">{post.stepTitle}</p>
                          <p className="text-xs">클릭하여 자세히 보기</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-4">
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700 mb-1">{post.stepTitle}</p>
                        <p className="text-xs text-gray-500 line-clamp-2">{post.text.substring(0, 50)}...</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {selectedPost && (
            <PostDetail
              post={selectedPost}
              onClose={() => setSelectedPost(null)}
            />
          )}
        </div>
      ) : (
        <Curriculum 
          profileData={profileData} 
          userId={userId} 
          onPostSaved={loadPosts}
        />
      )}
    </div>
  );
}
