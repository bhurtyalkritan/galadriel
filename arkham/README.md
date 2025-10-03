# Arkham

A minimal, Palantir-inspired operations canvas for data fusion, filtering, and actioning built with Next.js.

## Features

- **Dark Theme UI**: Monochrome design with minimal accent colors and animated gradients
- **Dynamic Canvas**: Infinite canvas with zoom, pan, and navigation controls
- **Mind Map Connections**: Organic, curved connections between nodes with visual feedback
- **Node-based Workflow**: Drag-and-drop interface for building data pipelines
- **Real-time Map Integration**: Geospatial data visualization and interaction
- **Data Connectors**: Support for CSV, JSON, GeoJSON, and Parquet files
- **Collapsible Sidebar**: Unified interface for all tools and configurations
- **Governance & Audit**: Built-in policy and audit logging framework

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **State Management**: Zustand
- **Canvas**: Custom infinite canvas with transform controls
- **Maps**: MapLibre GL JS with Mapbox integration
- **Styling**: Tailwind CSS with custom dark theme and gradients
- **Data Processing**: Papa Parse for CSV, client-side data transforms

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
# Add your Mapbox token to .env.local
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

```
arkham/
├── app/                 # Next.js app directory
├── components/          # React components
│   ├── canvas/         # Node-based canvas components
│   ├── inspector/      # Node configuration panel
│   ├── map/           # Map visualization
│   ├── table/         # Data table view
│   └── upload/        # File upload interface
├── store/              # Zustand stores
├── types/              # TypeScript type definitions
└── lib/                # Utility functions
```

## Usage

1. **Create Nodes**: Use the floating + button to add dataset, filter, API, and other nodes
2. **Navigate Canvas**: Mouse wheel to zoom, click and drag to pan around
3. **Connect Workflow**: Click right port (output) then left port (input) to create mind-map style connections
4. **Upload Data**: Use the collapsible sidebar to upload CSV files and manage datasets
5. **Configure**: Select nodes to configure parameters in the Inspector panel
6. **Visualize**: View results on the integrated map and table views

## Canvas Controls

- **Mouse Wheel**: Zoom in and out
- **Click + Drag**: Pan around the infinite canvas
- **Ctrl+0**: Reset view to center
- **Ctrl+1**: Fit all nodes in view
- **Escape**: Cancel connection mode

## Supported Node Types

- **Dataset**: Data source nodes (CSV, JSON, GeoJSON)
- **Filter**: Apply SQL-like filters to data
- **Join**: Combine datasets with key-based or spatial joins
- **If/Then**: Conditional branching logic
- **API**: Send/receive data via REST APIs
- **Enrich**: Enhance data with external services

## Contributing

This is a demonstration application showcasing modern data pipeline architecture and user experience design principles.

## License

MIT
