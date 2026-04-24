import path from 'node:path';

/**
 * Listener invoked whenever the active project root changes. Receives the
 * resolved absolute path, or `null` when no project is open.
 */
export type ProjectRootListener = (projectRoot: string | null) => void;

let currentRoot: string | null = readInitialRoot();
const listeners = new Set<ProjectRootListener>();

/** Returns the project root currently in use, or `null` when none is open. */
export function getProjectRoot(): string | null {
  return currentRoot;
}

/**
 * Updates the active project root and notifies subscribers when the value
 * actually changes. Pass `null` to mark the workspace as having no project.
 */
export function setProjectRoot(next: string | null): void {
  const normalised =
    next === null || next.trim() === '' ? null : path.resolve(next.trim());
  if (normalised === currentRoot) {
    return;
  }
  currentRoot = normalised;
  for (const listener of listeners) {
    try {
      listener(currentRoot);
    } catch (error) {
      console.error('[project-root] listener failed', error);
    }
  }
}

/**
 * Subscribes to project root changes. Returns an unsubscribe function suitable
 * for `useEffect` cleanups in the renderer side via the preload bridge.
 */
export function onProjectRootChanged(listener: ProjectRootListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function readInitialRoot(): string | null {
  const fromEnv = process.env.NAVIMINT_PROJECT_ROOT;
  if (fromEnv !== undefined && fromEnv.length > 0) {
    return path.resolve(fromEnv);
  }
  return null;
}
