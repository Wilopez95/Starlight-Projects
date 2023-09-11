import React, { useEffect, useMemo } from 'react';
import { Layouts, Select } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Section, Subsection, Typography } from '@root/common';
import { normalizeOptions } from '@root/helpers';
import { usePrevious, useStores } from '@root/hooks';

import { getOrderTotal } from '../../helpers';
import { INewRecurrentOrder } from '../../types';

const PaymentSection: React.FC = () => {
  const { values, errors, setFieldError, setFieldValue } = useFormikContext<INewRecurrentOrder>();

  const { surchargeStore, i18nStore } = useStores();

  const orderTotals = useMemo(() => {
    let total = getOrderTotal({
      order: values.recurrentTemplateData,
      businessLineId: values.businessLineId,
      region: i18nStore.region,
      taxDistricts: values.taxDistricts,
      surcharges: surchargeStore.values,
      commercialTaxesUsed: values.commercialTaxesUsed,
    });

    if (values.delivery) {
      total += getOrderTotal({
        order: values.delivery,
        businessLineId: values.businessLineId,
        region: i18nStore.region,
        taxDistricts: values.taxDistricts,
        surcharges: surchargeStore.values,
        commercialTaxesUsed: values.commercialTaxesUsed,
      });
    }
    if (values.final) {
      total += getOrderTotal({
        order: values.final,
        businessLineId: values.businessLineId,
        region: i18nStore.region,
        taxDistricts: values.taxDistricts,
        surcharges: surchargeStore.values,
        commercialTaxesUsed: values.commercialTaxesUsed,
      });
    }

    return total;
  }, [
    i18nStore.region,
    surchargeStore.values,
    values.businessLineId,
    values.delivery,
    values.final,
    values.recurrentTemplateData,
    values.taxDistricts,
    values.commercialTaxesUsed,
  ]);

  const prevOrderTotals = usePrevious(orderTotals);

  useEffect(() => {
    if (prevOrderTotals !== orderTotals) {
      setFieldValue('payment', {
        paymentMethod: 'onAccount',
        amount: orderTotals,
        sendReceipt: false,
        authorizeCard: false,
      });
    }
  }, [orderTotals, prevOrderTotals, setFieldValue]);

  useEffect(() => {
    if (orderTotals !== prevOrderTotals && orderTotals > 0) {
      setFieldError('payment.amount', undefined);
    }
  }, [orderTotals, prevOrderTotals, setFieldError]);

  return (
    <Section>
      <Subsection gray>
        <Layouts.Margin bottom="1">
          <Layouts.Flex justifyContent="space-between">
            <Typography variant="headerThree">Payment</Typography>
          </Layouts.Flex>
        </Layouts.Margin>
        <Layouts.Flex>
          <Layouts.Column single>
            <Select
              label="Payment method"
              name="payments.paymentMethod"
              options={normalizeOptions(['onAccount'])}
              value={values.payment.paymentMethod}
              onSelectChange={noop}
              error={errors.payment?.paymentMethod}
              nonClearable
              disabled
            />
          </Layouts.Column>
        </Layouts.Flex>
      </Subsection>
    </Section>
  );
};

export default observer(PaymentSection);
