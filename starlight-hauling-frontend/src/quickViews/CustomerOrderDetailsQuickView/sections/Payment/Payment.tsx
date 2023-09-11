import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { startCase } from 'lodash-es';

import { Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { IOrder } from '@root/types';

const I18N_PATH = 'quickViews.OrderDetailsView.sections.Payment.Text.';

const PaymentSection: React.FC = () => {
  const { values } = useFormikContext<IOrder>();
  const { t } = useTranslation();

  const paymentMethods = values?.payments?.map(payment => startCase(payment.paymentType)) ?? [];

  if (values.paymentMethod === 'onAccount') {
    paymentMethods.push('On Account');
  }

  return (
    <Layouts.Cell top={3}>
      <Layouts.Grid gap="4" columns="250px 1fr">
        <Layouts.Cell width={2}>
          <Typography variant="bodyLarge" fontWeight="bold">
            {t(`${I18N_PATH}PricingAndPayment`)}
          </Typography>
        </Layouts.Cell>
        <Typography color="secondary" shade="desaturated">
          {t(`${I18N_PATH}PricingGroup`)}
        </Typography>
        <Typography color="secondary" shade="desaturated">
          {t(`${I18N_PATH}PaymentMethod`)}
        </Typography>
        <span>{values.customRatesGroup?.description ?? t(`${I18N_PATH}GeneralPriceGroup`)}</span>
        <span>{paymentMethods.join(', ')}</span>
        <Layouts.Cell width={2}>
          <Divider bottom />
        </Layouts.Cell>
      </Layouts.Grid>
    </Layouts.Cell>
  );
};

export default PaymentSection;
