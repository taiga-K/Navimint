import type {
  ScreensDocument,
  WorkspaceLoadFailure,
  WorkspaceState,
} from '@shared/types';

/**
 * `selectedScreenId` stays `null` after loading per the workspace contract.
 * Both `projectRoot` and `loadFailure` start as `null` because we do not yet
 * know what the main process will report.
 */
export const initialWorkspaceState: WorkspaceState = {
  projectRoot: null,
  document: null,
  loadState: 'idle',
  loadFailure: null,
  selectedScreenId: null,
  searchQuery: '',
  previewBaseUrl: null,
};

export type WorkspaceAction =
  | { type: 'load-started' }
  | { type: 'document-loaded'; document: ScreensDocument }
  | { type: 'document-load-failed'; failure: WorkspaceLoadFailure }
  | { type: 'project-root-changed'; projectRoot: string | null }
  | { type: 'screen-selected'; screenId: string | null }
  | { type: 'search-query-changed'; query: string }
  | { type: 'preview-base-url-updated'; baseUrl: string };

export function workspaceReducer(
  state: WorkspaceState,
  action: WorkspaceAction,
): WorkspaceState {
  switch (action.type) {
    case 'load-started':
      return { ...state, loadState: 'loading', loadFailure: null };
    case 'document-loaded':
      return reduceDocumentLoaded(state, action.document);
    case 'document-load-failed':
      return {
        ...state,
        loadState: 'error',
        loadFailure: action.failure,
        document: null,
        selectedScreenId: null,
        previewBaseUrl: null,
      };
    case 'project-root-changed':
      return reduceProjectRootChanged(state, action.projectRoot);
    case 'screen-selected':
      return { ...state, selectedScreenId: action.screenId };
    case 'search-query-changed':
      return { ...state, searchQuery: action.query };
    case 'preview-base-url-updated':
      return reducePreviewBaseUrlUpdated(state, action.baseUrl);
  }
}

function reduceDocumentLoaded(state: WorkspaceState, document: ScreensDocument): WorkspaceState {
  const nextSelectedScreenId = isSelectionStillValid(state.selectedScreenId, document)
    ? state.selectedScreenId
    : null;
  return {
    ...state,
    loadState: 'ready',
    loadFailure: null,
    document,
    previewBaseUrl: document.project.baseURL,
    selectedScreenId: nextSelectedScreenId,
  };
}

function reduceProjectRootChanged(
  state: WorkspaceState,
  nextProjectRoot: string | null,
): WorkspaceState {
  if (state.projectRoot === nextProjectRoot) {
    return { ...state, projectRoot: nextProjectRoot };
  }
  /*
   * Switching to a different project drops the selection and search context
   * because the previous values reference a now-unrelated screens.json.
   */
  return {
    ...state,
    projectRoot: nextProjectRoot,
    selectedScreenId: null,
    searchQuery: '',
  };
}

function reducePreviewBaseUrlUpdated(state: WorkspaceState, baseUrl: string): WorkspaceState {
  if (state.document === null) {
    return { ...state, previewBaseUrl: baseUrl };
  }
  return {
    ...state,
    previewBaseUrl: baseUrl,
    document: {
      ...state.document,
      project: { ...state.document.project, baseURL: baseUrl },
    },
  };
}

function isSelectionStillValid(
  selectedScreenId: string | null,
  document: ScreensDocument,
): boolean {
  if (selectedScreenId === null) {
    return false;
  }
  return document.screens.some((screen) => screen.id === selectedScreenId);
}
