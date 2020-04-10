import { Timeline, DayTotal, RegionMap, TimeSeries, Region } from '../types';
import { getAllCasesDeaths } from '../types/getAllCasesDeaths';
import { timeFormat, mean, deviation } from 'd3';

export function processTimeline(timeline: Timeline, key: keyof DayTotal): [Date, number][] {
  return timeline.map(({ date, [key]: value }) => [new Date(date), value as number]);
}

export function formatNumber(n: number): string {
  return n.toLocaleString();
}

export const MMMMDYYYY = timeFormat('%B %e, %Y');
export const MMDDYYYY = timeFormat('%m-%d-%Y');

function getRegionInfo(region: RawRegion) {
  return {
    fips: region.fips,
    name: region.name,
    population: region.population,
    timeline: region.hasOwnProperty('timeline') ? (region as Region).timeline : undefined,
  };
}

export function createRegionMap(data?: getAllCasesDeaths): [RegionMap, TimeSeries] {
  const map: RegionMap = new Map();
  const timeSeries: TimeSeries = new Map();
  if (data) {
    const { nation, states } = data;
    map.set(nation.fips, getRegionInfo(nation));
    nation.timeline.forEach(({ date, ...info }) => {
      timeSeries.set(`${MMDDYYYY(new Date(date))}-${nation.fips}`, { ...info, fips: nation.fips });
    });

    states.forEach((state) => {
      map.set(state.fips, getRegionInfo(state));
      state.timeline.forEach(({ date, ...info }) => {
        timeSeries.set(`${MMDDYYYY(new Date(date))}-${state.fips}`, { ...info, fips: state.fips });
      });
      state.counties.forEach((county) => {
        map.set(county.fips, getRegionInfo(county));
        timeSeries.set(`${MMDDYYYY(new Date())}-${county.fips}`, {
          fips: county.fips,
          cases: county.cases,
          deaths: county.deaths,
        });
      });
    });
  }
  return [map, timeSeries];
}

function getNearestPowerOf10(n: number) {
  return Math.pow(10, Math.round(n).toString().length - 1);
}

export function getUpperBound(data: number[]) {
  // returns the upper bound for data scaling
  const bound = mean(data)! + 0.5 * deviation(data)!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
  const nearestPowerOf10 = getNearestPowerOf10(bound);
  const rounded = Math.round(bound / nearestPowerOf10) * nearestPowerOf10;
  return rounded;
}
