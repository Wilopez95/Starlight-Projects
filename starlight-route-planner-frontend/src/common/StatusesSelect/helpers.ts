import { StatusSelectItem } from './types';

export const getOption = (
  statuses: StatusSelectItem[],
  value?: string,
): StatusSelectItem | undefined => statuses.find(status => status === value);

export const getOptions = (
  statuses: StatusSelectItem[] = [],
  values: string[] = [],
): StatusSelectItem[] | undefined =>
  statuses.filter(item => values.find(value => value === item) !== undefined);
