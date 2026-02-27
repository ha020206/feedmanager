import { X } from 'lucide-react';

export default function PostDetail({ post, onClose }) {
  if (!post) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800">{post.stepTitle}</h3>
            <p className="text-sm text-gray-600 mt-1">Step {post.step}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="p-6">
          {/* 게시물 이미지 */}
          {post.imageUrl && (
            <div className="w-full mb-6 rounded-lg overflow-hidden">
              <img
                src={post.imageUrl}
                alt={post.stepTitle}
                className="w-full h-auto object-cover"
                loading="lazy"
                onLoad={(e) => {
                  e.target.style.opacity = '1';
                }}
                onError={(e) => {
                  e.target.src = 'https://placehold.co/800x800?text=Image+Error';
                }}
                style={{ opacity: 0, transition: 'opacity 0.3s' }}
              />
            </div>
          )}

          {/* 게시물 텍스트 */}
          <div className="mb-4">
            <div className="mb-3">
              <span className="text-xs text-purple-600 font-semibold">
                Step {post.step}: {post.stepTitle}
              </span>
            </div>
            <p className="text-gray-800 whitespace-pre-wrap text-lg leading-relaxed">
              {post.text}
            </p>
          </div>

          {/* 날짜 */}
          <div className="text-sm text-gray-500 border-t border-gray-200 pt-4">
            {new Date(post.createdAt).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>
    </div>
  );
}





