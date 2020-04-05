import { useMemo } from 'react';
import { Region } from '../types';
import Stat from './Stat';
import Card from './Card';
import LineChart from './LineChart';
import { processTimeline } from '../utils/data';

interface SidebarProps {
  selectedRegion: Region;
}

export default function Sidebar({ selectedRegion }: SidebarProps) {
  const casesTimeline = useMemo(() => processTimeline(selectedRegion.timeline, 'cases'), [selectedRegion]);
  const deathsTimeline = useMemo(() => processTimeline(selectedRegion.timeline, 'deaths'), [selectedRegion]);

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
      <Card color="red">
        <LineChart timeline={casesTimeline} width={375} height={200} />
      </Card>
      <Card color="gray">
        <LineChart timeline={deathsTimeline} width={375} height={200} />
      </Card>
      <style jsx>{`
        .sidebar {
          flex: 0 0 450px;
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
        .sidebar > .card {
          margin: 5px 0;
        }

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
