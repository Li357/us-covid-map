import { Topology } from 'topojson-specification';
import { TopologyObjects } from '../types';
import usMap from '../public/counties.json';

export const us = (usMap as unknown) as Topology<TopologyObjects>;
export default us;
