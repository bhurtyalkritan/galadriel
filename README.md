# galadriel

**arkham.** — A Palantir-inspired node-based data pipeline builder for the web.

## What is Arkham?

Arkham is a minimalist, black-and-white canvas for visually designing data transformation pipelines. Think of it as a mind-map for your data flows, where you can drag, connect, and orchestrate different operations in an intuitive, free-flowing workspace.

## Features

- **Free-flowing Canvas** — Infinite zoom/pan workspace with smooth interactions
- **Node-based Pipeline Design** — Drag and connect nodes to build data flows
- **Six Node Types:**
  - **Dataset** — Data sources
  - **Filter** — Conditional filtering
  - **Join** — Combine datasets
  - **If/Then** — Conditional logic
  - **API** — External endpoints
  - **Enrich** — Data enhancement

- **Mind-map Style Connections** — Smooth bezier curves with magnetic snapping
- **Dark Theme** — Subtle, focused interface inspired by Palantir's aesthetic
- **Keyboard Shortcuts:**
  - `Ctrl+0` — Reset view
  - `Ctrl+1` — Fit all nodes
  - `Delete/Backspace` — Remove selected node
  - `Esc` — Deselect / Cancel connection

## Tech Stack

- **Next.js 14** — React framework with App Router
- **TypeScript** — Type-safe development
- **Zustand** — Lightweight state management
- **Tailwind CSS** — Utility-first styling
- **Lucide React** — Clean, minimal icons

## Getting Started

```bash
cd arkham
npm install
npm run dev
```

Visit `http://localhost:3000` to start building pipelines.

## Usage

1. Click the **+** button (bottom-left) to add nodes
2. **Drag nodes** around the canvas to position them
3. **Click and drag** from a blue output port to a green input port to create connections
4. **Select a node** and press Delete to remove it
5. Use **mouse wheel** to zoom, **click + drag** empty space to pan

---

Built with precision. Designed for clarity.
