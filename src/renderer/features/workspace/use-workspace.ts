import type { WorkspaceDerived, WorkspaceState } from '@shared/types';
import {
  createContext,
  createElement,
  type Dispatch,
  type ReactNode,
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

/** Loads `screens.json` once when the workspace mounts. */
export function useLoadScreensOnMount(): void {
  const { dispatch } = useWorkspace();

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: 'load-started' });
    void (async () => {
      const result = await window.navimint.loadScreensDocument();
      if (cancelled) {
        return;
      }
      if (result.ok) {
        dispatch({ type: 'document-loaded', document: result.document });
        return;
      }
      dispatch({ type: 'document-load-failed' });
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);
}
