import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import cx from 'classnames';
import { getIn, useFormikContext } from 'formik';
import { capitalize } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { HistoryIcon } from '@root/assets';
import { Badge, FormInput } from '@root/common';
import { Table } from '@root/common/TableTools';
import { BillingCycleEnum } from '@root/consts';
import { useBusinessContext, useStores } from '@root/hooks';
import { RatesEntityType } from '@root/modules/pricing/const';

import { FormSkeleton } from '../../../../components';
import { IRecurringLineItemForm } from '../LineItem/types';

import styles from '../../../../css/styles.scss';
import { type IRecurringLineItemGeneralRateFormikData } from './types';

const I18N_PATH = 'modules.pricing.GeneralRate.components.forms.Text.';

const RecurringLineItemForm: React.FC<IRecurringLineItemForm> = ({ onShowRatesHistory }) => {
  const { values, errors, handleChange, handleBlur } =
    useFormikContext<IRecurringLineItemGeneralRateFormikData>();

  const { generalRateStoreNew, lineItemStore } = useStores();
  const { businessUnitId, businessLineId } = useBusinessContext();
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      await generalRateStoreNew.request({
        businessUnitId,
        businessLineId,
        entityType: RatesEntityType.recurringLineItem,
      });

      generalRateStoreNew.filterRecurrentLineItemRatesByParameters();
    })();
  }, [businessLineId, businessUnitId, generalRateStoreNew]);

  const handleShowHistory = useCallback(
    (lineItemId: number, billingCycle: BillingCycleEnum | null, description?: string) => {
      const ratesHistoryParams = {
        businessUnitId,
        businessLineId,
        lineItemId,
        billingCycle,
        entityType: RatesEntityType.recurringLineItem,
      };

      onShowRatesHistory(ratesHistoryParams, [description].join(' • '));
    },
    [businessLineId, businessUnitId, onShowRatesHistory],
  );

  return (
    <Layouts.Grid
      as={Layouts.Box}
      columns="1fr"
      height="100%"
      minHeight="100%"
      backgroundColor="white"
    >
      <Layouts.Scroll>
        <div className={styles.wrapper}>
          {generalRateStoreNew.loading ? (
            <FormSkeleton />
          ) : (
            <Table>
              <thead>
                <tr>
                  <th className={cx(styles.title, styles.left)}>{t(`${I18N_PATH}Items`)}</th>
                  <th className={cx(styles.title, styles.right)}>
                    {t(`${I18N_PATH}BillingCycle`)}
                  </th>
                  <th className={cx(styles.title, styles.right)}>
                    {t(`${I18N_PATH}GeneralRackRates`)}, $
                  </th>
                </tr>
              </thead>
              <tbody>
                {values.recurringLineItem?.map((recurringLineItem, index) => {
                  const lineItemService = lineItemStore.getById(
                    recurringLineItem.billableLineItemId,
                  );

                  return (
                    <tr key={recurringLineItem.id} className={styles.historyLabel}>
                      <td className={cx(styles.cell, styles.large, styles.label)}>
                        <Layouts.Flex alignItems="center">
                          {lineItemService?.description}
                          {!lineItemService?.active ? (
                            <Badge color="alert" className={styles.inactive}>
                              {t(`${I18N_PATH}Inactive`)}
                            </Badge>
                          ) : null}
                          <HistoryIcon
                            className={styles.rateHistoryIcon}
                            onClick={() =>
                              handleShowHistory(
                                recurringLineItem.billableLineItemId,
                                recurringLineItem.billingCycle as BillingCycleEnum,
                                lineItemService?.description,
                              )
                            }
                          />
                        </Layouts.Flex>
                      </td>
                      <td className={cx(styles.cell, styles.large, styles.label, styles.right)}>
                        {capitalize((recurringLineItem.billingCycle as string) ?? '')}
                      </td>
                      <td className={cx(styles.cell, styles.midSize)}>
                        <div className={styles.inputWrapper}>
                          <FormInput
                            name={`recurringLineItem[${index}].price`}
                            type="number"
                            ariaLabel="Price"
                            key="price"
                            value={recurringLineItem.price}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={getIn(errors, `recurringLineItem[${index}].price`)}
                            wrapClassName={styles.input}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </div>
      </Layouts.Scroll>
    </Layouts.Grid>
  );
};

export default observer(RecurringLineItemForm);
