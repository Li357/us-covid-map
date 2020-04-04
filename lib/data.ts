import { Region } from '../types';
import { getAllCases_nation, getAllCases_states } from '../types/GetAllCases';

export function createRegionMap(nation: getAllCases_nation, states: getAllCases_states[]): Map<string, Region> {
  const statePairs = states.reduce((regions: [string, Region][], state) => {
    const countyPairs: [string, Region][] = state.counties.map((county) => [county.fips, county]);
    const statePair: [string, Region] = [state.fips, state];
    return [...regions, statePair, ...countyPairs];
  }, []);
  return new Map([...statePairs, [nation.fips, nation]]);
}
