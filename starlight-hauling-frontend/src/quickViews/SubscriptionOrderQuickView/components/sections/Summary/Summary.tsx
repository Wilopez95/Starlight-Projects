import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Shadow, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import AppliedTaxesModal from '@root/components/modals/AppliedTaxesModal/AppliedTaxesModal';
import SurchargesViewModal from '@root/components/modals/SurchargesView/SurchargesViewModal';
import { useBoolean, useStores, useSubscriptionOrderPrices } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import SummaryItem from '@root/pages/CustomerSubscriptionDetails/components/Summary/SummaryItem/SummaryItem';
import { getServiceOrderById } from '@root/quickViews/SubscriptionOrderQuickView/helpers/helpers';
import { Subscription } from '@root/stores/subscription/Subscription';
import { SubscriptionOrder } from '@root/stores/subscriptionOrder/SubscriptionOrder';

const width = '15rem';
const I18N_PATH = 'quickViews.SubscriptionOrderQuickView.components.sections.Summary.';

const Summary: React.FC<{ subscription: Subscription; subscriptionOrder: SubscriptionOrder }> = ({
  subscription,
  subscriptionOrder,
}) => {
  const { surchargeStore } = useStores();
  const { t } = useTranslation();
  const { formatCurrency } = useIntl();
  const [isTaxesModalOpen, openTaxesModal, closeTaxesModal] = useBoolean();
  const [isSurchargesModalOpen, openSurchargesModal, closeSurchargesModal] = useBoolean();

  useEffect(() => {
    (async () => {
      if (subscriptionOrder?.businessLine?.id) {
        await surchargeStore.request({
          businessLineId: subscriptionOrder.businessLine.id,
          activeOnly: true,
        });
      }
    })();
  }, [surchargeStore, subscriptionOrder?.businessLine?.id]);

  const serviceOrder = useMemo(
    () => getServiceOrderById(subscription, subscriptionOrder),
    [subscription, subscriptionOrder],
  );

  const subscriptionOrderPrices = useSubscriptionOrderPrices(subscriptionOrder);

  if (!subscriptionOrderPrices) {
    return null;
  }

  if (!serviceOrder && !subscriptionOrder.oneTime) {
    return null;
  }

  const {
    subscriptionOrdersTotal,
    lineItemsTotal,
    grandTotal,
    surchargesTotal,
    total,
    taxesInfo,
    taxesInfo: { taxesTotal, taxDistrictNames },
  } = subscriptionOrderPrices.summary;

  const hasSurcharges = surchargesTotal > 0;

  const surchargesProps = hasSurcharges ? { onClick: openSurchargesModal, underlined: true } : {};

  return (
    <Layouts.Margin top="2">
      <AppliedTaxesModal
        isOpen={isTaxesModalOpen}
        onClose={closeTaxesModal}
        taxesInfo={taxesInfo}
      />
      {hasSurcharges && subscriptionOrderPrices?.summary ? (
        <SurchargesViewModal
          centered
          isOpen={isSurchargesModalOpen}
          onClose={closeSurchargesModal}
          surchargesData={subscriptionOrderPrices.summary}
        />
      ) : null}
      <Divider both />
      <Layouts.Flex justifyContent="space-between" alignItems="flex-start">
        <Typography variant="headerThree">{t(`${I18N_PATH}Summary`)}</Typography>
        <Layouts.Padding right="2">
          <SummaryItem
            label={`${t(`${I18N_PATH}Service`)}:`}
            price={subscriptionOrdersTotal}
            width={width}
          />
          <SummaryItem
            label={`${t(`${I18N_PATH}LineItems`)}:`}
            price={lineItemsTotal}
            width={width}
          />
          <SummaryItem label={`${t(`${I18N_PATH}Total`)}:`} price={total} width={width} />
          {subscriptionOrder.applySurcharges ? (
            <SummaryItem
              label={`${t(`${I18N_PATH}Surcharges`)}:`}
              price={surchargesTotal}
              width={width}
              {...surchargesProps}
            />
          ) : null}
          <SummaryItem
            label={`${t(`${I18N_PATH}TaxDistrict`)}:`}
            value={taxDistrictNames.join(', ')}
            width={width}
          />
          <SummaryItem
            label={`${t(`${I18N_PATH}Taxes`)}:`}
            price={taxesTotal}
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

export default observer(Summary);
