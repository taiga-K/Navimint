import type { AnalyzeUiResult, WorkspaceDerived, WorkspaceState } from '@shared/types';
import {
  createContext,
  createElement,
  type Dispatch,
  type MutableRefObject,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';

import { getNavimintBridge } from '../../lib/navimint-bridge';
import { deriveWorkspace } from './selectors';
import { initialWorkspaceState, type WorkspaceAction, workspaceReducer } from './store';

/**
 * Loads `screens.json` from disk into workspace state (used on project change and manual refresh).
 */
export async function reloadWorkspaceScreensDocument(
  dispatch: Dispatch<WorkspaceAction>,
  options?: { shouldAbort?: () => boolean },
): Promise<void> {
  const navimint = getNavimintBridge();
  dispatch({ type: 'load-started' });
  try {
    const result = await navimint.loadScreensDocument();
    if (options?.shouldAbort?.()) {
      return;
    }
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
    if (options?.shouldAbort?.()) {
      return;
    }
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

export interface WorkspaceContextValue {
  state: WorkspaceState;
  derived: WorkspaceDerived;
  dispatch: Dispatch<WorkspaceAction>;
  /** Shared counter so sync and manual reloads invalidate each other's in-flight loads. */
  loadSeqRef: MutableRefObject<number>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export interface WorkspaceProviderProps {
  children: ReactNode;
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const [state, dispatch] = useReducer(workspaceReducer, initialWorkspaceState);
  const derived = useMemo(() => deriveWorkspace(state), [state]);
  const loadSeqRef = useRef(0);
  const value = useMemo<WorkspaceContextValue>(
    () => ({ state, derived, dispatch, loadSeqRef }),
    [state, derived, loadSeqRef],
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
  const { dispatch, loadSeqRef } = useWorkspace();

  useEffect(() => {
    const navimint = getNavimintBridge();
    let active = true;

    async function runLoad(): Promise<void> {
      const seq = ++loadSeqRef.current;
      await reloadWorkspaceScreensDocument(dispatch, {
        shouldAbort: () => !active || seq !== loadSeqRef.current,
      });
    }

    void (async () => {
      try {
        const projectRoot = await navimint.getProjectRoot();
        if (!active) {
          return;
        }
        dispatch({ type: 'project-root-changed', projectRoot });
      } catch (error) {
        console.error('[workspace] getProjectRoot failed', error);
        if (!active) {
          return;
        }
        dispatch({ type: 'project-root-changed', projectRoot: null });
      }
      if (!active) {
        return;
      }
      await runLoad();
    })();

    const unsubscribe = navimint.onProjectRootChanged((projectRoot) => {
      dispatch({ type: 'project-root-changed', projectRoot });
      void runLoad();
    });

    return () => {
      active = false;
      loadSeqRef.current += 1;
      unsubscribe();
    };
  }, [dispatch, loadSeqRef]);
}

/**
 * Imperative trigger for the renderer-side "Open Folder" affordance.
 * The main process broadcasts `projectRootChanged`, which `useWorkspaceSync`
 * turns into a reload, so no additional dispatch is required here.
 */
export function useOpenProjectFolder(): () => void {
  return useCallback(() => {
    void getNavimintBridge().openProjectDialog().catch((error) => {
      console.error('[workspace] openProjectDialog failed', error);
    });
  }, []);
}

export function useAnalyzeUi(): () => Promise<AnalyzeUiResult> {
  const { dispatch, loadSeqRef } = useWorkspace();

  return useCallback(async () => {
    const seq = ++loadSeqRef.current;
    let result: AnalyzeUiResult;
    try {
      result = await getNavimintBridge().analyzeUi();
    } catch (error) {
      result = {
        ok: false,
        reason: 'unexpected-error',
        message: error instanceof Error ? error.message : String(error),
        filePath: null,
      };
    }
    if (seq !== loadSeqRef.current) {
      return result;
    }
    if (result.ok) {
      dispatch({ type: 'document-loaded', document: result.document });
    }
    return result;
  }, [dispatch, loadSeqRef]);
}
