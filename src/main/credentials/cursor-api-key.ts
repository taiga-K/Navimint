import { deletePassword, getPassword, setPassword } from '@napi-rs/keyring/keytar';

import type { CursorApiKeyStatus } from '../../shared/types';

const SERVICE_NAME = 'Navimint';
const ACCOUNT_NAME = 'cursor-api-key';

export class CursorApiKeyNotConfiguredError extends Error {
  constructor() {
    super('Cursor API key is not configured.');
    this.name = 'CursorApiKeyNotConfiguredError';
  }
}

export async function getCursorApiKeyStatus(): Promise<CursorApiKeyStatus> {
  const envValue = getEnvCursorApiKey();
  const keychainValue = await getStoredCursorApiKey(envValue !== null);
  if (keychainValue !== null) {
    return configuredStatus('keychain');
  }
  if (envValue !== null) {
    return configuredStatus('env');
  }
  return { configured: false, source: null };
}

export async function saveCursorApiKey(apiKey: string): Promise<CursorApiKeyStatus> {
  await setPassword(SERVICE_NAME, ACCOUNT_NAME, apiKey);
  return configuredStatus('keychain');
}

export async function deleteStoredCursorApiKey(): Promise<CursorApiKeyStatus> {
  await deletePassword(SERVICE_NAME, ACCOUNT_NAME);
  const envValue = getEnvCursorApiKey();
  if (envValue !== null) {
    return configuredStatus('env');
  }
  return { configured: false, source: null };
}

export async function resolveCursorApiKey(): Promise<string> {
  const envValue = getEnvCursorApiKey();
  const keychainValue = await getStoredCursorApiKey(envValue !== null);
  if (keychainValue !== null) {
    return keychainValue;
  }
  if (envValue !== null) {
    return envValue;
  }

  throw new CursorApiKeyNotConfiguredError();
}

async function getStoredCursorApiKey(ignoreFailure: boolean): Promise<string | null> {
  try {
    const value = await getPassword(SERVICE_NAME, ACCOUNT_NAME);
    return normalizeApiKey(value);
  } catch (error) {
    if (ignoreFailure) {
      return null;
    }
    throw error;
  }
}

function getEnvCursorApiKey(): string | null {
  return normalizeApiKey(process.env.CURSOR_API_KEY);
}

function normalizeApiKey(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed === undefined || trimmed.length === 0 ? null : trimmed;
}

function configuredStatus(source: 'keychain' | 'env'): CursorApiKeyStatus {
  return { configured: true, source };
}
