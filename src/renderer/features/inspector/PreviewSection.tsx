import { parseHttpUrl, type PreviewUrlResult, resolvePreviewUrl } from '@shared/utils/preview-url';
import { type KeyboardEvent, useCallback, useEffect, useMemo, useState } from 'react';

import { cn } from '../../lib/cn';
import { getNavimintBridge } from '../../lib/navimint-bridge';
import { InspectorSection } from './InspectorSection';

type SaveState = 'idle' | 'error';
type CopyState = 'idle' | 'copied' | 'error';

const ICON_BUTTON_CLASS =
  'inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-text-muted transition-colors duration-[120ms] hover:bg-elevated hover:text-text-primary focus:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-text-muted';

interface PreviewSectionProps {
  baseUrl: string;
  route: string;
  screenName: string;
  onBaseUrlSaved: (baseUrl: string) => void;
}

export function PreviewSection({
  baseUrl,
  route,
  screenName,
  onBaseUrlSaved,
}: PreviewSectionProps) {
  const bridge = useMemo(() => getNavimintBridge(), []);
  const [baseUrlDraft, setBaseUrlDraft] = useState(baseUrl);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const previewUrl = useMemo(
    () => resolvePreviewUrl(baseUrlDraft, route),
    [baseUrlDraft, route],
  );
  const baseUrlValidation = useMemo(
    () => parseHttpUrl(baseUrlDraft, 'Base URL'),
    [baseUrlDraft],
  );
  const isDirty = baseUrlDraft.trim() !== baseUrl.trim();

  useEffect(() => {
    setBaseUrlDraft(baseUrl);
    setSaveState('idle');
    setSaveMessage(null);
  }, [baseUrl]);

  useEffect(() => {
    setCopyState('idle');
    setCopyMessage(null);
    setIsPreviewLoading(previewUrl.ok);
  }, [previewUrl]);

  const saveBaseUrl = useCallback(async () => {
    if (!isDirty) {
      return;
    }
    if (!baseUrlValidation.ok) {
      setSaveState('error');
      setSaveMessage(baseUrlValidation.message);
      return;
    }

    setSaveState('idle');
    setSaveMessage(null);
    const result = await bridge.savePreviewBaseUrl(baseUrlValidation.href);
    if (!result.ok) {
      setSaveState('error');
      setSaveMessage(result.message);
      return;
    }

    onBaseUrlSaved(result.document.project.baseURL);
    setSaveState('idle');
    setSaveMessage(null);
  }, [baseUrlValidation, bridge, isDirty, onBaseUrlSaved]);

  const handleBaseUrlKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void saveBaseUrl();
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      setBaseUrlDraft(baseUrl);
      setSaveState('idle');
      setSaveMessage(null);
    }
  };

  const handleReload = () => {
    setReloadNonce((current) => current + 1);
    setIsPreviewLoading(previewUrl.ok);
  };

  const handleCopyUrl = async () => {
    if (!previewUrl.ok) {
      setCopyState('error');
      setCopyMessage(previewUrl.message);
      return;
    }

    try {
      await navigator.clipboard.writeText(previewUrl.href);
      setCopyState('copied');
      setCopyMessage('Copied');
    } catch (error) {
      setCopyState('error');
      setCopyMessage(errorMessage(error));
    }
  };

  return (
    <InspectorSection
      className="min-h-0 flex-1 gap-2 overflow-hidden border-t border-border-strong py-3 pb-0"
      collapsedClassName="shrink-0 border-t border-border-strong py-3"
      collapsible
      title="Preview"
    >
      <label className="flex h-8 min-w-0 shrink-0 items-center gap-2 rounded-md border border-border-strong bg-panel-muted px-2.5 transition-colors duration-[120ms] focus-within:border-accent-primary focus-within:shadow-focus">
        <GlobeIcon />
        <input
          aria-label="Base URL"
          className="min-w-0 flex-1 bg-transparent font-mono text-xs text-text-primary outline-none placeholder:text-text-muted"
          onBlur={() => void saveBaseUrl()}
          onChange={(event) => {
            setBaseUrlDraft(event.target.value);
            setSaveState('idle');
            setSaveMessage(null);
          }}
          onKeyDown={handleBaseUrlKeyDown}
          spellCheck={false}
          value={baseUrlDraft}
        />
        <code className="shrink-0 truncate font-mono text-xs text-text-muted">
          {previewUrl.ok ? previewPathLabel(previewUrl.href) : previewUrl.message}
        </code>
        <span className="flex shrink-0 items-center gap-1">
          <button
            aria-label="Copy preview URL"
            className={ICON_BUTTON_CLASS}
            disabled={!previewUrl.ok}
            onClick={() => void handleCopyUrl()}
            type="button"
          >
            <CopyIcon />
          </button>
          <button
            aria-label="Reload preview"
            className={ICON_BUTTON_CLASS}
            disabled={!previewUrl.ok}
            onClick={handleReload}
            type="button"
          >
            <ReloadIcon />
          </button>
        </span>
      </label>
      <StatusText state={saveState} text={saveMessage} />
      <StatusText state={copyState} text={copyMessage} />

      <PreviewFrame
        isLoading={isPreviewLoading}
        onLoad={() => setIsPreviewLoading(false)}
        previewUrl={previewUrl}
        reloadNonce={reloadNonce}
        screenName={screenName}
      />
    </InspectorSection>
  );
}

interface PreviewFrameProps {
  isLoading: boolean;
  previewUrl: PreviewUrlResult;
  reloadNonce: number;
  screenName: string;
  onLoad: () => void;
}

function PreviewFrame({
  isLoading,
  previewUrl,
  reloadNonce,
  screenName,
  onLoad,
}: PreviewFrameProps) {
  if (!previewUrl.ok) {
    return (
      <div className="-mx-4 -mb-4 flex min-h-0 flex-1 flex-col items-center justify-center gap-2 border-t border-border-strong bg-panel-muted px-4 py-6 text-center">
        <p className="text-sm font-medium text-text-secondary">Preview unavailable</p>
        <p className="text-xs text-text-muted">{previewUrl.message}</p>
      </div>
    );
  }

  return (
    <div className="-mx-4 -mb-4 min-h-0 flex-1 border-t border-border-strong bg-white">
      <div className="relative h-full min-h-0 overflow-hidden bg-white">
        {isLoading ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white text-center">
            <span className="size-5 rounded-full border border-border-subtle border-t-text-muted" />
            <p className="px-3 text-xs text-text-muted">Loading preview</p>
          </div>
        ) : null}
        <iframe
          className="h-full w-full bg-white"
          key={`${previewUrl.href}:${reloadNonce}`}
          onLoad={onLoad}
          referrerPolicy="no-referrer"
          sandbox="allow-downloads allow-forms allow-scripts"
          src={previewUrl.href}
          title={`Preview: ${screenName}`}
        />
      </div>
    </div>
  );
}

function StatusText({ state, text }: { state: SaveState | CopyState; text: string | null }) {
  if (text === null) {
    return null;
  }

  return (
    <span
      className={cn(
        'text-xs',
        state === 'error'
          ? 'text-accent-danger'
          : state === 'copied'
            ? 'text-accent-success'
            : 'text-text-muted',
      )}
    >
      {text}
    </span>
  );
}

function previewPathLabel(href: string): string {
  const url = new URL(href);
  return `${url.pathname}${url.search}${url.hash}`;
}

function GlobeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      viewBox="0 0 24 24"
    >
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
      <path d="M3.6 9h16.8M3.6 15h16.8M12 3a13.2 13.2 0 0 1 0 18M12 3a13.2 13.2 0 0 0 0 18" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      viewBox="0 0 24 24"
    >
      <rect height="12" rx="2" width="12" x="8" y="8" />
      <path d="M4 16V6a2 2 0 0 1 2-2h10" />
    </svg>
  );
}

function ReloadIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      viewBox="0 0 24 24"
    >
      <path d="M20 12a8 8 0 1 1-2.3-5.7" />
      <path d="M20 4v6h-6" />
    </svg>
  );
}

function errorMessage(value: unknown): string {
  if (value instanceof Error) {
    return value.message;
  }
  return String(value);
}
