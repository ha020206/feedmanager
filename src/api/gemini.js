// Gemini API 설정 파일
import { GoogleGenerativeAI } from '@google/generative-ai';

// 환경변수에서만 API 키 사용 (유출 방지). .env 파일에 VITE_GEMINI_API_KEY=발급받은키 입력
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === '') {
  console.warn(
    '⚠️ VITE_GEMINI_API_KEY가 없습니다. 프로젝트 루트에 .env 파일을 만들고\n' +
    '   VITE_GEMINI_API_KEY=여기에_새_API_키\n' +
    '   를 입력한 뒤 서버를 다시 실행하세요. (새 키 발급: https://aistudio.google.com/apikey)'
  );
}

// Gemini 클라이언트 초기화 (키가 있을 때만 사용)
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

/**
 * 단일 Gemini 모델 설정
 * - 너무 많은 모델을 번갈아 시도하면 429(Too Many Requests)가 쉽게 발생하므로
 *   실제로 사용 가능한 최신/경량 모델 하나만 고정해서 사용한다.
 */
const GEMINI_MODEL = 'gemini-2.0-flash-lite';

/**
 * 공통 Gemini 호출 헬퍼
 * - 429(Too Many Requests)를 사용자 친화적인 메시지로 변환
 * - 그 외 에러는 그대로 전달
 */
async function generateWithGemini(prompt) {
  if (!genAI) {
    throw new Error(
      'Gemini API 키가 설정되지 않았습니다. .env 파일에 VITE_GEMINI_API_KEY=새_API_키 를 넣고 서버를 재시작하세요. 새 키: https://aistudio.google.com/apikey'
    );
  }
  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContent(prompt);
    return result.response;
  } catch (error) {
    const msg = error?.message || String(error);

    if (msg.includes('429') || msg.toLowerCase().includes('too many requests')) {
      throw new Error('Gemini 무료 사용량이 초과되었습니다. 잠시 후 다시 시도해주세요.');
    }
    if (msg.includes('403') || msg.toLowerCase().includes('leaked') || msg.toLowerCase().includes('api key')) {
      throw new Error(
        'API 키가 차단되었거나 유효하지 않습니다. 새 API 키를 발급해 .env의 VITE_GEMINI_API_KEY에 넣고 서버를 재시작하세요. https://aistudio.google.com/apikey'
      );
    }
    throw error;
  }
}

/**
 * AI 브랜딩 추천 생성
 * 수정: 로고 키워드를 '오브제' 중심으로 명확하게 요청하여 이상한 이미지 생성 방지
 */
export async function generateBranding(userData) {

  const prompt = `
당신은 인스타그램 퍼스널 브랜딩 전문가입니다.
사용자 정보를 바탕으로 **가장 트렌디하고 세련된** 계정 정보를 기획해주세요.

[사용자 데이터]
- 카테고리: ${userData.interest}
- 소개: ${userData.introduction}
- 스타일: ${userData.style}
- 타겟: ${userData.targetAudience}
- 목표: ${userData.goal}
- 차별점(USP): ${userData.usp}

[작업 가이드]
1. **username (아이디)**:
   - 촌스러운 숫자나 특수문자 난사 금지.
   - 영문 소문자, 온점(.), 언더바(_)만 사용.
   - 감성적이고 기억하기 쉬운 아이디 (예: mood.archive, studio_min, daily.log).

2. **bio (소개글)**:
   - **반드시 줄바꿈(\n)**을 사용하여 3줄~4줄로 구성.
   - [정체성] -> [제공 가치] -> [가벼운 소통 제안] 순서.
   - "DM 주세요" 금지. "프로필 링크"나 "소통 환영"으로 대체.
   - 이모지는 라인당 1개로 절제.

3. **logoKeyword (프로필 이미지 묘사)**:
   - 추상적인 단어(행복, 성공) 금지. **눈에 보이는 구체적인 사물(Object)** 위주로 묘사.
   - 글자, 텍스트, 알파벳 포함 금지.
   - 예시:
     - (X) "성공을 위한 열정적인 로고"
     - (O) "A minimal coffee cup with steam, soft sunlight, white background"
     - (O) "Cute 3D avatar wearing hoodie, pastel colors, soft lighting"

반드시 **순수 JSON 포맷**으로만 응답하세요. (Markdown code block 없이):
{
  "recommendations": {
    "username": ["추천ID1", "추천ID2", "추천ID3"],
    "bio": ["소개글1(줄바꿈포함)", "소개글2(줄바꿈포함)", "소개글3(줄바꿈포함)"],
    "logoKeyword": "Detailed English object description for image generation..."
  }
}
`;

  try {
    const response = await generateWithGemini(prompt);
    let text = response.text().trim();
    
    // Markdown 코드 블록 제거
    text = text.replace(/^```(json)?|```$/g, '').trim();
    
    console.log('Gemini 브랜딩 응답:', text);
    
    const jsonData = JSON.parse(text);
    
    if (!jsonData.recommendations || 
        !Array.isArray(jsonData.recommendations.username) || 
        !Array.isArray(jsonData.recommendations.bio) ||
        !jsonData.recommendations.logoKeyword) {
      throw new Error('응답 데이터 구조가 올바르지 않습니다.');
    }
    
    return jsonData;
  } catch (error) {
    console.error('Gemini 브랜딩 생성 오류:', error);
    return {
      recommendations: {
        username: ["brand.new_log", "daily.archive", "studio_mood"],
        bio: ["나만의 시선으로 담은 기록\n일상의 작은 틈을 채워요\n함께 소통해요 ✨", "Daily Inspiration\n당신의 일상에 영감을 줍니다.\n팔로우하고 소식 받아보기 👇", "Creator\n성장하는 과정을 공유해요\n유용한 정보는 하이라이트에!"],
        logoKeyword: "simple minimalist shape icon, soft lighting"
      }
    };
  }
}

/**
 * 로고 이미지 생성 (Pollinations API)
 * 수정: 프롬프트 조합 로직을 대폭 수정하여 '이상한 로고' 대신 '고퀄리티 아트워크'가 나오도록 변경
 */
export function generateLogoImage(logoKeyword, userData = {}) {
  const interest = userData.interest || '';
  const goal = userData.goal || '';
  const usp = userData.usp || '';
  const introduction = userData.introduction || '';
  const style = userData.style || '';
  const targetAudience = userData.targetAudience || '';
  
  // 사용자가 입력한 한국어 정보를 그대로 Gemini에게 전달
  const prompt = `
인스타그램 프로필 사진을 생성하기 위한 이미지 프롬프트를 영어로 작성해주세요.

[사용자 정보]
- 관심 분야: ${interest}
- 선호 스타일: ${style}
- 타겟 독자: ${targetAudience}
- 구체적인 목표: ${goal}
- 나의 정체성/차별점: ${usp}
- 자기소개: ${introduction}

[로고 키워드]
${logoKeyword}

[중요 지시사항]
0. 사용자의 거주 지역은 한국입니다. 한국적 정서에 맞는 사진을 구성하세요 
1. 사용자 정보를 모두 반영하여 로고 프로필 사진을 묘사하세요
2. 예쁘고 세련된 디자인: 미니멀하고 깔끔한 스타일, 고급스러운 색감, 부드러운 그라데이션
3. 인스타그램 트렌드: MZ세대가 좋아하는 감성, 핀터레스트 스타일, 모던하고 귀여운 일러스트
4. 프로필 사진 최적화: 원형 프레임에 잘 맞는 중앙 배치, 눈에 띄는 색상, 명확한 포커스
5. 고품질: 선명하고 깨끗한 이미지, 부드러운 라인, 자연스러운 그림자
6. 영어 키워드로만 작성하세요
7. 쉼표로 구분된 키워드 형식으로 작성하세요
8. 텍스트, 로고, 워터마크는 절대 제외하세요
9. 설명 없이 키워드만 출력하세요
10. 사용자의 관심 분야에 좀 더 초점을 맞춘 프로필 사진을 묘사하세요 
11. 사용자가 선호하는 스타일에 맞춰 로고를 만드세요
12. 로고는 많은 사람들이 좋아하는 귀여운 스타일로 만드세요


[키워드 예시]
aesthetic, beautiful, cute, trendy, modern, minimalist, clean design, soft colors, pastel tones, Instagram-worthy, high quality, professional, eye-catching, stylish, elegant
`;

  // Gemini API를 사용하여 프롬프트 생성
  return generateWithGemini(prompt)
    .then(response => {
      let promptText = response.text().trim();
      
      // 예쁜 로고를 위한 키워드 추가
       promptText += 'no text';
      
      const encodedPrompt = encodeURIComponent(promptText);
      const randomSeed = Math.floor(Math.random() * 1000);
      return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=400&height=400&nologo=true&enhance=true&seed=${randomSeed}`;
    })
    .catch(error => {
      console.error('로고 프롬프트 생성 오류:', error);
      // 에러 시 기본값 (예쁜 키워드 포함)
      const encodedPrompt = encodeURIComponent(`${logoKeyword}, no text`);
      const randomSeed = Math.floor(Math.random() * 1000);
      return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=400&height=400&nologo=true&enhance=true&seed=${randomSeed}`;
    });
}

/**
 * 커리큘럼 추천 생성
 */
export async function generateCurriculum(profileData, completedSteps = []) {

  const startStep = completedSteps.length > 0 ? Math.max(...completedSteps) + 1 : 1;
  
  const prompt = `
사용자는 인스타그램 ${completedSteps.length > 0 ? '성장기' : '초기'} 단계입니다. 
사용자의 모든 정보를 바탕으로 팔로워를 팬으로 만드는 **전략적인 5단계 콘텐츠 로드맵**을 짜주세요.

[사용자 계정 정보 - 모두 반영 필수]
- 관심 분야: ${profileData.interest || ''}
- 선호 스타일: ${profileData.style || ''}
- 타겟 독자: ${profileData.targetAudience || ''}
- 구체적인 목표: ${profileData.goal || ''}
- 나의 정체성/차별점: ${profileData.usp || ''}
- 자기소개: ${profileData.introduction || ''}
- 계정명: ${profileData.username || ''}
- 프로필 소개글: ${profileData.bio || ''}

[중요 지시사항]
1. **모든 사용자 정보를 정확히 반영**하여 각 스텝을 기획하세요
2. 관심 분야(${profileData.interest || ''})에 맞는 구체적인 콘텐츠를 제안하세요
3. 타겟 독자(${profileData.targetAudience || ''})가 공감할 수 있는 내용으로 작성하세요
4. 목표(${profileData.goal || ''})를 달성할 수 있는 방향으로 기획하세요
5. 정체성/차별점(${profileData.usp || ''})을 각 스텝에서 자연스럽게 드러내세요
6. 자기소개(${profileData.introduction || ''})의 톤과 내용을 반영하세요
7. 단순한 주제 나열이 아닌, 아래 **마케팅 퍼널** 순서에 맞춰 구체적인 콘텐츠를 기획하세요

[마케팅 퍼널 순서]
1. **Step ${startStep} (정체성/Identity)**: 내가 누구인지, 어떤 가치를 줄 수 있는지 명확히 보여주는 첫 인상 게시물. 사용자의 정체성(${profileData.usp || ''})과 관심 분야(${profileData.interest || ''})를 강조하세요.
2. **Step ${startStep + 1} (정보/Value)**: 타겟 독자(${profileData.targetAudience || ''})가 "저장" 버튼을 누를 수밖에 없는 유용한 정보나 꿀팁. 관심 분야(${profileData.interest || ''})와 관련된 실용적인 내용을 제공하세요.
3. **Step ${startStep + 2} (공감/Relatable)**: 완벽한 모습보다는 인간적인 매력, 비하인드 스토리, 혹은 실패 극복기. 자기소개(${profileData.introduction || ''})의 톤을 반영하여 공감대를 형성하세요.
4. **Step ${startStep + 3} (소통/Engagement)**: 질문을 던지거나, 투표를 유도하거나, 댓글을 달게 만드는 참여형 콘텐츠. 타겟 독자(${profileData.targetAudience || ''})가 참여하고 싶어하는 주제로 기획하세요.
5. **Step ${startStep + 4} (권위/Authority)**: 나의 전문성을 입증하거나, 성과를 보여주거나, 서비스를 홍보하는 콘텐츠. 목표(${profileData.goal || ''})를 달성하기 위한 구체적인 행동을 유도하세요.

[응답 형식]
반드시 **순수 JSON**으로만 응답하세요:
{
  "steps": [
    {"step": ${startStep}, "title": "제목(이목을 끄는 카피)", "description": "구체적인 기획 의도와 촬영 가이드 (한 문장)"},
    {"step": ${startStep + 1}, "title": "제목", "description": "내용"},
    {"step": ${startStep + 2}, "title": "제목", "description": "내용"},
    {"step": ${startStep + 3}, "title": "제목", "description": "내용"},
    {"step": ${startStep + 4}, "title": "제목", "description": "내용"}
  ]
}

중요: 
- step 번호는 반드시 ${startStep}부터 ${startStep + 4}까지 연속된 번호여야 합니다.
- 각 스텝의 제목과 설명은 사용자의 모든 정보를 반영하여 작성하세요.
- 관심 분야, 목표, 정체성, 타겟 독자, 자기소개를 모두 고려하여 기획하세요.
`;

  try {
    const response = await generateWithGemini(prompt);
    let text = response.text().trim();
    text = text.replace(/^```(json)?|```$/g, '').trim();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]).steps;
    }
    throw new Error('JSON 파싱 실패');
  } catch (error) {
    console.error('Gemini 커리큘럼 생성 오류:', error);
    return [
      {"step": startStep, "title": "첫 인사 & 자기소개", "description": "거울 셀카나 작업 공간 사진과 함께 가볍게 시작하는 나의 이야기"},
      {"step": startStep + 1, "title": "입문자를 위한 Best 3", "description": "이 분야에 관심 있는 사람들이 가장 궁금해할 정보 3가지 정리"},
      {"step": startStep + 2, "title": "What's in my bag", "description": "내가 사용하는 도구나 아이템을 감성적으로 배치하여 소개"},
      {"step": startStep + 3, "title": "Q&A 무물 타임", "description": "스토리 기능을 활용하거나 댓글로 질문을 유도하여 소통하기"},
      {"step": startStep + 4, "title": "나만의 노하우 공개", "description": "나만 알고 있는 팁을 카드뉴스나 릴스 형식으로 제작"}
    ];
  }
}

/**
 * 게시물 예시 데이터 생성
 */
export async function generatePostExample(step, profileData) {
  const prompt = `
다음 기획을 바탕으로 실제 인스타그램에 업로드할 게시물 초안을 작성해주세요.

[기획안]
- 주제: ${step.title}
- 가이드: ${step.description}
- 계정 분야: ${profileData.interest}
- 타겟: ${profileData.targetAudience}

[작성 요구사항]
- 말투: ${profileData.style}한 느낌을 살려서.
- **첫 줄**: 호기심을 자극하는 문장으로 시작.
- **본문**: 가독성 좋게 줄바꿈 자주 사용.
- **마무리**: 댓글이나 저장을 유도하는 멘트 포함.
- 해시태그: 관련 태그 5~7개 포함.

다른 설명 없이 **게시물 본문 내용만** 출력하세요.
`;

  try {
    const response = await generateWithGemini(prompt);
    return response.text().trim();
  } catch (error) {
    console.error('게시물 예시 생성 오류:', error);
    return `오늘은 ${step.title}에 대해 이야기해볼게요.\n\n${step.description}\n\n여러분은 어떠신가요? 💭\n\n#${profileData.interest} #일상 #인스타그램`;
  }
}

/**
 * 게시물 텍스트 다듬기
 */
export async function refinePostText(rawText, profileData) {

  const prompt = `
당신은 베스트셀러 작가이자 인스타그램 인플루언서입니다.
사용자가 대충 입력한 텍스트를 **'좋아요'와 '저장'을 부르는 감성적인 게시물**로 리라이팅(Rewriting)해주세요.

[사용자 원본]
${rawText}

[계정 정보]
- 분야: ${profileData.interest}
- 톤앤매너: ${profileData.style} (이 말투를 반드시 유지하세요)

[필수 수정 가이드]
1. **Hook (첫 문장)**: 피드에서 "더 보기"를 누를 수밖에 없는 매력적인 첫 문장으로 변경.
2. **Body (가독성)**: 벽돌 같은 긴 글은 금지. 문단 사이에 **공백 라인(엔터)**을 넣어 시원하게 배치.
3. **Emoji (감성)**: 문장 끝에 적절한 이모지를 사용하여 딱딱하지 않게 (단, 도배는 금지).
4. **CTA (행동유도)**: "도움이 되셨다면 저장!", "친구 태그!" 등 구체적인 행동 요청으로 마무리.
5. **Hashtags**: 본문과 2~3줄 띄우고, 검색 노출이 잘 되는 핵심 태그 10~15개 선정.

결과물에는 부가 설명 없이 **최종 게시물 텍스트만** 출력하세요.
`;

  try {
    const response = await generateWithGemini(prompt);
    return response.text();
  } catch (error) {
    console.error('Gemini 게시물 다듬기 오류:', error);
    return rawText;
  }
}

/**
 * 이미지 생성 프롬프트 생성
 * 수정: 피드 이미지가 이상하게 나오지 않도록 프롬프트 구조화 (Subject + Style + Technical)
 */
export async function generateImagePrompt(postText, profileData) {

  const prompt = `
인스타그램 피드 사진을 생성하기 위한 이미지 프롬프트를 영어로 작성해주세요.

[게시글 전체 내용]
${postText}

[사용자 계정 정보]
- 관심 분야: ${profileData.interest || ''}
- 선호 스타일: ${profileData.style || ''}
- 타겟 독자: ${profileData.targetAudience || ''}
- 구체적인 목표: ${profileData.goal || ''}
- 나의 정체성/차별점: ${profileData.usp || ''}
- 자기소개: ${profileData.introduction || ''}

[규칙]
0. 사용자의 거주 지역은 한국입니다. 한국적 정서에 맞는 사진을 구성하세요 
1. 게시글 내용을 정확히 반영하여 이미지의 주제와 분위기를 결정하세요
2. 사용자의 모든 정보를 고려하여 이미지를 묘사하세요
3. 영어 키워드로만 작성하세요
4. 문장이 아닌 쉼표로 구분된 키워드 나열 방식으로 작성하세요
5. 텍스트, 로고, 워터마크에 대한 설명은 절대 넣지 마세요
6. 설명 없이 키워드만 출력하세요
`;

  try {
    const response = await generateWithGemini(prompt);
    const promptText = response.text().trim();
    
    console.log('게시물 이미지 프롬프트 (Gemini가 생성):', promptText);
    return promptText;
  } catch (error) {
    console.error('Gemini 이미지 프롬프트 생성 오류:', error);
    // 기본값
    return `Instagram photo, ${profileData.interest || 'lifestyle'}, no text, no watermark`;
  }
}