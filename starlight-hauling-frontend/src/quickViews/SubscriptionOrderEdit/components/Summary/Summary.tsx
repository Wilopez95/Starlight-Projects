import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { LeftPanelTools, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import AppliedTaxesModal from '@root/components/modals/AppliedTaxesModal/AppliedTaxesModal';
import SurchargesViewModal from '@root/components/modals/SurchargesView/SurchargesViewModal';
import { useBoolean, useSubscriptionOrderFormPrices } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { IConfigurableSubscriptionOrder } from '@root/types';

const I18N_PATH = 'quickViews.SubscriptionOrderEditQuickView.components.LeftPanel.';

const Summary: React.FC = () => {
  const subscriptionOrderPrices = useSubscriptionOrderFormPrices();
  const { t } = useTranslation();
  const { values } = useFormikContext<IConfigurableSubscriptionOrder>();
  const { formatCurrency } = useIntl();
  const [isTaxesModalOpen, openTaxesModal, closeTaxesModal] = useBoolean();
  const [isSurchargesModalOpen, openSurchargesModal, closeSurchargesModal] = useBoolean();

  const subscriptionOrdersTotal = subscriptionOrderPrices?.summary.subscriptionOrdersTotal ?? 0;
  const lineItemsTotal = subscriptionOrderPrices?.summary.lineItemsTotal ?? 0;
  const grandTotal = subscriptionOrderPrices?.summary.grandTotal ?? 0;
  const taxesTotal = subscriptionOrderPrices?.summary.taxesInfo.taxesTotal ?? 0;
  const surchargesTotal = subscriptionOrderPrices?.summary.surchargesTotal ?? 0;
  const hasSurcharges = surchargesTotal > 0;

  const surchargesProps = hasSurcharges ? { onClick: openSurchargesModal, underlined: true } : {};

  return (
    <>
      {subscriptionOrderPrices ? (
        <AppliedTaxesModal
          isOpen={isTaxesModalOpen}
          onClose={closeTaxesModal}
          taxesInfo={subscriptionOrderPrices.summary.taxesInfo}
        />
      ) : null}
      {hasSurcharges && subscriptionOrderPrices?.summary ? (
        <SurchargesViewModal
          centered
          isOpen={isSurchargesModalOpen}
          onClose={closeSurchargesModal}
          surchargesData={subscriptionOrderPrices.summary}
        />
      ) : null}
      <LeftPanelTools.Item>
        <Divider />
      </LeftPanelTools.Item>
      <Layouts.Box height="200px">
        <LeftPanelTools.Item inline>
          <Typography color="secondary">{t(`${I18N_PATH}Service`)}</Typography>
          <Typography variant="bodyLarge">{formatCurrency(subscriptionOrdersTotal)}</Typography>
        </LeftPanelTools.Item>
        {values.lineItems?.length ? (
          <LeftPanelTools.Item inline>
            <Typography color="secondary">{t(`${I18N_PATH}LineItems`)}</Typography>
            <Typography variant="bodyLarge">{formatCurrency(lineItemsTotal)}</Typography>
          </LeftPanelTools.Item>
        ) : null}
        {values.applySurcharges ? (
          <LeftPanelTools.Item inline>
            <Typography color="secondary">{t(`${I18N_PATH}Surcharges`)}:</Typography>
            <Typography variant="bodyLarge" {...surchargesProps}>
              {formatCurrency(surchargesTotal)}
            </Typography>
          </LeftPanelTools.Item>
        ) : null}
        <LeftPanelTools.Item inline>
          <Typography color="secondary">{t(`${I18N_PATH}Taxes`)}:</Typography>
          <Typography
            variant="bodyLarge"
            textDecoration="underline dotted"
            onClick={openTaxesModal}
            tabIndex={0}
          >
            {formatCurrency(taxesTotal)}
          </Typography>
        </LeftPanelTools.Item>
        <LeftPanelTools.Item inline>
          <Typography color="secondary" fontWeight="bold">
            {t(`${I18N_PATH}GrandTotal`)}:
          </Typography>
          <Typography variant="bodyLarge" fontWeight="bold">
            {formatCurrency(grandTotal)}
          </Typography>
        </LeftPanelTools.Item>
      </Layouts.Box>
    </>
  );
};

export default observer(Summary);
