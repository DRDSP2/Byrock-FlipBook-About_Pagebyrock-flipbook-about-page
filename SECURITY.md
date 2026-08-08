# Security Policy

## Scope

This project is an early scaffold for a public, read-only story experience. Treat all content as public once deployed.

## Rules

- Do not commit API keys, access tokens, patient information, unpublished trial data, or private research documents.
- Keep the approved-content boundary enforced server-side; UI hiding is not authorization.
- Validate and review citations and claims before publication.
- Keep admin or CMS endpoints separate from this public read-only surface and protect them with authentication, authorization, rate limits, audit logging, and CSRF protection where applicable.
- Set a restrictive Content Security Policy before production embedding.

## Reporting

Do not disclose a suspected vulnerability in a public issue. Contact the repository owner privately with reproduction steps, impact, and any proposed mitigation.
