import React, { FC } from 'react';
import { Trans, useTranslation } from '../../../../i18n';
import { useField } from 'react-final-form';
import { TableCell, TableRow, Typography } from '@material-ui/core';
import { TextField } from '@starlightpro/common';

import {
  OrderBillableItem,
  OrderPriceSourceType,
  OrderType,
  useGetUserInfoQuery,
} from '../../../../graphql/api';
import { Skeleton } from '@material-ui/lab';
import { useBillableItemRowStyles } from './BillableItemRow';

interface MaterialBillableItemRowProps {
  name: string;
  className?: string;
  readOnly?: boolean;
  loading?: boolean;
  classes?: {
    skeleton?: string;
  };
  useOrderBillableItem?: OrderBillableItem;
}

export const MaterialBillableItemRow: FC<MaterialBillableItemRowProps> = ({
  name,
  className,
  readOnly,
  loading,
  classes: classesProp,
  useOrderBillableItem,
}) => {
  const classes = useBillableItemRowStyles({ classes: { skeleton: classesProp?.skeleton } });
  const [t] = useTranslation();
  const { data: userInfoData } = useGetUserInfoQuery();
  const { input } = useField<OrderBillableItem>(name, { subscription: { value: true } });
  const {
    input: { value: type },
  } = useField<OrderType>('type', {
    subscription: { value: true },
  });
  const {
    input: { value: unlockOverrides },
  } = useField('unlockOverrides', { subscription: { value: true } });
  const userId = userInfoData?.userInfo.id;
  const orderBillableItem = useOrderBillableItem || input.value;
  const onItemChange = input.onChange;

  return (
    <TableRow className={className}>
      <TableCell align="left">
        <Typography variant="body2">
          <Trans>{type === OrderType.Dump ? 'Disposal by ton' : 'Material by ton'}</Trans>
        </Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="body2">{orderBillableItem.material?.description}</Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="body2">{orderBillableItem.material?.units}</Typography>
      </TableCell>
      <TableCell align="right">
        {loading ? (
          <Skeleton className={classes.skeleton} variant="text" />
        ) : unlockOverrides && !(orderBillableItem.readonly || readOnly) ? (
          <TextField
            disabled={readOnly}
            name={`${name}.price`}
            type="number"
            hideArrows
            classes={{
              root: classes.priceTextFieldRoot,
              input: classes.priceInput,
            }}
            onChange={(e) => {
              if (orderBillableItem.priceSourceType !== OrderPriceSourceType.Manual) {
                onItemChange({
                  target: {
                    name,
                    value: {
                      ...orderBillableItem,
                      price: e.target.value,
                      priceSource: userId,
                      priceSourceType: OrderPriceSourceType.Manual,
                    },
                  },
                });
              }
            }}
            style={{ marginBottom: 0 }}
          />
        ) : (
          <Typography variant="body2">
            {t('{{value, number}}', {
              value: orderBillableItem.price || 0,
            })}
          </Typography>
        )}
      </TableCell>
      <TableCell align="right">
        <Typography variant="body2">
          {t('{{value, number}}', { value: Number(orderBillableItem.quantity) || 0 })}
        </Typography>
      </TableCell>
      <TableCell align="right">
        {loading ? (
          <Skeleton className={classes.skeleton} variant="text" />
        ) : (
          <Typography variant="body2">
            {t('{{value, number}}', {
              value: (orderBillableItem.price || 0) * (orderBillableItem.quantity || 0),
            })}
          </Typography>
        )}
      </TableCell>
    </TableRow>
  );
};
