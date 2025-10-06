# PMO Command Center

A lightweight, single-page portfolio dashboard tailored for project managers and PMO leads. The app runs entirely in the browser and can be hosted directly from this repository (for example via GitHub Pages).

## Features

- 📊 **Portfolio snapshot** – real-time counts of active, on-track, and at-risk projects plus the next milestone.
- 🗂️ **Project list** – sortable project cards with progress, budget usage, RAG health, and quick actions.
- ⚠️ **Risk & action log** – consolidated open risks with mitigation notes and owners.
- 🗓️ **Milestone timeline** – chronological list of upcoming project end dates.
- ➕ **Add projects** – capture portfolio entries (including tags and a first risk) that persist in local storage.
- 📤 **Export summary** – download a plain-text portfolio digest for status reports or leadership updates.

## Getting started

1. Open `index.html` in any modern browser. No build tools or backend services are required.
2. Use the filters to focus on a specific quarter, status, or keyword.
3. Press **+ Add Project** to capture new work. Data persists locally in the browser via `localStorage`.
4. Use **Log Risk** and **Mark Complete** buttons on each project card to keep the portfolio current.
5. Click **Export Summary** to generate a shareable text report.

> ℹ️ Initial sample data is provided to demonstrate the experience. Clear your browser storage to reset the workspace.

## Deploying with GitHub Pages

1. Push the repository to GitHub.
2. In the repository settings, enable **GitHub Pages** and choose the main branch (root folder).
3. Visit the published URL to interact with the dashboard.

## License

This project is available under the MIT License. See `LICENSE` if provided by the repository owner.
