import React, { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { EditIcon } from '@root/assets';
import { Badge, Typography } from '@root/common';
import { Divider, LeftPanelTools } from '@root/common/TableTools';
import AppliedTaxesModal from '@root/components/modals/AppliedTaxesModal/AppliedTaxesModal';
import {
  useBoolean,
  useBusinessContext,
  useScrollContainerHeight,
  useStores,
  useSubscriptionOrderFormPrices,
} from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import ChangePromoModal from '@root/quickViews/components/ChangePromoModal/ChangePromoModal';
import { UnlockOverrides } from '@root/quickViews/SubscriptionOrderEdit/components/UnlockOverrides/UnlockOverrides';
import { IConfigurableSubscriptionOrder, SubscriptionOrderStatusEnum } from '@root/types';

const I18N_PATH = 'quickViews.SubscriptionNonServiceOrderEditQuickView.components.LeftPanel.';

const LeftPanel: React.FC = () => {
  const { subscriptionOrderStore, subscriptionStore, promoStore } = useStores();

  const { t } = useTranslation();
  const { formatCurrency } = useIntl();
  const { businessUnitId } = useBusinessContext();
  const containerRef = useRef<HTMLDivElement>(null);

  const subscriptionOrder = subscriptionOrderStore.selectedEntity;
  const subscription = subscriptionStore.selectedEntity;

  const { values } = useFormikContext<IConfigurableSubscriptionOrder>();

  const subscriptionOrderPrices = useSubscriptionOrderFormPrices();
  const fallback = t(`${I18N_PATH}None`);
  const [isPromoModalOpen, openPromoModal, closePromoModal] = useBoolean();
  const [isTaxesModalOpen, openTaxesModal, closeTaxesModal] = useBoolean();

  const initialOrderTotal = subscriptionOrderPrices?.summary.total;
  const lineItemsTotal = subscriptionOrderPrices?.summary.lineItemsTotal;
  const taxDistrictNames = subscriptionOrderPrices?.summary.taxesInfo.taxDistrictNames.join(', ');
  const taxesTotal = subscriptionOrderPrices?.summary.taxesInfo.taxesTotal;
  const grandTotal = subscriptionOrderPrices?.summary.grandTotal;

  const promoDescription = useMemo(() => {
    const promo =
      values.promoId === values.promo?.id ? values.promo : promoStore.getById(values.promoId);

    if (promo) {
      return `${promo.code}${promo.description ? `/${promo.description}` : ''} ${
        promo.note ? ` (${promo.note})` : ''
      }`;
    }

    return fallback;
  }, [fallback, promoStore, values.promo, values.promoId]);

  const { scrollContainerHeight } = useScrollContainerHeight({ containerRef });

  return (
    <Layouts.Flex
      as={Layouts.Box}
      ref={containerRef}
      height="100%"
      direction="column"
      justifyContent="space-between"
    >
      <ChangePromoModal
        onClose={closePromoModal}
        isOpen={isPromoModalOpen}
        businessLineId={values.businessLineId}
        businessUnitId={+businessUnitId}
      />
      {subscriptionOrderPrices ? (
        <AppliedTaxesModal
          isOpen={isTaxesModalOpen}
          onClose={closeTaxesModal}
          taxesInfo={subscriptionOrderPrices.summary.taxesInfo}
        />
      ) : null}
      <Layouts.Scroll maxHeight={scrollContainerHeight}>
        <LeftPanelTools.ItemsContainer>
          <LeftPanelTools.Item>
            <Typography variant="headerThree">
              {t(`${I18N_PATH}NonServiceOrder`)} #{subscriptionOrder?.id}
            </Typography>
            <Layouts.Margin top="2">
              <Badge borderRadius={2} color={subscriptionOrder?.statusColor}>
                {subscriptionOrder
                  ? t(`consts.SubscriptionOrderStatuses.${subscriptionOrder.statusLabel}`)
                  : ''}
              </Badge>
            </Layouts.Margin>
          </LeftPanelTools.Item>
          <Divider />
          <LeftPanelTools.Item>
            <Typography color="secondary">{t(`${I18N_PATH}LineOfBusiness`)}</Typography>
            <LeftPanelTools.Subitem>
              {subscription?.businessLine.name ?? fallback}
            </LeftPanelTools.Subitem>
          </LeftPanelTools.Item>
          <LeftPanelTools.Item>
            <Typography color="secondary">{t(`${I18N_PATH}ServiceArea`)}</Typography>
            <LeftPanelTools.Subitem>
              {subscription?.serviceArea?.name ?? fallback}
            </LeftPanelTools.Subitem>
          </LeftPanelTools.Item>
          <LeftPanelTools.Item>
            <Typography color="secondary">{t(`${I18N_PATH}Customer`)}</Typography>
            <LeftPanelTools.Subitem>
              {subscriptionOrder?.customer?.name ?? fallback}
            </LeftPanelTools.Subitem>
          </LeftPanelTools.Item>
          <LeftPanelTools.Item>
            <Typography color="secondary">{t(`${I18N_PATH}JobSiteAddress`)}</Typography>
            <LeftPanelTools.Subitem>
              {subscriptionOrder?.jobSiteAddress ?? fallback}
            </LeftPanelTools.Subitem>
          </LeftPanelTools.Item>
          <LeftPanelTools.Item>
            <Typography color="secondary">{t(`${I18N_PATH}TaxDistrict`)}</Typography>
            <LeftPanelTools.Subitem>
              {subscription?.taxDistricts?.map(({ description }) => description).join(', ') ??
                fallback}
            </LeftPanelTools.Subitem>
          </LeftPanelTools.Item>
          <LeftPanelTools.Item onClick={openPromoModal} editable>
            <Typography color="secondary">{t(`${I18N_PATH}Promo`)}:</Typography>
            <LeftPanelTools.Subitem>
              {promoDescription}
              <EditIcon />
            </LeftPanelTools.Subitem>
          </LeftPanelTools.Item>
          {values.status === SubscriptionOrderStatusEnum.completed && values.unapprovedComment ? (
            <LeftPanelTools.Item>
              <Typography color="alert">{t(`Text.UnapprovedComment`)}:</Typography>
              <LeftPanelTools.Subitem>{values.unapprovedComment}</LeftPanelTools.Subitem>
            </LeftPanelTools.Item>
          ) : null}
          {values.status === SubscriptionOrderStatusEnum.approved && values.unfinalizedComment ? (
            <LeftPanelTools.Item>
              <Typography color="alert">{t(`Text.UnfinalizedComment`)}:</Typography>
              <LeftPanelTools.Subitem>{values.unfinalizedComment}</LeftPanelTools.Subitem>
            </LeftPanelTools.Item>
          ) : null}
        </LeftPanelTools.ItemsContainer>
      </Layouts.Scroll>
      <LeftPanelTools.ItemsContainer>
        <LeftPanelTools.Item inline>
          <UnlockOverrides />
        </LeftPanelTools.Item>
        <LeftPanelTools.Item inline>
          <Typography color="secondary">{t(`${I18N_PATH}InitialOrderTotal`)}</Typography>
          <Typography variant="bodyLarge">{formatCurrency(initialOrderTotal)}</Typography>
        </LeftPanelTools.Item>
        {!!values.lineItems?.length || !!values.newLineItems?.length ? (
          <LeftPanelTools.Item inline>
            <Typography color="secondary">{t(`${I18N_PATH}LineItems`)}</Typography>
            <Typography variant="bodyLarge">{formatCurrency(lineItemsTotal)}</Typography>
          </LeftPanelTools.Item>
        ) : null}

        <LeftPanelTools.Item inline>
          <Typography color="secondary">{t(`${I18N_PATH}TaxDistrict`)}:</Typography>
          <Typography variant="bodyLarge" textAlign="right">
            {taxDistrictNames}
          </Typography>
        </LeftPanelTools.Item>
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
      </LeftPanelTools.ItemsContainer>
    </Layouts.Flex>
  );
};

export default observer(LeftPanel);
