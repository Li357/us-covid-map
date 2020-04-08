import { Selection, BaseType } from 'd3';

export function bringToFront<E extends Element, D, P extends BaseType, PD>(
  selection: Selection<E, D, P, PD>,
) {
  return selection.each((_datum, i, nodes) => {
    nodes[i].parentNode?.appendChild(nodes[i]);
  });
}
