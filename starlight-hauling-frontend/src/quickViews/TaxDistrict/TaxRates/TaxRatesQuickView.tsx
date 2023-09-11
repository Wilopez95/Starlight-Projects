import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ISelectOption,
  Layouts,
  Navigation,
  NavigationConfigItem,
  Select,
} from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { isEmpty, noop, upperFirst } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { CrossIcon } from '@root/assets';
import { ClickOutHandler, Typography } from '@root/common';
import { Divider, TableQuickView, withQuickView } from '@root/common/TableTools';
import { FormContainer } from '@root/components';
import { BusinessLineType } from '@root/consts';
import { enableRecyclingFeatures, isCore } from '@root/consts/env';
import { generateTaxDistrictDescription, handleEnterOrSpaceKeyDown } from '@root/helpers';
import { useBoolean, useCrudPermissions, useScrollOnError, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { ButtonContainer } from '@root/pages/SystemConfiguration/components';
import useTabConfirmModal from '@root/pages/SystemConfiguration/hooks/useTabConfirmModal';
import { TaxGroup } from '@root/types';

import styles from '../css/taxRatesStyles.scss';
import TaxDescriptionConfirm from './TaxDescriptionConfirm/TaxDescriptionConfirm';
import TaxRatesForm from './TaxRatesForm/TaxRatesForm';
import { getTaxRatesNavigationConfig } from './configs';
import { mapFormToTax, mapTaxToForm, validationSchema } from './formikData';
import { ITaxRatesQuickView, TaxGroupItem, TaxRatesConfigType } from './types';

const TaxRatesQuickView: React.FC<ITaxRatesQuickView> = ({
  tableScrollContainerRef,
  onClose,
  commercialTaxesUsed,
}) => {
  const {
    taxDistrictStore,
    lineItemStore,
    materialStore,
    billableServiceStore,
    businessLineStore,
    thresholdStore,
  } = useStores();
  const [isConfirmModalOpen, openConfirmModal, closeConfirmModal] = useBoolean();
  const { t } = useTranslation();
  const intlConfig = useIntl();

  const [, canUpdateDistricts] = useCrudPermissions('configuration', 'tax-districts');

  const businessLinesOptions: ISelectOption[] = businessLineStore.sortedValues
    .filter(({ type }) => commercialTaxesUsed || type !== BusinessLineType.recycling)
    .reduce((acc: ISelectOption[], businessLine) => {
      if (!businessLine.active) {
        return acc;
      }

      return [...acc, { label: businessLine.name, value: businessLine.id }] as ISelectOption[];
    }, []);

  const [businessLineId, setBusinessLineId] = useState<number>(+businessLinesOptions[0].value || 0);

  const isRollOff = businessLineStore.isRollOffType(businessLineId);
  const isRecycling = businessLineStore.isRecyclingType(businessLineId);
  const taxRatesNavigationConfig = useMemo(
    () => getTaxRatesNavigationConfig(t, isRollOff, isRecycling),
    [t, isRollOff, isRecycling],
  );

  const [currentTab, setCurrentTab] = useState<NavigationConfigItem<TaxRatesConfigType>>(
    taxRatesNavigationConfig[0],
  );

  useEffect(() => {
    setCurrentTab(taxRatesNavigationConfig[0]);
  }, [taxRatesNavigationConfig]);

  const handleBusinessLineTypeChange = useCallback((_: string, value: number) => {
    setBusinessLineId(value);
  }, []);

  const selectedTaxDistrict = taxDistrictStore.selectedEntity;
  const selectedTaxes = selectedTaxDistrict?.businessConfiguration?.find(
    district => +district.businessLineId === +businessLineId,
  );

  const selectedTax = useMemo(() => {
    if (selectedTaxes) {
      const key = `${commercialTaxesUsed ? 'commercial' : 'nonCommercial'}${upperFirst(
        currentTab.key,
      )}` as TaxGroup;

      return selectedTaxes[key];
    }

    return undefined;
  }, [currentTab.key, selectedTaxes, commercialTaxesUsed]);

  const taxDescriptionDirty = !selectedTaxDistrict?.useGeneratedDescription;

  const activeStore = useMemo(() => {
    switch (currentTab.key) {
      case 'services':
      case 'recurringServices':
        return billableServiceStore;
      case 'materials':
        return materialStore;
      case 'lineItems':
      case 'recurringLineItems':
        return lineItemStore;
      default:
        return null;
    }
  }, [currentTab.key, billableServiceStore, lineItemStore, materialStore]);

  useEffect(() => {
    activeStore?.cleanup();

    if (currentTab.key === 'lineItems') {
      thresholdStore.cleanup();
    }

    switch (currentTab.key) {
      case 'services':
        activeStore?.request({ businessLineId, oneTime: true });
        break;
      case 'recurringServices':
        activeStore?.request({ businessLineId, oneTime: false });
        break;
      case 'materials':
        materialStore.request({ businessLineId });
        break;
      case 'lineItems':
        activeStore?.request({ businessLineId, oneTime: true });
        thresholdStore.request({ businessLineId: String(businessLineId) });
        break;
      case 'recurringLineItems':
        activeStore?.request({ businessLineId, oneTime: false });
        break;
      default:
        break;
    }
  }, [businessLineId, currentTab.key, activeStore, materialStore, thresholdStore]);

  const items = useMemo(
    () =>
      currentTab.key !== 'lineItems'
        ? activeStore?.sortedValues
        : [...thresholdStore.sortedValues, ...lineItemStore.sortedValues],
    [
      currentTab.key,
      activeStore?.sortedValues,
      lineItemStore.sortedValues,
      thresholdStore.sortedValues,
    ],
  );

  const formik = useFormik({
    validationSchema: validationSchema(t),
    enableReinitialize: true,
    validateOnChange: false,
    initialValues: mapTaxToForm(currentTab.key, items as TaxGroupItem[], selectedTax),
    initialErrors: {},
    onSubmit: noop,
  });
  const { values, resetForm, validateForm, dirty, errors, isValidating } = formik;

  useScrollOnError(errors, !isValidating);

  const [isTabModalOpen, handleTabModalCancel, closeTabModal, handleTabChange] = useTabConfirmModal(
    dirty,
    setCurrentTab as (tab: NavigationConfigItem) => void,
    resetForm,
  );

  const handleTaxRatesChange = useCallback(
    async (updateDescription = false, closeConfirmModalFunc?: () => void) => {
      const formErrors = await validateForm();

      if (!isEmpty(formErrors)) {
        closeConfirmModalFunc?.();

        return false;
      }

      if (selectedTaxDistrict) {
        const tax = mapFormToTax(values);

        taxDistrictStore.updateTaxDistrictRates(
          commercialTaxesUsed,
          selectedTaxDistrict.id,
          businessLineId,
          currentTab.key,
          tax,
        );
        selectedTaxDistrict.setTax(currentTab.key, commercialTaxesUsed, businessLineId, tax);

        if (updateDescription || selectedTaxDistrict?.useGeneratedDescription) {
          taxDistrictStore.update({
            id: selectedTaxDistrict.id,
            taxDescription: generateTaxDistrictDescription(
              selectedTaxDistrict,
              businessLineStore.values,
              intlConfig,
            ),
          });
        }
      }

      return true;
    },
    [
      validateForm,
      selectedTaxDistrict,
      values,
      taxDistrictStore,
      commercialTaxesUsed,
      businessLineId,
      currentTab.key,
      businessLineStore.values,
      intlConfig,
    ],
  );

  const handleConfirmModalCancel = useCallback(() => {
    closeConfirmModal();
    onClose();
  }, [closeConfirmModal, onClose]);

  const handleConfirmModalSave = useCallback(
    async (updateDescription?: boolean) => {
      const isSuccessful = await handleTaxRatesChange(updateDescription, closeTabModal);

      if (isSuccessful) {
        handleTabModalCancel();
      } else {
        closeTabModal();
      }
      closeConfirmModal();
    },
    [closeConfirmModal, closeTabModal, handleTabModalCancel, handleTaxRatesChange],
  );

  const handleSilentSaveChanges = useCallback(
    async (updateDescription?: boolean) => {
      const isSuccessful = await handleTaxRatesChange(updateDescription, closeConfirmModal);

      closeConfirmModal();
      closeTabModal();
      if (isSuccessful) {
        onClose();
      }
    },
    [closeConfirmModal, closeTabModal, handleTaxRatesChange, onClose],
  );

  const handleQuickViewChanges = useCallback(async () => {
    if (taxDescriptionDirty && dirty) {
      openConfirmModal();
    } else {
      await handleSilentSaveChanges(selectedTaxDistrict?.useGeneratedDescription);
    }
  }, [
    dirty,
    handleSilentSaveChanges,
    openConfirmModal,
    selectedTaxDistrict?.useGeneratedDescription,
    taxDescriptionDirty,
  ]);

  const handleCancel = useCallback(() => {
    if (dirty || (dirty && taxDescriptionDirty)) {
      openConfirmModal();
    } else {
      onClose();
    }
  }, [dirty, onClose, openConfirmModal, taxDescriptionDirty]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLOrSVGElement>, callback: () => void) => {
    if (handleEnterOrSpaceKeyDown(e)) {
      callback();
    }
  };

  const loading = activeStore?.loading;

  return (
    <TableQuickView
      parentRef={tableScrollContainerRef}
      closeOnClickOut={false}
      store={taxDistrictStore}
      size="half"
    >
      {({ onAddRef, scrollContainerHeight, tableQuickViewStyles }) => {
        return (
          <ClickOutHandler onClickOut={handleCancel} skipModal>
            <TaxDescriptionConfirm
              taxDescriptionDirty={taxDescriptionDirty}
              isOpen={isTabModalOpen}
              onClose={handleTabModalCancel}
              onTaxRatesSave={handleConfirmModalSave}
            />
            <TaxDescriptionConfirm
              taxDescriptionDirty={taxDescriptionDirty}
              isOpen={isConfirmModalOpen}
              onClose={handleConfirmModalCancel}
              onTaxRatesSave={handleSilentSaveChanges}
            />
            <div ref={onAddRef} className={styles.navigation}>
              <div className={tableQuickViewStyles.cancelButton}>
                <CrossIcon
                  tabIndex={0}
                  role="button"
                  aria-label={t('Text.Close')}
                  onKeyDown={e => handleKeyDown(e, handleCancel)}
                  onClick={handleCancel}
                />
              </div>
              <Layouts.Flex>
                <div className={tableQuickViewStyles.dataContainer}>
                  <div className={tableQuickViewStyles.quickViewTitle}>
                    {selectedTaxDistrict?.description}
                  </div>
                </div>
                {!isCore || enableRecyclingFeatures ? (
                  <Layouts.Flex flexGrow={1} alignItems="center" justifyContent="flex-end">
                    <Typography as="label" htmlFor="lineOfBusiness" className={styles.label}>
                      Line of Business
                    </Typography>
                    <Layouts.Box
                      className={tableQuickViewStyles.spaceLeft}
                      maxWidth="250px"
                      width="100%"
                    >
                      <Select
                        name="lineOfBusiness"
                        options={businessLinesOptions}
                        value={businessLineId}
                        onSelectChange={handleBusinessLineTypeChange}
                        nonClearable
                        noErrorMessage
                      />
                    </Layouts.Box>
                  </Layouts.Flex>
                ) : null}
              </Layouts.Flex>
              <Navigation
                activeTab={currentTab}
                configs={taxRatesNavigationConfig}
                onChange={handleTabChange}
              />
            </div>
            <Layouts.Scroll className={styles.scrollContainer} height={scrollContainerHeight - 90}>
              <Layouts.Padding padding="3" as={Layouts.Box} width="100%">
                <FormContainer formik={formik} className={styles.wrapper}>
                  <TaxRatesForm
                    isRollOffType={isRollOff}
                    currentTab={currentTab}
                    showGroupTaxes={values.group}
                    loading={loading ?? false}
                  />
                </FormContainer>
              </Layouts.Padding>
            </Layouts.Scroll>

            <div ref={onAddRef} className={tableQuickViewStyles.buttonContainer}>
              <Divider bottom />
              <ButtonContainer
                submitButtonType="button"
                onSave={canUpdateDistricts ? handleQuickViewChanges : undefined}
                onCancel={onClose}
              />
            </div>
          </ClickOutHandler>
        );
      }}
    </TableQuickView>
  );
};

export default withQuickView(observer(TaxRatesQuickView));
