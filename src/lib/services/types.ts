// Shared types for the service layer

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: Record<string, string | string[] | undefined>;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export function normalizeListParams(params: ListParams): Required<Pick<ListParams, "page" | "limit">> & ListParams {
  return {
    ...params,
    page: Math.max(1, params.page ?? 1),
    limit: Math.min(MAX_PAGE_SIZE, Math.max(1, params.limit ?? DEFAULT_PAGE_SIZE)),
  };
}
