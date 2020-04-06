import { useState } from 'react';
import { RegionMap } from '../types';
import { getAllCasesDeaths } from '../types/getAllCasesDeaths';
import { getCountyData } from '../types/getCountyData';

// Really hacky
const GLOBAL_REGION_MAP: RegionMap = new Map();
export function useRegionMap(): [RegionMap, (data: getAllCasesDeaths) => void, (data: getCountyData) => void] {
  const [regionMap, setRegionMap] = useState<RegionMap>(GLOBAL_REGION_MAP);
  const addCounties = ({ states }: getCountyData) => {
    states.forEach((state) => {
      state.counties.forEach((county) => {
        GLOBAL_REGION_MAP.set(county.fips, county);
      });
    });
    setRegionMap(GLOBAL_REGION_MAP);
  };
  const addStates = ({ nation, states }: getAllCasesDeaths) => {
    GLOBAL_REGION_MAP.set(nation.fips, nation);
    states.forEach((state) => {
      GLOBAL_REGION_MAP.set(state.fips, state);
      state.counties.forEach((county) => {
        GLOBAL_REGION_MAP.set(county.fips, county);
      });
    });
    setRegionMap(GLOBAL_REGION_MAP);
  };
  return [regionMap, addStates, addCounties];
}
