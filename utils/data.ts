import { MinimalRegion, Timeline, DayTotal } from '../types';
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

export function processTimeline(timeline: Timeline, key: keyof DayTotal): [Date, number][] {
  return timeline.map(({ date, [key]: value }) => [new Date(date), value as number]);
}
