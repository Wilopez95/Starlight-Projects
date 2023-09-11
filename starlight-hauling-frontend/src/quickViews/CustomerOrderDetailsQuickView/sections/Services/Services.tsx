import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { startCase } from 'lodash-es';

import { FilePreviewModal, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { IRescheduleOrderData } from '@root/components/forms/RescheduleOrder/types';
import { ConfirmModal, RescheduleOrderModal } from '@root/components/modals';
import { useBoolean, useStores, useToggle } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { Order } from '@root/stores/entities';

const I18N_PATH = 'quickViews.OrderDetailsView.sections.Services.Text.';
const fallback = '-';

const ServicesSection: React.FC = () => {
  const { orderStore } = useStores();
  const [isRescheduleModalOpen, toggleRescheduleModal] = useToggle();
  const [isModalOpen, openModal, closeModal] = useBoolean();
  const [isRatesNotFoundModalOpen, toggleRatesNotFoundModal] = useToggle();
  const { t } = useTranslation();

  const { values } = useFormikContext<Order>();
  const { formatDateTime, formatCurrency, currencySymbol } = useIntl();

  const date = formatDateTime(values.serviceDate).date;

  const handleRescheduleSubmit = useCallback(
    async (data: IRescheduleOrderData) => {
      await orderStore.reschedule(values, data);
      toggleRescheduleModal();

      if (orderStore.ratesError) {
        toggleRatesNotFoundModal();
        orderStore.cleanRatesError();
      } else {
        orderStore.requestDetails({
          orderId: values.id,
          edit: true,
        });
      }
    },
    [orderStore, values, toggleRescheduleModal, toggleRatesNotFoundModal],
  );

  return (
    <Layouts.Cell top={2}>
      {isRescheduleModalOpen ? (
        <RescheduleOrderModal
          isOpen={isRescheduleModalOpen}
          onClose={toggleRescheduleModal}
          onFormSubmit={handleRescheduleSubmit}
        />
      ) : null}
      <ConfirmModal
        isOpen={isRatesNotFoundModalOpen}
        title={t('components.modals.RescheduleOrderRatesNotFound.Text.Title')}
        cancelButton={t('Text.Close')}
        subTitle={t('components.modals.RescheduleOrderRatesNotFound.Text.SubTitle')}
        onCancel={toggleRatesNotFoundModal}
      />
      <Layouts.Grid gap="4" columns="250px repeat(6, 1fr)">
        <Layouts.Cell width={7}>
          <Typography variant="bodyLarge" fontWeight="bold">
            {t(`${I18N_PATH}Service`)}
          </Typography>
        </Layouts.Cell>
        <Layouts.Cell width={7}>
          <Layouts.Grid gap="4" columns="150px 150px 1fr">
            <Typography color="secondary" shade="desaturated">
              {t(`${I18N_PATH}ServiceDate`)}:
            </Typography>
            <span>{date}</span>
            {values.status === 'inProgress' ? (
              <Layouts.Margin left="auto">
                <Button onClick={toggleRescheduleModal}>Reschedule</Button>
              </Layouts.Margin>
            ) : null}
          </Layouts.Grid>
        </Layouts.Cell>
        <Layouts.Cell width={7}>
          <Divider bottom />
        </Layouts.Cell>
        {values.billableService ? (
          <>
            <Typography color="secondary" shade="desaturated">
              {t(`${I18N_PATH}Service`)}
            </Typography>
            <Typography color="secondary" shade="desaturated">
              {t(`${I18N_PATH}CanNumber`)}
            </Typography>
            <Typography color="secondary" shade="desaturated">
              {t(`${I18N_PATH}Material`)}
            </Typography>
            <Typography color="secondary" shade="desaturated">
              {t(`${I18N_PATH}QTY`)}
            </Typography>
            <Layouts.Cell width={3}>
              <Typography color="secondary" shade="desaturated" textAlign="right">
                {t(`${I18N_PATH}Total`, { currencySymbol })}
              </Typography>
            </Layouts.Cell>

            <span>{values.billableService.description}</span>
            <span>{values.equipmentItem?.shortDescription}</span>
            <span>{values.material?.description}</span>
            <span>1</span>
            <Layouts.Cell width={3}>
              <Typography textAlign="right">
                {formatCurrency(values.billableServiceTotal)}
              </Typography>
            </Layouts.Cell>
            <Layouts.Cell width={7}>
              <Divider bottom />
            </Layouts.Cell>
          </>
        ) : null}
        {values.manifestItems?.length > 0 ? (
          <>
            <Layouts.Cell width={7}>
              <Typography variant="bodyLarge" fontWeight="bold">
                {t(`${I18N_PATH}Manifests`)}
              </Typography>
            </Layouts.Cell>
            <Typography color="secondary" shade="desaturated">
              {t(`${I18N_PATH}ManifestNumber`)}
            </Typography>
            <Typography color="secondary" shade="desaturated">
              {t(`${I18N_PATH}Value`)}
            </Typography>
            <Typography color="secondary" shade="desaturated">
              {t(`${I18N_PATH}Unit`)}
            </Typography>
            <Typography color="secondary" shade="desaturated">
              {t(`${I18N_PATH}Material`)}
            </Typography>
            <Layouts.Cell width={3} />
            {values.manifestItems.map(manifestItem => (
              <React.Fragment key={manifestItem.id}>
                <FilePreviewModal
                  isOpen={isModalOpen}
                  onClose={closeModal}
                  fileName={`Manifest #${manifestItem.manifestNumber}`}
                  category="Manifest item"
                  author={manifestItem?.csrName ?? t('Text.Missed')}
                  timestamp={manifestItem.createdAt as Date}
                  src={manifestItem.url}
                  downloadSrc={manifestItem.url}
                  size="small"
                  withMeta
                />
                <Typography color="information" as="span" onClick={openModal}>
                  {manifestItem.manifestNumber}
                </Typography>
                <span>{manifestItem.quantity.toFixed(2)}</span>
                <span>{startCase(manifestItem.unitType)}</span>
                <span>{manifestItem.material.description}</span>
                <Layouts.Cell width={3} />
              </React.Fragment>
            ))}
            <Layouts.Cell width={7}>
              <Divider bottom />
            </Layouts.Cell>
          </>
        ) : null}
        {values.lineItems?.length > 0 || values.thresholds?.length ? (
          <>
            <Layouts.Cell width={7}>
              <Typography variant="bodyLarge" fontWeight="bold">
                {t(`${I18N_PATH}LineItems`)}
              </Typography>
            </Layouts.Cell>
            <Typography color="secondary" shade="desaturated">
              {t(`${I18N_PATH}Item`)}
            </Typography>
            <Typography color="secondary" shade="desaturated">
              {t(`${I18N_PATH}Material`)}
            </Typography>
            <Typography color="secondary" shade="desaturated">
              {t(`${I18N_PATH}ManifestNumber`)}
            </Typography>
            <Typography color="secondary" shade="desaturated">
              {t(`${I18N_PATH}Unit`)}
            </Typography>
            <Typography color="secondary" shade="desaturated">
              {t(`${I18N_PATH}QTY`)}
            </Typography>
            <Typography color="secondary" shade="desaturated">
              {t(`${I18N_PATH}Price`)}
            </Typography>
            <Typography color="secondary" shade="desaturated" textAlign="right">
              {t(`${I18N_PATH}Total`, { currencySymbol })}
            </Typography>
            {values.thresholds?.map(threshold => (
              <React.Fragment key={threshold.id}>
                <span>{startCase(threshold.threshold.type)}</span>
                <span>-</span>
                <span>-</span>
                <span>{startCase(threshold.threshold.unit)}</span>
                <span>{threshold.quantity}</span>
                <span>{formatCurrency(threshold.price)}</span>
                <Typography textAlign="right">
                  {formatCurrency((threshold.price ?? 0) * threshold.quantity)}
                </Typography>
              </React.Fragment>
            ))}
            {values.lineItems?.map(lineItem => (
              <React.Fragment key={lineItem.id}>
                <span>{lineItem.billableLineItem.description}</span>
                <span>{lineItem.material?.description ?? fallback}</span>
                <span>{lineItem.manifestNumber ?? fallback}</span>
                <span>{t(`${I18N_PATH}Each`)}</span>
                <span>{lineItem.quantity}</span>
                <span>{formatCurrency(lineItem.price)}</span>
                <Typography textAlign="right">
                  {formatCurrency((lineItem.price ?? 0) * lineItem.quantity)}
                </Typography>
              </React.Fragment>
            ))}

            <Layouts.Cell width={7}>
              <Divider bottom />
            </Layouts.Cell>
          </>
        ) : null}
      </Layouts.Grid>
    </Layouts.Cell>
  );
};

export default ServicesSection;
