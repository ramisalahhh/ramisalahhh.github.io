# ramisalahhh.github.io

Personal site of Rami Salah, DevOps engineer. Built with [Astro](https://astro.build), deployed to GitHub Pages by GitHub Actions on every push to `main`.

Live: https://ramisalahhh.github.io

## Run it locally

Needs Node 22.23.4 or newer (CI uses Node 24).

```bash
npm ci
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
npm run preview  # serve dist/
```

## Add a project

1. Copy the template: `cp src/content/projects/_template.md src/content/projects/my-project.md`. The file name becomes the URL: `/projects/my-project/`.
2. Fill in the frontmatter and the four sections. Put the architecture diagram (SVG or PNG) next to the file and point `diagram:` at it, e.g. `diagram: ./my-project.svg`.
3. Commit and push to `main`. The card, the case-study page and any new skill tags appear on the next deploy.

Fields:

| Field | Needed for | Notes |
| --- | --- | --- |
| `title` | all | |
| `summary` | all | One line, shown on the card |
| `type` | all | `devops` (Projects page + case study) or `lab` (Lab page only) |
| `date` | all | `YYYY-MM-DD`, newest shows first |
| `repo` | all | Full URL |
| `tools` | devops | List, e.g. `[Docker, GitHub Actions]`. These are the only source of the home-page skills |
| `featured` | devops | `true` puts it on the home page. At most 3 |
| `live` | devops, optional | Full URL |
| `diagram` | devops, optional | Path relative to the Markdown file |
| `problem` | lab, optional | First line on the Lab card. `summary` is the second line (what you built) |

A lab entry needs only frontmatter:

```markdown
---
title: "Gym log"
problem: "I kept losing track of my lifts."
summary: "A small web app that logs sets and shows progress."
type: lab
date: 2026-11-10
repo: https://github.com/ramisalahhh/gym-log
---
```

If a file has bad frontmatter (missing field, wrong type, not a URL, more than 3 featured), `npm run build` fails and names the file and the field. On a pull request this shows up as a failed check before anything is merged.

Files starting with `_` are ignored, so `_template.md` never shows on the site.

## Edit the other content

Everything else is in `src/data/`:

- `site.json`: name, headline, GitHub, LinkedIn, email
- `services.json`: the three services on the home page
- `about.json`: the About paragraph and the four cards
- `certifications.json`: a list of `{ "name": "...", "issuer": "...", "year": 2026, "url": "..." }`
- `skill-groups.json`: which group a tool sits in on the skills strip. Listing a tool here does **not** show it; only tools used in a devops project appear. Tools not in any group show under "Other"

Text that still starts with `TODO` is highlighted on the page so it can't slip through.

## Change the domain

1. In `astro.config.mjs`, change `SITE_URL` to the new domain, e.g. `https://ramisalah.dev`.
2. Add a file `public/CNAME` containing just the domain, e.g. `ramisalah.dev`.
3. Point the domain's DNS at GitHub Pages and set the custom domain in the repo under Settings → Pages. Push.

## Deployment

`.github/workflows/deploy.yml` runs on every push and pull request:

- **build** (always): `withastro/action` installs dependencies, runs `astro build` and uploads `dist/`.
- **deploy** (push to `main` only): `actions/deploy-pages` publishes it.

One-time setup: in the repo go to Settings → Pages and set **Source** to **GitHub Actions**.

The build output is plain static files, so moving to S3 + CloudFront later only means replacing the `deploy` job. No secrets are needed for this site.
