import { cn } from '@/shared/lib/cn';

// Pop Art Style SVG Components
// Thick borders, flat colors, simple shapes

export const PopCactus = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full drop-shadow-[2px_2px_0_rgba(0,0,0,1)]", className)}>
    {/* Pot */}
    <path d="M20 70 L25 95 L75 95 L80 70 Z" fill="#E67E22" stroke="black" strokeWidth="3" />
    <text x="33" y="88" fontSize="10" fontFamily="sans-serif" fontWeight="bold" fill="black">PLANT</text>
    {/* Cactus Body */}
    <path d="M40 70 L40 30 A 10 10 0 0 1 60 30 L60 70 Z" fill="#2ECC71" stroke="black" strokeWidth="3" />
    {/* Arms */}
    <path d="M40 50 L30 50 A 5 5 0 0 0 30 60 L40 60" fill="#2ECC71" stroke="black" strokeWidth="3" />
    <path d="M60 40 L70 40 A 5 5 0 0 1 70 50 L60 50" fill="#2ECC71" stroke="black" strokeWidth="3" />
    {/* Prickles */}
    <path d="M45 35 L48 38 M55 35 L52 38 M50 50 L53 53" stroke="black" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const PopLamp = ({ className, on }: { className?: string, on?: boolean }) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full drop-shadow-[2px_2px_0_rgba(0,0,0,1)]", className)}>
    {/* Stand */}
    <path d="M45 95 L55 95 L55 40 L45 40 Z" fill="#34495E" stroke="black" strokeWidth="3" />
    <path d="M30 95 L70 95" stroke="black" strokeWidth="3" strokeLinecap="round" />
    {/* Shade */}
    <path d="M30 40 L70 40 L60 15 L40 15 Z" fill={on ? "#F1C40F" : "#95A5A6"} stroke="black" strokeWidth="3" />
    {/* Light Beam (Optional) */}
    {on && <path d="M35 42 L10 90 L90 90 L65 42" fill="url(#lightGradient)" opacity="0.3" />}
    <defs>
      <linearGradient id="lightGradient" x1="0.5" y1="0" x2="0.5" y2="1">
        <stop offset="0%" stopColor="#F1C40F" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#F1C40F" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

export const PopClock = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full drop-shadow-[2px_2px_0_rgba(0,0,0,1)]", className)}>
    <circle cx="50" cy="50" r="40" fill="#ECF0F1" stroke="black" strokeWidth="3" />
    <circle cx="50" cy="50" r="3" fill="black" />
    <line x1="50" y1="50" x2="50" y2="25" stroke="black" strokeWidth="3" strokeLinecap="round" />
    <line x1="50" y1="50" x2="70" y2="50" stroke="black" strokeWidth="3" strokeLinecap="round" />
    {/* Marks */}
    <line x1="50" y1="15" x2="50" y2="20" stroke="black" strokeWidth="2" />
    <line x1="85" y1="50" x2="80" y2="50" stroke="black" strokeWidth="2" />
    <line x1="50" y1="85" x2="50" y2="80" stroke="black" strokeWidth="2" />
    <line x1="15" y1="50" x2="20" y2="50" stroke="black" strokeWidth="2" />
  </svg>
);

export const PopRobot = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full drop-shadow-[2px_2px_0_rgba(0,0,0,1)]", className)}>
    {/* Legs */}
    <rect x="35" y="80" width="10" height="15" fill="#95A5A6" stroke="black" strokeWidth="3" />
    <rect x="55" y="80" width="10" height="15" fill="#95A5A6" stroke="black" strokeWidth="3" />
    {/* Body */}
    <rect x="30" y="40" width="40" height="40" rx="4" fill="#3498DB" stroke="black" strokeWidth="3" />
    {/* Head */}
    <rect x="35" y="15" width="30" height="25" rx="4" fill="#E74C3C" stroke="black" strokeWidth="3" />
    {/* Eyes */}
    <circle cx="43" cy="27" r="3" fill="#F1C40F" stroke="black" strokeWidth="1" />
    <circle cx="57" cy="27" r="3" fill="#F1C40F" stroke="black" strokeWidth="1" />
    {/* Antenna */}
    <line x1="50" y1="15" x2="50" y2="5" stroke="black" strokeWidth="2" />
    <circle cx="50" cy="5" r="3" fill="#F1C40F" stroke="black" strokeWidth="2" />
  </svg>
);

// --- FURNITURE & DECORATION PACK ---

export const PopRugCircle = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full drop-shadow-[2px_2px_0_rgba(0,0,0,1)]", className)}>
    {/* Base Rug */}
    <circle cx="50" cy="50" r="45" fill="#E67E22" stroke="black" strokeWidth="3" />
    <circle cx="50" cy="50" r="35" fill="none" stroke="black" strokeWidth="2" strokeDasharray="5,5" />
    <circle cx="50" cy="50" r="15" fill="#F1C40F" stroke="black" strokeWidth="3" />
  </svg>
);

export const PopRugRect = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full drop-shadow-[2px_2px_0_rgba(0,0,0,1)]", className)}>
    <rect x="10" y="20" width="80" height="60" rx="4" fill="#9B59B6" stroke="black" strokeWidth="3" />
    {/* Pattern */}
    <path d="M20 20 L20 80 M30 20 L30 80 M40 20 L40 80 M50 20 L50 80 M60 20 L60 80 M70 20 L70 80 M80 20 L80 80" stroke="black" strokeWidth="1" strokeOpacity="0.3" />
    {/* Tassels */}
    <path d="M5 25 L10 25 M5 35 L10 35 M5 45 L10 45 M5 55 L10 55 M5 65 L10 65 M5 75 L10 75" stroke="black" strokeWidth="2" />
    <path d="M90 25 L95 25 M90 35 L95 35 M90 45 L95 45 M90 55 L95 55 M90 65 L95 65 M90 75 L95 75" stroke="black" strokeWidth="2" />
  </svg>
);

export const PopChair = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full drop-shadow-[2px_2px_0_rgba(0,0,0,1)]", className)}>
    {/* Legs */}
    <path d="M25 90 L25 60 M75 90 L75 60" stroke="black" strokeWidth="4" />
    <path d="M35 60 L35 90 M65 60 L65 90" stroke="black" strokeWidth="4" />
    {/* Seat */}
    <rect x="20" y="55" width="60" height="10" rx="2" fill="#E74C3C" stroke="black" strokeWidth="3" />
    {/* Backrest */}
    <path d="M25 55 L25 20 A 5 5 0 0 1 75 20 L75 55" fill="#C0392B" stroke="black" strokeWidth="3" />
    <path d="M35 55 L35 25 M45 55 L45 25 M55 55 L55 25 M65 55 L65 25" stroke="black" strokeWidth="2" />
  </svg>
);

export const PopTable = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full drop-shadow-[2px_2px_0_rgba(0,0,0,1)]", className)}>
    {/* Legs */}
    <path d="M20 90 L20 40 M80 90 L80 40 M30 40 L30 85 M70 40 L70 85" stroke="#7F8C8D" strokeWidth="4" />
    {/* Top */}
    <rect x="10" y="35" width="80" height="10" rx="2" fill="#F39C12" stroke="black" strokeWidth="3" />
    {/* Shine */}
    <path d="M15 40 L35 40" stroke="white" strokeWidth="2" opacity="0.5" />
  </svg>
);

export const PopPlantLarge = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full drop-shadow-[2px_2px_0_rgba(0,0,0,1)]", className)}>
    {/* Pot */}
    <path d="M30 70 L35 95 L65 95 L70 70 Z" fill="#34495E" stroke="black" strokeWidth="3" />
    {/* Leaves */}
    <ellipse cx="50" cy="40" rx="15" ry="30" fill="#2ECC71" stroke="black" strokeWidth="3" />
    <ellipse cx="30" cy="50" rx="10" ry="20" transform="rotate(-30 30 50)" fill="#27AE60" stroke="black" strokeWidth="3" />
    <ellipse cx="70" cy="50" rx="10" ry="20" transform="rotate(30 70 50)" fill="#27AE60" stroke="black" strokeWidth="3" />
  </svg>
);

export const PopFrame = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full drop-shadow-[2px_2px_0_rgba(0,0,0,1)]", className)}>
    {/* Frame */}
    <rect x="15" y="15" width="70" height="70" fill="#ECF0F1" stroke="black" strokeWidth="3" />
    {/* Inner Image Area */}
    <rect x="25" y="25" width="50" height="50" fill="#3498DB" stroke="black" strokeWidth="2" />
    {/* Abstract Art */}
    <circle cx="40" cy="40" r="5" fill="#F1C40F" stroke="black" strokeWidth="2" />
    <path d="M30 75 L45 50 L60 65 L75 40" fill="none" stroke="white" strokeWidth="2" />
  </svg>
);

export const PopWindow = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full drop-shadow-[2px_2px_0_rgba(0,0,0,1)]", className)}>
    {/* Frame */}
    <rect x="10" y="10" width="80" height="80" fill="#BDC3C7" stroke="black" strokeWidth="3" />
    {/* Glass */}
    <rect x="15" y="15" width="32" height="32" fill="#81D4FA" stroke="black" strokeWidth="2" />
    <rect x="53" y="15" width="32" height="32" fill="#81D4FA" stroke="black" strokeWidth="2" />
    <rect x="15" y="53" width="32" height="32" fill="#81D4FA" stroke="black" strokeWidth="2" />
    <rect x="53" y="53" width="32" height="32" fill="#81D4FA" stroke="black" strokeWidth="2" />
    {/* Reflection */}
    <path d="M20 20 L30 30" stroke="white" strokeWidth="3" opacity="0.7" />
  </svg>
);

export const PopCat = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full drop-shadow-[2px_2px_0_rgba(0,0,0,1)]", className)}>
    {/* Body */}
    <ellipse cx="50" cy="65" rx="30" ry="25" fill="#34495E" stroke="black" strokeWidth="3" />
    {/* Head */}
    <circle cx="50" cy="35" r="22" fill="#34495E" stroke="black" strokeWidth="3" />
    {/* Ears */}
    <path d="M30 25 L30 10 L45 20" fill="#34495E" stroke="black" strokeWidth="3" />
    <path d="M70 25 L70 10 L55 20" fill="#34495E" stroke="black" strokeWidth="3" />
    {/* Face */}
    <circle cx="42" cy="32" r="3" fill="white" />
    <circle cx="58" cy="32" r="3" fill="white" />
    <path d="M50 40 L45 45 M50 40 L55 45" stroke="white" strokeWidth="2" />
    {/* Tail */}
    <path d="M75 70 Q 90 60 90 40" fill="none" stroke="#34495E" strokeWidth="6" strokeLinecap="round" />
    <path d="M75 70 Q 90 60 90 40" fill="none" stroke="black" strokeWidth="3" /> {/* Outline hack could be better but ok for now */}
  </svg>
);

export const PopShelf = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full drop-shadow-[2px_2px_0_rgba(0,0,0,1)]", className)}>
    {/* Frame */}
    <rect x="5" y="10" width="90" height="80" fill="#D35400" stroke="black" strokeWidth="3" />
    {/* Inner Back */}
    <rect x="10" y="15" width="80" height="70" fill="#F39C12" stroke="black" strokeWidth="2" />
    {/* Shelves */}
    <line x1="10" y1="40" x2="90" y2="40" stroke="black" strokeWidth="3" />
    <line x1="10" y1="65" x2="90" y2="65" stroke="black" strokeWidth="3" />
    {/* Wood Texture Detail */}
    <path d="M15 20 L25 30" stroke="black" strokeWidth="1" opacity="0.2" />
    <path d="M85 80 L75 70" stroke="black" strokeWidth="1" opacity="0.2" />
  </svg>
);
