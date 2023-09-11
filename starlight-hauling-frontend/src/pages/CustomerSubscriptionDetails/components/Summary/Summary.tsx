import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Shadow, Typography } from '@root/common';
import AppliedTaxesModal from '@root/components/modals/AppliedTaxesModal/AppliedTaxesModal';
import NextSubscriptionPrice from '@root/components/NextSubscriptionPrice/NextSubscriptionPrice';
import SubscriptionPrice from '@root/components/SubscriptionPrice/SubscriptionPrice';
import { useBoolean, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import {
  getSubscriptionBillableLineItems,
  getSubscriptionBillableServices,
} from '@root/stores/subscription/helpers';

import SummaryItem from './SummaryItem/SummaryItem';

const I18N_PATH = 'pages.CustomerSubscriptionDetails.components.Summary.Summary.Text.';
const width = '100px';

const Summary: React.FC = () => {
  const { subscriptionStore, subscriptionDraftStore } = useStores();
  const { formatCurrency } = useIntl();
  const { t } = useTranslation();
  const [isTaxesModalOpen, openTaxesModal, closeTaxesModal] = useBoolean();

  const subscription = subscriptionStore.selectedEntity ?? subscriptionDraftStore.selectedEntity;
  const proration = subscription?.proration ?? null;

  const billableServices = useMemo(() => {
    return subscription ? getSubscriptionBillableServices(subscription) : [];
  }, [subscription]);

  const billableLineItems = useMemo(() => {
    return subscription ? getSubscriptionBillableLineItems(subscription) : [];
  }, [subscription]);

  if (!proration) {
    // TODO: render skeleton
    return null;
  }

  const taxDistricts = proration.taxesInfo.taxDistrictNames.join(', ');
  const taxDistrictsCount = proration.taxesInfo.taxDistrictNames.length;

  return (
    <Layouts.Margin top="2">
      <AppliedTaxesModal
        isOpen={isTaxesModalOpen}
        onClose={closeTaxesModal}
        taxesInfo={proration.taxesInfo}
      />
      <Layouts.Flex justifyContent="space-between" alignItems="flex-start">
        <Typography variant="headerThree">{t(`${I18N_PATH}Summary`)}</Typography>
        <Layouts.Padding right="2">
          <SummaryItem
            label={t(`${I18N_PATH}BillingCycle`)}
            value={startCase(subscription?.billingCycle)}
            width={width}
            fontWeight="bold"
          />
          <SubscriptionPrice
            proration={proration}
            billableServices={billableServices}
            billableLineItems={billableLineItems}
          />
          <SummaryItem
            label={`${t('Text.Service')}:`}
            price={proration.serviceTotal}
            width={width}
          />
          <SummaryItem
            label={`${t('Text.RecurringLineItem')}:`}
            price={proration.lineItemsTotal}
            width={width}
          />
          <SummaryItem
            label={`${t('Text.SubscriptionOrder')}:`}
            price={proration.subscriptionOrdersTotal}
            width={width}
          />
          <NextSubscriptionPrice
            proration={proration}
            billableServices={billableServices}
            billableLineItems={billableLineItems}
          />
          <SummaryItem
            label={`${t('Text.TaxDistrict', { count: taxDistrictsCount })}:`}
            value={taxDistricts}
            width={width}
          />
          <SummaryItem
            label={`${t(`${I18N_PATH}Taxes`)}:`}
            price={proration.taxesInfo.taxesTotal}
            width={width}
            onClick={openTaxesModal}
            textDecoration="underline dotted"
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
                {formatCurrency(proration.grandTotal)}
              </Typography>
            </Layouts.Box>
          </Layouts.Padding>
        </Shadow>
      </Layouts.Margin>
    </Layouts.Margin>
  );
};

export default observer(Summary);
