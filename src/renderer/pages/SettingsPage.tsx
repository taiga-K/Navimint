import type { CursorApiKeyStatus } from '@shared/types';
import { useEffect, useMemo, useState } from 'react';

import { getNavimintBridge } from '../lib/navimint-bridge';

type SaveState = 'idle' | 'saving' | 'error' | 'saved';
type DeleteState = 'idle' | 'deleting' | 'error' | 'deleted';

const API_KEY_SAVE_DEBOUNCE_MS = 700;

export function SettingsPage() {
  const [apiKeyDraft, setApiKeyDraft] = useState('');
  const [status, setStatus] = useState<CursorApiKeyStatus>({
    configured: false,
    source: null,
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
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
    if (apiKeyToSave.length === 0) {
      return;
    }

    let active = true;
    const timerId = window.setTimeout(() => {
      setSaveState('saving');
      setDeleteState('idle');
      setStatusMessage(null);

      void getNavimintBridge()
        .saveCursorApiKey(apiKeyToSave)
        .then((result) => {
          if (!active) {
            return;
          }
          if (!result.ok) {
            setSaveState('error');
            setStatusMessage(result.message);
            return;
          }
          setStatus(result.status);
          setSaveState('saved');
        });
    }, API_KEY_SAVE_DEBOUNCE_MS);

    return () => {
      active = false;
      window.clearTimeout(timerId);
    };
  }, [apiKeyToSave]);

  async function handleDelete(): Promise<void> {
    setDeleteState('deleting');
    setSaveState('idle');
    setStatusMessage(null);

    const result = await getNavimintBridge().deleteCursorApiKey();
    if (!result.ok) {
      setDeleteState('error');
      setStatusMessage(result.message);
      return;
    }

    setStatus(result.status);
    setApiKeyDraft('');
    setDeleteState('deleted');
  }

  const canDelete = deleteState !== 'deleting' && status.source === 'keychain';

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
                <input
                  autoComplete="off"
                  className="h-9 rounded-md border border-border-subtle bg-panel px-3 font-mono text-sm text-text-primary outline-none transition-colors duration-[120ms] placeholder:text-text-muted hover:border-border-strong focus:border-accent-primary focus:shadow-focus"
                  onChange={(event) => {
                    setApiKeyDraft(event.target.value);
                    setSaveState('idle');
                    setStatusMessage(null);
                  }}
                  placeholder={status.configured ? 'Enter a new key to replace the saved key' : 'Enter Cursor API key'}
                  spellCheck={false}
                  type="password"
                  value={apiKeyDraft}
                />
              </label>

              <div className="flex items-center gap-2">
                {status.source === 'keychain' ? (
                  <button
                    className="inline-flex h-8 cursor-pointer items-center rounded-md border border-transparent px-3 text-xs font-semibold text-text-muted transition-colors duration-[120ms] hover:bg-elevated hover:text-accent-danger focus:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-text-muted"
                    disabled={!canDelete}
                    onClick={() => void handleDelete()}
                    type="button"
                  >
                    {deleteState === 'deleting' ? 'Deleting...' : 'Delete Saved Key'}
                  </button>
                ) : null}
              </div>

              <SettingsMessage
                deleteState={deleteState}
                saveState={saveState}
                statusMessage={statusMessage}
              />
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function SettingsMessage({
  deleteState,
  saveState,
  statusMessage,
}: {
  deleteState: DeleteState;
  saveState: SaveState;
  statusMessage: string | null;
}) {
  if (statusMessage !== null) {
    return <p className="text-xs text-accent-danger">{statusMessage}</p>;
  }
  if (deleteState === 'deleted') {
    return <p className="text-xs text-text-muted">Saved Cursor API key deleted.</p>;
  }
  return null;
}
