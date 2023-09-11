import React, { FC, useCallback, useEffect, useMemo } from 'react';
import { Field, useField } from 'react-final-form';
import { SelectOption, showError, TextField } from '@starlightpro/common';
import TextFieldCommon from '@starlightpro/common/components/TextField';
import { Box, IconButton, makeStyles, TableCell, TableRow, Typography } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { isEmpty, toLower, truncate } from 'lodash/fp';
import QuantityTextMask from '../../../../components/QuantityTextMask';

import DeleteIcon from '@material-ui/icons/Delete';
import {
  HaulingBillableItemUnit,
  HaulingMeasurementUnit,
  GetHaulingMaterialsQueryVariables,
  OrderBillableItem,
  OrderBillableItemType,
  OrderPriceSourceType,
  OrderType,
  useFillOrderBillableItemsWithPricesMutation,
  useGetHaulingCompanyGeneralSettingsQuery,
  useGetHaulingMaterialsLazyQuery,
  useGetUserInfoQuery,
} from '../../../../graphql/api';
import { Trans, useTranslation } from '../../../../i18n';
import { billableItemUnitTransMapping, measurementUnitTonMap } from '../../constants';
import { has, keyBy } from 'lodash-es';

export const useBillableItemRowStyles = makeStyles(
  ({ palette, spacing }) => ({
    quantityInput: {
      textAlign: 'right',
    },
    priceInput: {
      textAlign: 'right',
    },
    priceTextFieldRoot: {
      minWidth: 45,
      maxWidth: 75,
    },
    quantityTextFieldRoot: {
      width: 45,
    },
    materialSelectInputBaseRoot: {
      boxShadow: 'none',
      background: 'transparent',

      '&:before': {
        display: 'none',
      },
      '&:after': {
        display: 'none',
      },

      '& $materialSelectPlaceHolder': {
        color: palette.primary.main,
      },
    },
    materialSelectIcon: {
      display: 'none',
    },
    materialSelectInputBaseInput: {
      padding: spacing(1, 0, 1, 0) + '!important',
      width: 'auto',
      position: 'relative',
      textAlign: 'center',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',

      '&:after': {
        height: 1,
        display: 'block',
        borderBottom: `1px dashed ${palette.primary.main}`,
        width: '100%',
        content: "'\\00a0'",
        opacity: 1,
        zIndex: 1,
        transition: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
        pointerEvents: 'none',
      },
    },
    materialSelectPlaceHolder: {},
    removeButton: {
      position: 'relative',
      left: '-6px',
      top: '-2px',
    },
    alightRightText: {
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'flex-end',
    },
    skeleton: {},
  }),
  { name: 'BillableItemRow' },
);

const getBillableItemUnit = (
  billableItemUnit: HaulingBillableItemUnit,
  generalUnitSetting?: HaulingMeasurementUnit,
): string => {
  let units = billableItemUnitTransMapping[billableItemUnit];

  if (!generalUnitSetting) {
    return toLower(units);
  }

  if (billableItemUnit === HaulingBillableItemUnit.Ton) {
    units = measurementUnitTonMap[generalUnitSetting];
  }

  return toLower(units);
};

interface BillableItemRowProps {
  name: string;
  className?: string;
  readOnly?: boolean;
  classes?: {
    skeleton?: string;
  };
}

export const BillableItemRow: FC<BillableItemRowProps> = ({
  name,
  readOnly,
  className,
  classes: classesProp,
}) => {
  const classes = useBillableItemRowStyles({ classes: { skeleton: classesProp?.skeleton } });
  const [t] = useTranslation();
  const { data: userInfoData } = useGetUserInfoQuery();
  const [getMaterials, { data: materialsData }] = useGetHaulingMaterialsLazyQuery();
  const { input } = useField<OrderBillableItem>(name, { subscription: { value: true } });
  const {
    input: { value: unlockOverrides },
  } = useField('unlockOverrides', { subscription: { value: true } });
  const {
    input: { value: priceGroupId },
  } = useField('priceGroupId', {
    subscription: { value: true },
  });
  const {
    input: { value: material },
  } = useField('material', {
    subscription: { value: true },
  });
  const {
    input: { value: type },
  } = useField<OrderType>('type', {
    subscription: { value: true },
  });
  const { data: haulingGeneralSettings } = useGetHaulingCompanyGeneralSettingsQuery();
  const generalUnitSetting = haulingGeneralSettings?.haulingCompanyGeneralSettings?.unit;
  const orderBillableItem = input.value;
  const onItemChange = input.onChange;
  const userId = userInfoData?.userInfo.id;
  const description = orderBillableItem.billableItem?.description || '';
  const units = orderBillableItem.billableItem?.unit || '';

  useEffect(() => {
    const filter: GetHaulingMaterialsQueryVariables['filter'] = {
      activeOnly: true,
      equipmentItems: false,
    };

    getMaterials({
      variables: {
        filter,
      },
    });
  }, [getMaterials, type]);

  const billableItemMaterials = useMemo(() => {
    if (
      orderBillableItem.type === OrderBillableItemType.Line &&
      orderBillableItem.billableItem?.materialBasedPricing &&
      materialsData?.haulingMaterials.data
    ) {
      return materialsData?.haulingMaterials.data;
    }

    const materialsById = keyBy(materialsData?.haulingMaterials.data || [], 'id');

    return (orderBillableItem.billableItem?.materialIds || [])
      .filter((id) => has(materialsById, id))
      .map((id) => materialsById[id]);
  }, [
    materialsData?.haulingMaterials.data,
    orderBillableItem.billableItem?.materialBasedPricing,
    orderBillableItem.billableItem?.materialIds,
    orderBillableItem.type,
  ]);

  const onFillCompleted = useCallback(
    (values) => {
      onItemChange({
        target: {
          name,
          value: values.fillOrderBillableItemsWithPrices[0],
        },
      });
    },
    [onItemChange, name],
  );

  const [fillItemsWithPrice, { loading }] = useFillOrderBillableItemsWithPricesMutation({
    onCompleted: onFillCompleted,
  });

  const onMaterialIdChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (orderBillableItem.priceSourceType === OrderPriceSourceType.Manual) {
        return;
      }

      try {
        await fillItemsWithPrice({
          variables: {
            orderBillableItemsInput: [
              {
                uuid: orderBillableItem.uuid,
                type: orderBillableItem.type,
                quantity: orderBillableItem.quantity,
                billableItemId: orderBillableItem.billableItem?.id,
                materialId: parseInt(e.target.value) || null,
                price: 0,
                priceSource: null,
                priceSourceType: OrderPriceSourceType.NoPrice,
                auto: orderBillableItem.auto,
              },
            ],
            priceGroupId,
            materialId: material?.id || null,
            type,
          },
        });
      } catch (e) {
        showError(e.message);
      }
    },
    [
      fillItemsWithPrice,
      material?.id,
      orderBillableItem.auto,
      orderBillableItem.billableItem?.id,
      orderBillableItem.priceSourceType,
      orderBillableItem.quantity,
      orderBillableItem.type,
      orderBillableItem.uuid,
      priceGroupId,
      type,
    ],
  );

  return (
    <TableRow className={className}>
      <TableCell align="left">
        <Box display="flex">
          {!readOnly && !orderBillableItem.readonly && (
            <Field name="billableItems" subscription={{ value: true }}>
              {({ input }) => (
                <IconButton
                  size="small"
                  color="secondary"
                  className={classes.removeButton}
                  onClick={() => {
                    input.onChange({
                      target: {
                        name: 'billableItems',
                        value: input.value.filter(
                          (v: OrderBillableItem) => v !== orderBillableItem,
                        ),
                      },
                    });
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Field>
          )}
          <Typography variant="body2">{truncate({ length: 26 }, description)}</Typography>
        </Box>
      </TableCell>
      <TableCell align="left">
        {isEmpty(billableItemMaterials) ? (
          <Typography variant="body2">
            {truncate({ length: 16 }, orderBillableItem.material?.description || '')}
          </Typography>
        ) : (
          <TextFieldCommon
            disabled={readOnly || loading}
            style={{ marginBottom: 0 }}
            select
            fullWidth
            value={orderBillableItem.material?.id}
            name={`${name}.material.id`}
            classes={{
              inputBaseRoot: classes.materialSelectInputBaseRoot,
              input: classes.materialSelectInputBaseInput,
            }}
            placeholder={'_placeholder'}
            SelectProps={{
              classes: {
                icon: classes.materialSelectIcon,
              },
            }}
            onChange={onMaterialIdChange}
          >
            <SelectOption value={'_placeholder'} disabled>
              <span className={classes.materialSelectPlaceHolder}>
                <Trans>Select Material</Trans>
              </span>
            </SelectOption>
            {(billableItemMaterials || []).map((material: any) => (
              <SelectOption key={material.id} value={material.id}>
                {truncate({ length: 16 }, material.description)}
              </SelectOption>
            ))}
          </TextFieldCommon>
        )}
      </TableCell>
      <TableCell align="left">
        <Typography variant="body2">
          {units && getBillableItemUnit(units, generalUnitSetting)}
        </Typography>
      </TableCell>
      <TableCell align="right">
        {unlockOverrides && !(orderBillableItem.readonly || readOnly) ? (
          <TextField
            disabled={readOnly || loading}
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
        ) : loading ? (
          <Skeleton className={classes.skeleton} variant="text" />
        ) : (
          <Typography variant="body2" className={classes.alightRightText}>
            {t('{{value, number}}', { value: Number(orderBillableItem.price) || 0 })}
          </Typography>
        )}
      </TableCell>
      <TableCell align="right">
        {orderBillableItem.auto ? (
          orderBillableItem.quantity
        ) : (
          <TextField
            InputProps={{
              inputComponent: QuantityTextMask as any,
            }}
            type="text"
            hideArrows
            name={`${name}.quantity`}
            style={{ marginBottom: 0 }}
            disabled={readOnly || !!orderBillableItem.readonly || loading}
            hideErrorText={true}
            classes={{
              root: classes.quantityTextFieldRoot,
              input: classes.quantityInput,
            }}
          />
        )}
      </TableCell>
      <TableCell align="right">
        {loading ? (
          <Skeleton className={classes.skeleton} variant="text" />
        ) : (
          <Typography variant="body2" className={classes.alightRightText}>
            {t('{{value, number}}', {
              value: Number((orderBillableItem.price || 0) * (orderBillableItem.quantity || 0)),
            })}
          </Typography>
        )}
      </TableCell>
    </TableRow>
  );
};
