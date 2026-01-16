export const Logo = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="0"
  >
    {/* Background Circle Gradient (Optional, usually handled by container but added here for standalone usage if needed) */}
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#9333EA" /> {/* Purple 600 */}
        <stop offset="100%" stopColor="#4F46E5" /> {/* Indigo 600 */}
      </linearGradient>
    </defs>

    {/* Roof / House Shape */}
    <path
      d="M50 15L15 45H25V85H75V45H85L50 15Z"
      fill="url(#logoGradient)"
      opacity="0.2"
    />
    
    {/* Open Book Shape (Central Focus) */}
    <path
      d="M50 80C50 80 35 85 20 80V45C35 50 50 45 50 45C50 45 65 50 80 45V80C65 85 50 80 50 80Z"
      fill="url(#logoGradient)"
      className="drop-shadow-sm"
    />
    
    {/* Book Pages Detail (Spine) */}
    <path
      d="M50 45V80"
      stroke="white"
      strokeWidth="4"
      strokeLinecap="round"
    />
  </svg>
);
