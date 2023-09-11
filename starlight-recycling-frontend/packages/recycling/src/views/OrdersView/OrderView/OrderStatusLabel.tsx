import React, { FC } from 'react';
import { capitalize, toUpper } from 'lodash-es';
import Label from '../../../components/Label';
import { orderStatusLabelMapping } from '../constant';
import { OrderStatus } from '../../../graphql/api';
import { makeStyles } from '@material-ui/core';
import cx from 'classnames';

const useStyles = makeStyles(() => ({
  fontClass: {
    fontSize: '1.5rem',
  },
}));

interface Props {
  status: OrderStatus | 'In_Progress';
}

export const OrderStatusLabel: FC<Props> = ({ status }) => {
  const classes = useStyles();
  const formattedStatus = status
    ? status
        .split('_')
        .map((w) => capitalize(w))
        .join(' ')
    : '';

  return (
    <Label
      className={cx(classes.fontClass)}
      variant={
        orderStatusLabelMapping[toUpper(status) as keyof typeof orderStatusLabelMapping] ?? 'active'
      }
    >
      {formattedStatus}
    </Label>
  );
};
