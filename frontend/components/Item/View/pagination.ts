import type { ShallowUnwrapRef } from "vue";

export type Pagination = ShallowUnwrapRef<{
  page: WritableComputedRef<number, number>;
  pageSize: ComputedRef<number>;
  totalSize: Ref<number, number>;
  setPage: (newPage: number) => void;
}>;

// Keep a page selection within the current result set after data mutations.
export function clampPageToTotal(page: number, total: number, pageSize: number): number {
  const lastPage = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  return Math.min(Math.max(1, page), lastPage);
}

// Cached async-data from a prior page must never be shown under a new page
// number, including during refreshes or quick navigation.
export function isCurrentLocationPage(status: string, requestedKey: string, loadedKey?: string): boolean {
  return status === "success" && requestedKey === loadedKey;
}

// Defensive validation: this preference comes from local storage and can be
// malformed despite its TypeScript type. The API only accepts integer sizes.
export function normalizeLocationPageSize(value: unknown): number {
  const parsed = typeof value === "number" || typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(parsed) || parsed <= 0) return 24;
  return Math.min(96, Math.max(1, Math.floor(parsed)));
}

// Direct mode loads the complete item list and paginates locally. Preserve
// the mounted table (including its selection/page state) on page-size changes.
// Descendant mode is paginated by the server and needs a per-page key.
export function locationItemDataKey(locationId: string, depth: string, page: number, pageSize: number): string {
  const prefix = locationId + "_item_list_" + depth;
  return depth === "direct" ? prefix : prefix + "_" + page + "_" + pageSize;
}
