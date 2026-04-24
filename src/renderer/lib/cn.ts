/** Compose Tailwind class names without pulling in `clsx` for the initial slice. */
export type ClassValue =
  | string
  | null
  | undefined
  | false
  | ClassValue[]
  | { [key: string]: boolean | null | undefined };

function append(buffer: string[], value: ClassValue): void {
  if (value === null || value === undefined || value === false) {
    return;
  }
  if (typeof value === 'string') {
    if (value.length > 0) {
      buffer.push(value);
    }
    return;
  }
  if (Array.isArray(value)) {
    for (const entry of value) {
      append(buffer, entry);
    }
    return;
  }
  for (const [key, enabled] of Object.entries(value)) {
    if (enabled) {
      buffer.push(key);
    }
  }
}

export function cn(...values: ClassValue[]): string {
  const buffer: string[] = [];
  for (const value of values) {
    append(buffer, value);
  }
  return buffer.join(' ');
}
