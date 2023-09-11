import React, { useCallback, useMemo } from 'react';
import { capitalize } from 'lodash-es';
import { DifferenceRow } from '../../BaseRows';

type FormatFunction = (v1: string | null, v2: string | null) => any[];

const format: FormatFunction = (v1, v2) => {
  const format = (str: string) => {
    if (str === 'onAccount') {
      return 'On Account';
    }

    if (str === 'creditCard') {
      return 'Credit Card';
    }

    return str.includes('_')
      ? str.split('_')
      : str
          .split(' ')
          .map((w) => capitalize(w))
          .join(' '); // hauling and our BE keep different enums for payments
  };

  return [v1 ? format(v1) : v1, v2 ? format(v2) : v2];
};

export const GenericPropertiesChanges: React.FC<any> = ({ attribute, prevValue, newValue }) => {
  const getFromTo = useCallback((prevV, newV, attrs = null) => {
    if (!attrs) {
      return [prevV, newV];
    }

    if (typeof attrs === 'string') {
      return [prevV[attrs], newV[attrs]];
    }

    const from = prevV[attrs.some((attr: string) => !!prevV[attr])] || null;
    const to = newV[attrs.some((attr: string) => !!newV[attr])] || null;

    return [from, to];
  }, []);

  const [from, to, prefix, subject] = useMemo(() => {
    let from,
      to,
      prefix,
      subject = '';

    switch (attribute) {
      case 'containerId':
        subject = 'Container';
        [from, to] = getFromTo(prevValue, newValue, 'description');
        break;
      case 'paymentMethod':
        subject = 'Payment Method';
        const [fromRaw, toRaw] = getFromTo(prevValue, newValue);
        [from, to] = format(fromRaw, toRaw);
        break;
      case 'PONumber':
        subject = 'PO number';
        [from, to] = getFromTo(prevValue, newValue);
        break;
      case 'WONumber':
        subject = 'WO number';
        [from, to] = getFromTo(prevValue, newValue);
        break;
      default:
        break;
    }

    return [from, to, prefix, subject];
  }, [attribute, getFromTo, newValue, prevValue]);

  return <DifferenceRow prefix={prefix} subject={subject} from={from} to={to} />;
};
