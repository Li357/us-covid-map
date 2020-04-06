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
  Selection,
} from 'd3';
import { feature, mesh } from 'topojson-client';
import us from '../utils/map';
import { MapMouseHandler, RegionFeature, Region, MinimalRegion } from '../types';

interface ChoroplethProps {
  regions: Map<string, Region | MinimalRegion>;
  width: number;
  height: number;
  onEnterRegion: (region: Region | MinimalRegion) => void;
  onClickRegion: (region: Region | MinimalRegion) => void;
  onClickOutside: () => void;
}

export default function Choropleth({
  regions,
  width,
  height,
  onEnterRegion,
  onClickRegion,
  onClickOutside,
}: ChoroplethProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) {
      return;
    }

    /* handlers and utility functions */
    const handleClickRegion: MapMouseHandler = (feature, i, nodes) => {
      svg.selectAll('.focused').classed('focused', false);
      select(nodes[i])
        .classed('focused', true)
        .each(function () {
          this.parentNode?.appendChild(this);
        });
      onClickRegion(regions.get(feature.id)!);
    };

    const handleClickOutside = () => {
      svg.selectAll('.focused').classed('focused', false);
      onClickOutside();
    };

    const handleEnterRegion: MapMouseHandler = (feature, i, nodes) => {
      select(nodes[i]).classed('entered', true);
      onEnterRegion(regions.get(feature.id)!);
    };

    const handleLeaveRegion: MapMouseHandler = (_feature, i, nodes) => {
      select(nodes[i]).classed('entered', false);
    };

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
        .filter((feature) => !feature.id.startsWith(state.id))
        .transition()
        .duration(750)
        .style('opacity', 0)
        .style('visibility', 'hidden');
    };

    const attachCountyMouseHandlers = (stateGroup: Selection<SVGGElement, RegionFeature, null, undefined>) => {
      stateGroup.select('.state').remove();
      stateGroup
        .on('mouseenter', null)
        .on('mouseleave', null)
        .on('click', null)
        .select('g')
        .attr('stroke', 'white')
        .attr('stroke-width', 0.5)
        .selectAll<SVGPathElement, RegionFeature>('path')
        .on('mouseenter', handleEnterRegion)
        .on('mouseleave', handleLeaveRegion)
        .on('click', handleClickRegion);
    };

    const handleDoubleClickState: MapMouseHandler<SVGGElement> = (feature, i, nodes) => {
      const stateGroup = select<SVGGElement, RegionFeature>(nodes[i]).classed('entered', false);
      zoomOnState(feature);
      blurOtherStates(feature);
      attachCountyMouseHandlers(stateGroup);
    };

    const handleZoom = () => states.attr('transform', event.transform);

    /* choropleth drawing */
    const stateZoom = zoom<SVGSVGElement, undefined>().scaleExtent([1, 8]).on('zoom', handleZoom);
    const projection = geoAlbersUsa().fitSize([width, height], feature(us, us.objects.counties));
    const path = geoPath(projection);
    const color = scaleThreshold<number, string>().domain(range(1, 400, 50)).range(schemeReds[9]);
    const svg = select<SVGSVGElement, undefined>(svgRef.current).attr('viewBox', `0 0 ${width} ${height}`);
    svg
      .call(stateZoom)
      .on('wheel.zoom', null)
      .on('mousewheel.zoom', null)
      .on('mousedown.zoom', null)
      .on('dblclick.zoom', null);

    svg
      .append('rect')
      .classed('outside', true)
      .attr('width', '100%')
      .attr('height', '100%')
      .on('click', handleClickOutside); // catches clicks outside the map

    const states = svg.append('g').classed('states', true);
    us.objects.states.geometries.forEach((state) => {
      const stateFeature = feature(us, state) as RegionFeature;
      const stateGroup = states
        .append('g')
        .datum(stateFeature)
        .on('mouseenter', handleEnterRegion)
        .on('mouseleave', handleLeaveRegion)
        .on('click', handleClickRegion)
        .on('dblclick', handleDoubleClickState);

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

      stateGroup.append('path').datum(stateFeature).attr('class', 'state').attr('d', path);
    });
  }, [svgRef, width, height]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <svg className="choropleth" ref={svgRef} />
      <style jsx global>{`
        .choropleth {
          padding: 10px;
          width: 100%;
        }

        .choropleth .outside {
          fill: transparent;
        }

        .choropleth .states {
          stroke: white;
          stroke-width: 2;
          stroke-linejoin: round;
          stroke-linecap: round;
        }

        .choropleth .state {
          fill: transparent;
        }

        .choropleth .entered {
          fill-opacity: 0.6;
        }

        .choropleth .focused {
          stroke: black;
        }
      `}</style>
    </>
  );
}
