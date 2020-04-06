import { Timeline, DayTotal } from '../types';

export function processTimeline(timeline: Timeline, key: keyof DayTotal): [Date, number][] {
  return timeline.map(({ date, [key]: value }) => [new Date(date), value as number]);
}

export function formatNumber(n: number) {
  return n.toLocaleString();
}
