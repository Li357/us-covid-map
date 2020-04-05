import { useState, useMemo } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import Page from '../components/Page';
import Choropleth from '../components/Choropleth';
import Sidebar from '../components/Sidebar';
import { withApollo } from '../utils/apollo';
import { createRegionMap } from '../utils/data';
import { Region, MinimalRegion } from '../types';
import { GET_ALL_CASES_DEATHS, GET_COUNTY_DATA_BY_STATE } from '../queries';
import { getAllCasesDeaths } from '../types/getAllCasesDeaths';
import { getCountyDataVariables, getCountyData } from '../types/getCountyData';

function Index() {
  const { loading: loadingCasesDeaths, data: allCasesDeaths } = useQuery<getAllCasesDeaths>(GET_ALL_CASES_DEATHS);
  const [loadState, { loading: loadingState, data: stateData }] = useLazyQuery<getCountyData, getCountyDataVariables>(
    GET_COUNTY_DATA_BY_STATE,
  );
  const [selectedRegion, setSelectedRegion] = useState<Region | undefined>(allCasesDeaths?.nation);

  const regionMap: Map<string, MinimalRegion | Region> | null = useMemo(() => {
    if (allCasesDeaths && stateData) {
      stateData.states.forEach((state) => {
        state.counties.forEach((county) => {
          regionMap?.set(county.fips, county);
        });
      });
    } else if (loadingState) {
      return regionMap;
    }
    return allCasesDeaths ? createRegionMap(allCasesDeaths) : null;
  }, [allCasesDeaths, stateData]);

  const setSelectedRegionAndPreload = (region: MinimalRegion | Region) => {
    // if we reach here, the hovered area is going to be a region with fully loaded data (as it has a sidebar to show up in)
    setSelectedRegion(region as Region);

    // currently this only preloads states
    if (region.__typename === 'State') {
      loadState({ variables: { stateFips: region.fips } });
    }
  };
  const clearSelectedRegion = () => setSelectedRegion(allCasesDeaths?.nation);
  const focusRegion = () => {};

  if (loadingCasesDeaths || !allCasesDeaths) {
    return null;
  }

  return (
    <Page>
      <div className="container">
        <Choropleth
          regions={regionMap!}
          width={960}
          height={600}
          onEnterRegion={setSelectedRegionAndPreload}
          onExitRegion={clearSelectedRegion}
          onClickRegion={focusRegion}
        />
        <Sidebar selectedRegion={selectedRegion!} />
      </div>
      <style jsx>{`
        .container {
          display: flex;
          align-items: stretch;
          height: 100%;
        }
      `}</style>
    </Page>
  );
}

export default withApollo({ ssr: true })(Index);
