/**
 * 🎭 Framer Motion Animation Variants
 * 프리미엄 느낌의 애니메이션 프리셋 모음
 */

// 💫 페이지 진입 애니메이션
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.4 }
};

// 🎪 스태거 컨테이너 (순차적 등장)
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

export const staggerItem = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

// 💫 떠오르는 카드
export const floatingCard = {
  initial: { scale: 0.9, opacity: 0, y: 40 },
  animate: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      mass: 1
    }
  },
  exit: {
    scale: 0.9,
    opacity: 0,
    y: 20,
    transition: { duration: 0.2 }
  }
};

// 🎨 호버 효과
export const hoverScale = {
  whileHover: {
    scale: 1.05,
    y: -4,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  },
  whileTap: { scale: 0.98 }
};

export const hoverGlow = {
  whileHover: {
    boxShadow: "0 12px 40px rgba(168, 85, 247, 0.25)",
    transition: { duration: 0.2 }
  }
};

// ✨ 버튼 애니메이션
export const buttonPress = {
  whileTap: {
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

export const buttonHover = {
  whileHover: {
    scale: 1.02,
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  whileTap: {
    scale: 0.98
  }
};

// 🌟 펄스 애니메이션 (로고, 배지 등)
export const pulseAnimation = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.9, 1, 0.9],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// 🎭 모달/바텀시트 애니메이션
export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 }
};

export const modalContent = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 }
  }
};

// 📱 슬라이드 인 애니메이션
export const slideInFromBottom = {
  initial: { y: "100%", opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20
    }
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

export const slideInFromRight = {
  initial: { x: "100%", opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20
    }
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

// 🎯 책 카드 3D 틸트 효과 (호버)
export const bookCardHover = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.05,
    y: -8,
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  tap: { scale: 0.98 }
};

// ⚡ 빠른 피드백 (탭/클릭)
export const quickFeedback = {
  whileTap: {
    scale: 0.95,
    transition: { duration: 0.05 }
  }
};

// 🌈 배지 등장 애니메이션
export const badgeBounce = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15
    }
  }
};

// 💬 텍스트 타이핑 효과를 위한 variants
export const textReveal = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};
