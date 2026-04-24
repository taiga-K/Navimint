export const SCREENS_DOCUMENT_VERSION = '1.0' as const;

export type ScreensDocumentVersion = typeof SCREENS_DOCUMENT_VERSION;

export interface ScreensProject {
  name: string;
  baseURL: string;
}

export interface ScreenDefinition {
  id: string;
  name: string;
  route: string;
  description?: string;
  color?: string;
}

export interface ScreenTransition {
  from: string;
  to: string;
  trigger?: string;
  condition?: string;
}

export interface ScreensDocument {
  version: ScreensDocumentVersion;
  project: ScreensProject;
  screens: ScreenDefinition[];
  transitions: ScreenTransition[];
}
