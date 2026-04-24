import type { LoadScreensFailureReason } from './ipc';
import type { ScreenDefinition, ScreensDocument, ScreenTransition } from './screens';

export type WorkspaceLoadState = 'idle' | 'loading' | 'ready' | 'error';

/** Detailed failure information surfaced to the renderer for empty-state copy. */
export interface WorkspaceLoadFailure {
  reason: LoadScreensFailureReason;
  message: string;
  filePath: string | null;
}

export interface WorkspaceState {
  /** Absolute path of the active project root, or `null` when none is open. */
  projectRoot: string | null;
  document: ScreensDocument | null;
  loadState: WorkspaceLoadState;
  loadFailure: WorkspaceLoadFailure | null;
  selectedScreenId: string | null;
  searchQuery: string;
  previewBaseUrl: string | null;
}

export interface WorkspaceDerived {
  screenById: Record<string, ScreenDefinition>;
  inboundByScreenId: Record<string, ScreenTransition[]>;
  outboundByScreenId: Record<string, ScreenTransition[]>;
  connectedScreenIds: string[];
  orphanScreenIds: string[];
  filteredConnectedScreenIds: string[];
  filteredOrphanScreenIds: string[];
}
