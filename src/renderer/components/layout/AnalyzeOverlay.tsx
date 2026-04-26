export function AnalyzeOverlay() {
  return (
    <div
      aria-live="polite"
      aria-label="Analyzing UI"
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
      role="status"
    >
      <div className="flex -translate-y-8 flex-col items-center gap-4 rounded-xl border border-border-subtle bg-panel/80 px-8 py-7 text-center shadow-panel backdrop-blur-md">
        <AnalyzerPulse />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-text-primary">Analyzing UI...</p>
          <p className="text-xs text-text-muted">Mapping screens and transitions</p>
        </div>
      </div>
    </div>
  );
}

function AnalyzerPulse() {
  return (
    <svg
      aria-hidden="true"
      className="size-28 text-accent-primary"
      fill="none"
      viewBox="0 0 144 144"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="72" cy="72" fill="currentColor" opacity="0.9" r="22" />
      <circle cx="72" cy="72" opacity="0.28" r="38" stroke="currentColor" strokeWidth="2">
        <animate attributeName="r" dur="2.4s" repeatCount="indefinite" values="34;42;34" />
        <animate attributeName="opacity" dur="2.4s" repeatCount="indefinite" values="0.16;0.42;0.16" />
      </circle>
      <circle cx="72" cy="72" opacity="0.18" r="58" stroke="currentColor" strokeWidth="1.5">
        <animate attributeName="r" dur="2.8s" repeatCount="indefinite" values="50;64;50" />
        <animate attributeName="opacity" dur="2.8s" repeatCount="indefinite" values="0.08;0.28;0.08" />
      </circle>
      <path
        d="M72 16a56 56 0 0 1 48.5 28"
        opacity="0.72"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      >
        <animateTransform
          attributeName="transform"
          dur="3.2s"
          from="0 72 72"
          repeatCount="indefinite"
          to="360 72 72"
          type="rotate"
        />
      </path>
      <path
        d="M72 128a56 56 0 0 1-48.5-28"
        opacity="0.36"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      >
        <animateTransform
          attributeName="transform"
          dur="4.6s"
          from="360 72 72"
          repeatCount="indefinite"
          to="0 72 72"
          type="rotate"
        />
      </path>
    </svg>
  );
}
