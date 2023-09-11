import { ISubjectRow } from '../SubjectRow/types';

export type ChangeFormat = 'id' | 'money' | 'date' | 'time';

export interface IDifferenceRow extends Omit<ISubjectRow, 'children'> {
  label?: string;
  to?: string;
  from?: string;
  format?: ChangeFormat;
}
