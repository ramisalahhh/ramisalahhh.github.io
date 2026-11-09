---
title: "DeviceWatch: monitor and control my laptops from my phone"
summary: "A tiny agent on each laptop, a containerized offline monitor, and a CI pipeline that tests everything and ships the Android APK on every push."
type: devops
featured: true
date: 2026-10-18
tools: [Docker, Docker Compose, GitHub Actions, GitHub Pages, Python, Bash, ntfy]
repo: https://github.com/ramisalahhh/device-watch
live: https://github.com/ramisalahhh/device-watch/releases/latest
diagram: ./device-watch.svg
---

## Problem

I wanted to see what my laptops are doing (on, sleeping, battery, which game is running) on my phone and my watch. I also wanted to lock, sleep or shut them down remotely. The hard case is a laptop whose battery dies or whose Wi-Fi drops: it can't announce that it's gone, so something always-on has to notice the silence.

## Architecture

- **Agent** on each laptop (Python standard library only, about 20 MB RAM). It sends events and a heartbeat every 15 minutes to an **ntfy** server (HTTP pub/sub), and receives commands over one idle connection, with no polling.
- **Phone apps**: a native Android app and an installable web app for iPhone. They show a card per laptop and send signed commands back through ntfy.
- **Monitor** in a Docker container on any always-on machine. It watches the heartbeats and alerts when a laptop has been silent for more than 35 minutes without saying goodbye.

## Tools and why

- **Docker Compose for the monitor.** It's a small `python:3.13-alpine` image that runs as a non-root user on a read-only filesystem, capped at 48 MB of memory and 0.1 CPU, with log rotation and `restart: unless-stopped`. It runs the same on a free cloud VM or a Raspberry Pi. The Compose file also includes an optional self-hosted ntfy server.
- **GitHub Actions, three jobs on every push to `main`:**
  - **test:** history unit tests, plus an end-to-end test of agent and monitor against a mock ntfy server, with a 30 MB RAM limit so the agent can't quietly grow.
  - **android:** builds the APK with Gradle. It's signed with a keystore stored in GitHub Secrets, versioned by the run number, and published to GitHub Releases, so the phone installs the latest build straight from the Releases page.
  - **web:** publishes the iPhone web app to GitHub Pages.
- **Security:** commands are authenticated with a shared secret, and anything older than 5 minutes is rejected to block replays. Secrets live on the devices and in GitHub Secrets, never in the repo.
- **Install scripts** for Windows (PowerShell) and Linux (Bash) so a new laptop is set up in a few minutes.

## What broke and how I fixed it

**Commands got lost when the connection dropped.** If the laptop's connection blipped while I pressed "Shut down", the command was simply gone. I fixed it on both sides:

- **Agent:** on reconnect it replays the commands it missed, de-duplicated by ID. It detects a dead connection in 75 seconds instead of 120, and sends a receipt for every command.
- **Android app:** each command is retried up to 3 times, and the app shows "✓ received" when the receipt arrives.
- **Tests:** I added a simulated network outage to the end-to-end test so this can't regress. It passes 18 of 18 checks.

**The agent could grow without anyone noticing.** It is meant to stay tiny next to games, so I added the 30 MB RAM limit to CI. The build now fails if memory use creeps up.
