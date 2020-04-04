import { GeometryCollection, Objects } from 'topojson-specification';
import { Feature, GeometryObject } from 'geojson';
import { ValueFn } from 'd3';
import {
  getAllCases_states,
  getAllCases_states_counties,
  getAllCases_nation,
  getAllCases_states_timeline,
  getAllCases_nation_timeline,
} from './getAllCases';

export interface RegionProperties {
  name: string;
}

export interface TopologyObjects extends Objects {
  counties: GeometryCollection<RegionProperties>;
  states: GeometryCollection<RegionProperties>;
}

export type Timeline = getAllCases_states_timeline | getAllCases_nation_timeline;
export type Region = getAllCases_nation | getAllCases_states | getAllCases_states_counties;
export type RegionFeature = Omit<Feature<GeometryObject, RegionProperties>, 'id'> & { id: string };
export type MapMouseHandler = ValueFn<Element, RegionFeature, any>;
