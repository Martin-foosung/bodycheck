# BodyCheck v2.4 — Auth, SNS and Admin

Production-oriented Android/Expo project connected to the BodyCheck Render API.

## v2.4 additions
- Email/password registration and login with clearer errors and request timeout.
- Google / Kakao / Naver OAuth flow (provider credentials required).
- Multi-provider account identity model.
- User role/status fields.
- Admin-only user management tab.
- Admin APIs for search, suspend/reactivate, and role changes.
- Prisma 6.19 pinned to avoid the incompatible Prisma 8 preview CLI issue.
- Expo SDK 57-compatible app config (legacy `splash` field removed).
- Automatic `prisma migrate deploy` before backend start on Render.

See `DEPLOY-V2.4.md` for deployment and SNS callback configuration.
