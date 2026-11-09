---
title: "DevOps command reference"
summary: "A searchable reference of commands and config files for everyday DevOps work, checked and published by GitHub Actions."
type: devops
featured: true
date: 2026-10-27
tools: [GitHub Actions, GitHub Pages]
repo: https://github.com/ramisalahhh/devops-command-reference
live: https://ramisalahhh.github.io/devops-command-reference/
diagram: ./devops-command-reference.svg
---

## Problem

While studying DevOps and Cloud I kept looking up the same commands and config files across Linux, Git, Docker, Ansible, Jenkins, Kubernetes, Prometheus, web servers, AWS and Terraform. I wanted them in one searchable page, with ready-to-copy templates and links to the official docs.

## Architecture

The whole site is one static HTML file (`site/index.html`) with no build step and no dependencies. Every push to `main` runs a GitHub Actions workflow that checks the page and publishes the `site/` folder to GitHub Pages.

## Tools and why

- **No build step.** With nothing to compile there is nothing to break, and the page loads instantly. It's easy to host anywhere later.
- **GitHub Actions:** a guard step fails the deploy if `index.html` is empty or its title is missing, so a bad commit can't replace the live page with a blank one. Then the official Pages actions upload and deploy it.
- **`concurrency: pages`** with `cancel-in-progress: false`, so two quick pushes deploy one after another instead of fighting.
- **Issue templates** for "add a command" and "report a mistake", so readers can help keep it correct.

## What broke and how I fixed it

**Some commands in the first version were wrong.** In a reference, a wrong command is worse than no command. On the same day I corrected the descriptions of `passwd`, `journalctl -b`, `git branch -D` and `docker inspect` (getting the IP on any network). I also fixed the Jenkins Java requirement (Java 21) and the `sshd` service name on RHEL.

**Two config examples were unsafe or broken.** An `.htpasswd` example sat inside the web root; I moved it outside. A container volume didn't match the image's `WORKDIR`; I fixed it to match. I also replaced moved and dead documentation links and added the issue templates above, so mistakes get reported instead of copied.
