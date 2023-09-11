import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { Table, TableBody, TableCell, TableRow, TableTools } from '@root/common/TableTools';
import { IOrderViewSurcharge } from '@root/helpers';
import { useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import styles from './css/styles.scss';

const I18N_PATH = 'components.modals.SurchargesCalculation.Text.';

const fallback = '-';

const SurchargeItems: React.FC<{
  orderSurcharges: IOrderViewSurcharge[];
  total: number;
  billableServiceQuantity?: number;
  billableServiceId?: number;
}> = ({ orderSurcharges, billableServiceId, billableServiceQuantity, total }) => {
  const { materialStore, lineItemStore, billableServiceStore } = useStores();

  const { formatCurrency } = useIntl();

  const { t } = useTranslation();

  const billableService = billableServiceStore.values.find(
    service => service.id === billableServiceId,
  );

  return (
    <Layouts.Padding left="1" right="2">
      <Table className={styles.surchargesTable}>
        <TableTools.Header sticky={false}>
          <TableTools.HeaderCell>{t(`${I18N_PATH}Surcharge`)}</TableTools.HeaderCell>
          <TableTools.HeaderCell>{t(`${I18N_PATH}BillableItem`)}</TableTools.HeaderCell>
          <TableTools.HeaderCell>{t(`${I18N_PATH}Material`)}</TableTools.HeaderCell>
          <TableTools.HeaderCell>{t(`${I18N_PATH}Price`)}</TableTools.HeaderCell>
          <TableTools.HeaderCell>{t(`${I18N_PATH}Rate`)}</TableTools.HeaderCell>
          <TableTools.HeaderCell right>{t(`${I18N_PATH}Amount`)}</TableTools.HeaderCell>
        </TableTools.Header>

        <TableBody cells={6}>
          {orderSurcharges.map(surcharge => {
            const material = materialStore.values.find(
              materialData => materialData.id === surcharge.materialId,
            );

            return !surcharge.billableItemSurcharges.length ? (
              <TableRow key={surcharge.id}>
                <TableCell>{surcharge.description}</TableCell>
                <TableCell>{fallback}</TableCell>
                <TableCell>
                  {surcharge.materialBasedPricing ? material?.description : fallback}
                </TableCell>
                <TableCell>{fallback}</TableCell>
                <TableCell>{formatCurrency(surcharge.flatRateValue)}</TableCell>
                <TableCell right>
                  {billableServiceQuantity
                    ? formatCurrency((surcharge.flatRateValue ?? 0) * billableServiceQuantity)
                    : formatCurrency(surcharge.flatRateValue)}
                </TableCell>
              </TableRow>
            ) : (
              <React.Fragment key={surcharge.id}>
                {surcharge.billableItemSurcharges.map((billableItem, billableItemIndex) => {
                  const billableItemMaterial = materialStore.values.find(
                    materialData => materialData.id === billableItem.materialId,
                  );
                  const billableLineItem = lineItemStore.values.find(
                    item => item.id === billableItem.billableLineItemId,
                  );

                  return (
                    <TableRow key={`${surcharge.id}-${billableItemIndex}`}>
                      <TableCell>
                        {billableItemIndex === 0 ? surcharge.description : null}
                      </TableCell>
                      <TableCell>
                        {billableItem.billableServiceId
                          ? billableItem.description ?? billableService?.description
                          : billableLineItem?.description ?? billableItem?.description}
                      </TableCell>
                      <TableCell>
                        {surcharge.materialBasedPricing
                          ? billableItemMaterial?.description
                          : fallback}
                      </TableCell>
                      <TableCell>{formatCurrency(billableItem.billableItemPrice)}</TableCell>
                      <TableCell>{billableItem.rateValue}%</TableCell>
                      <TableCell right>{formatCurrency(billableItem.total)}</TableCell>
                    </TableRow>
                  );
                })}
              </React.Fragment>
            );
          })}

          <TableRow>
            <TableCell>
              <Layouts.Padding top="1" bottom="1">
                <Typography fontWeight="bold" color="secondary">
                  {t(`${I18N_PATH}Total`)}
                </Typography>
              </Layouts.Padding>
            </TableCell>
            <TableCell right colSpan={5}>
              <Layouts.Padding top="1" bottom="1">
                <Typography fontWeight="bold" color="secondary">
                  {formatCurrency(total)}
                </Typography>
              </Layouts.Padding>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Layouts.Padding>
  );
};

export default observer(SurchargeItems);
