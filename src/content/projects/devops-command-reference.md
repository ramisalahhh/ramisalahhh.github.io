---
title: "DevOps command reference"
summary: "A searchable reference of commands and config files for everyday DevOps work, checked and published by GitHub Actions."
type: devops
featured: false
date: 2026-10-27
tools: [GitHub Actions, GitHub Pages]
repo: https://github.com/ramisalahhh/devops-command-reference
live: https://ramisalahhh.github.io/devops-command-reference/
diagram:
---

## Problem

TODO: the problem you were solving when you built this.

## Architecture

One static HTML file (`site/index.html`) with no build step. Every push to `main` runs `.github/workflows/pages.yml`, which checks the page and publishes the `site/` folder to GitHub Pages.

TODO: anything else about the architecture.

## Tools and why

TODO: why GitHub Actions and GitHub Pages.

## What broke and how I fixed it

TODO: one real problem you hit and how you fixed it.
