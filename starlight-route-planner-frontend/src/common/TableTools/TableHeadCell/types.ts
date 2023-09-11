import { ITableCell } from '../TableCell/types';

export type ITableHeadCell = Omit<ITableCell, 'fallback' | 'tag'>;
