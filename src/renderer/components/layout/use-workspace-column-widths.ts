import {
  type Dispatch,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

const STORAGE_KEY = 'navimint.workspaceColumnWidths';
const DEFAULT_LEFT = 272;
const DEFAULT_RIGHT = 360;
const GUTTER_PX = 6;
const MIN_LEFT = 200;
const MIN_RIGHT = 200;
const MIN_CENTER = 200;

type Widths = { left: number; right: number };

function loadInitialWidths(): Widths {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return { left: DEFAULT_LEFT, right: DEFAULT_RIGHT };
    }
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) {
      return { left: DEFAULT_LEFT, right: DEFAULT_RIGHT };
    }
    const rec = parsed as Record<string, unknown>;
    const left = typeof rec.left === 'number' ? rec.left : DEFAULT_LEFT;
    const right = typeof rec.right === 'number' ? rec.right : DEFAULT_RIGHT;
    if (!Number.isFinite(left) || !Number.isFinite(right)) {
      return { left: DEFAULT_LEFT, right: DEFAULT_RIGHT };
    }
    return { left, right };
  } catch {
    return { left: DEFAULT_LEFT, right: DEFAULT_RIGHT };
  }
}

function maxSideSum(mainWidth: number): number {
  return Math.max(0, mainWidth - 2 * GUTTER_PX - MIN_CENTER);
}

function clampWidthsForMain(widths: Widths, mainWidth: number): Widths {
  const max = maxSideSum(mainWidth);
  if (max <= 0) {
    return { left: MIN_LEFT, right: MIN_RIGHT };
  }
  let { left, right } = widths;
  left = Math.max(MIN_LEFT, left);
  right = Math.max(MIN_RIGHT, right);
  if (left + right <= max) {
    return { left, right };
  }
  const minSum = MIN_LEFT + MIN_RIGHT;
  if (max < minSum) {
    const wL = MIN_LEFT / minSum;
    return { left: max * wL, right: max * (1 - wL) };
  }
  const s = max / (left + right);
  const sl = left * s;
  const sr = right * s;
  if (sl >= MIN_LEFT && sr >= MIN_RIGHT) {
    return { left: sl, right: sr };
  }
  if (sl < MIN_LEFT) {
    const nl = MIN_LEFT;
    const nr = Math.max(MIN_RIGHT, max - nl);
    return { left: nl, right: nr };
  }
  const nr = MIN_RIGHT;
  const nl = Math.max(MIN_LEFT, max - nr);
  return { left: nl, right: nr };
}

function startWorkspaceGutterDrag(
  side: 'left' | 'right',
  e: ReactPointerEvent<HTMLDivElement>,
  widthsRef: MutableRefObject<Widths>,
  mainRef: RefObject<HTMLDivElement | null>,
  setWidths: Dispatch<SetStateAction<Widths>>,
  setResizing: Dispatch<SetStateAction<'left' | 'right' | null>>,
): void {
  e.preventDefault();
  const target = e.currentTarget;
  const pointerId = e.pointerId;
  const startX = e.clientX;
  const startLeft = widthsRef.current.left;
  const startRight = widthsRef.current.right;
  const mw = mainRef.current?.getBoundingClientRect().width ?? 0;
  if (mw <= 0) {
    return;
  }
  target.setPointerCapture(pointerId);
  setResizing(side);
  const prevUserSelect = document.body.style.userSelect;
  document.body.style.userSelect = 'none';
  document.body.style.cursor = 'col-resize';

  const onMove = (ev: PointerEvent) => {
    if (ev.pointerId !== pointerId) {
      return;
    }
    const wMain = mainRef.current?.getBoundingClientRect().width ?? mw;
    const g = 2 * GUTTER_PX;
    const deltaRaw = ev.clientX - startX;
    const primaryDelta = side === 'left' ? deltaRaw : -deltaRaw;
    let nextLeft: number;
    let nextRight: number;
    if (side === 'left') {
      const capPrimary = wMain - g - MIN_RIGHT - MIN_CENTER;
      nextLeft = Math.max(MIN_LEFT, Math.min(capPrimary, startLeft + primaryDelta));
      const maxSpaceForRight = wMain - g - nextLeft - MIN_CENTER;
      nextRight = Math.max(MIN_RIGHT, Math.min(startRight, maxSpaceForRight));
    } else {
      const capPrimary = wMain - g - MIN_LEFT - MIN_CENTER;
      nextRight = Math.max(MIN_RIGHT, Math.min(capPrimary, startRight + primaryDelta));
      const maxSpaceForLeft = wMain - g - nextRight - MIN_CENTER;
      nextLeft = Math.max(MIN_LEFT, Math.min(startLeft, maxSpaceForLeft));
    }
    setWidths((prev) => {
      if (nextLeft === prev.left && nextRight === prev.right) {
        return prev;
      }
      return { left: nextLeft, right: nextRight };
    });
  };

  const onUp = (ev: PointerEvent) => {
    if (ev.pointerId !== pointerId) {
      return;
    }
    target.removeEventListener('pointermove', onMove);
    target.removeEventListener('pointerup', onUp);
    target.removeEventListener('pointercancel', onUp);
    if (target.hasPointerCapture(pointerId)) {
      target.releasePointerCapture(pointerId);
    }
    document.body.style.userSelect = prevUserSelect;
    document.body.style.cursor = '';
    setResizing(null);
  };

  target.addEventListener('pointermove', onMove);
  target.addEventListener('pointerup', onUp);
  target.addEventListener('pointercancel', onUp);
}

export function useWorkspaceColumnWidths() {
  const mainRef = useRef<HTMLDivElement | null>(null);
  const [widths, setWidths] = useState<Widths>(loadInitialWidths);
  const widthsRef = useRef<Widths>(widths);

  useEffect(() => {
    widthsRef.current = widths;
  }, [widths]);
  const [mainWidth, setMainWidth] = useState(0);
  const [resizing, setResizing] = useState<null | 'left' | 'right'>(null);

  useEffect(() => {
    const el = mainRef.current;
    if (el === null) {
      return;
    }
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        setMainWidth(e.contentRect.width);
      }
    });
    ro.observe(el);
    setMainWidth(el.getBoundingClientRect().width);
    return () => {
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    if (mainWidth === 0) {
      return;
    }
    setWidths((w) => {
      const next = clampWidthsForMain(w, mainWidth);
      if (next.left === w.left && next.right === w.right) {
        return w;
      }
      return next;
    });
  }, [mainWidth]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ left: widths.left, right: widths.right }),
      );
    } catch {
      void 0;
    }
  }, [widths]);

  const onLeftGutterPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      startWorkspaceGutterDrag('left', e, widthsRef, mainRef, setWidths, setResizing);
    },
    [],
  );

  const onRightGutterPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      startWorkspaceGutterDrag('right', e, widthsRef, mainRef, setWidths, setResizing);
    },
    [],
  );

  return {
    mainRef,
    leftWidthPx: widths.left,
    rightWidthPx: widths.right,
    onLeftGutterPointerDown,
    onRightGutterPointerDown,
    activeResize: resizing,
  };
}
