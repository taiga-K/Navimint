export function compactProjectLabel(value: string | null): string | null {
  if (value === null) {
    return null;
  }
  const segments = value.split(/[\\/]/).filter(Boolean);
  return segments.at(-1) ?? value;
}
