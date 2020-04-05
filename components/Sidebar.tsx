import React from 'react';
import { Region } from '../types';
// import Stat from './Stat';
// import TimelineChart from './TimelineChart';
// import { GetAllCases_states } from '../../types/GetAllCases';

interface SidebarProps {
  selectedRegion: Region | undefined;
}

export default function Sidebar({ selectedRegion }: SidebarProps) {
  if (!selectedRegion) {
    return null;
  }

  // const casesTimeline: [Date, number][] = (selectedRegion as GetAllCases_states).timeline.map(({ date, cases }) => [
  //   new Date(date),
  //   cases,
  // ]);

  return (
    <div>
      <strong className="name">{selectedRegion?.name}</strong>
      {/* <div className="stats">
        <Stat className="red" title="Cases" value={selectedRegion?.cases || 0} />
        <Stat className="gray" title="Deaths" value={selectedRegion?.deaths || 0} />
      </div> */}
      {/* <TimelineChart timeline={casesTimeline} width={300} height={300} /> */}
      <style jsx>{`
        div {
          flex: 0 0 400px;
          padding: 50px;
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
}
