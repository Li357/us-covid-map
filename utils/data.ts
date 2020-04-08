import { Timeline, DayTotal, Region, MinimalRegion } from '../types';
import { getAllCasesDeaths } from '../types/getAllCasesDeaths';

export function processTimeline(timeline: Timeline, key: keyof DayTotal): [Date, number][] {
  return timeline.map(({ date, [key]: value }) => [new Date(date), value as number]);
}

export function formatNumber(n: number): string {
  return n.toLocaleString();
}

export function createRegionMap(data?: getAllCasesDeaths): Map<string, Region | MinimalRegion> {
  const map = new Map<string, Region | MinimalRegion>();
  if (data) {
    const { nation, states } = data;
    map.set(nation.fips, nation);
    states.forEach((state) => {
      map.set(state.fips, state);
      state.counties.forEach((county) => {
        map.set(county.fips, county);
      });
    });
  }
  return map;
}
