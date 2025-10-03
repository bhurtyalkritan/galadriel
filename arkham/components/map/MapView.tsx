'use client';

import React from 'react';
import Map, { Source, Layer } from 'react-map-gl';

interface MapViewProps {
  className?: string;
}

export function MapView({ className }: MapViewProps) {
  return (
    <div className={`${className}`}>
      <div className="relative h-full rounded-lg overflow-hidden">
        <Map
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          initialViewState={{
            longitude: -74.0,
            latitude: 40.7,
            zoom: 10
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/dark-v11"
        />
      </div>
    </div>
  );
}
