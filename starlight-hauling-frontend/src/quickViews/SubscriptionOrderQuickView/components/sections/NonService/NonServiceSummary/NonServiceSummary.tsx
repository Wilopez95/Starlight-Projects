import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Shadow, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import AppliedTaxesModal from '@root/components/modals/AppliedTaxesModal/AppliedTaxesModal';
import { useBoolean, useStores, useSubscriptionOrderPrices } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import SummaryItem from '@root/pages/CustomerSubscriptionDetails/components/Summary/SummaryItem/SummaryItem';

const width = '15rem';
const I18N_PATH = 'quickViews.SubscriptionOrderQuickView.components.sections.Summary.';

const NonServiceSummary: React.FC = () => {
  const { t } = useTranslation();
  const { subscriptionOrderStore } = useStores();
  const { formatCurrency } = useIntl();
  const subscriptionOrder = subscriptionOrderStore.selectedEntity;

  const subscriptionOrderPrices = useSubscriptionOrderPrices(subscriptionOrder);
  const [isTaxesModalOpen, openTaxesModal, closeTaxesModal] = useBoolean();

  const lineItemsTotal = subscriptionOrderPrices?.summary.lineItemsTotal;
  const taxes = subscriptionOrderPrices?.summary.taxesInfo.taxesTotal;
  const taxDistrictNames = subscriptionOrderPrices?.summary.taxesInfo.taxDistrictNames.join(', ');
  const grandTotal = subscriptionOrderPrices?.summary.grandTotal;

  return (
    <Layouts.Margin top="2">
      {subscriptionOrderPrices ? (
        <AppliedTaxesModal
          isOpen={isTaxesModalOpen}
          onClose={closeTaxesModal}
          taxesInfo={subscriptionOrderPrices.summary.taxesInfo}
        />
      ) : null}
      <Divider both />
      <Layouts.Flex justifyContent="space-between" alignItems="flex-start">
        <Typography variant="headerThree">{t(`${I18N_PATH}Summary`)}</Typography>
        <Layouts.Padding right="2">
          <SummaryItem
            label={`${t(`${I18N_PATH}LineItems`)}:`}
            price={lineItemsTotal}
            width={width}
          />
          <SummaryItem
            label={`${t(`${I18N_PATH}TaxDistrict`)}:`}
            value={taxDistrictNames}
            width={width}
          />
          <SummaryItem
            label={`${t(`${I18N_PATH}Taxes`)}:`}
            price={taxes}
            width={width}
            textDecoration="underline dotted"
            onClick={openTaxesModal}
            tabIndex={0}
          />
        </Layouts.Padding>
      </Layouts.Flex>
      <Layouts.Margin top="1">
        <Shadow
          as={Layouts.Box}
          variant="light"
          borderRadius="4px"
          backgroundColor="grey"
          backgroundShade="light"
        >
          <Layouts.Padding as={Layouts.Flex} padding="2" justifyContent="flex-end">
            <Typography fontWeight="bold">{t(`${I18N_PATH}GrandTotal`)}:</Typography>
            <Layouts.Box width={width}>
              <Typography textAlign="right" fontWeight="bold">
                {formatCurrency(grandTotal)}
              </Typography>
            </Layouts.Box>
          </Layouts.Padding>
        </Shadow>
      </Layouts.Margin>
    </Layouts.Margin>
  );
};

export default observer(NonServiceSummary);
