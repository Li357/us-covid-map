import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import Page from '../components/Page';
import Choropleth from '../components/Choropleth';
import Sidebar from '../components/Sidebar';
import Settings from '../components/Settings';
import { withApollo } from '../utils/apollo';
import { GET_ALL_CASES_DEATHS, GET_COUNTY_DATA_BY_STATE } from '../queries';
import { getAllCasesDeaths } from '../types/getAllCasesDeaths';
import { getCountyDataVariables, getCountyData } from '../types/getCountyData';
import { createRegionMap } from '../utils/data';
import { NATION_ID } from '../utils/constants';
import spinner from '../public/loading.svg';
import { MinimalRegion, MapType } from '../types';
import { interpolateGreys, interpolateReds } from 'd3';

const getCases = (region?: MinimalRegion) => region?.cases ?? 0;
const getDeaths = (region?: MinimalRegion) => region?.deaths ?? 0;
const getCasesPer1000 = (region?: MinimalRegion) =>
  (getCases(region) / (region?.population ?? 1)) * 1000;
const getDeathsPer1000 = (region?: MinimalRegion) =>
  (getDeaths(region) / (region?.population ?? 1)) * 1000;

const mapTypes: MapType[] = [
  {
    name: 'Cases',
    legendTitle: 'Coronavirus cases by county',
    getScalar: getCases,
    colorInterpolator: interpolateReds,
  },
  {
    name: 'Cases / 1000 people',
    legendTitle: 'Coronavirus cases per 1000 by county',
    getScalar: getCasesPer1000,
    colorInterpolator: interpolateReds, // so you can actually see the background
  },
  {
    name: 'Deaths',
    legendTitle: 'Coronavirus deaths by county',
    getScalar: getDeaths,
    colorInterpolator: (t) => interpolateGreys(t + 0.1), // so you can actually see the background
  },
  {
    name: 'Deaths / 1000 people',
    legendTitle: 'Coronavirus deaths per 1000 by county',
    getScalar: getDeathsPer1000,
    colorInterpolator: (t) => interpolateGreys(t + 0.1), // so you can actually see the background
  },
];

function Index() {
  const { loading, data, error, client } = useQuery<getAllCasesDeaths>(GET_ALL_CASES_DEATHS);
  const regionMap = useMemo(() => createRegionMap(data), [data]);
  const [view, setView] = useState<'nation' | 'state'>('nation');
  const [selectedMapTypeIndex, setSelectedMapTypeIndex] = useState(0);
  const [selectedRegionId, setSelectedRegionId] = useState(NATION_ID);
  const selectedRegion = regionMap.get(selectedRegionId)!; // eslint-disable-line @typescript-eslint/no-non-null-assertion

  const preloadStateData = (regionId: string) => {
    const isState = regionId.length === 2;
    if (isState) {
      client.query<getCountyData, getCountyDataVariables>({
        query: GET_COUNTY_DATA_BY_STATE,
        variables: { stateId: regionId },
      });
    }
  };

  const setViewAndSelectedRegionId = useCallback(
    (stateId: string) => {
      setView('state');
      setSelectedRegionId(stateId);
    },
    [setView, setSelectedRegionId],
  );

  const resetSelectedRegionId = useCallback(() => {
    // if in nation view, reset to nation info, else reset to state info
    setSelectedRegionId((prevSelectedRegionId) =>
      view === 'nation' ? NATION_ID : prevSelectedRegionId.slice(0, 2),
    );
  }, [setSelectedRegionId, view]);

  const resetViewAndSelectedRegionId = useCallback(() => {
    setView('nation');
    // set selected region to state when blurring
    setSelectedRegionId((prevSelectedRegionId) => prevSelectedRegionId.slice(0, 2));
  }, [setView, setSelectedRegionId]);

  let content = <img src={spinner} className="spinner" />;
  if (!loading && data && !error) {
    content = (
      <>
        <div className="left">
          <Settings
            mapTypes={mapTypes}
            selectedMapTypeIndex={selectedMapTypeIndex}
            onChangeMapType={setSelectedMapTypeIndex}
          />
          <Choropleth
            view={view}
            width={960}
            height={600}
            mapType={mapTypes[selectedMapTypeIndex]}
            regions={regionMap}
            onEnterRegion={preloadStateData}
            onClickRegion={setSelectedRegionId}
            onClickOutside={resetSelectedRegionId}
            onDoubleClickState={setViewAndSelectedRegionId}
          />
        </div>
        <Sidebar
          view={view}
          selectedRegion={selectedRegion}
          onBlurState={resetViewAndSelectedRegionId}
        />
      </>
    );
  }

  return (
    <Page>
      <div className="container">{content}</div>
      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .spinner {
          width: 50px;
          animation: spin 1s linear infinite;
          align-self: center;
        }

        .container {
          display: flex;
          align-items: stretch;
          height: 100%;
          justify-content: center;
        }

        .container > .left {
          display: flex;
          flex-direction: column;
          padding: 50px 0 50px 50px;
          flex: 1;
        }

        @media (max-width: 1200px) {
          body {
            overflow: visible !important;
            overflow-y: scroll;
          }

          body > #__next {
            height: auto;
            display: flex;
          }

          .container {
            flex: 1;
            flex-direction: column;
            justify-content: center;
          }

          .container > .left {
            padding: 50px;
          }

          .container > div.sidebar {
            overflow: hidden;
          }
        }
      `}</style>
    </Page>
  );
}

export default withApollo({ ssr: true })(Index);
