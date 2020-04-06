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
  extent,
  timeWeek,
  format,
} from 'd3';

interface LineChartProps {
  timeline: [Date, number][];
  width: number;
  height: number;
}

const MARGIN = 30;
export default function LineChart({ timeline, width, height }: LineChartProps) {
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = select(svgRef.current).attr('viewBox', `0 0 ${width} ${height}`);

    const [minX = new Date(), maxX = new Date()] = extent(timeline.slice(0, 30), ([date]) => date) as [Date, Date];
    maxX.setDate(maxX.getDate() + 1);

    const x = scaleTime()
      .domain([minX, maxX])
      .range([0, width - MARGIN])
      .nice();
    const y = scaleLinear()
      .domain([0, 1.2 * max(timeline, ([_date, data]) => data)!])
      .range([height - MARGIN, 0]);

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
      const dots = svg
        .append('g')
        .selectAll('circle')
        .data(timeline)
        .enter()
        .append('circle')
        .attr('fill', 'red')
        .attr('r', 3)
        .attr('cx', ([date]) => x(date))
        .attr('cy', ([_date, data]) => y(data));

      const path = svg
        .append('path')
        .datum(timeline)
        .attr('fill', 'none')
        .attr('stroke', 'red')
        .attr('stroke-width', 1.5)
        .attr(
          'd',
          line<[Date, number]>()
            .x(([date]) => x(date))
            .y(([_date, data]) => y(data)),
        );
      return () => {
        path.remove();
        dots.remove();
        xAxis.remove();
        yAxis.remove();
      };
    }

    const noData = svg
      .append('text')
      .text('No Data')
      .attr('text-anchor', 'middle')
      .attr('x', x(new Date()))
      .attr('y', y(0));
    return () => {
      xAxis.remove();
      yAxis.remove();
      noData.remove();
    };
  }, [svgRef, width, height, timeline]);

  return <svg className="line-chart" ref={svgRef} />;
}
