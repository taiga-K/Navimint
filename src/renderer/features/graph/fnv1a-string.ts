/** FNV-1a 32-bit initial offset (standard). */
export const FNV1A_OFFSET = 0x811c9dc5;
const FNV1A_PRIME = 0x01000193;
/** Base for stringified stable graph hashes (unsigned 32-bit). */
export const FNV1A_HASH_RADIX = 36;

/** FNV-1a 32-bit update from `seed` over `value` (hash not finalized). */
export function fnv1aUpdate(seed: number, value: string): number {
  let hash = seed;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, FNV1A_PRIME);
  }
  return hash;
}

/** Full string hash as unsigned base-`HASH_RADIX` string (stable graph ids). */
export function fnv1aHashString(value: string): string {
  return (fnv1aUpdate(FNV1A_OFFSET, value) >>> 0).toString(FNV1A_HASH_RADIX);
}
