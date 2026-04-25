import { useState } from 'react';

import { type AppView, WorkspaceHeader } from './components/layout/WorkspaceHeader';
import { useWorkspaceSync, WorkspaceProvider } from './features/workspace/use-workspace';
import { SettingsPage } from './pages/SettingsPage';
import { WorkspacePage } from './pages/WorkspacePage';

export function App() {
  return (
    <WorkspaceProvider>
      <AppShell />
    </WorkspaceProvider>
  );
}

function AppShell() {
  useWorkspaceSync();
  const [activeView, setActiveView] = useState<AppView>('workspace');

  return (
    <div className="flex h-dvh w-dvw flex-col bg-app text-text-primary">
      <WorkspaceHeader
        activeView={activeView}
        onNavigateSettings={() =>
          setActiveView((v) => (v === 'settings' ? 'workspace' : 'settings'))
        }
      />
      <div className="min-h-0 flex-1">
        {activeView === 'settings' ? (
          <SettingsPage onBackToWorkspace={() => setActiveView('workspace')} />
        ) : (
          <WorkspacePage />
        )}
      </div>
    </div>
  );
}
