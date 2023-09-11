import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@starlightpro/shared-components';

import { Paths, Routes } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useStores } from '@hooks';

import { IButtons } from './types';

const I18N_PATH =
  'quickViews.SubscriptionOrderQuickView.components.sections.SubscriptionOrderViewActions.Buttons.Invoiced.';

const Invoiced: React.FC<IButtons> = () => {
  const { t } = useTranslation();
  const { subscriptionOrderStore } = useStores();
  const { businessUnitId } = useBusinessContext();

  const selectedSubscriptionOrder = subscriptionOrderStore.selectedEntity;
  const customerId = selectedSubscriptionOrder?.customer?.originalId;
  const subOrderId = selectedSubscriptionOrder?.id;

  const link = `${pathToUrl(Paths.CustomerModule.Invoices, {
    customerId,
    subPath: Routes.Invoices,
    businessUnit: businessUnitId,
  })}${subOrderId ? `?subOrderId=${subOrderId}` : ''}`;

  return (
    <Button variant="alternative" to={link}>
      {t(`${I18N_PATH}InvoiceDetails`)}
    </Button>
  );
};

export default Invoiced;
