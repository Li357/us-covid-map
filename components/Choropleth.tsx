import { useEffect, useRef } from 'react';
import {
  select,
  geoAlbersUsa,
  geoPath,
  scaleThreshold,
  range,
  schemeReds,
  zoom,
  event,
  zoomIdentity,
  mouse,
  ValueFn,
} from 'd3';
import { feature } from 'topojson-client';
import us from '../utils/map';
import { MapMouseHandler, RegionFeature, Region, MinimalRegion } from '../types';

interface ChoroplethProps {
  regions: Map<string, Region | MinimalRegion>;
  width: number;
  height: number;
  onEnterRegion: (region: Region | MinimalRegion) => void;
  onExitMap: () => void;
}

export default function Choropleth({ regions, width, height, onEnterRegion, onExitMap }: ChoroplethProps) {
  const svgRef = useRef(null);

  const onMouseEnter: MapMouseHandler = (feature, i, nodes) => {
    select(nodes[i])
      .each(function () {
        this.parentNode?.appendChild(this);
      })
      .attr('stroke', 'black');
    onEnterRegion(regions.get(feature.id)!);
  };

  const onMouseLeave: MapMouseHandler = (_feature, i, nodes) => {
    select(nodes[i]).attr('stroke', null);
  };

  useEffect(() => {
    const projection = geoAlbersUsa().fitSize([width, height], feature(us, us.objects.counties));
    const path = geoPath(projection);
    const color = scaleThreshold<number, string>().domain(range(1, 400, 50)).range(schemeReds[9]);

    const zoomOnState = (state: RegionFeature) => {
      const [[x0, y0], [x1, y1]] = path.bounds(state);
      svg
        .transition()
        .duration(750)
        .call(
          stateZoom.transform,
          zoomIdentity
            .translate(width / 2, height / 2)
            .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
            .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
          mouse(svg.node()!),
        );
    };
    const blurOtherStates = (state: RegionFeature) => {
      states
        .selectAll<Element, RegionFeature>('g')
        .filter((d) => !d.id.startsWith(state.id))
        .transition()
        .duration(750)
        .style('opacity', 0)
        .style('visibility', 'hidden');
    };
    const attachCountyMouseHandlers = (state: Element) => {
      const stateGroup = select(state);
      stateGroup.select('.state').remove();
      stateGroup
        .on('click', null)
        .on('mouseenter', null)
        .on('mouseleave', null)
        .select('g')
        .attr('stroke', 'white')
        .attr('stroke-width', 0.5)
        .selectAll('path')
        .on('mouseenter', onMouseEnter)
        .on('mouseleave', onMouseLeave);
    };

    const onClick: MapMouseHandler = (feature, i, nodes) => {
      zoomOnState(feature);
      blurOtherStates(feature);
      attachCountyMouseHandlers(nodes[i]);
    };

    const onZoom = () => g.attr('transform', event.transform);
    const stateZoom = zoom().scaleExtent([1, 8]).on('zoom', onZoom);

    const svg = select(svgRef.current).attr('viewBox', `0 0 ${width} ${height}`);
    svg.call(stateZoom).on('wheel.zoom', null).on('mousewheel.zoom', null).on('mousedown.zoom', null);

    const g = svg.append('g');
    const states = g
      .append('g')
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .on('mouseleave', onExitMap);
    us.objects.states.geometries.forEach((state) => {
      const stateGroup = states
        .append('g')
        .datum(feature(us, state) as RegionFeature)
        .attr('id', state.id!)
        .on('mouseenter', onMouseEnter)
        .on('mouseleave', onMouseLeave)
        .on('click', onClick);
      const counties = stateGroup.append('g').attr('stroke-width', 0);
      us.objects.counties.geometries.forEach((county) => {
        if ((county.id as string).startsWith(state.id as string)) {
          counties
            .append('path')
            .datum(feature(us, county) as RegionFeature)
            .attr('fill', (d) => color(regions.get(d.id)?.cases || 0))
            .attr('d', path);
        }
      });

      stateGroup
        .append('path')
        .datum(feature(us, state) as RegionFeature)
        .attr('fill', 'transparent')
        .attr('d', path)
        .attr('class', 'state');
    });
  }, [svgRef, width, height]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <svg className="choropleth" ref={svgRef} />
      <style jsx>{`
        .choropleth {
          width: 100%;
        }
      `}</style>
    </>
  );
}
