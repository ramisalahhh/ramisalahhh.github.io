---
title: "Ply Review: a chess game reviewer, containerized and deployed"
summary: "Stockfish reviews of chess.com games. Runs free in the browser on GitHub Pages, or self-hosted with Docker Compose behind nginx."
type: devops
featured: true
date: 2026-10-29
tools: [Docker, Docker Compose, Nginx, GitHub Actions, GitHub Pages, Python]
repo: https://github.com/ramisalahhh/ply-review
live: https://ramisalahhh.github.io/ply-review/
diagram: ./ply-review.svg
---

## Problem

I wanted a move-by-move review of my chess.com games (Brilliant, Best, Mistake, Blunder, an accuracy score and an estimated rating) using an open method I could tune. And I wanted anyone to be able to use it with nothing to install and no server bill.

## Architecture

There are two ways to run the same app:

- **The public website.** A static TypeScript site. Stockfish 19 (WebAssembly) runs inside the visitor's browser in several Web Workers at once. Games come straight from chess.com's public API, and finished reviews are saved on the device. GitHub Actions builds it and publishes it to GitHub Pages on every push to `main`. There is no server to run or pay for.
- **Self-hosted with Docker.** `docker compose up` starts an nginx container that serves the same built site. `docker compose --profile api up` adds a second container: a Python FastAPI service with native, full-strength Stockfish, a SQLite review store and an on-disk cache in a named volume.

## Tools and why

- **Multi-stage Docker builds.** The website image builds with `node:24-alpine` and ships only the output on `nginx:1.29-alpine`, so no Node or source code ends up in production. The API image downloads the right Stockfish binary for amd64 or arm64 in its own stage, checks that it answers `uciok`, and copies in only the binary.
- **Hardened API container.** It runs as a non-root user, has a `HEALTHCHECK` on `/api/health`, keeps its data in a volume, and mounts `config.yaml` read-only, so thresholds can change without a rebuild.
- **Compose profiles.** One file runs the website by default and adds the heavier API only when asked.
- **nginx.** It gives single-page-app routing (unknown paths fall back to `index.html`) and one-year immutable caching for hashed assets.
- **GitHub Actions CI.** Python tests run on 3.11, 3.12 and 3.13, against a real Stockfish installed in the runner. Linting, the frontend tests and the build run next. Only when everything passes do both Docker images get built with Buildx, using the GitHub Actions layer cache.
- **A drift check in CI.** The website and the Python code share one `config.yaml`. CI fails if someone changes it without exporting it to the website.

## What broke and how I fixed it

**CI failed even though nothing was wrong.** The drift check compared the exported data byte for byte. On GitHub's Linux runners `exp()` gave last-digit differences compared with my Windows machine, so the check failed although the data was current. I changed it to compare the numbers within a tolerance instead of the bytes.

**The numbers didn't match what players expect.** On 13 games read from chess.com's own review, my first thresholds gave far too many Excellent moves (236 vs 170) and Blunders (46 vs 23), and too few Mistakes (32 vs 69). I wrote a script that refits the thresholds from those counts. For accuracy, I collected 93 reviewed games (ratings ~200 to 2800) and fitted the formula with 5-fold cross-validation. The typical gap dropped from 7.6 to 4.9 points.
