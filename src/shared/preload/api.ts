import type { LoadScreensResult } from '../types';

export interface NavimintBridge {
  loadScreensDocument(): Promise<LoadScreensResult>;
}

export const NAVIMINT_BRIDGE_KEY = 'navimint';
