# Byrock Story Explorer

Byrock Story Explorer is a small, embeddable About experience inspired by the visual, click-through branching idea of [`eren23/openflipbook`](https://github.com/eren23/openflipbook). It is deliberately different in one important way: the first version is deterministic and approved-content-only. It does not expose unrestricted image generation, vision-model click resolution, user prompts, or provider keys in the browser.

## Status

This repository contains the initial working scaffold: a zero-dependency Node server, accessible text layer, keyboard-friendly branch navigation, health endpoint, content schema, seed data, and setup documentation. Placeholder content must be replaced before publication.

## Run locally

Requires Node.js 20 or newer.

```bash
npm run seed
npm start
```

Open `http://localhost:3000`. Check `http://localhost:3000/health` for a machine-readable health response. Use `npm run dev` during local editing.

## Content model

Approved story content lives in `data/story.json`. Each node has a stable `id`, title, accessible summary, tags, media alt text, citations, and an explicit `allowedBranches` list. Public citations may include a `url`; internal or confidential sources remain filename-only. Timeline nodes may include draft `milestones`, and team nodes may include draft `teamMembers` with approval status. Run `npm run seed` to normalize the JSON file. A future CMS or API can replace the file behind the same `/api/story` contract.

## Environment and controls

Copy `.env.example` to `.env` if you need overrides. `CONTENT_MODE=approved-only` is the intended default. Never put provider credentials in `public/` or commit real secrets.

### Private staging preview

Use HTTP Basic Auth for a review-only deployment. The server fails closed if private mode is enabled without a password:

```bash
PREVIEW_MODE=private \
PREVIEW_USER=reviewer \
PREVIEW_PASSWORD='use-a-long-random-password' \
npm start
```

Configure the same environment variables in the hosting provider's staging/preview project only. Do not set them on the future public production deployment. The password is never included in the browser bundle or story data, and all routes—including `/health` and `/api/story`—are protected.

For a hosted preview, use a provider-generated preview hostname or an unadvertised staging subdomain. Do not connect `story.byrock.com` until the launch-gate approvals in `docs/LAUNCH-GATE.md` are complete.

## Embedding

The simplest first deployment is a same-origin route such as `/about/story`. If it is hosted separately, link to it from the main site or place it in a sandboxed iframe after reviewing CSP, cookie, analytics, and accessibility implications. Keep the text layer available in the parent navigation as a fallback.

## What Byrock must provide

- Approved sections: company overview, unmet need, science, research evidence and references, regulatory path, trial design, team, and pipeline.
- Approved citations and links for every externally verifiable claim.
- Branding assets, image direction, typography, and tone guidelines.
- Compliance constraints, prohibited claims, review owners, and publication sign-off process.
- Hosting and embedding decision, including analytics and cookie requirements.

## Upstream note

The upstream project is MIT-licensed and remains credited as inspiration. This implementation does not copy upstream source files; it keeps the concept while using a smaller deterministic architecture. If upstream code is imported later, retain its copyright and MIT notice and document the exact files and commit used.

## License

MIT. See `LICENSE`.
