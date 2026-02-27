import { NextResponse } from "next/server";
import type { PaginatedResult } from "@/lib/services/types";

export function apiSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data }, { status });
}

export function apiError(
  message: string,
  status: number,
  code?: string
): NextResponse {
  return NextResponse.json(
    { error: { message, ...(code ? { code } : {}) } },
    { status }
  );
}

export function apiPaginated<T>(result: PaginatedResult<T>): NextResponse {
  return NextResponse.json(
    {
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    },
    { status: 200 }
  );
}
