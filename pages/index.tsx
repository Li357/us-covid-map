import { useState, useEffect } from 'react';
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

function Index() {
  // TODO: handle loading and errors
  const { loading: loadingCasesDeaths, data: allCasesDeaths, client } = useQuery<getAllCasesDeaths>(
    GET_ALL_CASES_DEATHS,
  );
  const [selectedRegion, setSelectedRegion] = useState<Region | undefined>(undefined);
  const [regionMap, addStates, addCounties] = useRegionMap();

  const setSelectedRegionAndPreload = async (region: MinimalRegion | Region) => {
    // if we reach here, the hovered area is going to be a region with fully loaded data (as it has a sidebar to show up in)
    setSelectedRegion(region as Region);

    // currently this only preloads states
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
      if (prevSelectedRegion && prevSelectedRegion.fips.length > 2) {
        return regionMap.get(prevSelectedRegion.fips.slice(0, 2)) as Region;
      }
      return allCasesDeaths?.nation;
    });
  };

  useEffect(() => {
    if (allCasesDeaths && !selectedRegion) {
      setSelectedRegion(allCasesDeaths?.nation);
      addStates(allCasesDeaths);
    }
  }, [allCasesDeaths]);

  if (loadingCasesDeaths || !allCasesDeaths || !selectedRegion) {
    return null;
  }

  return (
    <Page>
      <div className="container">
        <Choropleth
          regions={regionMap}
          width={960}
          height={600}
          onEnterRegion={setSelectedRegionAndPreload}
          onExitMap={clearSelectedRegion}
        />
        <Sidebar selectedRegion={selectedRegion} />
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
