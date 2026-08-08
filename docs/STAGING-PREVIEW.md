# Staging Preview

This repository is staging-only until the public launch gate is approved. The app now supports a provider-neutral private preview using HTTP Basic Auth.

## Enable access control

Set these variables in the staging environment only:

```text
PREVIEW_MODE=private
PREVIEW_USER=reviewer
PREVIEW_PASSWORD=<long-random-password>
CONTENT_MODE=approved-only
```

The server refuses to start if `PREVIEW_MODE=private` and `PREVIEW_PASSWORD` is empty. Every route is protected, including `/`, `/health`, and `/api/story`.

## Review workflow

1. Deploy the current branch to a provider-generated preview URL or an unadvertised staging hostname.
2. Share the hostname and password only with reviewers.
3. Review content, citations, titles, milestones, accessibility, and branch navigation.
4. Rotate `PREVIEW_PASSWORD` after the review or remove the preview deployment.
5. Keep the public domain disconnected until `docs/LAUNCH-GATE.md` is signed off.

## Limitations

- This protects the app at the Node server layer; a hosting provider or reverse proxy must route requests through this server.
- If a static-only host serves `public/` directly, this protection will not run. Use a Node-capable deployment or the host's own access-control feature.
- HTTP Basic Auth is suitable for a temporary review gate over HTTPS, not for end-user accounts.
