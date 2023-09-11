import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormikContext } from 'formik';
import { isEmpty } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { useQuickViewContext } from '@root/common';
import { ConfirmModal } from '@root/components/modals';
import { NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { useBoolean, useBusinessContext, useCrudPermissions, useStores } from '@root/hooks';
import { buildI18Path } from '@root/i18n/helpers';
import { ButtonContainer } from '@root/pages/SystemConfiguration/components';
import { ITaxDistrict, TaxGroup } from '@root/types';
import { AtLeast } from '@root/types/helpers/atLeast';

import TaxRatesQuickView from '../TaxRates/TaxRatesQuickView';

import { TaxDistrictForm } from './formikData';

const I18N_PATH = buildI18Path(
  'pages.SystemConfiguration.tables.TaxDistricts.QuickView.TaxDistrict.',
);

const TaxDistrictQuickViewActions: React.FC = () => {
  const { values, validateForm } = useFormikContext<TaxDistrictForm>();
  const { forceCloseQuickView, closeQuickView } = useQuickViewContext();
  const { businessLineId } = useBusinessContext();

  const [canViewBillableItems] = useCrudPermissions('configuration', 'billable-items');
  const [, canUpdateDistricts] = useCrudPermissions('configuration', 'tax-districts');
  const { t } = useTranslation();

  const { taxDistrictStore, systemConfigurationStore } = useStores();
  const [isNoMapCodeModalOpen, openNoMapCodeModal, closeNoMapCodeModal] = useBoolean();
  const [isRatesQuickViewOpen, openRatesQuickViewModal, closeRatesQuickViewModal] = useBoolean();
  const [isCommercialUsed, setIsCommercial] = useState<boolean>(true);

  const isCreatingAndConfiguring = useRef(false);

  const selectedTaxDistrict = taxDistrictStore.selectedEntity;
  const isCreating = systemConfigurationStore.isCreating;
  const isNew = isCreating || !selectedTaxDistrict;

  const [canViewDistricts] = useCrudPermissions('configuration', 'tax-districts');

  useEffect(() => {
    if (canViewDistricts) {
      selectedTaxDistrict?.id && taxDistrictStore.requestById(+selectedTaxDistrict.id);
    } else {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
    }
  }, [taxDistrictStore, canViewDistricts, selectedTaxDistrict?.id]);

  const handleConfigureTaxes = useCallback(
    async (isCommercial: boolean, emptyDistrictCodeConfirmed?: boolean) => {
      if (isCreating && !selectedTaxDistrict) {
        const formErrors = await validateForm();

        if (!isEmpty(formErrors)) {
          return;
        }

        setIsCommercial(isCommercial);

        if (!emptyDistrictCodeConfirmed && !values.districtCode) {
          isCreatingAndConfiguring.current = true;
          openNoMapCodeModal();

          return;
        }

        const taxDistrict = await taxDistrictStore.create({
          ...values,
          businessLineId: +businessLineId,
        } as Omit<ITaxDistrict, TaxGroup>);

        if (taxDistrict) {
          taxDistrictStore.selectEntity(taxDistrict);
          openRatesQuickViewModal();
        }
      }
    },
    [
      isCreating,
      openRatesQuickViewModal,
      openNoMapCodeModal,
      selectedTaxDistrict,
      taxDistrictStore,
      validateForm,
      values,
      businessLineId,
    ],
  );

  const handleTaxDistrictChange = useCallback(
    async (emptyDistrictCodeConfirmed?: boolean) => {
      closeNoMapCodeModal();

      const formErrors = await validateForm();

      if (!isEmpty(formErrors)) {
        return;
      }

      if (!emptyDistrictCodeConfirmed && !values.districtCode) {
        openNoMapCodeModal();

        return;
      }

      if (selectedTaxDistrict) {
        await taxDistrictStore.update({ ...values, businessLineId: +businessLineId } as AtLeast<
          ITaxDistrict,
          'id'
        >);
      } else {
        // TODO: fix it later
        delete (values as Partial<ITaxDistrict>).id;
        await taxDistrictStore.create({ ...values, businessLineId: +businessLineId } as Omit<
          ITaxDistrict,
          TaxGroup
        >);
      }
      if (!taxDistrictStore.isPreconditionFailed) {
        forceCloseQuickView();
      }
    },
    [
      closeNoMapCodeModal,
      validateForm,
      values,
      selectedTaxDistrict,
      taxDistrictStore,
      openNoMapCodeModal,
      businessLineId,
      forceCloseQuickView,
    ],
  );

  const handleOpenTaxRatesByCustomerType = useCallback(
    async (isCommercial: boolean) => {
      if (
        selectedTaxDistrict &&
        values?.taxesPerCustomerType !== selectedTaxDistrict.taxesPerCustomerType
      ) {
        await taxDistrictStore.update({ ...values, businessLineId: +businessLineId } as AtLeast<
          ITaxDistrict,
          'id'
        >);
      }

      setIsCommercial(isCommercial);

      openRatesQuickViewModal();
    },
    [businessLineId, openRatesQuickViewModal, selectedTaxDistrict, taxDistrictStore, values],
  );

  const handleNoMapCodeModalCancel = useCallback(() => {
    closeNoMapCodeModal();
    isCreatingAndConfiguring.current = false;
  }, [closeNoMapCodeModal]);

  const handleNoMapCodeModalSubmit = useCallback(() => {
    closeNoMapCodeModal();

    if (isCreatingAndConfiguring.current) {
      isCreatingAndConfiguring.current = false;
      handleConfigureTaxes(isCommercialUsed, true);

      return;
    }

    handleTaxDistrictChange(true);
  }, [isCommercialUsed, closeNoMapCodeModal, handleConfigureTaxes, handleTaxDistrictChange]);

  return (
    <>
      <ConfirmModal
        isOpen={isNoMapCodeModalOpen}
        nonDestructive
        cancelButton={t('Text.Cancel')}
        submitButton={t('Text.Save')}
        title={t(`${I18N_PATH.Text}MapCodeIsMissing`)}
        subTitle={t(`${I18N_PATH.Text}AreYouSure`)}
        onCancel={handleNoMapCodeModalCancel}
        onSubmit={handleNoMapCodeModalSubmit}
      />
      <TaxRatesQuickView
        commercialTaxesUsed={
          !values?.taxesPerCustomerType || (values?.taxesPerCustomerType && isCommercialUsed)
        }
        tableScrollContainerRef={{ current: document.body as HTMLDivElement }}
        condition={isRatesQuickViewOpen}
        store={taxDistrictStore}
        onClose={closeRatesQuickViewModal}
        shouldDeselect={false}
      />
      <ButtonContainer
        isCreating={isNew}
        submitButtonType="button"
        onSave={canUpdateDistricts ? () => handleTaxDistrictChange() : undefined}
        onCancel={closeQuickView}
        customCreateActions={
          // If the user has no access to billable items, they will not be able to configure anything.
          canViewBillableItems
            ? values?.taxesPerCustomerType
              ? [
                  {
                    buttonText: t(`${I18N_PATH.Text}ConfigureCommercialTaxes`),
                    handler: () => handleConfigureTaxes(true),
                  },
                  {
                    buttonText: t(`${I18N_PATH.Text}ConfigureNonCommercialTaxes`),
                    handler: () => handleConfigureTaxes(false),
                  },
                ]
              : [
                  {
                    buttonText: t(`${I18N_PATH.Text}SaveConfigureTaxes`),
                    handler: () => handleConfigureTaxes(true),
                  },
                ]
            : undefined
        }
        customEditActions={
          values?.taxesPerCustomerType
            ? [
                {
                  buttonText: t(`${I18N_PATH.Text}ConfigureCommercialTaxes`),
                  handler: () => handleOpenTaxRatesByCustomerType(true),
                },
                {
                  buttonText: t(`${I18N_PATH.Text}ConfigureNonCommercialTaxes`),
                  handler: () => handleOpenTaxRatesByCustomerType(false),
                },
              ]
            : [
                {
                  buttonText: t(`${I18N_PATH.Text}ConfigureTaxes`),
                  handler: () => handleOpenTaxRatesByCustomerType(true),
                },
              ]
        }
      />
    </>
  );
};

export default observer(TaxDistrictQuickViewActions);
