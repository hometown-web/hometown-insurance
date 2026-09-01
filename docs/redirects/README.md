# Redirects

All redirects live in the `redirects` array in `vercel.json` at the repo root.
They are served from Vercel's edge routing config — no function invocations —
and go through a PR like any other change, so the redirect map stays
reviewable and auditable.

## Adding a redirect

Add an entry to the `redirects` array:

```json
{
  "source": "/old-path",
  "destination": "/new-path",
  "permanent": true
}
```

- `permanent: true` → HTTP 308 (search engines transfer ranking; browsers
  cache it — use only when the move is final)
- `permanent: false` → HTTP 307 (use for vanity/campaign URLs, or when the
  destination may change)
- `source` supports path parameters and wildcards, e.g.
  `"/blog/:slug"` → `"/insights/:slug"` or `"/promo/:path*"`.
- Query strings on the incoming request are preserved automatically. Careful
  when hardcoding a query on the `destination` — at the Vercel edge it
  collides with the incoming query and the destination's params win.

## Rules

1. **Redirects only, at the correct layer.** Never implement a static
   redirect as an Astro page stub or in middleware — each hit would invoke a
   serverless function instead of resolving at the edge.
2. **Internal route renames** (an Astro page that moved) may instead use the
   `redirects: {}` option in `astro.config.mjs`; the Vercel adapter compiles
   those into the same edge rules. Either layer is fine — don't define the
   same source in both.
3. **Verify on a preview deployment** before merging; redirects don't run
   under `npm run dev`.
