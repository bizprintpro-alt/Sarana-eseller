import { NextResponse } from 'next/server';

/**
 * Standard response envelope used by Sarana API routes (AUDIT M5).
 *
 * Success shape:  { success: true,  data: <T> }
 * Failure shape:  { success: false, error: <string> }
 *
 * Migration is incremental — routes opt in by calling `ok()` / `fail()`
 * instead of raw `NextResponse.json(...)`. Existing routes continue to
 * return bare payloads until migrated.
 *
 * Mobile `api.ts` interceptor sniffs `res.data.success` to decide whether
 * to unwrap the envelope, so both shapes coexist on the wire without
 * breaking older screens.
 */

export type ApiSuccess<T> = { success: true;  data: T };
export type ApiFailure    = { success: false; error: string };
export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

/** Success response. `status` defaults to 200. */
export function ok<T>(data: T, status = 200): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

/** Failure response. `status` defaults to 400. */
export function fail(error: string, status = 400): NextResponse<ApiFailure> {
  return NextResponse.json({ success: false, error }, { status });
}
