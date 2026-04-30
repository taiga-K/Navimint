import type { CursorApiKeyStatus } from '@shared/types';
import { useEffect, useMemo, useState } from 'react';

import { getNavimintBridge } from '../lib/navimint-bridge';

type DeleteState = 'idle' | 'deleting';

const API_KEY_SAVE_DEBOUNCE_MS = 700;
const FALLBACK_MASKED_API_KEY_LENGTH = 24;

export function SettingsPage() {
  const [apiKeyDraft, setApiKeyDraft] = useState('');
  const [isEditingApiKey, setIsEditingApiKey] = useState(false);
  const [status, setStatus] = useState<CursorApiKeyStatus>({
    configured: false,
    source: null,
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [deleteState, setDeleteState] = useState<DeleteState>('idle');

  useEffect(() => {
    let active = true;
    void getNavimintBridge()
      .getCursorApiKeyStatus()
      .then((result) => {
        if (!active) {
          return;
        }
        if (result.ok) {
          setStatus(result.status);
          setStatusMessage(null);
          return;
        }
        setStatusMessage(result.message);
      });
    return () => {
      active = false;
    };
  }, []);

  const apiKeyToSave = useMemo(() => apiKeyDraft.trim(), [apiKeyDraft]);

  useEffect(() => {
    if (!isEditingApiKey || apiKeyToSave.length === 0 || deleteState === 'deleting') {
      return;
    }

    let active = true;
    const timerId = window.setTimeout(() => {
      setStatusMessage(null);

      void getNavimintBridge()
        .saveCursorApiKey(apiKeyToSave)
        .then((result) => {
          if (!active) {
            return;
          }
          if (!result.ok) {
            setStatusMessage(result.message);
            return;
          }
          setStatus(result.status);
          setApiKeyDraft('');
          setIsEditingApiKey(false);
        })
        .catch(() => {
          if (!active) {
            return;
          }
          setStatusMessage('Failed to save the API key. Please try again.');
        });
    }, API_KEY_SAVE_DEBOUNCE_MS);

    return () => {
      active = false;
      window.clearTimeout(timerId);
    };
  }, [apiKeyToSave, isEditingApiKey, deleteState]);

  async function handleDelete(): Promise<void> {
    setDeleteState('deleting');
    setStatusMessage(null);

    try {
      const result = await getNavimintBridge().deleteCursorApiKey();
      if (!result.ok) {
        setDeleteState('idle');
        setStatusMessage(result.message);
        return;
      }

      setStatus(result.status);
      setApiKeyDraft('');
      setIsEditingApiKey(false);
      setDeleteState('idle');
    } catch {
      setDeleteState('idle');
      setStatusMessage('Failed to delete the API key. Please try again.');
    }
  }

  const canDelete = deleteState !== 'deleting' && status.source === 'keychain';
  const maskedApiKey = '•'.repeat(FALLBACK_MASKED_API_KEY_LENGTH);
  const apiKeyInputValue = status.configured && !isEditingApiKey ? maskedApiKey : apiKeyDraft;

  return (
    <main className="flex h-dvh min-h-0 bg-app text-text-primary">
      <section className="mx-auto flex w-full max-w-4xl flex-col px-8 py-7">
        <div className="border-b border-border-subtle pb-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Application
            </p>
            <h1 className="mt-1 text-xl font-semibold text-text-primary">Settings</h1>
          </div>
        </div>

        <div className="flex flex-col divide-y divide-border-subtle">
          <section
            className="grid grid-cols-[minmax(0,260px)_minmax(0,1fr)] gap-8 py-6"
          >
            <div className="flex flex-col gap-1.5">
              <h2 className="text-sm font-semibold text-text-primary">Cursor API Key</h2>
              <p className="text-xs leading-5 text-text-muted">
                Stored in the operating system credential store and used for Analyze UI.
                The key is never shown again after saving.
              </p>
            </div>

            <div className="flex min-w-0 flex-col gap-3">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-medium text-text-secondary">API Key</span>
                <span className="relative">
                  <input
                    autoComplete="off"
                    className="h-9 w-full rounded-md border border-border-subtle bg-panel px-3 pr-10 font-mono text-sm text-text-primary outline-none transition-colors duration-[120ms] placeholder:text-text-muted hover:border-border-strong focus:border-accent-primary focus:shadow-focus"
                    onChange={(event) => {
                      setIsEditingApiKey(true);
                      setApiKeyDraft(event.target.value);
                      setStatusMessage(null);
                    }}
                    onBlur={() => {
                      if (status.configured && apiKeyDraft.trim().length === 0) {
                        setIsEditingApiKey(false);
                      }
                    }}
                    onFocus={() => {
                      if (status.configured && !isEditingApiKey) {
                        setIsEditingApiKey(true);
                        setApiKeyDraft('');
                      }
                    }}
                    placeholder={status.configured ? 'Paste a new key to replace the saved key' : 'Enter Cursor API key'}
                    spellCheck={false}
                    type="password"
                    value={apiKeyInputValue}
                  />
                  {status.source === 'keychain' ? (
                    <button
                      aria-label="Delete saved Cursor API key"
                      className="absolute right-1.5 top-1/2 inline-flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-text-muted transition-colors duration-[120ms] hover:bg-elevated hover:text-accent-danger focus:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-text-muted"
                      disabled={!canDelete}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => void handleDelete()}
                      title="Delete saved key"
                      type="button"
                    >
                      <TrashIcon />
                    </button>
                  ) : null}
                </span>
              </label>

              <SettingsMessage
                statusMessage={statusMessage}
              />
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.6}
      viewBox="0 0 24 24"
    >
      <path d="M4 7h16" />
      <path d="M10 11v6M14 11v6" />
      <path d="M6 7l1 14h10l1-14" />
      <path d="M9 7V4h6v3" />
    </svg>
  );
}

function SettingsMessage({ statusMessage }: { statusMessage: string | null }) {
  if (statusMessage !== null) {
    return <p className="text-xs text-accent-danger">{statusMessage}</p>;
  }
  return null;
}
