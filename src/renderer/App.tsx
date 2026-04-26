import { useEffect, useState } from 'react';

import { AnalyzeOverlay } from './components/layout/AnalyzeOverlay';
import { type AnalysisFeedback, WorkspaceHeader } from './components/layout/WorkspaceHeader';
import {
  useAnalyzeUi,
  useWorkspaceSync,
  WorkspaceProvider,
} from './features/workspace/use-workspace';
import { getNavimintBridge } from './lib/navimint-bridge';
import { SettingsPage } from './pages/SettingsPage';
import { WorkspacePage } from './pages/WorkspacePage';

const ANALYSIS_FEEDBACK_MS = 3200;

export function App() {
  const settingsWindow = isSettingsWindow();
  if (settingsWindow) {
    return <SettingsPage />;
  }

  return (
    <WorkspaceProvider>
      <AppShell />
    </WorkspaceProvider>
  );
}

function AppShell() {
  useWorkspaceSync();
  const analyzeUi = useAnalyzeUi();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisFeedback, setAnalysisFeedback] = useState<AnalysisFeedback | null>(null);

  useEffect(() => {
    if (analysisFeedback === null) {
      return;
    }
    const timerId = window.setTimeout(() => {
      setAnalysisFeedback(null);
    }, ANALYSIS_FEEDBACK_MS);
    return () => window.clearTimeout(timerId);
  }, [analysisFeedback]);

  function handleAnalyzeUi(): void {
    setAnalysisFeedback(null);
    setIsAnalyzing(true);
    void analyzeUi()
      .then((result) => {
        if (result.ok) {
          setAnalysisFeedback({ kind: 'success', message: 'screens.json updated' });
          return;
        }
        setAnalysisFeedback({ kind: 'error', message: result.message });
      })
      .finally(() => {
        setIsAnalyzing(false);
      });
  }

  return (
    <div className="relative flex h-dvh w-dvw flex-col bg-app text-text-primary">
      <WorkspaceHeader
        analysisFeedback={analysisFeedback}
        isAnalyzing={isAnalyzing}
        onAnalyzeUi={handleAnalyzeUi}
        onOpenSettings={() => {
          void getNavimintBridge().openSettingsWindow();
        }}
      />
      <div className="min-h-0 flex-1">
        <WorkspacePage />
      </div>
      {isAnalyzing ? <AnalyzeOverlay /> : null}
    </div>
  );
}

function isSettingsWindow(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return new URLSearchParams(window.location.search).get('view') === 'settings';
}
