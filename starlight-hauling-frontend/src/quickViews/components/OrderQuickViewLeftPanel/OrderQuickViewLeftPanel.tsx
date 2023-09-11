/* eslint-disable complexity */ // disabled because it will need a huge refactor
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, ISelectOption, Layouts } from '@starlightpro/shared-components';
import { useFormikContext, validateYupSchema, yupToFormErrors } from 'formik';
import { isEmpty, startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import {
  IOrderRatesCalculateRequest,
  IOrderSelectCustomRatesResponse,
  IOrderSelectGlobalRatesResponse,
  OrderService,
} from '@root/api';
import { EditIcon } from '@root/assets';
import { Badge, Protected, Switch, Typography } from '@root/common';
import { LeftPanelTools } from '@root/common/QuickView';
import { Divider } from '@root/common/TableTools';
import { TaxesCalculationModal } from '@root/components/modals';
import SurchargesCalculationModal from '@root/components/modals/SurchargesCalculation/SurchargesCalculationModal';
import { BusinessLineType } from '@root/consts';
import {
  calcOrderSurcharges,
  checkIfMaterialTaxable,
  getColorByStatus,
  getColorByWorkOrderStatus,
  getCurrentOrderTotal,
  handleEnterOrSpaceKeyDown,
  mapWorkOrderStatus,
  NotificationHelper,
} from '@root/helpers';
import { useBoolean, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { IConfigurableOrder, ITaxDistrict } from '@root/types';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { lineItemsValidationSchema } from '../../helpers/orderFormikData';
import ChangePromoModal from '../ChangePromoModal/ChangePromoModal';

import ChangeProjectModal from './ChangeProjectModal/ChangeProjectModal';
import { ILeftPanel } from './types';

import styles from './css/styles.scss';

const I18N_PATH = 'quickViews.components.OrderQuickViewLeftPanel.Text.';

const LeftPanel: React.FC<ILeftPanel> = ({ isEdit, setBillableServiceOptions }) => {
  const { projectStore, promoStore, orderStore, surchargeStore, billableServiceStore, i18nStore } =
    useStores();
  const { values, errors, setFieldValue, setErrors } = useFormikContext<IConfigurableOrder>();

  const [isProjectModalOpen, openProjectModal, closeProjectModal] = useBoolean();
  const [isPromoModalOpen, openPromoModal, closePromoModal] = useBoolean();
  const [isTaxesModalOpen, openTaxesModal, closeTaxesModal] = useBoolean();
  const [isSurchargesModalOpen, openSurchargesModal, closeSurchargesModal] = useBoolean();

  const { t } = useTranslation();
  const intl = useIntl();
  const { formatCurrency } = intl;

  const selectedOrder = orderStore.selectedEntity;

  useEffect(() => {
    (async () => {
      projectStore.cleanup();
      billableServiceStore.cleanup();

      if (values.customerJobSiteId) {
        projectStore.request({
          customerJobSiteId: values.customerJobSiteId,
        });
      }

      promoStore.request({
        businessLineId: values.businessLine.id.toString(),
        businessUnitId: values.businessUnit.id.toString(),
        activeOnly: true,
        excludeExpired: true,
      });

      const billableServices = await billableServiceStore.request({
        businessLineId: values.businessLine.id,
        oneTime: true,
        activeOnly: true,
      });

      const billableServiceOptions: ISelectOption[] | undefined = billableServices?.map(
        billableService => ({
          label: billableService.description,
          value: billableService.id,
          hint: billableService.equipmentItem?.shortDescription,
        }),
      );

      setBillableServiceOptions(billableServiceOptions);
    })();
  }, [
    projectStore,
    promoStore,
    setFieldValue,
    values.billableServiceId,
    values.businessLine.id,
    values.businessUnit.id,
    values.customerJobSiteId,
    billableServiceStore,
    t,
    setBillableServiceOptions,
  ]);

  const selectedGroup = useRef<
    IOrderSelectCustomRatesResponse | IOrderSelectGlobalRatesResponse | null
  >(null);

  useEffect(() => {
    (async () => {
      try {
        selectedGroup.current = await OrderService.selectRatesGroup({
          businessUnitId: String(values.businessUnit.id),
          businessLineId: String(values.businessLine.id),
          customerId: values.customerId,
          customerJobSiteId: values.customerJobSiteId,
          date: values.serviceDate,
          serviceAreaId: values.serviceArea?.originalId,
        });
      } catch (error) {
        selectedGroup.current = null;
        NotificationHelper.error('default');
      }
    })();
  }, [
    values.customerId,
    values.jobSiteId,
    values.serviceDate,
    values.serviceArea?.originalId,
    values.customerJobSiteId,
    values.businessUnit.id,
    values.businessLine.id,
  ]);

  const handleGetSurchargesRates = useCallback(async () => {
    const group = selectedGroup.current;

    if (group) {
      const payload: IOrderRatesCalculateRequest = {
        businessUnitId: values.businessUnit.id,
        businessLineId: values.businessLine.id,
        type: values.customRatesGroupId === 0 ? 'global' : group.level,
      };

      if (group.level === 'custom' && values.customRatesGroupId !== 0) {
        payload.customRatesGroupId = values.customRatesGroupId ?? undefined;
      }

      try {
        const rates = await OrderService.calculateRates(payload);

        if (rates) {
          const global = rates.globalRates;
          const custom = rates.customRates;

          setFieldValue('globalRatesSurcharges', global?.globalRatesSurcharges);
          setFieldValue('customRatesSurcharges', custom?.customRatesSurcharges);
        }
      } catch (error: unknown) {
        const typedError = error as ApiError;
        NotificationHelper.error('calculateServiceRates', typedError.response.code as ActionCode);
      }
    }
  }, [setFieldValue, values.businessLine.id, values.businessUnit.id, values.customRatesGroupId]);

  const handleChangeApplySurcharges = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = e.target;

      if (checked && !values.globalRatesSurcharges) {
        handleGetSurchargesRates();
      }
      setFieldValue(name, checked);
    },
    [handleGetSurchargesRates, setFieldValue, values.globalRatesSurcharges],
  );

  let promoDescription = 'None';
  const promo =
    values.promoId === values.promo?.id ? values.promo : promoStore.getById(values.promoId);

  if (promo) {
    promoDescription = `${promo.code}${promo.description ? `/${promo.description}` : ''} ${
      promo.note ? ` (${promo.note})` : ''
    }`;
  }

  const isOverrideDisabled =
    values.unlockOverrides && !(isEmpty(errors.lineItems) && isEmpty(errors.thresholds));

  const orderValues = orderStore.values.find(({ id }) => id === values.id);

  const badgeColor = getColorByStatus(values.status);
  const {
    serviceFee,
    billableItemsPrice,
    areTaxDistrictsPartial,
    taxesTotal,
    newOrderTotal,
    surchargesTotal,
  } = getCurrentOrderTotal({
    values,
    region: i18nStore.region,
    surcharges: surchargeStore.values,
    commercialTaxesUsed: !!selectedOrder?.commercialTaxesUsed,
  });
  const taxesProps = taxesTotal > 0 ? { onClick: openTaxesModal, underlined: true } : {};
  const surchargesProps =
    surchargesTotal > 0 ? { onClick: openSurchargesModal, underlined: true } : {};

  const handleKeyDown = (e: React.KeyboardEvent<HTMLOrSVGElement>, callback: () => void) => {
    if (handleEnterOrSpaceKeyDown(e)) {
      callback();
    }
  };

  useEffect(() => {
    (async () => {
      await surchargeStore.request({ businessLineId: values.businessLine.id });
    })();
  }, [surchargeStore, values.businessLine.id]);

  const handleChangeUnlockOverrides = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = e.target;

      if (!e.target.checked) {
        try {
          await validateYupSchema(values, lineItemsValidationSchema);
          setFieldValue(name, checked);
        } catch (err) {
          setErrors(yupToFormErrors(err));
        }
      } else {
        setFieldValue(name, checked);
      }
    },
    [setErrors, setFieldValue, values],
  );

  const fallback = '-';

  const materialId = values.materialId;

  const isMaterialTaxable = useMemo(
    () =>
      materialId && !areTaxDistrictsPartial
        ? values.taxDistricts?.some(district =>
            checkIfMaterialTaxable(
              values.businessLine.id,
              materialId,
              district as ITaxDistrict,
              true,
            ),
          )
        : false,
    [areTaxDistrictsPartial, materialId, values.businessLine.id, values.taxDistricts],
  );

  let lineItemsWithSurcharges = values.lineItems ?? [];
  let thresholdsWithSurcharges = values.thresholds ?? [];
  let serviceTotalWithSurcharges = serviceFee;

  if (values.applySurcharges) {
    ({ lineItemsWithSurcharges, serviceTotalWithSurcharges, thresholdsWithSurcharges } =
      calcOrderSurcharges({ order: values, surcharges: surchargeStore.values }));
  }

  return (
    <LeftPanelTools.Panel>
      {values.taxDistricts &&
      !areTaxDistrictsPartial &&
      (values.billableService || values.lineItems?.length) ? (
        <TaxesCalculationModal
          centered
          isOpen={isTaxesModalOpen}
          onClose={closeTaxesModal}
          isOrderCanceled={values.status === 'canceled'}
          businessLineId={values.businessLine.id.toString()}
          taxDistricts={values.taxDistricts as ITaxDistrict[]}
          serviceTotal={serviceTotalWithSurcharges}
          workOrder={values.workOrder}
          lineItems={lineItemsWithSurcharges}
          thresholds={thresholdsWithSurcharges}
          region={i18nStore.region}
          service={{
            billableServiceId: values.billableService?.originalId,
            materialId: values.materialId ?? undefined,
            hasServiceAppliedSurcharges: values.billableServiceApplySurcharges,
          }}
          serviceName={values.billableService?.description}
          materialName={values.material?.description}
          applySurcharges={values.applySurcharges}
          commercialTaxesUsed={!!selectedOrder?.commercialTaxesUsed}
        />
      ) : null}

      <ChangeProjectModal onClose={closeProjectModal} isOpen={isProjectModalOpen} />
      <ChangePromoModal
        onClose={closePromoModal}
        isOpen={isPromoModalOpen}
        businessUnitId={values.businessUnit.id}
        businessLineId={values.businessLine.id}
      />
      {surchargesTotal > 0 ? (
        <SurchargesCalculationModal
          isOpen={isSurchargesModalOpen}
          editOrder={values}
          centered
          onClose={closeSurchargesModal}
        />
      ) : null}
      <Layouts.Scroll>
        <LeftPanelTools.ItemsContainer>
          <LeftPanelTools.Item>
            <Typography fontWeight="bold" variant="bodyLarge">
              {t(`${I18N_PATH}OrderN`, { id: values.id })}
            </Typography>
            <div className={styles.badge}>
              <Badge color={badgeColor}>{startCase(values.status)}</Badge>
            </div>
          </LeftPanelTools.Item>

          {values.workOrder?.id ? (
            <LeftPanelTools.Item>
              <Typography color="secondary">{t(`${I18N_PATH}WorkOrder`)}:</Typography>
              <LeftPanelTools.Subitem className={styles.workOrder}>
                <Typography>
                  {+values.workOrder?.woNumber === -1
                    ? t('Text.Pending')
                    : values.workOrder?.woNumber}
                </Typography>
                <Badge
                  color={getColorByWorkOrderStatus(values.workOrder.status)}
                  className={styles.completedBadge}
                >
                  {mapWorkOrderStatus(values.workOrder.status)}
                </Badge>
              </LeftPanelTools.Subitem>
            </LeftPanelTools.Item>
          ) : null}

          <LeftPanelTools.Item>
            <Typography color="secondary">{t(`${I18N_PATH}LineOfBusiness`)}</Typography>
            <LeftPanelTools.Subitem>{orderValues?.businessLine?.name}</LeftPanelTools.Subitem>
          </LeftPanelTools.Item>

          <LeftPanelTools.Item>
            <Typography color="secondary">{t(`${I18N_PATH}ServiceArea`)}</Typography>
            <LeftPanelTools.Subitem>
              {orderValues?.serviceArea?.name ?? fallback}
            </LeftPanelTools.Subitem>
          </LeftPanelTools.Item>

          <LeftPanelTools.Item>
            <Typography color="secondary">{t(`${I18N_PATH}Customer`)}:</Typography>
            <LeftPanelTools.Subitem>{values.customerName}</LeftPanelTools.Subitem>
          </LeftPanelTools.Item>

          <LeftPanelTools.Item>
            <Typography color="secondary">{t(`${I18N_PATH}JobSiteAddress`)}:</Typography>
            <LeftPanelTools.Subitem>{values.jobSiteAddress}</LeftPanelTools.Subitem>
          </LeftPanelTools.Item>

          {values.thirdPartyHauler ? (
            <LeftPanelTools.Item>
              <Typography color="secondary">{t(`${I18N_PATH}3rdPartHauler`)}:</Typography>
              <LeftPanelTools.Subitem>{values.thirdPartyHauler.description}</LeftPanelTools.Subitem>
            </LeftPanelTools.Item>
          ) : null}

          <LeftPanelTools.Item>
            <Typography color="secondary">{t(`${I18N_PATH}TaxDistrict`)}:</Typography>
            <LeftPanelTools.Subitem>
              {values.taxDistricts?.length
                ? values.taxDistricts.map(({ description }) => description).join(', ')
                : 'None'}
            </LeftPanelTools.Subitem>
          </LeftPanelTools.Item>

          {!isEdit ? (
            <LeftPanelTools.Item>
              <Typography color="secondary">{t(`${I18N_PATH}Service`)}:</Typography>
              <LeftPanelTools.Subitem>
                {values.billableService?.description ?? t(`${I18N_PATH}NoBillableService`)}
              </LeftPanelTools.Subitem>
            </LeftPanelTools.Item>
          ) : null}

          {values.billableService?.action === 'relocate' &&
          values.businessLine.type !== BusinessLineType.portableToilets ? (
            <LeftPanelTools.Item>
              <Typography color="secondary">{t(`${I18N_PATH}RelocationAddress`)}:</Typography>
              <LeftPanelTools.Subitem>{values.jobSite2Address}</LeftPanelTools.Subitem>
            </LeftPanelTools.Item>
          ) : null}

          {values.billableService ? (
            <LeftPanelTools.Item tabIndex={0}>
              <Typography color="secondary">{t(`${I18N_PATH}Material`)}:</Typography>
              <LeftPanelTools.Subitem>
                {values.material?.description ?? t('Text.None')}
                {isMaterialTaxable ? (
                  <Layouts.Margin left="1">
                    <Badge color="secondary">{t(`${I18N_PATH}Taxable`)}</Badge>
                  </Layouts.Margin>
                ) : null}
              </LeftPanelTools.Subitem>
            </LeftPanelTools.Item>
          ) : null}

          <LeftPanelTools.Item tabIndex={0} editable onClick={openProjectModal}>
            <Typography color="secondary">{t(`${I18N_PATH}Project`)}:</Typography>
            <LeftPanelTools.Subitem>
              {projectStore.getById(values.projectId)?.description ?? t('Text.None')}
              <EditIcon
                role="button"
                aria-label={t('Text.Edit')}
                tabIndex={0}
                onKeyDown={(e: React.KeyboardEvent<HTMLOrSVGElement>) =>
                  handleKeyDown(e, openProjectModal)
                }
              />
            </LeftPanelTools.Subitem>
          </LeftPanelTools.Item>

          <LeftPanelTools.Item tabIndex={0} editable onClick={openPromoModal}>
            <Typography color="secondary">{t(`${I18N_PATH}Promo`)}:</Typography>
            <LeftPanelTools.Subitem>
              {promoDescription}
              <EditIcon
                role="button"
                aria-label={t('Text.Edit')}
                tabIndex={0}
                onKeyDown={(e: React.KeyboardEvent<HTMLOrSVGElement>) =>
                  handleKeyDown(e, openPromoModal)
                }
              />
            </LeftPanelTools.Subitem>
          </LeftPanelTools.Item>

          {values.rescheduleComment ? (
            <LeftPanelTools.Item>
              <Typography color="alert">{t(`${I18N_PATH}RescheduleComment`)}:</Typography>
              <LeftPanelTools.Subitem>{values.rescheduleComment}</LeftPanelTools.Subitem>
            </LeftPanelTools.Item>
          ) : null}

          {values.status === 'canceled' && values.cancellationReasonType ? (
            <LeftPanelTools.Item>
              <Typography color="alert">{t(`${I18N_PATH}CancellationReason`)}:</Typography>
              <LeftPanelTools.Subitem>{values.cancellationReasonType}</LeftPanelTools.Subitem>
            </LeftPanelTools.Item>
          ) : null}

          {values.status === 'completed' && values.unapprovedComment ? (
            <LeftPanelTools.Item>
              <Typography color="alert">{t(`${I18N_PATH}UnapproveComment`)}:</Typography>
              <LeftPanelTools.Subitem>{values.unapprovedComment}</LeftPanelTools.Subitem>
            </LeftPanelTools.Item>
          ) : null}

          {values.status === 'approved' && values.unfinalizedComment ? (
            <LeftPanelTools.Item>
              <Typography color="alert">{t(`${I18N_PATH}UnfinalizeComment`)}:</Typography>
              <LeftPanelTools.Subitem>{values.unfinalizedComment}</LeftPanelTools.Subitem>
            </LeftPanelTools.Item>
          ) : null}
        </LeftPanelTools.ItemsContainer>
      </Layouts.Scroll>
      <LeftPanelTools.ItemsContainer>
        <LeftPanelTools.Item>
          <Divider />
        </LeftPanelTools.Item>
        {isEdit ? (
          <LeftPanelTools.Item inline>
            <Checkbox
              id="applySurcharges"
              name="applySurcharges"
              value={values.applySurcharges}
              onChange={handleChangeApplySurcharges}
            >
              {t(`${I18N_PATH}ApplySurcharges`)}
            </Checkbox>
          </LeftPanelTools.Item>
        ) : null}
        <LeftPanelTools.Item inline>
          <Protected permissions="orders:unlock-overrides:perform">
            <Switch
              name="unlockOverrides"
              value={values.unlockOverrides}
              onChange={handleChangeUnlockOverrides}
              disabled={isOverrideDisabled}
            >
              {t(`${I18N_PATH}UnlockOverrides`)}
            </Switch>
          </Protected>
        </LeftPanelTools.Item>
        <LeftPanelTools.Item inline>
          <Typography color="secondary">{t(`${I18N_PATH}InitialOrderTotal`)}</Typography>
          <Typography variant="bodyLarge">{formatCurrency(values.initialGrandTotal)}</Typography>
        </LeftPanelTools.Item>
        <LeftPanelTools.Item inline>
          <Typography>{t(`${I18N_PATH}Service`)}</Typography>
          <Typography variant="bodyLarge">{formatCurrency(serviceFee)}</Typography>
        </LeftPanelTools.Item>

        <LeftPanelTools.Item inline>
          <Typography color="secondary">{t(`${I18N_PATH}BillableItems`)}:</Typography>
          <Typography variant="bodyLarge">{formatCurrency(billableItemsPrice)}</Typography>
        </LeftPanelTools.Item>

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
          <Typography variant="bodyLarge" {...taxesProps}>
            {formatCurrency(taxesTotal)}
          </Typography>
        </LeftPanelTools.Item>
        <LeftPanelTools.Item inline>
          <Typography color="secondary" fontWeight="bold">
            {t(`${I18N_PATH}GrandTotal`)}:
          </Typography>
          <Typography variant="bodyLarge" fontWeight="bold">
            {formatCurrency(newOrderTotal)}
          </Typography>
        </LeftPanelTools.Item>
      </LeftPanelTools.ItemsContainer>
    </LeftPanelTools.Panel>
  );
};

export default observer(LeftPanel);
