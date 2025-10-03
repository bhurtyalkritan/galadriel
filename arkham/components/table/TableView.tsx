'use client';

import React from 'react';

interface TableViewProps {
  className?: string;
}

export function TableView({ className }: TableViewProps) {
  const sampleData = [
    { id: 1, name: 'Incident A', severity: 3, lat: 40.7128, lng: -74.0060 },
    { id: 2, name: 'Incident B', severity: 2, lat: 40.7589, lng: -73.9851 },
    { id: 3, name: 'Incident C', severity: 4, lat: 40.7614, lng: -73.9776 },
  ];

  return (
    <div className={`${className}`}>
      <div className="p-4 h-full">
        <div className="overflow-auto h-full bg-card/20 backdrop-blur-sm rounded-lg border border-border/30">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-panel/80 backdrop-blur-sm">
              <tr className="border-b border-border/30">
                <th className="text-left py-3 px-3 text-text-subtle font-medium">ID</th>
                <th className="text-left py-3 px-3 text-text-subtle font-medium">Name</th>
                <th className="text-left py-3 px-3 text-text-subtle font-medium">Severity</th>
                <th className="text-left py-3 px-3 text-text-subtle font-medium">Location</th>
              </tr>
            </thead>
            <tbody>
              {sampleData.map((row) => (
                <tr key={row.id} className="border-b border-border/20 hover:bg-accent/10 transition-colors duration-200">
                  <td className="py-3 px-3">{row.id}</td>
                  <td className="py-3 px-3 font-medium">{row.name}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      row.severity >= 4 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      row.severity >= 3 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      'bg-green-500/20 text-green-400 border border-green-500/30'
                    }`}>
                      {row.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-text-subtle">{row.lat.toFixed(4)}, {row.lng.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
