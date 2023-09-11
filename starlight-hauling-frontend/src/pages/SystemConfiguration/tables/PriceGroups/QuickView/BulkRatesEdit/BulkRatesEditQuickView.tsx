import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { isEmpty, noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { ArrowLeftIcon, CrossIcon } from '@root/assets';
import { Typography } from '@root/common';
import { Divider, TableQuickView, withQuickView } from '@root/common/TableTools';
import { IBaseQuickView } from '@root/common/TableTools/TableQuickView/types';
import { FormContainer } from '@root/components';
import { handleEnterOrSpaceKeyDown } from '@root/helpers';
import { useBusinessContext, useScrollOnError, useStores } from '@root/hooks';

import styles from '../css/styles.scss';
import { OverrideChangesModal } from './tabs/components/Modal/OverrideChangesModal';
import { bulkRatesValidationSchema, getBulkRatesValues } from './formikData';
import { defineTarget, filterRatesArray } from './helper';
import { EditTab, PreviewTab } from './tabs';
import { BulkRatesAffectedEntity } from './types';

const I18N_PATH =
  'pages.SystemConfiguration.tables.PriceGroups.QuickView.BulkRatesEdit.BulkRatesEditQuickView.';

const BulkPricingEdit: React.FC<IBaseQuickView> = ({
  tableScrollContainerRef,
  tbodyContainerRef,
  newButtonRef,
}) => {
  const { priceGroupStore } = useStores();

  const isOpenBulkEditQuickView = priceGroupStore.isOpenBulkEditQuickView;
  const [isPreviewMode, setPreviewModeTab] = useState(false);
  const { businessLineId, businessUnitId } = useBusinessContext();
  const { t } = useTranslation();
  const formik = useFormik({
    validationSchema: bulkRatesValidationSchema,
    enableReinitialize: true,
    validateOnChange: false,
    initialValues: getBulkRatesValues(),
    initialErrors: {},
    onSubmit: noop,
  });

  const { values, dirty, errors, isValidating, validateForm } = formik;

  const handlePreviewClick = useCallback(() => {
    setPreviewModeTab(true);
  }, []);

  const handleBackLinkClick = useCallback(() => {
    setPreviewModeTab(false);
  }, []);

  const handleAdjustClick = useCallback(() => {
    setPreviewModeTab(false);
  }, []);

  const [overrideModalIsOpened, setOverrideModalIsOpened] = useState<boolean>(false);

  const checkPendingUpdates = useCallback(async () => {
    const data = values.edit;
    const priceValueMultiplier = data.direction === 'increase' ? 1 : -1;

    const result = await priceGroupStore.checkPendingUpdates({
      ...data,
      businessLineId,
      businessUnitId,
      value: data.value * priceValueMultiplier,
      target: defineTarget(data.type),
      equipmentItems: filterRatesArray(data.equipmentItems),
      lineItems: filterRatesArray(data.lineItems),
      materials: filterRatesArray(data.materials),
      services: filterRatesArray(data.services),
      pairCustomerIds: filterRatesArray(data.pairCustomerIds),
      applyTo:
        data.application === BulkRatesAffectedEntity.customerGroups
          ? filterRatesArray(data.applyTo)
          : data.applyTo,
      checkPendingUpdates: true,
    });

    return result;
  }, [businessLineId, businessUnitId, priceGroupStore, values.edit]);

  const updateBatch = useCallback(
    async (overrideUpdates = false) => {
      const data = values.edit;
      const priceValueMultiplier = data.direction === 'increase' ? 1 : -1;

      const result = await priceGroupStore.updateBatch({
        ...data,
        businessLineId,
        businessUnitId,
        value: data.value * priceValueMultiplier,
        target: defineTarget(data.type),
        equipmentItems: filterRatesArray(data.equipmentItems),
        lineItems: filterRatesArray(data.lineItems),
        materials: filterRatesArray(data.materials),
        services: filterRatesArray(data.services),
        pairCustomerIds: filterRatesArray(data.pairCustomerIds),
        applyTo:
          data.application === BulkRatesAffectedEntity.customerGroups
            ? filterRatesArray(data.applyTo)
            : data.applyTo,
        overrideUpdates,
        checkPendingUpdates: false,
      });

      return result;
    },
    [businessLineId, businessUnitId, priceGroupStore, values.edit],
  );

  const handleApplyClick = useCallback(
    async (onCancel: () => void) => {
      const formErrors = await validateForm();

      if (!isEmpty(formErrors)) {
        return;
      }

      const isPendingOverrideUpdates = await checkPendingUpdates();

      if (isPendingOverrideUpdates) {
        setOverrideModalIsOpened(true);

        return;
      }

      updateBatch();
      onCancel();
    },
    [checkPendingUpdates, updateBatch, validateForm],
  );

  useScrollOnError(errors, !isValidating);

  const handleClose = useCallback(() => {
    priceGroupStore.toggleBulkEditQuickView(false);
  }, [priceGroupStore]);

  const isPreviewDisabled = useMemo(() => {
    return (
      !values.edit.value || (values.edit.applyTo ?? []).length === 0 || !values.edit.effectiveDate
    );
  }, [values.edit]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLOrSVGElement>, callback: () => void) => {
    if (handleEnterOrSpaceKeyDown(e)) {
      callback();
    }
  };

  return (
    <TableQuickView
      parentRef={tableScrollContainerRef}
      clickOutContainers={[tbodyContainerRef, newButtonRef]}
      onCancel={() => priceGroupStore.toggleBulkEditQuickView()}
      confirmModal={dirty ? !isOpenBulkEditQuickView : undefined}
      clickOutHandler={handleClose}
      size={isPreviewMode ? 'three-quarters' : 'moderate'}
    >
      {({ onCancel, onAddRef, scrollContainerHeight, tableQuickViewStyles }) => {
        const title = isPreviewMode
          ? t(`${I18N_PATH}PricingUpdatesPreview`)
          : t(`${I18N_PATH}PricingUpdate`);

        return (
          <>
            <div ref={onAddRef} className={styles.navigation}>
              <Layouts.Flex
                justifyContent={isPreviewMode ? 'space-between' : 'flex-end'}
                alignItems="flex-start"
              >
                {isPreviewMode ? (
                  <Typography
                    variant="bodyMedium"
                    color="information"
                    cursor="pointer"
                    onClick={handleBackLinkClick}
                  >
                    <Layouts.Margin top="3" bottom="2">
                      <Layouts.Flex alignItems="center">
                        <Layouts.Margin right="1">
                          <ArrowLeftIcon />
                        </Layouts.Margin>
                        {t(`${I18N_PATH}BackToPricingOptions`)}
                      </Layouts.Flex>
                    </Layouts.Margin>
                  </Typography>
                ) : null}
                <div className={tableQuickViewStyles.cancelButton}>
                  <CrossIcon
                    tabIndex={0}
                    role="button"
                    aria-label={t('Text.Close')}
                    onKeyDown={e => handleKeyDown(e, onCancel)}
                    onClick={handleClose}
                  />
                </div>
              </Layouts.Flex>
              <div className={tableQuickViewStyles.dataContainer}>
                <div className={tableQuickViewStyles.quickViewTitle}>{title}</div>
              </div>
            </div>
            <Layouts.Scroll height={scrollContainerHeight}>
              <Layouts.Padding padding="3" as={Layouts.Box} height="100%">
                <FormContainer className={styles.formContainer} formik={formik}>
                  {isPreviewMode ? <PreviewTab /> : <EditTab />}
                </FormContainer>
              </Layouts.Padding>
            </Layouts.Scroll>
            <div ref={onAddRef}>
              <Divider bottom />
              <Layouts.Padding padding="3" top="0">
                <Layouts.Flex justifyContent="space-between">
                  <Button type="reset" variant="converseAlert" onClick={handleClose}>
                    {t('Text.Cancel')}
                  </Button>
                  <Layouts.Flex>
                    {isPreviewMode ? (
                      <Button onClick={handleAdjustClick}>{t(`${I18N_PATH}AdjustPricing`)}</Button>
                    ) : (
                      <Button onClick={handlePreviewClick} disabled={isPreviewDisabled}>
                        {t('Text.Preview')}
                      </Button>
                    )}
                    <Layouts.Margin left="3">
                      <Button
                        type="submit"
                        variant="primary"
                        onClick={() => handleApplyClick(onCancel)}
                      >
                        {t('Text.ApplyChanges')}
                      </Button>
                    </Layouts.Margin>
                  </Layouts.Flex>
                </Layouts.Flex>
              </Layouts.Padding>
            </div>
            <OverrideChangesModal
              isOpened={overrideModalIsOpened}
              closeBulkUpdate={onCancel}
              setIsOpened={setOverrideModalIsOpened}
              onBulkUpdate={updateBatch}
            />
          </>
        );
      }}
    </TableQuickView>
  );
};

export default withQuickView(observer(BulkPricingEdit));
