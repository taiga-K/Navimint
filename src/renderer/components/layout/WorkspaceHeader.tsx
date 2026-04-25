import { useEffect, useState } from 'react';

import { useWorkspace } from '../../features/workspace/use-workspace';
import { cn } from '../../lib/cn';
import { compactProjectLabel } from '../../lib/project-label';

export type AppView = 'workspace' | 'settings';

interface WorkspaceHeaderProps {
  activeView: AppView;
  onNavigateSettings: () => void;
}

const ANALYSIS_FEEDBACK_MS = 1600;

const ICON_BUTTON_CLASS =
  'inline-flex size-8 cursor-pointer items-center justify-center rounded-md border border-border-strong bg-panel text-text-muted transition-colors duration-[120ms] hover:border-accent-primary hover:bg-elevated hover:text-text-primary focus:outline-none focus-visible:shadow-focus';

export function WorkspaceHeader({ activeView, onNavigateSettings }: WorkspaceHeaderProps) {
  const { state } = useWorkspace();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const hasProject = state.projectRoot !== null;
  const projectLabel = compactProjectLabel(state.document?.project.name ?? state.projectRoot);

  useEffect(() => {
    if (!isAnalyzing) {
      return;
    }
    const timerId = window.setTimeout(() => {
      setIsAnalyzing(false);
    }, ANALYSIS_FEEDBACK_MS);
    return () => window.clearTimeout(timerId);
  }, [isAnalyzing]);

  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border-strong bg-panel px-3 text-sm text-text-primary">
      <div className="min-w-0">
        <span className="block truncate text-sm font-semibold text-text-primary">
          {projectLabel ?? 'No project'}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          aria-busy={isAnalyzing}
          className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border border-border-strong bg-elevated px-3 text-xs font-semibold text-text-secondary transition-colors duration-[120ms] hover:border-accent-primary hover:text-text-primary focus:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border-strong disabled:hover:text-text-secondary"
          disabled={!hasProject || isAnalyzing}
          onClick={() => setIsAnalyzing(true)}
          title={hasProject ? 'Analyze UI' : 'Open a project folder first'}
          type="button"
        >
          <ArrowPathIcon className={isAnalyzing ? 'animate-spin' : undefined} />
          {isAnalyzing ? 'Analyzing...' : 'Analyze UI'}
        </button>
        <button
          aria-label="Open settings"
          aria-pressed={activeView === 'settings'}
          className={cn(
            ICON_BUTTON_CLASS,
            activeView === 'settings' &&
              'border-accent-primary bg-selected text-text-primary hover:bg-selected',
          )}
          onClick={onNavigateSettings}
          title="Settings"
          type="button"
        >
          <Cog6ToothIcon />
        </button>
      </div>
    </header>
  );
}

function ArrowPathIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn('size-4', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M7.977 14.652H2.985m0 0v.001m18.03-10.295v4.992m0 0h-4.992m4.992 0-3.181-3.183a8.25 8.25 0 0 0-13.803 3.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
