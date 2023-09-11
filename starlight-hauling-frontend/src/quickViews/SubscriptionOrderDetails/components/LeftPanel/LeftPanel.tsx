import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ISelectOption, Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { groupBy } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { EditIcon } from '@root/assets';
import { Badge, Typography } from '@root/common';
import { LeftPanelTools } from '@root/common/QuickView';
import { Divider } from '@root/common/TableTools';
import AppliedTaxesModal from '@root/components/modals/AppliedTaxesModal/AppliedTaxesModal';
import { useIntl } from '@root/i18n/useIntl';
import ChangePromoModal from '@root/quickViews/components/ChangePromoModal/ChangePromoModal';
import { UnlockOverrides } from '@root/quickViews/SubscriptionOrderEdit/components/UnlockOverrides/UnlockOverrides';
import { IConfigurableSubscriptionOrder, SubscriptionOrderStatusEnum } from '@root/types';
import { useBoolean, useBusinessContext, useStores, useSubscriptionOrderPrices } from '@hooks';

import ChangeMaterialModal from './ChangeMaterialModal/ChangeMaterialModal';

import styles from './css/styles.scss';

const I18N_PATH = 'quickViews.SubscriptionOrderDetails.components.LeftPanel.LeftPanel.Text.';

const LeftPanel: React.FC = () => {
  const {
    subscriptionOrderStore,
    subscriptionStore,
    materialStore,
    subscriptionWorkOrderStore,
    promoStore,
  } = useStores();
  const { t } = useTranslation();
  const { formatCurrency } = useIntl();
  const { values, setFieldValue } = useFormikContext<IConfigurableSubscriptionOrder>();
  const { businessUnitId } = useBusinessContext();

  const [isPromoModalOpen, openPromoModal, closePromoModal] = useBoolean();
  const [isMaterialModalOpen, openMaterialModal, closeMaterialModal] = useBoolean();
  const [isTaxesModalOpen, openTaxesModal, closeTaxesModal] = useBoolean();

  const subscriptionOrder = subscriptionOrderStore.selectedEntity!;
  const subscription = subscriptionStore.selectedEntity;
  const subscriptionOrderPrices = useSubscriptionOrderPrices(subscriptionOrder);

  const workOrders = subscriptionWorkOrderStore.valuesBySubscriptionOrderId(subscriptionOrder.id);
  const isNonService = values.noBillableService;

  useEffect(() => {
    if (!isNonService && subscription?.id && !workOrders.length) {
      subscriptionWorkOrderStore.request({
        subscriptionOrderId: subscriptionOrder.id,
        subscriptionId: subscription.id,
      });
    }
  }, [
    subscription?.id,
    workOrders.length,
    subscriptionWorkOrderStore,
    subscriptionOrder.id,
    isNonService,
  ]);

  useEffect(() => {
    (async () => {
      if (values.billableServiceId) {
        const materials = await materialStore.request({
          businessLineId: values.businessLineId.toString(),
          activeOnly: true,
        });

        const materialOptions: ISelectOption[] | undefined = materials?.map(material => ({
          label: material.description,
          value: material.id,
          hint: material.manifested ? t(`${I18N_PATH}Manifested`) : '',
        }));

        setFieldValue('materialOptions', materialOptions);
      }
    })();
  }, [materialStore, setFieldValue, values.billableServiceId, values.businessLineId, t]);

  const subscriptionOrdersTotal = subscriptionOrderPrices?.summary.subscriptionOrdersTotal ?? 0;
  const lineItemsTotal = subscriptionOrderPrices?.summary.lineItemsTotal ?? 0;
  const grandTotal = subscriptionOrderPrices?.summary.grandTotal ?? 0;
  const taxDistrictNames = subscriptionOrderPrices?.summary.taxesInfo.taxDistrictNames.join(', ');
  const taxesTotal = subscriptionOrderPrices?.summary.taxesInfo.taxesTotal ?? 0;

  const oneTime = subscriptionOrder.oneTime;

  const fallback = t(`${I18N_PATH}None`);

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

  const WOStatuses = useMemo(() => {
    if (isNonService || !workOrders.length) {
      return null;
    }

    const groupedWorkOrders = groupBy(workOrders, 'statusLabel');

    return Object.entries(groupedWorkOrders).map(([key, value]) => {
      const workOrder = value[0];

      return (
        <LeftPanelTools.Subitem key={key} className={styles.workOrder}>
          <Typography>
            {value.length} WO{value.length > 1 ? 's' : ''}
          </Typography>
          <Badge color={workOrder.statusColor} className={styles.completedBadge}>
            {workOrder.statusLabel}
          </Badge>
        </LeftPanelTools.Subitem>
      );
    });
  }, [workOrders, isNonService]);

  useEffect(() => {
    setFieldValue('grandTotal', grandTotal);
  }, [grandTotal, setFieldValue]);

  const isNeedsApproval = subscriptionOrder.status === SubscriptionOrderStatusEnum.needsApproval;
  const statusColor = subscriptionOrder.statusColor;

  return (
    <LeftPanelTools.Panel>
      <ChangeMaterialModal onClose={closeMaterialModal} isOpen={isMaterialModalOpen} />
      {subscriptionOrderPrices ? (
        <AppliedTaxesModal
          isOpen={isTaxesModalOpen}
          onClose={closeTaxesModal}
          taxesInfo={subscriptionOrderPrices.summary.taxesInfo}
        />
      ) : null}
      <ChangePromoModal
        onClose={closePromoModal}
        isOpen={isPromoModalOpen}
        businessUnitId={+businessUnitId}
        businessLineId={values.businessLineId}
      />
      <Layouts.Scroll>
        <LeftPanelTools.ItemsContainer>
          <LeftPanelTools.Item>
            {isNonService ? (
              <Typography variant="headerThree">
                {t(`${I18N_PATH}NonServiceOrder`)} #{subscriptionOrder?.id}
              </Typography>
            ) : (
              <Typography variant="headerThree">
                {t(`${I18N_PATH}Subscription`)} {!oneTime ? t(`${I18N_PATH}Servicing`) : null}{' '}
                {t(`${I18N_PATH}Order`)} #{subscriptionOrder.id}
              </Typography>
            )}
            <Layouts.Margin top="2">
              <Badge
                borderRadius={2}
                color={statusColor}
                bgColor={isNeedsApproval ? 'grey' : statusColor}
                shade={isNeedsApproval ? 'light' : 'standard'}
                bgShade={isNeedsApproval ? 'light' : 'desaturated'}
              >
                {t(`consts.SubscriptionOrderStatuses.${subscriptionOrder.statusLabel}`)}
              </Badge>
            </Layouts.Margin>
          </LeftPanelTools.Item>

          <Divider />

          {!isNonService && workOrders.length ? (
            <LeftPanelTools.Item>
              <Typography color="secondary">{t(`${I18N_PATH}WorkOrder`)}:</Typography>
              {WOStatuses}
            </LeftPanelTools.Item>
          ) : null}

          <LeftPanelTools.Item>
            <Typography color="secondary" shade="light" variant="bodyMedium">
              {t(`${I18N_PATH}LineOfBusiness`)}
            </Typography>
            <LeftPanelTools.Subitem>
              <Typography variant="bodyMedium" shade="dark">
                {subscription?.businessLine.name}
              </Typography>
            </LeftPanelTools.Subitem>
          </LeftPanelTools.Item>

          <LeftPanelTools.Item>
            <Typography color="secondary" shade="light" variant="bodyMedium">
              {t(`${I18N_PATH}ServiceArea`)}
            </Typography>
            <LeftPanelTools.Subitem>
              <Typography variant="bodyMedium" shade="dark">
                {subscription?.serviceArea?.name ?? fallback}
              </Typography>
            </LeftPanelTools.Subitem>
          </LeftPanelTools.Item>

          <LeftPanelTools.Item>
            <Typography color="secondary" shade="light" variant="bodyMedium">
              {t(`${I18N_PATH}Customer`)}
            </Typography>
            <LeftPanelTools.Subitem>
              <Typography variant="bodyMedium" shade="dark">
                {subscriptionOrder?.customer?.name ?? fallback}
              </Typography>
            </LeftPanelTools.Subitem>
          </LeftPanelTools.Item>

          <LeftPanelTools.Item>
            <Typography color="secondary" shade="light" variant="bodyMedium">
              {t(`${I18N_PATH}JobSiteAddress`)}
            </Typography>
            <LeftPanelTools.Subitem>
              <Typography variant="bodyMedium" shade="dark">
                {subscriptionOrder?.jobSiteAddress || fallback}
              </Typography>
            </LeftPanelTools.Subitem>
          </LeftPanelTools.Item>

          <LeftPanelTools.Item>
            <Typography color="secondary" shade="light" variant="bodyMedium">
              {t(`${I18N_PATH}TaxDistrict`)}
            </Typography>
            <LeftPanelTools.Subitem>
              <Typography variant="bodyMedium" shade="dark">
                {taxDistrictNames}
              </Typography>
            </LeftPanelTools.Subitem>
          </LeftPanelTools.Item>

          {!isNonService ? (
            <LeftPanelTools.Item>
              <Typography color="secondary" shade="light" variant="bodyMedium">
                {t(`${I18N_PATH}Service`)}
              </Typography>
              <LeftPanelTools.Subitem>
                <Typography variant="bodyMedium" shade="dark">
                  {values.billableService?.description ?? t(`${I18N_PATH}NoBillableService`)}
                </Typography>
              </LeftPanelTools.Subitem>
            </LeftPanelTools.Item>
          ) : null}

          {values.billableService && !isNonService ? (
            <LeftPanelTools.Item editable onClick={openMaterialModal}>
              <Typography color="secondary">{t(`${I18N_PATH}Material`)}:</Typography>
              <LeftPanelTools.Subitem>
                {materialStore.getById(values.materialId)?.description ?? t('Text.None')}{' '}
                <EditIcon />
              </LeftPanelTools.Subitem>
            </LeftPanelTools.Item>
          ) : null}

          <LeftPanelTools.Item editable onClick={openPromoModal}>
            <Typography color="secondary" shade="light" variant="bodyMedium">
              {t(`${I18N_PATH}Promo`)}
            </Typography>
            <LeftPanelTools.Subitem>
              <Typography variant="bodyMedium" shade="dark">
                {promoDescription} <EditIcon />
              </Typography>
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
        <LeftPanelTools.Item>
          <Divider />
        </LeftPanelTools.Item>
        <LeftPanelTools.Item>
          <UnlockOverrides />
        </LeftPanelTools.Item>
        <LeftPanelTools.Item inline>
          <Typography shade="dark">{t(`${I18N_PATH}InitialOrderTotal`)}:</Typography>
          <Typography shade="dark" variant="bodyLarge">
            {formatCurrency(subscriptionOrdersTotal)}
          </Typography>
        </LeftPanelTools.Item>
        <LeftPanelTools.Item inline>
          <Typography shade="dark">{t(`${I18N_PATH}Service`)}</Typography>
          <Typography shade="dark" variant="bodyLarge">
            {formatCurrency(subscriptionOrdersTotal)}
          </Typography>
        </LeftPanelTools.Item>
        {!!values.lineItems?.length || !!values.newLineItems?.length ? (
          <LeftPanelTools.Item inline>
            <Typography shade="dark">{t(`${I18N_PATH}LineItems`)}</Typography>
            <Typography shade="dark" variant="bodyLarge">
              {formatCurrency(lineItemsTotal)}
            </Typography>
          </LeftPanelTools.Item>
        ) : null}
        <LeftPanelTools.Item inline>
          <Typography shade="dark">{t(`${I18N_PATH}Taxes`)}:</Typography>
          <Typography
            shade="dark"
            variant="bodyLarge"
            textDecoration="underline dotted"
            onClick={openTaxesModal}
            tabIndex={0}
          >
            {formatCurrency(taxesTotal)}
          </Typography>
        </LeftPanelTools.Item>
        <LeftPanelTools.Item inline>
          <Typography shade="dark">{t(`${I18N_PATH}GrandTotal`)}:</Typography>
          <Typography shade="dark" variant="headerFour">
            {formatCurrency(grandTotal)}
          </Typography>
        </LeftPanelTools.Item>
      </LeftPanelTools.ItemsContainer>
    </LeftPanelTools.Panel>
  );
};

export default observer(LeftPanel);
