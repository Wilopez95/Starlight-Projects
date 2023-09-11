import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ISelectOption, Layouts, Select } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { noop, startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { DeleteIcon } from '@root/assets';
import { FormInput, Subsection, Typography } from '@root/common';
import { useStores } from '@root/hooks';
import { IConfigurableSubscriptionWorkOrder } from '@root/stores/subscriptionWorkOrder/SubscriptionWorkOrder';

const I18N_PATH = 'quickViews.SubscriptionOrderEditQuickView.components.RecurringLineItems.';

const RecurringLineItems: React.FC = () => {
  const { values } = useFormikContext<IConfigurableSubscriptionWorkOrder>();
  const { lineItemStore } = useStores();
  const { t } = useTranslation();

  const lineItemOptions: ISelectOption[] = useMemo(() => {
    return lineItemStore.sortedValues
      .filter(item => !item.oneTime)
      .map(lineItem => ({
        label: lineItem.description,
        value: lineItem.id,
      }));
  }, [lineItemStore.sortedValues]);

  return (
    <Subsection gray>
      <Typography variant="headerThree">{t(`${I18N_PATH}RecurringLineItems`)}</Typography>
      <Layouts.Margin top="2">
        {values.subscriptionServiceItem?.recurrentLineItems?.map((lineItem, index) => {
          return (
            <Layouts.Flex justifyContent="space-between" key={index}>
              <Layouts.Box width="424px" as={Layouts.Flex} justifyContent="space-between">
                <Layouts.Flex direction="column">
                  {index === 0 ? (
                    <Layouts.Margin left="3">
                      <Layouts.Padding left="0.5">
                        <Typography
                          as="label"
                          shade="desaturated"
                          color="secondary"
                          variant="bodyMedium"
                        >
                          {t(`${I18N_PATH}RecurringLineItems`)}
                        </Typography>
                      </Layouts.Padding>
                    </Layouts.Margin>
                  ) : null}
                  <Layouts.Flex alignItems="center">
                    {
                      <Layouts.Margin bottom="4">
                        <Layouts.IconLayout remove>
                          <DeleteIcon onClick={noop} />
                        </Layouts.IconLayout>
                      </Layouts.Margin>
                    }
                    <Layouts.Margin right="3">
                      <Layouts.Box width="320px">
                        <Select
                          name={`lineItems[${index}].billableLineItemId`}
                          value={lineItem.billableLineItem.originalId}
                          options={lineItemOptions}
                          onSelectChange={noop}
                          disabled
                        />
                      </Layouts.Box>
                    </Layouts.Margin>
                  </Layouts.Flex>
                </Layouts.Flex>
                <Layouts.Margin>
                  {index === 0 ? (
                    <Typography
                      htmlFor={`lineItems[${index}].units`}
                      color="secondary"
                      as="label"
                      shade="desaturated"
                      variant="bodyMedium"
                    >
                      {t(`${I18N_PATH}Unit`)}
                    </Typography>
                  ) : null}
                  <Layouts.Margin top="1">
                    <Typography variant="bodyMedium" textAlign="right">
                      {startCase(lineItem.billableLineItem?.unit)}
                    </Typography>
                  </Layouts.Margin>
                </Layouts.Margin>
              </Layouts.Box>
              <Layouts.Flex justifyContent="flex-end" alignItems="baseline">
                <Layouts.Box width="160px">
                  <Layouts.Box width="75px">
                    {index === 0 ? (
                      <Typography
                        color="secondary"
                        as="label"
                        shade="desaturated"
                        variant="bodyMedium"
                        htmlFor={`lineItems[${index}].quantity`}
                      >
                        {t(`${I18N_PATH}QTY`)}
                      </Typography>
                    ) : null}
                    <FormInput
                      name={`lineItems[${index}].quantity`}
                      key={`lineItems[${index}].quantity`}
                      value={lineItem.quantity}
                      type="number"
                      limits={{
                        min: 1,
                      }}
                      countable
                      disabled
                      onChange={noop}
                    />
                  </Layouts.Box>
                </Layouts.Box>
              </Layouts.Flex>
            </Layouts.Flex>
          );
        })}
        <Typography variant="bodyMedium" color="secondary" shade="desaturated">
          + {t(`${I18N_PATH}AddRecurringLineItem`)}
        </Typography>
      </Layouts.Margin>
    </Subsection>
  );
};

export default observer(RecurringLineItems);
