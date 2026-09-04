export interface PaginationQuery {
  page?: number;
  limit?: number;
  all?: boolean | string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function parsePagination(query: PaginationQuery = {}, defaultLimit = 12) {
  const isAll = query.all === true || String(query.all) === 'true';
  const page = Math.max(1, Number(query.page) || 1);
  const parsedLimit = Number(query.limit);
  const limit = isAll
    ? 10000
    : Math.min(
        10000,
        Math.max(1, !isNaN(parsedLimit) && parsedLimit > 0 ? parsedLimit : defaultLimit),
      );
  const skip = isAll ? 0 : (page - 1) * limit;
  return { page, limit, skip, isAll };
}

export function paginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
