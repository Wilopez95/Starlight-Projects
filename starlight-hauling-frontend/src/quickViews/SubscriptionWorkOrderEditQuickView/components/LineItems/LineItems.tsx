import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { FieldArray, useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { Subsection, Typography } from '@root/common';
import { BillableLineItemUnitTypeEnum } from '@root/consts';
import { IConfigurableSubscriptionWorkOrder } from '@root/stores/subscriptionWorkOrder/SubscriptionWorkOrder';

import LineItem from '../LineItem/LineItem';

import { IDefaultLineItem } from './types';

const I18N_PATH = 'quickViews.SubscriptionOrderEditQuickView.components.LineItems.';

const LineItems: React.FC = () => {
  const { values } = useFormikContext<IConfigurableSubscriptionWorkOrder>();
  const { t } = useTranslation();

  return (
    <Subsection gray>
      <Typography variant="headerThree">{t(`${I18N_PATH}LineItems`)}</Typography>
      <Layouts.Margin top="2">
        <FieldArray name="lineItems">
          {({
            push,
            remove,
          }: {
            push(obj: IDefaultLineItem): void;
            remove(index: number): void;
          }) => {
            return (
              <>
                {values.lineItems
                  ? values.lineItems.map((lineItem, index) => (
                      <LineItem
                        key={index + lineItem.billableLineItemId}
                        lineItem={lineItem}
                        index={index}
                        handleRemove={() => remove(index)}
                      />
                    ))
                  : null}
                <Button
                  variant="none"
                  onClick={() =>
                    push({
                      billableLineItemId: undefined,
                      quantity: 1,
                      price: undefined,
                      materialId: null,
                      historicalLineItem: {
                        unit: BillableLineItemUnitTypeEnum.EACH,
                        originalId: undefined,
                      },
                    })
                  }
                >
                  <Typography variant="bodyMedium" cursor="pointer" color="information">
                    + {t(`${I18N_PATH}AddLineItem`)}
                  </Typography>
                </Button>
              </>
            );
          }}
        </FieldArray>
      </Layouts.Margin>
    </Subsection>
  );
};

export default observer(LineItems);
