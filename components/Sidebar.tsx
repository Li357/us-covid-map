import { useMemo, useState, useEffect } from 'react';
import { Region, MinimalRegion } from '../types';
import Stat from './Stat';
import Card from './Card';
import LineChart from './LineChart';
import { processTimeline, formatNumber } from '../utils/data';
import { useLazyQuery } from '@apollo/client';
import { GET_COUNTY_DATA_BY_STATE } from '../queries';
import { getCountyData, getCountyDataVariables } from '../types/getCountyData';
import arrow from '../public/arrow.svg';
import spinner from '../public/loading.svg';

interface SidebarProps {
  view: 'nation' | 'state';
  selectedRegion: Region | MinimalRegion;
  onBlurState: () => void;
}

export default function Sidebar({ selectedRegion, view, onBlurState }: SidebarProps) {
  const [loadCounties, { loading, error, data }] = useLazyQuery<
    getCountyData,
    getCountyDataVariables
  >(GET_COUNTY_DATA_BY_STATE);
  const hasPartialInfo = !selectedRegion.hasOwnProperty('timeline');

  const region = useMemo(() => {
    if (hasPartialInfo) {
      if (data) {
        const { counties } = data.states[0];
        return counties.find((county) => county.fips === selectedRegion.fips)!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
      }
      return;
    }
    return selectedRegion as Region;
  }, [data, selectedRegion, hasPartialInfo]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [casesTimeline, deathsTimeline] = useMemo(() => {
    if (region) {
      const timeline = region.timeline.slice(0, 30);
      const cases = processTimeline(timeline, 'cases');
      const deaths = processTimeline(timeline, 'deaths');
      return [cases, deaths];
    }
    return [[], []];
  }, [region]);

  // fetch county data if it doesn't exist
  useEffect(() => {
    if (!loading && !region?.hasOwnProperty('timeline')) {
      const stateId = selectedRegion.fips.slice(0, 2);
      loadCounties({ variables: { stateId } });
    }
  }, [region, loading, loadCounties, selectedRegion]);

  // TODO: handle errors
  if (loading || error || !region) {
    return (
      <div className="sidebar">
        <img src={spinner} className="spinner" />
        <style jsx>{`
          .sidebar {
            display: flex;
            align-items: center;
            justify-content: center;
            flex: 0 0 450px;
            padding: 50px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="sidebar">
      <div className="name">
        <div>
          <strong>{region.name}</strong>
          {view === 'state' && <img className="back" src={arrow} onClick={onBlurState} />}
        </div>
        <span>
          <strong>POPULATION:</strong> {formatNumber(region.population)}
        </span>
      </div>
      <div className="stats">
        <Stat color="red" title="Cases" value={formatNumber(region.cases)} />
        <Stat color="gray" title="Deaths" value={formatNumber(region.deaths)} />
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
      <style jsx>{`
        .sidebar {
          flex-basis: 25%;
          padding: 50px;
          display: flex;
          flex-direction: column;
          overflow-y: scroll;
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

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .sidebar > * {
          animation: slideUp 0.5s linear;
        }
      `}</style>
    </div>
  );
}
