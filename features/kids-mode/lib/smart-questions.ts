export interface QuestionOption {
  label: string;
  description: string;
  tags?: string[];
  kdc?: string;
  situation?: string;
  personality?: string;
}

export interface SmartQuestion {
  id: string;
  question: string;
  options: QuestionOption[];
}

export const SMART_QUESTIONS: SmartQuestion[] = [
  {
    id: "interest",
    question: "우리 아이는 요즘 무엇에 관심이 많나요?",
    options: [
      {
        label: "동물 🐶",
        description: "강아지, 고양이, 동물원",
        tags: ["동물 그림책"], // ✅ 단순화
        kdc: "47" // 생물과학
      },
      {
        label: "자동차 🚗",
        description: "탈것, 기차, 비행기",
        tags: ["자동차 그림책"], // ✅ 단순화
        kdc: "53" // 공학
      },
      {
        label: "공주/왕자 👑",
        description: "판타지, 왕국 이야기",
        tags: ["공주 그림책"], // ✅ 단순화
        kdc: "8" // 문학
      },
      {
        label: "공룡 🦕",
        description: "공룡, 고생물학",
        tags: ["공룡 그림책"], // ✅ 단순화
        kdc: "4" // 자연과학
      },
      {
        label: "우주 🚀",
        description: "우주, 별, 행성",
        tags: ["우주 그림책"], // ✅ 단순화
        kdc: "44" // 천문학
      },
      {
        label: "요리/음식 🍳",
        description: "요리, 음식 만들기",
        tags: ["음식 그림책"], // ✅ 단순화
        kdc: "59" // 가정학
      },
      {
        label: "잘 모르겠어요 ❓",
        description: "인기 도서를 보여드릴게요",
        tags: ["그림책"] // ✅ 가장 일반적인 키워드
      },
    ]
  },
  {
    id: "timing",
    question: "언제 함께 읽을 예정인가요?",
    options: [
      {
        label: "잠자기 전 🌙",
        description: "편안하고 따뜻한 이야기",
        situation: "sleep",
        tags: [] // ✅ 제거 (중복 방지)
      },
      {
        label: "낮 시간 ☀️",
        description: "활동적이고 즐거운 이야기",
        situation: "day",
        tags: [] // ✅ 제거 (중복 방지)
      },
      {
        label: "언제든 📚",
        description: "다양한 이야기",
        situation: "anytime",
        tags: []
      },
    ]
  },
  {
    id: "personality",
    question: "우리 아이는 어떤 성향인가요?",
    options: [
      {
        label: "활발하고 에너지 넘침 ⚡",
        description: "모험, 활동적인 내용",
        personality: "active",
        tags: [] // ✅ 제거 (중복 방지)
      },
      {
        label: "조용하고 차분함 🌸",
        description: "잔잔하고 따뜻한 내용",
        personality: "calm",
        tags: [] // ✅ 제거 (중복 방지)
      },
      {
        label: "호기심 많고 질문 많음 🤔",
        description: "과학, 지식 관련 내용",
        personality: "curious",
        tags: ["과학책"], // ✅ 단순화
        kdc: "4" // 자연과학
      },
    ]
  },
];

export interface SmartAnswers {
  interest?: QuestionOption;
  timing?: QuestionOption;
  personality?: QuestionOption;
}

export function buildSearchQuery(answers: SmartAnswers): {
  keyword: string;
  kdc?: string;
} {
  const tags: string[] = [];
  let kdc: string | undefined;

  // 1. 관심사가 있으면 그것을 최우선으로 사용
  if (answers.interest) {
    if (answers.interest.tags && answers.interest.tags.length > 0) {
      tags.push(...answers.interest.tags);
    }
    if (answers.interest.kdc) {
      kdc = answers.interest.kdc;
    }
  }

  // 2. 관심사 태그가 없을 때만 성향 태그 사용 (충돌 방지)
  if (tags.length === 0 && answers.personality) {
    if (answers.personality.tags && answers.personality.tags.length > 0) {
      tags.push(...answers.personality.tags);
    }
    // KDC도 관심사가 없을 때만 적용
    if (answers.personality.kdc && !kdc) {
      kdc = answers.personality.kdc;
    }
  }

  // 3. 타이밍 태그는 보조적으로 사용하되, 검색어가 너무 길어지지 않게 주의 (현재는 비워둠)
  if (answers.timing && answers.timing.tags) {
     // 필요 시 추가
  }

  return {
    keyword: tags.join(" ") || "어린이 베스트셀러",
    kdc,
  };
}
