import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import Page from '../components/Page';
import Choropleth from '../components/Choropleth';
import Sidebar from '../components/Sidebar';
import { withApollo } from '../utils/apollo';
import { GET_ALL_CASES_DEATHS, GET_COUNTY_DATA_BY_STATE } from '../queries';
import { getAllCasesDeaths } from '../types/getAllCasesDeaths';
import { getCountyDataVariables, getCountyData } from '../types/getCountyData';
import { createRegionMap } from '../utils/data';
import { NATION_ID } from '../utils/constants';
import spinner from '../public/loading.svg';

function Index() {
  const { loading, data, error, client } = useQuery<getAllCasesDeaths>(GET_ALL_CASES_DEATHS);
  const regionMap = useMemo(() => createRegionMap(data), [data]);
  const [selectedRegionId, setSelectedRegionId] = useState(NATION_ID);
  const [view, setView] = useState<'nation' | 'state'>('nation');
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
        <Choropleth
          view={view}
          width={960}
          height={600}
          regions={regionMap}
          onEnterRegion={preloadStateData}
          onClickRegion={setSelectedRegionId}
          onClickOutside={resetSelectedRegionId}
          onDoubleClickState={setViewAndSelectedRegionId}
        />
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
      `}</style>
    </Page>
  );
}

export default withApollo({ ssr: true })(Index);
