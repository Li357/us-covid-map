import { GeometryCollection, Objects } from 'topojson-specification';
import { Feature, GeometryObject } from 'geojson';
import { ValueFn } from 'd3';
import { getAllCasesDeaths_states, getAllCasesDeaths_nation } from './getAllCasesDeaths';
import { getCountyData_states_counties } from './getCountyData';

export interface RegionProperties {
  name: string;
}

export interface TopologyObjects extends Objects {
  counties: GeometryCollection<RegionProperties>;
  states: GeometryCollection<RegionProperties>;
}

// properties of regions that are initially fetched, only represent cases and deaths and fips
// full region (after lazy fetching)
export type Region = getAllCasesDeaths_nation | getAllCasesDeaths_states | getCountyData_states_counties;
export type MinimalRegion = Pick<Region, 'fips' | 'cases' | 'deaths' | '__typename'>;
export type RegionFeature = Omit<Feature<GeometryObject, RegionProperties>, 'id'> & { id: string };
export type MapMouseHandler = ValueFn<Element, RegionFeature, any>;
