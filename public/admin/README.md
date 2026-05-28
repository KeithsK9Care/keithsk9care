# Keith's K9 Care — Content editor

This folder ships a Sveltia CMS instance at `keithsk9care.co.uk/admin/`.

Sveltia CMS is a drop-in Decap CMS replacement — same `config.yml` format, but
it doesn't need an OAuth proxy worker; it uses GitHub Device Flow login built in.

## First-time setup (one-off)

1. The repo owner (KeithsK9Care) and any GitHub collaborator can sign in.
2. Visit https://keithsk9care.co.uk/admin/
3. Click "Sign in with GitHub" — authorize Sveltia to read & write the repo.
4. That's it. Edits become commits to `main`; Cloudflare Pages auto-deploys.

## What can be edited

- Site settings (contact, address, hours, brand)
- Services (the 6 services + breed examples + per-service FAQs)
- Areas (the 13 villages)
- FAQs (all 10)
- Reviews
- Groom Stories
