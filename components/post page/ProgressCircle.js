export function ProgressCircle({ progress }) {
  return (
    <div className="fixed right-2 top-25 z-40">
      <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E0F0F6" strokeWidth="3" />
        <circle
          cx="18"
          cy="18"
          r="15.915"
          fill="none"
          stroke="#8EB7C6"
          strokeWidth="3"
          strokeDasharray={`${progress},100`}
          strokeLinecap="round"
          className="transition-all duration-150"
        />
      </svg>
    </div>
  );
}
