import { useEffect, useRef, useCallback, useState } from 'react';
import {
  select,
  geoAlbersUsa,
  geoPath,
  scaleThreshold,
  range,
  schemeReds,
  zoom,
  zoomIdentity,
  Selection,
  BaseType,
  event,
  zoomTransform,
} from 'd3';
import { feature } from 'topojson-client';
import us from '../utils/map';
import { MapMouseHandler, RegionFeature, Region, MinimalRegion } from '../types';

interface ChoroplethProps {
  regions: Map<string, Region | MinimalRegion>;
  regionInView: Region;
  width: number;
  height: number;
  onEnterRegion: (region: Region | MinimalRegion) => void;
  onClickRegion: (region: Region | MinimalRegion) => void;
  onClickOutside: () => void;
  onFocusState: (region: Region | null) => void;
}

export default function Choropleth({
  regions,
  regionInView,
  width,
  height,
  onEnterRegion,
  onClickRegion,
  onClickOutside,
  onFocusState,
}: ChoroplethProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const projection = geoAlbersUsa().fitSize([width, height], feature(us, us.objects.counties));
  const path = geoPath(projection);

  const handleClickRegion: MapMouseHandler = useCallback(
    (feature, i, nodes) => {
      select(svgRef.current).selectAll('.focused').classed('focused', false);
      select(nodes[i])
        .classed('focused', true)
        .each((_datum, i, nodes) => {
          nodes[i].parentNode?.appendChild(nodes[i]);
        });
      onClickRegion(regions.get(feature.id)!);
    },
    [svgRef, onClickRegion, regions],
  );

  const handleClickOutside = useCallback(() => {
    select(svgRef.current).selectAll('.focused').classed('focused', false);
    onClickOutside();
  }, [svgRef, onClickOutside]);

  const handleEnterRegion: MapMouseHandler = useCallback(
    (feature, i, nodes) => {
      select(nodes[i]).classed('entered', true);
      onEnterRegion(regions.get(feature.id)!);
    },
    [regions, onEnterRegion],
  );

  const handleLeaveRegion: MapMouseHandler = (_feature, i, nodes) => {
    select(nodes[i]).classed('entered', false);
  };

  const handleDoubleClickState: MapMouseHandler = useCallback(
    (feature, i, nodes) => {
      select(nodes[i]).classed('in-view', true);
      onFocusState(regions.get(feature.id)! as Region);
    },
    [regions, onFocusState],
  );

  useEffect(() => {
    const color = scaleThreshold<number, string>().domain(range(1, 400, 50)).range(schemeReds[9]);
    const svg = select(svgRef.current).attr('viewBox', `0 0 ${width} ${height}`);
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

      const counties = stateGroup.append('g').classed('counties', true).attr('stroke-width', 0);
      us.objects.counties.geometries.forEach((county) => {
        if ((county.id as string).startsWith(state.id as string)) {
          counties
            .append('path')
            .datum(feature(us, county) as RegionFeature)
            .attr('fill', (d) => color(regions.get(d.id)?.cases ?? 0))
            .attr('d', path);
        }
      });

      stateGroup.append('path').datum(stateFeature).attr('class', 'state').attr('d', path);
    });
  }, [svgRef, width, height]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!svgRef.current) {
      return;
    }

    const handleZoom = () => states.attr('transform', event.transform);
    const stateZoom = zoom<SVGSVGElement, undefined>().scaleExtent([1, 8]).on('zoom', handleZoom);
    const svg = select<SVGSVGElement, undefined>(svgRef.current);
    const states = svg.selectAll('.states');
    svg
      .call(stateZoom)
      .on('wheel.zoom', null)
      .on('mousewheel.zoom', null)
      .on('mousedown.zoom', null)
      .on('dblclick.zoom', null);

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
        );
    };

    const blurOtherStates = (state: RegionFeature) => {
      states
        .selectAll<Element, RegionFeature>('g')
        .filter((feature) => !feature.id.startsWith(state.id))
        .transition()
        .duration(750)
        .style('opacity', 0)
        .on('end', (_datum, i, nodes) => select(nodes[i]).attr('visibility', 'hidden'));
    };

    const attachCountyMouseHandlers = (stateGroup: Selection<SVGGElement, RegionFeature, BaseType, unknown>) => {
      stateGroup.select('.state').attr('visibility', 'hidden');
      stateGroup
        .classed('focused', false)
        .on('mouseenter', null)
        .on('mouseleave', null)
        .on('click', null)
        .select('.counties')
        .attr('stroke-width', 0.5)
        .selectAll<SVGPathElement, RegionFeature>('path')
        .on('mouseenter', handleEnterRegion)
        .on('mouseleave', handleLeaveRegion)
        .on('click', handleClickRegion);
    };

    const unblurOtherStates = () => {
      states
        .selectAll<Element, RegionFeature>('g')
        .transition()
        .duration(750)
        .style('opacity', 1)
        .attr('visibility', 'visible');
    };

    const resetZoom = () => {
      svg
        .transition()
        .duration(750)
        .call(stateZoom.transform, zoomIdentity, zoomTransform(svg.node()!).invert([width / 2, height / 2]));
    };

    const reattachStateMouseHandlers = (stateGroup: Selection<SVGGElement, RegionFeature, BaseType, unknown>) => {
      stateGroup
        .classed('in-view', false)
        .select<SVGPathElement>('.state')
        .attr('visibility', 'visible')
        .on('mouseenter', handleEnterRegion)
        .on('mouseleave', handleLeaveRegion)
        .on('click', handleClickRegion);
      stateGroup
        .select('.counties')
        .attr('stroke-width', 0)
        .selectAll('path')
        .on('mouseenter', null)
        .on('mouseleave', null)
        .on('click', null);
    };

    const inStateView = regionInView.fips.length === 2;
    const stateGroup = states.selectAll<SVGGElement, RegionFeature>('.in-view').classed('entered', false);
    if (inStateView) {
      const feature = stateGroup.datum();
      zoomOnState(feature);
      blurOtherStates(feature);
      attachCountyMouseHandlers(stateGroup);
    } else {
      unblurOtherStates();
      resetZoom();
      reattachStateMouseHandlers(stateGroup);
      onFocusState(null);
    }
  }, [svgRef, regionInView]);

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
