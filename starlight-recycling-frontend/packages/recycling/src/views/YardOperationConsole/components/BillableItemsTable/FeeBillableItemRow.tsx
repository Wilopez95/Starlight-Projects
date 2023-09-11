import React, { FC } from 'react';

import { TableCell, TableRow, Typography } from '@material-ui/core';
import { useTranslation } from '../../../../i18n';
import {
  HaulingBillableItemUnit,
  OrderBillableItem,
  OrderPriceSourceType,
  useGetUserInfoQuery,
} from '../../../../graphql/api';
import { Field, useField } from 'react-final-form';
import { billableItemUnitTransMapping } from '../../constants';
import { toLower } from 'lodash/fp';
import { Skeleton } from '@material-ui/lab';
import { TextField } from '@starlightpro/common';
import { ReadOnlyOrderFormComponent } from '../../types';
import { useBillableItemRowStyles } from './BillableItemRow';

export interface FeeBillableItemRowProps extends ReadOnlyOrderFormComponent {
  name: string;
  className?: string;
  loading?: boolean;
  classes?: {
    skeleton?: string;
  };
}

export const FeeBillableItemRow: FC<FeeBillableItemRowProps> = ({
  className,
  name,
  loading,
  classes: classesProp,
  readOnly,
}) => {
  const classes = useBillableItemRowStyles({ classes: { skeleton: classesProp?.skeleton } });
  const [t] = useTranslation();
  const { data: userInfoData } = useGetUserInfoQuery();
  const userId = userInfoData?.userInfo.id;
  const {
    input: { value: billableServiceName },
  } = useField('billableServiceName', { subscription: { value: true } });
  const {
    input: { value: orderBillableItem, onChange: onItemChange },
  } = useField<OrderBillableItem>(name, { subscription: { value: true } });
  const {
    input: { value: unlockOverrides },
  } = useField('unlockOverrides', { subscription: { value: true } });

  return (
    <TableRow className={className}>
      <TableCell align="left">
        <Typography variant="body2">
          {billableServiceName || orderBillableItem.billableItem?.description}
        </Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="body2">{orderBillableItem.material?.description}</Typography>
      </TableCell>
      <TableCell align="left">
        {toLower(billableItemUnitTransMapping[HaulingBillableItemUnit.Each])}
      </TableCell>
      <TableCell align="right">
        <Typography variant="body2">
          {loading ? (
            <Skeleton className={classes.skeleton} variant="text" />
          ) : unlockOverrides && !(orderBillableItem.readonly || readOnly) ? (
            <TextField
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
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Field name={`${name}.quantity`} subscription={{ value: true }}>
          {({ input }) => (
            <Typography variant="body2">
              {t('{{value, number}}', { value: Number(input.value) || 0 })}
            </Typography>
          )}
        </Field>
      </TableCell>
      <TableCell align="right">
        {loading ? (
          <Skeleton className={classes?.skeleton} variant="text" />
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

export default FeeBillableItemRow;
