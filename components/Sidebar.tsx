import React from 'react';
import { Region } from '../types';
import Stat from './Stat';

interface SidebarProps {
  selectedRegion: Region;
}

export default function Sidebar({ selectedRegion }: SidebarProps) {
  if (!selectedRegion) {
    return null;
  }

  return (
    <div className="sidebar">
      <div className="name">
        <strong>{selectedRegion.name}</strong>
        <span>
          <strong>POPULATION:</strong> {selectedRegion.population.toLocaleString()}
        </span>
      </div>
      <div className="stats">
        <Stat color="red" title="Cases" value={selectedRegion.cases.toLocaleString()} />
        <Stat color="gray" title="Deaths" value={selectedRegion.deaths.toLocaleString()} />
      </div>
      <style jsx>{`
        .sidebar {
          flex: 0 0 400px;
          padding: 50px;
          display: flex;
          flex-direction: column;
        }

        .name {
          display: flex;
          flex-direction: column;
          margin-bottom: 30px;
        }

        .name > span > strong {
          font-size: 1rem;
        }

        .stats {
          display: flex;
          flex-direction: row;
        }
      `}</style>
      <style jsx global>{`
        .stats > .stat {
          margin: 5px;
        }

        .stats > .stat:first-child {
          margin-left: 0;
        }

        .stats > .stat:last-child {
          margin-right: 0;
        }
      `}</style>
    </div>
  );
}
