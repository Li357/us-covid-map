import { Timeline, DayTotal, Region, MinimalRegion } from '../types';
import { getAllCasesDeaths } from '../types/getAllCasesDeaths';
import { timeFormat, mean, deviation } from 'd3';

export function processTimeline(timeline: Timeline, key: keyof DayTotal): [Date, number][] {
  return timeline.map(({ date, [key]: value }) => [new Date(date), value as number]);
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

export const formatDate = timeFormat('%B %e, %Y');

export function createRegionMap(data?: getAllCasesDeaths) {
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

function getNearestPowerOf10(n: number) {
  return Math.pow(10, Math.round(Math.log10(n)));
}

export function getUpperBound(data: number[]) {
  // returns the upper bound for data scaling
  const bound = mean(data)! + 0.5 * deviation(data)!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
  const nearestPowerOf10 = getNearestPowerOf10(bound);
  const rounded = Math.round(bound / nearestPowerOf10) * nearestPowerOf10;
  return rounded;
}

export const getCases = (region?: MinimalRegion) => region?.cases ?? 0;
export const getDeaths = (region?: MinimalRegion) => region?.deaths ?? 0;
export const getCasesPer1000 = (region?: MinimalRegion) =>
  (getCases(region) / (region?.population ?? 1)) * 1000;
export const getDeathsPer1000 = (region?: MinimalRegion) =>
  (getDeaths(region) / (region?.population ?? 1)) * 1000;
