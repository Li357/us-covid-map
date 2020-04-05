import { useEffect, useRef } from 'react';
import { select, geoAlbersUsa, geoPath, scaleThreshold, range, schemeReds } from 'd3';
import { feature } from 'topojson-client';
import us from '../utils/map';
import { MapMouseHandler, RegionFeature, Region, MinimalRegion } from '../types';

interface ChoroplethProps {
  regions: Map<string, Region | MinimalRegion>;
  width: number;
  height: number;
  onEnterRegion: (region?: Region | MinimalRegion) => void;
  onExitRegion: (region?: Region | MinimalRegion) => void;
}

export default function Choropleth({ regions, width, height, onEnterRegion, onExitRegion }: ChoroplethProps) {
  const svgRef = useRef(null);

  const onMouseEnter: MapMouseHandler = (feature, i, nodes) => {
    select(nodes[i])
      .each(function () {
        this.parentNode?.appendChild(this);
      })
      .attr('stroke', 'black');
    onEnterRegion(regions.get(feature.id));
  };

  const onMouseLeave: MapMouseHandler = (feature, i, nodes) => {
    select(nodes[i]).attr('stroke', null);
    onExitRegion(regions.get(feature.id));
  };

  useEffect(() => {
    const projection = geoAlbersUsa().fitSize([width, height], feature(us, us.objects.counties));
    const path = geoPath(projection);
    const color = scaleThreshold<number, string>().domain(range(1, 400, 50)).range(schemeReds[9]);

    const svg = select(svgRef.current).attr('viewBox', `0 0 ${width} ${height}`);

    const counties = svg
      .append('g')
      .attr('stroke', 'white')
      .attr('stroke-width', 0)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round');
    counties
      .selectAll('path')
      .data(feature(us, us.objects.counties).features as RegionFeature[])
      .join('path')
      .attr('fill', (d) => color(regions.get(d.id)?.cases || 0))
      .attr('d', path);

    const states = svg
      .append('g')
      .attr('stroke', 'white')
      .attr('stroke-width', 1.5)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round');
    us.objects.states.geometries.forEach((state) => {
      states
        .append('path')
        .datum(feature(us, state) as RegionFeature)
        .attr('fill', 'transparent')
        .attr('d', path)
        .on('mouseenter', onMouseEnter)
        .on('mouseleave', onMouseLeave);
    });
  }, [svgRef, width, height]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <svg ref={svgRef} />
      <style jsx>{`
        svg {
          width: 100%;
        }
      `}</style>
    </>
  );
}
