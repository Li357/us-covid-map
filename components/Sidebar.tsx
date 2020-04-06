import { useMemo, useState } from 'react';
import { timeFormat } from 'd3';
import { Region } from '../types';
import Stat from './Stat';
import Card from './Card';
import LineChart from './LineChart';
import { processTimeline, formatNumber } from '../utils/data';
import arrow from '../public/arrow.svg';

interface SidebarProps {
  selectedRegion: Region;
  regionInView: Region;
  onBlur: () => void;
}

export default function Sidebar({ selectedRegion, regionInView, onBlur }: SidebarProps) {
  // TODO: add loading vis
  if (!selectedRegion.timeline) {
    return null;
  }

  const data = selectedRegion.timeline.slice(0, 30); // only take first 30 days of data
  const [selectedIndex, setSelectedIndex] = useState(data.length - 1);
  const casesTimeline = useMemo(() => processTimeline(data, 'cases'), [selectedRegion]);
  const deathsTimeline = useMemo(() => processTimeline(data, 'deaths'), [selectedRegion]);
  const formatDateTime = timeFormat('%b %e, %I:%M %p');

  return (
    <div className="sidebar">
      <div className="name">
        <div>
          <strong>{selectedRegion.name}</strong>
          {regionInView.fips.length === 2 && <img className="back" src={arrow} onClick={onBlur} />}
        </div>
        <span>
          <strong>POPULATION:</strong> {formatNumber(selectedRegion.population)}
        </span>
      </div>
      <div className="stats">
        <Stat color="red" title="Cases" value={formatNumber(selectedRegion.cases)} />
        <Stat color="gray" title="Deaths" value={formatNumber(selectedRegion.deaths)} />
      </div>
      <Card color="red">
        <LineChart
          name="cases"
          index={selectedIndex}
          onMouseMove={setSelectedIndex}
          timeline={casesTimeline}
          width={375}
          height={200}
        />
      </Card>
      <Card color="gray">
        <LineChart
          name="deaths"
          index={selectedIndex}
          onMouseMove={setSelectedIndex}
          timeline={deathsTimeline}
          width={375}
          height={200}
        />
      </Card>
      <span>Last updated {formatDateTime(new Date(selectedRegion.lastUpdated))}</span>
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

        .name > div {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
        }

        .name > span > strong {
          font-size: 1rem;
        }

        .stats {
          display: flex;
          flex-direction: row;
        }

        .back {
          width: 10%;
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
