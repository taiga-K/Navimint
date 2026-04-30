import { useWorkspace } from '../../features/workspace/use-workspace';
import { cn } from '../../lib/cn';
import { compactProjectLabel } from '../../lib/project-label';

interface WorkspaceHeaderProps {
  analysisFeedback: AnalysisFeedback | null;
  isAnalyzing: boolean;
  onAnalyzeUi: () => void;
  onOpenSettings: () => void;
}

const ICON_BUTTON_CLASS =
  'inline-flex size-8 cursor-pointer items-center justify-center rounded-md border border-border-strong bg-panel text-text-muted transition-colors duration-[120ms] hover:border-accent-primary hover:bg-elevated hover:text-text-primary focus:outline-none focus-visible:shadow-focus';

export type AnalysisFeedback =
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

export function WorkspaceHeader({
  analysisFeedback,
  isAnalyzing,
  onAnalyzeUi,
  onOpenSettings,
}: WorkspaceHeaderProps) {
  const { state } = useWorkspace();
  const hasProject = state.projectRoot !== null;
  const isLoadingScreens = state.loadState === 'loading';
  const isAnalyzeDisabled = !hasProject || isAnalyzing || isLoadingScreens;
  const projectLabel = compactProjectLabel(state.document?.project.name ?? state.projectRoot);

  function handleOpenSettingsClick(): void {
    onOpenSettings();
  }

  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border-strong bg-panel px-3 text-sm text-text-primary">
      <div className="min-w-0">
        <span className="block truncate text-sm font-semibold text-text-primary">
          {projectLabel ?? 'No project'}
        </span>
        {analysisFeedback === null ? null : (
          <span
            className={cn(
              'block truncate text-xs',
              analysisFeedback.kind === 'error'
                ? 'text-accent-danger'
                : 'text-text-muted',
            )}
          >
            {analysisFeedback.message}
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          aria-busy={isAnalyzing}
          className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border border-border-strong bg-elevated px-3 text-xs font-semibold text-text-secondary transition-colors duration-[120ms] hover:border-accent-primary hover:text-text-primary focus:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border-strong disabled:hover:text-text-secondary"
          disabled={isAnalyzeDisabled}
          onClick={onAnalyzeUi}
          title={hasProject ? 'Analyze UI' : 'Open a project folder first'}
          type="button"
        >
          <AnalyzeUiIcon active={isAnalyzing} />
          {isAnalyzing ? 'Analyzing...' : isLoadingScreens ? 'Loading...' : 'Analyze UI'}
        </button>
        <button
          aria-label="Open settings"
          className={ICON_BUTTON_CLASS}
          onClick={handleOpenSettingsClick}
          title="Settings"
          type="button"
        >
          <Cog6ToothIcon />
        </button>
      </div>
    </header>
  );
}

function AnalyzeUiIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect height="12" rx="2.5" width="14" x="5" y="6" />
      <path
        d="M8 10.5h8M8 13.5h5"
        opacity={active ? 0.55 : 1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {active ? (
        <line opacity="0.8" strokeLinecap="round" x1="7" x2="17" y1="8.25" y2="8.25">
          <animate
            attributeName="y1"
            dur="1.4s"
            repeatCount="indefinite"
            values="8.25;15.75;8.25"
          />
          <animate
            attributeName="y2"
            dur="1.4s"
            repeatCount="indefinite"
            values="8.25;15.75;8.25"
          />
          <animate
            attributeName="opacity"
            dur="1.4s"
            repeatCount="indefinite"
            values="0.25;0.85;0.25"
          />
        </line>
      ) : null}
    </svg>
  );
}

function Cog6ToothIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.075.04.148.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.751.431.992l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.397-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 0 1-1.37-.49l-1.296-2.247a1.125 1.125 0 0 1 .26-1.431l1.003-.827c.293-.24.438-.613.431-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.751-.431-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.145-.086.22-.128.332-.183.582-.495.645-.869l.214-1.28Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
