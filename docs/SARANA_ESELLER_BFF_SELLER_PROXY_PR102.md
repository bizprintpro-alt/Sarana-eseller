# PR102 — Sarana eSeller BFF Read-Only Seller Proxy Routes

## A. Executive summary

PR102 adds the Sarana/eSeller **BFF proxy** layer for the read-only seller
dashboard. It is the Sarana side of the integration whose Negd side shipped
in PR101 (Negd internal S2S read-only seller adapter), under the design
agreed in PR100 (Option 3 — eSeller BFF proxy).

- **Purpose:** allow the eSeller mobile app to retrieve read-only seller
  data (profile, dashboard, wallet/referral/lead/commission summaries) by
  hitting the Sarana BFF with its existing mobile Bearer token. Sarana
  then validates the token, derives the eSeller user id server-side, and
  performs a server-to-server call to the Negd internal S2S adapter using
  the integration key — which never leaves the server.
- **Read-only:** GET routes only. No payout. No withdraw. No wallet
  mutation. No ledger writes. No commission posting/calculation.
- **No mobile code changes:** the existing mobile Bearer-token flow to
  `eseller.mn/api` is preserved.
- **No Negd code changes:** Negd already exposes the internal S2S adapter
  (PR101).
- **No schema/migration/seed changes** in either repo.
- Related PRs: **PR100** (proxy decision), **PR101** (Negd S2S adapter).

## B. Implemented routes

| BFF route                          | Negd upstream route                                    | Auth required                  | Method | Mutation? | Notes |
|-----------------------------------|--------------------------------------------------------|--------------------------------|--------|-----------|-------|
| `GET /api/seller/me`               | `GET /api/internal/eseller/seller/me`                  | mobile Bearer (existing)       | GET    | No        | Server-derived user id |
| `GET /api/seller/dashboard`        | `GET /api/internal/eseller/seller/dashboard`           | mobile Bearer (existing)       | GET    | No        | Read-only summary |
| `GET /api/seller/wallet-summary`   | `GET /api/internal/eseller/seller/wallet-summary`      | mobile Bearer (existing)       | GET    | No        | Read-only. NOT the Sarana wallet endpoint |
| `GET /api/seller/referral-summary` | `GET /api/internal/eseller/seller/referral-summary`    | mobile Bearer (existing)       | GET    | No        | Read-only |
| `GET /api/seller/lead-summary`     | `GET /api/internal/eseller/seller/lead-summary`        | mobile Bearer (existing)       | GET    | No        | Read-only |
| `GET /api/seller/commission-summary` | `GET /api/internal/eseller/seller/commission-summary` | mobile Bearer (existing)       | GET    | No        | Read-only. No commission calculation |

## C. Auth flow

1. Mobile app sends `Authorization: Bearer <mobile-token>` to the Sarana
   BFF as it already does today.
2. Sarana validates the token via the existing helper
   `getAuthUser(req)` from [src/lib/api-auth.ts](nextjs/src/lib/api-auth.ts) — same JWT logic used by all
   Sarana mobile routes.
3. Sarana derives the authenticated **eSeller user id** from the verified
   token payload server-side. The user id is **never** taken from a
   client-supplied header, body, or query parameter.
4. Sarana issues a server-to-server `GET` to the Negd internal S2S
   adapter, attaching:
   - `Authorization: Bearer <ESELLER_S2S_INTEGRATION_KEY>` (server only)
   - `X-ESELLER-USER-ID: <derived id>`
   - `X-ESELLER-PROVIDER: ESELLER_MOBILE`
   - `X-ESELLER-TIMESTAMP: <ISO timestamp>`
   - `X-ESELLER-REQUEST-ID: <uuid>`
   - `X-CORRELATION-ID: <inbound or generated>`
5. Negd validates and responds with its read-only envelope.
6. Sarana forwards the upstream status and a decorated envelope to mobile.
   The S2S key is never returned, never logged.

The integration key never reaches the mobile process. Mobile only ever
sends and receives its existing Bearer token.

## D. Env vars (by name only)

These environment variable **names** are referenced. No values appear in
this repository or the documentation:

- `NEGD_INTERNAL_BASE_URL` — base URL of the Negd internal API.
- `ESELLER_S2S_INTEGRATION_KEY` — server-only S2S secret used to
  authenticate Sarana → Negd internal calls.

When either is missing the proxy returns `BFF_UPSTREAM_UNAVAILABLE`.

## E. Error mapping

| Code                        | HTTP | Source                          | Meaning |
|-----------------------------|------|---------------------------------|---------|
| `UNAUTHENTICATED`           | 401  | Sarana BFF                      | Mobile Bearer token missing/invalid. |
| `BFF_UPSTREAM_UNAVAILABLE`  | 502 / 503 / 504 | Sarana BFF             | Negd unreachable, timed out, or env missing. |
| `S2S_AUTH_FAILED`           | 401  | Negd (passed through)           | Negd rejected the S2S key/headers. |
| `NO_IDENTITY_LINK`          | 4xx  | Negd (passed through)           | eSeller user id has no Negd identity mapping. |
| `NO_SELLER_PROFILE`         | 4xx  | Negd (passed through)           | Identity mapped, but no seller profile yet. |
| `INTERNAL_ERROR`            | 500  | Sarana BFF                      | Unexpected handler exception. |

The Sarana BFF preserves the upstream Negd envelope (`{ ok, data, error,
correlationId, responseVersion }`) and only adds two safe BFF metadata
fields: `bff: "sarana-eseller"`, `upstream: "negd"`.

## F. Security guardrails

- **No payout/withdraw routes** added or proxied.
- **No Sarana wallet endpoint** is invoked from the seller proxy.
- **No local DB mutation** in the proxy library or any of the six
  routes — no `prisma.*` calls.
- **No secrets in logs**: only the env variable *name* may appear in a
  one-time configuration warning; the *value* is read only at the call
  site and never logged or returned.
- **Correlation id**: inbound `X-Correlation-ID` is honored, otherwise a
  fresh uuid is generated; it is forwarded to Negd and echoed back to
  the mobile client in the response envelope and the `X-Correlation-ID`
  response header.
- **Timeout / upstream failure**: an 8s `AbortController` timeout caps
  every upstream call; transport failures, timeouts, and non-JSON 5xx
  responses map to `BFF_UPSTREAM_UNAVAILABLE`.
- **Server-only client**: `lib/negdSellerProxy.ts` is imported only from
  server route handlers; the integration key is read at call time from
  `process.env`.

## G. Validation and guardrails

### Commands run

- `npm run lint` (eslint) — see PR description for results.
- `npm run typecheck` — no `typecheck` script exists in `package.json`,
  so the closest equivalent (`tsc --noEmit`) was attempted via the
  project's existing TypeScript config to confirm the new files compile.
- `npm run build` was deliberately **not** run as part of this PR to
  avoid lockfile / Prisma / CI churn unrelated to the change. CI will
  exercise the full build.

### Grep results (over the new files)

```
# No POST/PUT/PATCH/DELETE handlers in seller proxy routes
$ grep -rE "export\s+async\s+function\s+(POST|PUT|PATCH|DELETE)" \
    src/app/api/seller/{me,dashboard,wallet-summary,referral-summary,lead-summary,commission-summary}
(no matches)

# No DB mutation in seller proxy routes or proxy lib
$ grep -rE "prisma\.|\.create\(|\.update\(|\.delete\(|\.upsert\(|\.deleteMany\(|\.updateMany\(" \
    src/app/api/seller/{me,dashboard,wallet-summary,referral-summary,lead-summary,commission-summary} \
    src/lib/negdSellerProxy.ts
(no matches)

# No payout/withdraw / Sarana wallet calls
$ grep -rE "payoutAction|withdrawUrl|wallet/withdraw|api/wallet|payout|withdraw" \
    src/app/api/seller/{me,dashboard,wallet-summary,referral-summary,lead-summary,commission-summary} \
    src/lib/negdSellerProxy.ts
(no matches)

# No commission calculation/posting
$ grep -rE "commission.*(create|update|calculate|post)" \
    src/app/api/seller/{me,dashboard,wallet-summary,referral-summary,lead-summary,commission-summary} \
    src/lib/negdSellerProxy.ts
(no matches)

# Integration key referenced by env-var NAME only, never as a literal value
$ grep -rn "ESELLER_S2S_INTEGRATION_KEY" \
    src/app/api/seller/{me,dashboard,wallet-summary,referral-summary,lead-summary,commission-summary}
(no matches)
$ grep -rn "ESELLER_S2S_INTEGRATION_KEY" src/lib/negdSellerProxy.ts
src/lib/negdSellerProxy.ts:5:// Reads NEGD_INTERNAL_BASE_URL and ESELLER_S2S_INTEGRATION_KEY.
src/lib/negdSellerProxy.ts:13:const S2S_KEY_PRESENT = Boolean(process.env.ESELLER_S2S_INTEGRATION_KEY);
src/lib/negdSellerProxy.ts:86:    console.error('[negdSellerProxy] Missing NEGD_INTERNAL_BASE_URL or ESELLER_S2S_INTEGRATION_KEY');
src/lib/negdSellerProxy.ts:106:        Authorization: `Bearer ${process.env.ESELLER_S2S_INTEGRATION_KEY}`,
```

The four matches above are all safe references to the **variable name**:
two comments, one boolean presence check, one log line that names the
missing env var, and one usage that reads the value only at the moment
of building the upstream `Authorization` header.

## H. Deferred items

- **Mobile UI integration** — moves to PR103.
- **Caching** — none in PR102. Each request makes a fresh upstream call.
  A safe per-user short TTL cache may follow in a later PR.
- **Notifications summary** endpoint — out of scope for PR102.
- **Stronger S2S signature** (HMAC over body+timestamp) — current
  approach uses the integration key as a Bearer secret with timestamp
  and request id headers per PR100; an HMAC upgrade can land in a later
  PR if needed.
- **Launch smoke test** — to be added alongside mobile integration in
  PR103.

## I. PR103 inputs

**Recommended next:** _PR103 — eSeller Mobile Read-Only Seller Dashboard
Integration._

Inputs that PR103 should rely on:

- Mobile may call `GET /api/seller/{me,dashboard,wallet-summary,referral-summary,lead-summary,commission-summary}` on the Sarana BFF.
- **Mobile must not** call Negd directly.
- The existing mobile Bearer-token flow remains unchanged.
- **No payout/withdraw UI** is to be introduced.
- **No Sarana wallet** usage in the seller dashboard flow.
- The response envelope shape forwarded by the BFF is the Negd envelope
  (`ok`, `data`, `error`, `correlationId`, `responseVersion`) decorated
  with `bff: "sarana-eseller"` and `upstream: "negd"`.

## J. Findings

| ID            | Severity | Title                                              |
|---------------|----------|----------------------------------------------------|
| PR102-F001    | INFO     | Sarana BFF seller proxy implemented                 |
| PR102-F002    | HIGH     | S2S integration key remains server-only             |
| PR102-F003    | HIGH     | No payout/withdraw proxy added                      |
| PR102-F004    | HIGH     | No client-supplied user id accepted                 |
| PR102-F005    | MEDIUM   | Caching deliberately deferred                       |

### PR102-F001 INFO — Sarana BFF seller proxy implemented
Six read-only `GET` routes added under `/api/seller/*`, backed by a
single server-only proxy library that calls the Negd internal S2S
adapter from PR101. Behavior matches the PR100 design.

### PR102-F002 HIGH — S2S integration key remains server-only
`ESELLER_S2S_INTEGRATION_KEY` is read from `process.env` only inside the
Sarana server runtime. It is never embedded in client bundles, never
logged (only its env-var name appears in a configuration error path),
and never returned in any response envelope.

### PR102-F003 HIGH — No payout/withdraw proxy added
The proxy exposes only the six read-only seller summary endpoints. No
payout creation, no withdraw flows, no Sarana wallet endpoints are
exposed or invoked. Verified via grep over the changed files.

### PR102-F004 HIGH — No client-supplied user id accepted
The eSeller user id forwarded to Negd is exclusively derived from the
verified mobile JWT (`getAuthUser(req).id`). No header, body, or query
parameter from the client is read for identity.

### PR102-F005 MEDIUM — Caching deliberately deferred
Each request currently issues a fresh upstream call. A per-user
short-TTL cache is intentionally deferred to keep PR102 minimal and to
avoid premature coupling to the Upstash Redis path used elsewhere.

## K. Mongolian operator summary

- **PR102 бол Sarana/eSeller BFF proxy** — eSeller mobile хэрэглэгчдэд
  Negd-ийн зөвхөн уншигдах (read-only) seller өгөгдлийг өгөх Sarana
  тал.
- **Mobile одоо байгаа Bearer token-оороо** Sarana-г дуудна. Mobile-д
  ямар ч өөрчлөлт байхгүй.
- **Sarana server тал Negd-ийн internal S2S endpoint** дуудна. Хэрэглэгчийн
  ID-г server тал token-оос гаргана, client-аас авахгүй.
- **S2S key mobile-д очихгүй**. Зөвхөн server-runtime дотор `process.env`
  -ээс уншигдана, log-д гарахгүй, response-д буцахгүй.
- **Зөвхөн GET / read-only**. Өгөгдөл бичихгүй, өөрчлөхгүй.
- **Payout / withdraw байхгүй**. Wallet mutation байхгүй. Sarana
  wallet endpoint дуудахгүй. Commission бодолт хийхгүй. Ledger бичихгүй.
- **PR103 дээр** mobile UI integration орно — энэ тохиолдолд
  mobile-аас Sarana BFF-ийн `/api/seller/*` руу хандах болно. Negd
  руу шууд дуудахгүй.
