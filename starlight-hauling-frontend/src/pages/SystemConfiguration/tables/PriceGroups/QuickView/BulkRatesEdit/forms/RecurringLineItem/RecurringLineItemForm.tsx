import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { capitalize, intersectionWith, noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Badge, FormInput, Typography } from '@root/common';
import { FormSkeleton } from '@root/components/forms/Rates/components';
import { useBusinessContext, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { LineItem } from '@root/stores/entities';

import { IBulkRatesData } from '../../types';
import { OperationButton } from '../styles';

import styles from '../../css/styles.scss';

const I18N_PATH = 'pages.SystemConfiguration.tables.PriceGroups.QuickView.BulkRatesEdit.forms.';

const RecurringLineItemForm: React.FC<{ lineItems: LineItem[] }> = () => {
  const { values } = useFormikContext<IBulkRatesData>();
  const { t } = useTranslation();
  const { currencySymbol } = useIntl();

  const { globalRateStore, lineItemStore, priceGroupStore } = useStores();
  const { businessUnitId, businessLineId } = useBusinessContext();

  useEffect(() => {
    if (values.preview.priceGroupId && businessUnitId && businessLineId) {
      globalRateStore.requestRecurringLineItems({ businessUnitId, businessLineId });
      priceGroupStore.requestLineItems({
        businessUnitId,
        businessLineId,
        priceGroupId: values.preview.priceGroupId,
      });
    }
  }, [
    globalRateStore,
    priceGroupStore,
    businessUnitId,
    businessLineId,
    priceGroupStore.isPreconditionFailed,
    values.preview.priceGroupId,
  ]);

  const recurringLineItemsValues = useMemo(
    () =>
      lineItemStore.sortedValues.length > 0
        ? intersectionWith(
            values.preview.recurringLineItems,
            lineItemStore.sortedValues,
            (_recurringLineItems, _propsRecurringLineItems) =>
              _recurringLineItems.lineItemId === _propsRecurringLineItems.id,
          )
        : values.preview.recurringLineItems,
    [values.preview.recurringLineItems, lineItemStore.sortedValues],
  );

  return (
    <Layouts.Box width="100%">
      <Layouts.Padding top="1" left="1">
        {globalRateStore.recurringLineItemsLoading ? (
          <FormSkeleton />
        ) : (
          <>
            <Typography
              textTransform="uppercase"
              variant="headerFive"
              color="secondary"
              shade="desaturated"
            >
              <Layouts.Grid alignItems="center" columns="auto 120px 170px 170px 150px" rows="36px">
                <Layouts.Flex justifyContent="flex-start">{t('Text.Items')}</Layouts.Flex>
                <Layouts.Flex justifyContent="flex-end">{t('Text.BillingCycle')}</Layouts.Flex>
                <Layouts.Flex justifyContent="flex-end">
                  {values.edit.source === 'current'
                    ? t(`${I18N_PATH}CurrentPriceGroupRates}`)
                    : t(`${I18N_PATH}GeneralRates`)}
                  , $
                </Layouts.Flex>
                <Layouts.Flex justifyContent="flex-end">
                  {' '}
                  {t('Text.Value')}, {values.edit.calculation === 'flat' ? currencySymbol : '%'}
                </Layouts.Flex>
                <Layouts.Flex justifyContent="flex-end">{t(`${I18N_PATH}FinalPrice`)}</Layouts.Flex>
              </Layouts.Grid>
            </Typography>
            {recurringLineItemsValues?.map((recurringLineItem, index) => {
              const lineItemService = lineItemStore.getById(recurringLineItem.lineItemId);

              return recurringLineItem?.billingCycles?.map(billingCycleObj => (
                <Layouts.Padding key={billingCycleObj.billingCycle} top="1" bottom="1">
                  <Layouts.Grid
                    alignItems="center"
                    columns="auto 120px 170px 170px 150px"
                    rows="36px"
                  >
                    <Layouts.Flex alignItems="center">
                      {lineItemService?.description}
                      {!lineItemService?.active ? (
                        <Badge color="alert" className={styles.inactive}>
                          {t('Text.Inactive')}
                        </Badge>
                      ) : null}
                    </Layouts.Flex>
                    <Typography textAlign="right">
                      {capitalize(billingCycleObj.billingCycle)}
                    </Typography>
                    <Typography textAlign="right">
                      {billingCycleObj.price ? `${billingCycleObj.price}` : null}
                    </Typography>
                    <Layouts.Flex justifyContent="flex-end">
                      <Layouts.Margin right="1">
                        <Layouts.Flex direction="column">
                          <Layouts.Margin bottom="0.5">
                            <OperationButton
                              position="relative"
                              as="button"
                              width="16px"
                              height="16px"
                              borderRadius="3px"
                              backgroundColor="white"
                              plus
                              active={values.edit.direction === 'increase'}
                            />
                          </Layouts.Margin>
                          <OperationButton
                            position="relative"
                            as="button"
                            width="16px"
                            height="16px"
                            borderRadius="3px"
                            backgroundColor="white"
                            active={values.edit.direction === 'decrease'}
                          />
                        </Layouts.Flex>
                      </Layouts.Margin>
                      <Layouts.Box width="120px">
                        <FormInput
                          type="number"
                          className={styles.formInput}
                          ariaLabel={
                            values.edit.calculation === 'flat'
                              ? t(`${I18N_PATH}ValueInCurrency`)
                              : t(`${I18N_PATH}ValueInPercents`)
                          }
                          name={`preview.recurringLineItems[${index}].value`}
                          key="value"
                          value={recurringLineItem?.value}
                          onChange={noop}
                          disabled
                          noError
                        />
                      </Layouts.Box>
                    </Layouts.Flex>
                    <Layouts.Flex justifyContent="flex-end">
                      <Layouts.Box width="120px">
                        <FormInput
                          type="number"
                          className={styles.formInput}
                          name={`preview.recurringLineItems[${index}].finalPrice`}
                          ariaLabel={t('Text.FinalPrice')}
                          key="finalPrice"
                          value={billingCycleObj?.finalPrice}
                          onChange={noop}
                          disabled
                          noError
                        />
                      </Layouts.Box>
                    </Layouts.Flex>
                  </Layouts.Grid>
                </Layouts.Padding>
              ));
            })}
          </>
        )}
      </Layouts.Padding>
    </Layouts.Box>
  );
};

export default observer(RecurringLineItemForm);
