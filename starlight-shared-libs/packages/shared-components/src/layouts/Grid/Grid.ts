import styled from 'styled-components';

import { ICellLayout, IGridLayout } from './types';

export const Grid = styled.div<IGridLayout>(
  ({ theme, alignItems, flow, columnGap, rowGap, gap, areas, rows, columns, autoRows }) => ({
    display: 'grid',
    gridAutoFlow: flow,
    alignItems,
    gridColumnGap: columnGap ? theme.offsets[columnGap] : undefined,
    gridRowGap: rowGap ? theme.offsets[rowGap] : undefined,
    gridGap: gap ? theme.offsets[gap] : undefined,
    gridTemplateAreas: areas?.map(area => `"${area}"`).join(' '),
    gridTemplateColumns: typeof columns === 'number' ? `repeat(${columns}, 1fr)` : columns,
    gridTemplateRows: typeof rows === 'number' ? `repeat(${rows}, 1fr)` : rows,
    gridAutoRows: autoRows,
  }),
);

export const Cell = styled.div<ICellLayout>(
  ({ left, top, area, alignSelf, justifySelf, width = 1, height = 1 }) => ({
    gridColumnStart: left,
    gridRowStart: top,
    gridColumnEnd: `span ${width}`,
    gridRowEnd: `span ${height}`,
    gridArea: area,
    alignSelf,
    justifySelf,
  }),
);
