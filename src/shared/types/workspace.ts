import type { ScreenDefinition, ScreensDocument, ScreenTransition } from './screens';

export type WorkspaceLoadState = 'idle' | 'loading' | 'ready' | 'error';

export interface WorkspaceState {
  document: ScreensDocument | null;
  loadState: WorkspaceLoadState;
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
