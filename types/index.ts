import { GeometryCollection, Objects } from 'topojson-specification';
import { Feature, GeometryObject } from 'geojson';
import { ValueFn } from 'd3';
import {
  getAllCasesDeaths_states,
  getAllCasesDeaths_nation,
  getAllCasesDeaths_nation_timeline,
  getAllCasesDeaths_states_timeline,
} from './getAllCasesDeaths';
import {
  getCountyData_states_counties,
  getCountyData_states_counties_timeline,
} from './getCountyData';

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
  getScalar: (region?: Region | MinimalRegion) => number;
}

// properties of regions that are initially fetched, only represent cases and deaths and fips
// full region (after lazy fetching)
export type Region =
  | getAllCasesDeaths_nation
  | getAllCasesDeaths_states
  | getCountyData_states_counties;
export type MinimalRegion = Pick<Region, 'fips' | 'cases' | 'deaths' | '__typename'>;
export type RegionMap = Map<string, MinimalRegion | Region>;
export type DayTotal =
  | getAllCasesDeaths_nation_timeline
  | getAllCasesDeaths_states_timeline
  | getCountyData_states_counties_timeline;
export type Timeline = DayTotal[];
export type RegionFeature = Omit<Feature<GeometryObject, RegionProperties>, 'id'> & { id: string };
export type MapMouseHandler<E extends Element = Element> = ValueFn<E, RegionFeature, void>;
