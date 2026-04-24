import type { ScreensDocument, WorkspaceState } from '@shared/types';

/** `selectedScreenId` stays `null` after loading per the workspace contract. */
export const initialWorkspaceState: WorkspaceState = {
  document: null,
  loadState: 'idle',
  selectedScreenId: null,
  searchQuery: '',
  previewBaseUrl: null,
};

export type WorkspaceAction =
  | { type: 'load-started' }
  | { type: 'document-loaded'; document: ScreensDocument }
  | { type: 'document-load-failed' }
  | { type: 'screen-selected'; screenId: string | null }
  | { type: 'search-query-changed'; query: string }
  | { type: 'preview-base-url-updated'; baseUrl: string };

export function workspaceReducer(
  state: WorkspaceState,
  action: WorkspaceAction,
): WorkspaceState {
  switch (action.type) {
    case 'load-started':
      return { ...state, loadState: 'loading' };
    case 'document-loaded':
      return reduceDocumentLoaded(state, action.document);
    case 'document-load-failed':
      return {
        ...state,
        loadState: 'error',
        document: null,
        selectedScreenId: null,
        previewBaseUrl: null,
      };
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
    document,
    previewBaseUrl: document.project.baseURL,
    selectedScreenId: nextSelectedScreenId,
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
