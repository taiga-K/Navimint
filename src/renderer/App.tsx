import { WorkspaceHeader } from './components/layout/WorkspaceHeader';
import { useWorkspaceSync, WorkspaceProvider } from './features/workspace/use-workspace';
import { getNavimintBridge } from './lib/navimint-bridge';
import { SettingsPage } from './pages/SettingsPage';
import { WorkspacePage } from './pages/WorkspacePage';

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

  return (
    <div className="flex h-dvh w-dvw flex-col bg-app text-text-primary">
      <WorkspaceHeader
        onOpenSettings={() => {
          void getNavimintBridge().openSettingsWindow();
        }}
      />
      <div className="min-h-0 flex-1">
        <WorkspacePage />
      </div>
    </div>
  );
}

function isSettingsWindow(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return new URLSearchParams(window.location.search).get('view') === 'settings';
}
