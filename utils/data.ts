import { MinimalRegion } from '../types';
import { getAllCasesDeaths } from '../types/getAllCasesDeaths';

export function createRegionMap({ nation, states }: getAllCasesDeaths): Map<string, MinimalRegion> {
  const regions: [string, MinimalRegion][] = states.reduce(
    (pairs: [string, MinimalRegion][], state) => {
      const counties: [string, MinimalRegion][] = state.counties.map((county) => [county.fips, county]);
      return [...pairs, [state.fips, state], ...counties];
    },
    [[nation.fips, nation]],
  );
  return new Map(regions);
}
