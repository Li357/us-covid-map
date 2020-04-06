import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import Page from '../components/Page';
import Choropleth from '../components/Choropleth';
import Sidebar from '../components/Sidebar';
import { withApollo } from '../utils/apollo';
import { Region, MinimalRegion } from '../types';
import { GET_ALL_CASES_DEATHS, GET_COUNTY_DATA_BY_STATE } from '../queries';
import { getAllCasesDeaths } from '../types/getAllCasesDeaths';
import { getCountyDataVariables, getCountyData } from '../types/getCountyData';
import { useRegionMap } from '../utils/hooks';

const NATION_FIPS = 'NATION'; // from graphql server
function Index() {
  // TODO: handle loading and errors
  const { loading: loadingCasesDeaths, data: allCasesDeaths, client } = useQuery<getAllCasesDeaths>(
    GET_ALL_CASES_DEATHS,
  );
  const [selectedRegion, setSelectedRegion] = useState<Region | undefined>(undefined);
  const [regionInView, setRegionInView] = useState<Region | undefined>(undefined);
  const [regionMap, addStates, addCounties] = useRegionMap();

  const preloadStateData = async (region: MinimalRegion | Region) => {
    // loads county data for specific hovered state
    // TODO: support mobile clients where only click event is triggered
    if (region.__typename === 'State') {
      const { data: counties } = await client.query<getCountyData, getCountyDataVariables>({
        query: GET_COUNTY_DATA_BY_STATE,
        variables: { stateFips: region.fips },
      });
      addCounties(counties);
    }
  };

  const clearSelectedRegion = () => {
    setSelectedRegion((prevSelectedRegion) => {
      const inStateView = prevSelectedRegion && regionInView && regionInView.fips.length === 2;
      return regionMap.get(inStateView ? prevSelectedRegion!.fips.slice(0, 2) : NATION_FIPS) as Region;
    });
  };

  const handleFocusAndBlur = (region: Region | null) => {
    const inNationView = region === null;
    const nextRegionInView = (inNationView ? regionMap.get(NATION_FIPS) : region) as Region;
    setRegionInView(nextRegionInView);
  };

  useEffect(() => {
    if (allCasesDeaths && !selectedRegion) {
      setSelectedRegion(allCasesDeaths.nation);
      setRegionInView(allCasesDeaths.nation);
      addStates(allCasesDeaths);
    }
  }, [allCasesDeaths, selectedRegion]);

  if (loadingCasesDeaths || !allCasesDeaths || !selectedRegion || !regionInView) {
    return null;
  }

  return (
    <Page>
      <div className="container">
        <Choropleth
          regions={regionMap}
          regionInView={regionInView}
          width={960}
          height={600}
          onEnterRegion={preloadStateData}
          onClickRegion={(region) => setSelectedRegion(region as Region)}
          onClickOutside={clearSelectedRegion}
          onFocusState={handleFocusAndBlur}
        />
        <Sidebar
          selectedRegion={selectedRegion}
          regionInView={regionInView}
          onBlur={() => setRegionInView(regionMap.get(NATION_FIPS) as Region)}
        />
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
