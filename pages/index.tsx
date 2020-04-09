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
import { MinimalRegion, Region, MapType } from '../types';

const getCases = (region?: Region | MinimalRegion) => region?.cases ?? 0;
const getDeaths = (region?: Region | MinimalRegion) => region?.deaths ?? 0;
const mapTypes: MapType[] = [
  { name: 'Cases', legendTitle: 'Coronavirus cases by county', getScalar: getCases },
  { name: 'Deaths', legendTitle: 'Coronavirus deaths by county', getScalar: getDeaths },
];

function Index() {
  const { loading, data, error, client } = useQuery<getAllCasesDeaths>(GET_ALL_CASES_DEATHS);
  const regionMap = useMemo(() => createRegionMap(data), [data]);
  const [view, setView] = useState<'nation' | 'state'>('nation');
  const [selectedMapTypeIndex, setSelectedMapTypeIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedRegionId, setSelectedRegionId] = useState(NATION_ID);
  const selectedRegion = regionMap.get(selectedRegionId)!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
  const { legendTitle, getScalar } = mapTypes[selectedMapTypeIndex];

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
            selectedDate={selectedDate}
            onChangeDate={setSelectedDate}
            mapTypes={mapTypes}
            selectedMapTypeIndex={selectedMapTypeIndex}
            onChangeMapType={setSelectedMapTypeIndex}
          />
          <Choropleth
            title={legendTitle}
            view={view}
            width={960}
            height={600}
            regions={regionMap}
            getScalar={getScalar}
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
      <style jsx>{`
        .container {
          display: flex;
          align-items: stretch;
          height: 100%;
          justify-content: center;
        }
      `}</style>
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
        }

        .container > .left {
          display: flex;
          flex-direction: column;
          padding: 50px 0 50px 50px;
        }
      `}</style>
    </Page>
  );
}

export default withApollo({ ssr: true })(Index);
