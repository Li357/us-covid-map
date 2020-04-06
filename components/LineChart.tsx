import { useRef, useEffect } from 'react';
import {
  select,
  axisBottom,
  scaleLinear,
  scaleTime,
  line,
  axisRight,
  max,
  timeFormat,
  timeWeek,
  format,
  min,
  mouse,
  bisector,
} from 'd3';
import { formatNumber } from '../utils/data';

interface LineChartProps {
  name: string;
  timeline: [Date, number][];
  width: number;
  height: number;
  index: number;
  onMouseMove: (i: number) => void;
}

const getTimelineDomain = (timeline: [Date, number][]): [Date, Date] => {
  let minX = min(timeline, ([date]) => date);
  const maxX = new Date();
  const fourWeeks = 4 * 7 * 24 * 60 * 60 * 1000;
  if (!minX || maxX.getTime() - minX.getTime() < fourWeeks) {
    minX = new Date();
    // defaults to showing 4 ticks (1 per week)
    minX.setDate(minX.getDate() - 4 * 7);
  }
  return [minX, maxX];
};

const getTimelineRange = (timeline: [Date, number][]) => {
  const maxY = max(timeline, ([_date, timeline]) => timeline);
  return [0, maxY && maxY > 15 ? 1.2 * maxY : 15];
};

const MARGIN = 30;
export default function LineChart({ name, timeline, width, height, onMouseMove, index }: LineChartProps) {
  const svgRef = useRef(null);
  const x = scaleTime()
    .domain(getTimelineDomain(timeline))
    .range([0, width - MARGIN])
    .nice();
  const y = scaleLinear()
    .domain(getTimelineRange(timeline))
    .range([height - MARGIN, 0]);
  const formatDate = timeFormat('%B %e');

  useEffect(() => {
    const svg = select(svgRef.current).attr('viewBox', `0 0 ${width} ${height}`);

    const xAxis = svg
      .append('g')
      .attr('transform', `translate(0, ${height - MARGIN})`)
      .attr('stroke-width', 2)
      .call(
        axisBottom<Date>(x)
          .tickFormat(timeFormat('%b %d'))
          .tickArguments([timeWeek.every(1)]),
      );
    const yAxis = svg
      .append('g')
      .attr('transform', `translate(${width - MARGIN}, 0)`)
      .attr('stroke-width', 2)
      .call(axisRight(y).tickValues(y.ticks(10).filter(Number.isInteger)).tickFormat(format('~s')));

    if (timeline.length > 0) {
      const { color } = getComputedStyle(svg.node()!);
      const path = svg
        .append('path')
        .datum(timeline)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 1.5)
        .attr(
          'd',
          line<[Date, number]>()
            .x(([date]) => x(date))
            .y(([_date, timeline]) => y(timeline)),
        );

      const dotsGroup = svg.append('g').classed('dots', true);
      dotsGroup
        .append('g')
        .selectAll('circle')
        .data(timeline)
        .enter()
        .append('circle')
        .attr('fill', color)
        .attr('r', 3)
        .attr('cx', ([date]) => x(date))
        .attr('cy', ([_date, timeline]) => y(timeline));

      svg.on('mousemove', () => {
        const [xPos] = mouse(svg.node()!);
        const dPos = x.invert(xPos);
        const bisect = bisector<[Date, number], [Date, number]>(([date1], [date2]) => date2.getTime() - date1.getTime())
          .left;
        const index = bisect(timeline, [dPos, 0], 1, timeline.length - 1);
        const [d0] = timeline[index - 1];
        const [d1] = timeline[index];
        const closestIndex = dPos.getTime() - d0.getTime() > d1.getTime() - dPos.getTime() ? index - 1 : index;
        onMouseMove(closestIndex);
      });

      return () => {
        path.remove();
        dotsGroup.remove();
        xAxis.remove();
        yAxis.remove();
        onMouseMove(0);
      };
    }
    return () => {
      xAxis.remove();
      yAxis.remove();
    };
  }, [svgRef, width, height, timeline]);

  useEffect(() => {
    const svg = select(svgRef.current);
    const { color } = getComputedStyle(svg.node()!);
    const info = svg.append('g').attr('dominant-baseline', 'hanging');
    info.append('text').classed('title', true).attr('x', 0).attr('y', 0).attr('fill', color).text('No data');

    if (timeline.length > 0 && timeline[index]) {
      const [x1, y1] = timeline[index];
      info.select('.title').text(`${formatNumber(y1)} ${name}`);
      info.append('text').classed('date', true).text(formatDate(x1)).attr('fill', color).attr('x', 0).attr('y', 20);

      const focusDot = svg
        .selectAll('.dots')
        .append('circle')
        .classed('focus', true)
        .attr('fill', color)
        .attr('r', 5)
        .attr('cx', x(x1))
        .attr('cy', y(y1));
      return () => {
        focusDot.remove();
        info.remove();
      };
    }
    return () => {
      info.remove();
    };
  }, [svgRef, timeline, index, name, onMouseMove]);

  return (
    <>
      <svg className="line-chart" ref={svgRef} />
      <style jsx global>{`
        .line-chart .title {
          font-weight: bold;
        }
      `}</style>
    </>
  );
}
