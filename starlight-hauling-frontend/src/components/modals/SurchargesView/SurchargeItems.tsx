import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { Table, TableBody, TableCell, TableRow, TableTools } from '@root/common/TableTools';
import { useIntl } from '@root/i18n/useIntl';

import { ISurchargesOrder } from './types';

import styles from './css/styles.scss';

const I18N_PATH = 'components.modals.SurchargesCalculation.Text.';
const fallback = '-';

const SurchargeItems: React.FC<{
  orderSurcharges: ISurchargesOrder[];
  total: number;
}> = ({ orderSurcharges, total }) => {
  const { formatCurrency } = useIntl();

  const { t } = useTranslation();

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
            return (
              <TableRow key={surcharge.id}>
                <TableCell>{surcharge.description}</TableCell>
                <TableCell>{surcharge?.billableItemDescription ?? fallback}</TableCell>
                <TableCell>{surcharge.materialDescription ?? fallback}</TableCell>
                <TableCell>{formatCurrency(surcharge.flatPrice)}</TableCell>
                <TableCell>
                  {surcharge.calculation === 'flat'
                    ? formatCurrency(surcharge.billableItemPrice)
                    : `${surcharge.billableItemPrice}%`}
                </TableCell>
                <TableCell right>{formatCurrency(surcharge.amount)}</TableCell>
              </TableRow>
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
