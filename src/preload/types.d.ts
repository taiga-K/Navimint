import type { NavimintBridge } from '../shared/preload/api';

declare global {
  interface Window {
    navimint: NavimintBridge;
  }
}

export {};
