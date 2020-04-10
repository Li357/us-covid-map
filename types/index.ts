import { GeometryCollection, Objects } from 'topojson-specification';
import { Feature, GeometryObject } from 'geojson';
import { ValueFn } from 'd3';
import {
  getAllCasesDeaths_nation,
  getAllCasesDeaths_nation_timeline,
  getAllCasesDeaths_states_timeline,
} from './getAllCasesDeaths';
import { getCountyData_states_counties_timeline } from './getCountyData';

export interface RegionProperties {
  name: string;
}

export interface TopologyObjects extends Objects {
  counties: GeometryCollection<RegionProperties>;
  states: GeometryCollection<RegionProperties>;
}

export interface MapType {
  name: string;
  legendTitle: string;
  getScalar: (datum?: TimeSeriesDatum) => number;
}

// properties of regions that are initially fetched, only represent cases and deaths and fips
// full region (after lazy fetching)
export type Region = Pick<getAllCasesDeaths_nation, 'name' | 'population' | 'fips' | 'timeline'>;
export type MinimalRegion = Omit<Region, 'timeline'>;
export type RegionMap = Map<string, Region | MinimalRegion>;
export type TimeSeriesDatum = Pick<getAllCasesDeaths_nation_timeline, 'cases' | 'deaths'> & {
  fips: string;
};
export type TimeSeries = Map<string, TimeSeriesDatum>;
export type DayTotal =
  | getAllCasesDeaths_nation_timeline
  | getAllCasesDeaths_states_timeline
  | getCountyData_states_counties_timeline;
export type Timeline = DayTotal[];
export type RegionFeature = Omit<Feature<GeometryObject, RegionProperties>, 'id'> & { id: string };
export type MapMouseHandler<E extends Element = Element> = ValueFn<E, RegionFeature, void>;
