import { ISubjectRow } from '../SubjectRow/types';

export type ChangeFormat = 'id' | 'money' | 'date' | 'time' | 'customizableDate';

export interface IDifferenceRow extends Omit<ISubjectRow, 'children'> {
  label?: string;
  to?: string | number | null;
  from?: string | number | null;
  format?: ChangeFormat;
}
