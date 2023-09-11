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
import { useBusinessContext, useStores } from '@root/hooks';
import { RatesEntityType } from '@root/types';

import { FormSkeleton } from '../../components';
import { IRecurringLineItemForm } from '../LineItem/types';

import styles from '../../css/styles.scss';
import { type IGlobalRecurringRateLineItemFormikData } from './types';

const I18N_PATH = 'components.forms.Rates.Global.Form.';

const RecurringLineItemForm: React.FC<IRecurringLineItemForm> = ({ onShowRatesHistory }) => {
  const { values, errors, handleChange, handleBlur } =
    useFormikContext<IGlobalRecurringRateLineItemFormikData>();

  const { globalRateStore, lineItemStore } = useStores();
  const { businessUnitId, businessLineId } = useBusinessContext();
  const { t } = useTranslation();

  useEffect(() => {
    globalRateStore.requestRecurringLineItems({ businessUnitId, businessLineId });
  }, [globalRateStore, businessUnitId, businessLineId, globalRateStore.isPreconditionFailed]);

  const handleShowHistory = useCallback(
    (lineItemId: number, billingCycle?: string, description?: string) => {
      const ratesHistoryParams = {
        businessUnitId,
        businessLineId,
        lineItemId,
        billingCycle,
        entityType: RatesEntityType.globalRatesRecurringLineItems,
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
          {globalRateStore.recurringLineItemsLoading ? (
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
                {values.recurringLineItems?.map((recurringLineItem, index) => {
                  const lineItemService = lineItemStore.getById(recurringLineItem.lineItemId);

                  return recurringLineItem.billingCycles.map(
                    (billingCycleObj, billingCycleIndex) => {
                      const inputPath = `recurringLineItems[${index}].billingCycles[${billingCycleIndex}].price`;

                      return (
                        <tr key={inputPath} className={styles.historyLabel}>
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
                                    recurringLineItem.lineItemId,
                                    billingCycleObj.billingCycle,
                                    lineItemService?.description,
                                  )
                                }
                              />
                            </Layouts.Flex>
                          </td>
                          <td className={cx(styles.cell, styles.large, styles.label, styles.right)}>
                            {capitalize(billingCycleObj.billingCycle)}
                          </td>
                          <td className={cx(styles.cell, styles.midSize)}>
                            <div className={styles.inputWrapper}>
                              <FormInput
                                name={inputPath}
                                type="number"
                                ariaLabel={`${
                                  lineItemService?.description ?? ''
                                } general rack rates`}
                                key="price"
                                value={
                                  values.recurringLineItems[index].billingCycles[billingCycleIndex]
                                    .price
                                }
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={getIn(errors, inputPath)}
                                wrapClassName={styles.input}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    },
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
