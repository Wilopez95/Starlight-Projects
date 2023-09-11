import { ISelectOption } from '@starlightpro/shared-components';
import { format } from 'date-fns';
import { range } from 'lodash-es';

export const defaultCardMask = '9999-9999-9999-9999';

export const cardPrefixes15 = ['34', '37', '2131', '1800'];
export const cardPrefixes14 = ['300', '301', '302', '303', '304', '305', '36', '38'];

const getCreditCartYearOptions = () => {
  const currentYear = +format(new Date(), 'yy');

  return range(0, 10).map(year => {
    const newYear = year + currentYear;

    return {
      label: `20${newYear}`,
      value: newYear.toString(),
    };
  });
};

export const creditCardYearOptions: ISelectOption[] = getCreditCartYearOptions();
