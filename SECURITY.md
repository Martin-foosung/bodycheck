# Security baseline
- Never expose HIRA service keys to the mobile app.
- Store API secrets only in backend environment variables / secret manager.
- Use TLS in production.
- Hash passwords; never store plaintext passwords.
- Encrypt backups and restrict DB access.
- Health records require explicit consent, access logging and deletion capability.
- Red-flag logic must be clinician-reviewed before production release.
