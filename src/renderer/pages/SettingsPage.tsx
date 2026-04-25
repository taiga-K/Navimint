interface SettingsPageProps {
  onBackToWorkspace: () => void;
}

export function SettingsPage({ onBackToWorkspace }: SettingsPageProps) {
  return (
    <main className="flex h-full min-h-0 bg-app px-6 py-5 text-text-primary">
      <section className="flex w-full max-w-3xl flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-border-strong pb-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Workspace
            </p>
            <h1 className="mt-1 text-xl font-semibold text-text-primary">Settings</h1>
          </div>
          <button
            className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border border-border-strong bg-panel px-3 text-xs font-semibold text-text-secondary transition-colors duration-[120ms] hover:border-accent-primary hover:bg-elevated hover:text-text-primary focus:outline-none focus-visible:shadow-focus"
            onClick={onBackToWorkspace}
            type="button"
          >
            <ArrowLeftIcon />
            Back to Workspace
          </button>
        </div>
      </section>
    </main>
  );
}

function ArrowLeftIcon() {
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
        d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
