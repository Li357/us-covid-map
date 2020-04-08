import { useEffect, useRef, useCallback, useMemo } from 'react';
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
} from 'd3';
import { feature } from 'topojson-client';
import { GeometryObject } from 'topojson-specification';
import us from '../utils/map';
import { bringToFront } from '../utils/element';
import { MapMouseHandler, RegionFeature, Region, MinimalRegion, RegionProperties } from '../types';

interface ChoroplethProps {
  view: 'nation' | 'state';
  regions: Map<string, Region | MinimalRegion>;
  width: number;
  height: number;
  onEnterRegion: (regionId: string) => void;
  onClickRegion: (regionId: string) => void;
  onClickOutside: () => void;
  onDoubleClickState: (stateId: string) => void;
}

export default function Choropleth({
  view,
  regions,
  width,
  height,
  onEnterRegion,
  onClickRegion,
  onClickOutside,
  onDoubleClickState,
}: ChoroplethProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const path = useMemo(
    () => geoPath(geoAlbersUsa().fitSize([width, height], feature(us, us.objects.counties))),
    [width, height],
  );
  const handleZoom = useCallback(() => {
    const { transform } = event;
    const svg = select(svgRef.current);
    svg.select('.states').attr('transform', transform);
  }, [svgRef]);
  const stateZoom = useMemo(
    () => zoom<SVGSVGElement, undefined>().scaleExtent([1, 8]).on('zoom', handleZoom),
    [handleZoom],
  );

  const handleClickRegion: MapMouseHandler = useCallback(
    (feature, i, nodes) => {
      select(svgRef.current).selectAll('.focused').classed('focused', false);
      bringToFront(select(nodes[i])).classed('focused', true);
      onClickRegion(feature.id);
    },
    [svgRef, onClickRegion],
  );

  const handleClickOutside = useCallback(() => {
    select(svgRef.current).selectAll('.focused').classed('focused', false);
    onClickOutside();
  }, [svgRef, onClickOutside]);

  const handleEnterRegion: MapMouseHandler = useCallback(
    (feature, i, nodes) => {
      select(nodes[i]).classed('entered', true);
      onEnterRegion(feature.id);
    },
    [onEnterRegion],
  );

  const handleLeaveRegion: MapMouseHandler = useCallback((_feature, i, nodes) => {
    select(nodes[i]).classed('entered', false);
  }, []);

  const handleDoubleClickState: MapMouseHandler = useCallback(
    (feature, i, nodes) => {
      select(nodes[i]).classed('in-view', true);
      onDoubleClickState(feature.id);
    },
    [onDoubleClickState],
  );

  const zoomOnState = useCallback(
    (state: RegionFeature) => {
      if (!svgRef.current) {
        return;
      }

      const [[x0, y0], [x1, y1]] = path.bounds(state);
      select<SVGSVGElement, undefined>(svgRef.current)
        .transition()
        .duration(750)
        .call(
          stateZoom.transform,
          zoomIdentity
            .translate(width / 2, height / 2)
            .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
            .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
        );
    },
    [svgRef, path, stateZoom, width, height],
  );

  const resetZoom = useCallback(() => {
    if (!svgRef.current) {
      return;
    }

    return select<SVGSVGElement, undefined>(svgRef.current)
      .transition()
      .duration(750)
      .call(stateZoom.transform, zoomIdentity);
  }, [svgRef, stateZoom]);

  const makeCountiesInteractive = useCallback(
    (stateGroup: Selection<SVGGElement, RegionFeature, BaseType, unknown>) => {
      stateGroup
        .classed('focused', false)
        .on('mouseenter', null)
        .on('mouseleave', null)
        .on('click', null)
        .select('.state')
        .attr('visibility', 'hidden');
      stateGroup
        .select('.counties')
        .attr('stroke-width', 0.5)
        .selectAll<SVGPathElement, RegionFeature>('path')
        .on('mouseenter', handleEnterRegion)
        .on('mouseleave', handleLeaveRegion)
        .on('click', handleClickRegion);
    },
    [handleClickRegion, handleEnterRegion, handleLeaveRegion],
  );

  const makeStateInteractive = useCallback(
    (stateGroup: Selection<SVGGElement, RegionFeature, BaseType, unknown>) => {
      stateGroup
        .classed('focused', true)
        .classed('in-view', false)
        .on('mouseenter', handleEnterRegion)
        .on('mouseleave', handleLeaveRegion)
        .on('click', handleClickRegion)
        .select('.state')
        .attr('visibility', 'visible');
      stateGroup
        .select('.counties')
        .attr('stroke-width', 0)
        .selectAll('.path')
        .on('mouseenter', null)
        .on('mouseleave', null)
        .on('click', null);
    },
    [handleClickRegion, handleEnterRegion, handleLeaveRegion],
  );

  // set up the svg's dimensions and zoom
  useEffect(() => {
    if (!svgRef.current) {
      return;
    }

    select<SVGSVGElement, undefined>(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .call(stateZoom)
      .on('wheel.zoom', null)
      .on('mousewheel.zoom', null)
      .on('mousedown.zoom', null)
      .on('dblclick.zoom', null);
  }, [svgRef, width, height, stateZoom]);

  // draw the map
  useEffect(() => {
    const color = scaleThreshold<number, string>().domain(range(1, 400, 50)).range(schemeReds[9]);
    const svg = select(svgRef.current);

    const states = svg.append('g').classed('states', true);
    states
      .append('rect')
      .classed('outside', true)
      .attr('width', '100%')
      .attr('height', '100%')
      .style('opacity', 0);

    const countiesByState = us.objects.counties.geometries.reduce(
      (countiesMap: Record<string, Array<GeometryObject<RegionProperties>>>, county) => {
        const stateFips = (county.id as string).slice(0, 2);
        if (!countiesMap[stateFips]) {
          countiesMap[stateFips] = [];
        }
        countiesMap[stateFips].push(county);
        return countiesMap;
      },
      {},
    );

    us.objects.states.geometries.forEach((state) => {
      const stateFeature = feature(us, state) as RegionFeature;
      const stateGroup = states
        .append('g')
        .classed('state-group', true)
        .datum(stateFeature)
        .on('mousedown', () => event.preventDefault()) // stop selecting text on double click
        .on('mouseenter', handleEnterRegion)
        .on('mouseleave', handleLeaveRegion)
        .on('click', handleClickRegion)
        .on('dblclick', handleDoubleClickState);

      const counties = stateGroup.append('g').classed('counties', true).attr('stroke-width', 0);
      countiesByState[state.id as string].forEach((county) => {
        const countyFeature = feature(us, county) as RegionFeature;
        counties
          .append('path')
          .datum(countyFeature)
          .attr('fill', (d) => color(regions.get(d.id)?.cases ?? 0))
          .attr('d', path);
      });

      stateGroup.append('path').datum(stateFeature).classed('state', true).attr('d', path);
    });
    // click handlers do not need to be listed, they do not use state
  }, [svgRef, path, regions]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!svgRef.current) {
      return;
    }

    const svg = select(svgRef.current);
    const states = svg.selectAll<SVGGElement, RegionFeature>('.states');
    const stateGroup = states.select<SVGGElement>('.in-view').classed('entered', false);
    if (view === 'state') {
      const feature = stateGroup.datum();
      zoomOnState(feature);
      states.selectAll('.state-group').attr('visibility', 'hidden');
      bringToFront(stateGroup).attr('visibility', 'visible');
      makeCountiesInteractive(stateGroup);
    } else {
      resetZoom()?.on('end', () => states.selectAll('.state-group').attr('visibility', 'visible'));
      makeStateInteractive(stateGroup);
    }
  }, [svgRef, view, makeCountiesInteractive, makeStateInteractive, resetZoom, zoomOnState]);

  // handlers to be rebound or else it'll receive stale state
  useEffect(() => {
    select(svgRef.current).select('.outside').on('click', handleClickOutside);
  }, [svgRef, handleClickOutside]);

  return (
    <>
      <svg className="choropleth" ref={svgRef} />
      <style jsx global>{`
        .choropleth {
          padding: 10px;
          width: 100%;
        }

        .choropleth .outside {
          fill: white;
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
