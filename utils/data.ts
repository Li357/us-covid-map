import { MinimalRegion, Timeline, DayTotal, Region } from '../types';
import { getAllCasesDeaths } from '../types/getAllCasesDeaths';
import { getCountyData } from '../types/getCountyData';

export function processTimeline(timeline: Timeline, key: keyof DayTotal): [Date, number][] {
  return timeline.map(({ date, [key]: value }) => [new Date(date), value as number]);
}
