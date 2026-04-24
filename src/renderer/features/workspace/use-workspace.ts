import type { WorkspaceDerived, WorkspaceState } from '@shared/types';
import {
  createContext,
  createElement,
  type Dispatch,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';

import { deriveWorkspace } from './selectors';
import { initialWorkspaceState, type WorkspaceAction, workspaceReducer } from './store';

export interface WorkspaceContextValue {
  state: WorkspaceState;
  derived: WorkspaceDerived;
  dispatch: Dispatch<WorkspaceAction>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export interface WorkspaceProviderProps {
  children: ReactNode;
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const [state, dispatch] = useReducer(workspaceReducer, initialWorkspaceState);
  const derived = useMemo(() => deriveWorkspace(state), [state]);
  const value = useMemo<WorkspaceContextValue>(
    () => ({ state, derived, dispatch }),
    [state, derived],
  );
  return createElement(WorkspaceContext.Provider, { value }, children);
}

export function useWorkspace(): WorkspaceContextValue {
  const value = useContext(WorkspaceContext);
  if (value === null) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return value;
}

/**
 * Wires the workspace state to the main process:
 *
 * - On mount, fetch the current project root and load `screens.json`.
 * - Subscribe to `projectRootChanged` events so menu-driven folder switches
 *   automatically refresh the document.
 */
export function useWorkspaceSync(): void {
  const { dispatch } = useWorkspace();

  useEffect(() => {
    let active = true;

    void (async () => {
      const projectRoot = await window.navimint.getProjectRoot();
      if (!active) {
        return;
      }
      dispatch({ type: 'project-root-changed', projectRoot });
      await loadAndDispatch(dispatch);
    })();

    const unsubscribe = window.navimint.onProjectRootChanged((projectRoot) => {
      dispatch({ type: 'project-root-changed', projectRoot });
      void loadAndDispatch(dispatch);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [dispatch]);
}

/**
 * Imperative trigger for the renderer-side "Open Folder" affordance.
 * The main process broadcasts `projectRootChanged`, which `useWorkspaceSync`
 * turns into a reload, so no additional dispatch is required here.
 */
export function useOpenProjectFolder(): () => void {
  return useCallback(() => {
    void window.navimint.openProjectDialog();
  }, []);
}

async function loadAndDispatch(dispatch: Dispatch<WorkspaceAction>): Promise<void> {
  dispatch({ type: 'load-started' });
  try {
    const result = await window.navimint.loadScreensDocument();
    if (result.ok) {
      dispatch({ type: 'document-loaded', document: result.document });
      return;
    }
    dispatch({
      type: 'document-load-failed',
      failure: {
        reason: result.reason,
        message: result.message,
        filePath: result.filePath,
      },
    });
  } catch (error) {
    dispatch({
      type: 'document-load-failed',
      failure: {
        reason: 'unexpected-error',
        message: error instanceof Error ? error.message : String(error),
        filePath: null,
      },
    });
  }
}
