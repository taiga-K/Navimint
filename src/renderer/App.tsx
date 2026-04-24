import { WorkspaceProvider } from './features/workspace/use-workspace';
import { WorkspacePage } from './pages/WorkspacePage';

export function App() {
  return (
    <WorkspaceProvider>
      <WorkspacePage />
    </WorkspaceProvider>
  );
}
