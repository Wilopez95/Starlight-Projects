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

import { OverrideChangesModal } from './tabs/components/Modal/OverrideChangesModal';
import { bulkRatesValidationSchema, getBulkRatesValues } from './formikData';
import { defineTarget, filterRatesArray } from './helper';
import { EditTab, PreviewTab } from './tabs';
import { BulkRatesAffectedEntity } from './types';

import styles from './css/styles.scss';

const I18N_PATH_BASE = 'modules.pricing.CustomRate.components.CustomRateBulkEditQuickView.tabs.';
const I18N_PATH_MODAL = `${I18N_PATH_BASE}components.OverrideChangesModal.Text.`;
const I18N_PATH_EDIT_TAB = `${I18N_PATH_BASE}EditTab.Text.`;

const BulkPricingEdit: React.FC<IBaseQuickView> = ({
  tableScrollContainerRef,
  tbodyContainerRef,
  newButtonRef,
}) => {
  const { priceGroupStoreNew } = useStores();

  const isOpenBulkEditQuickView = priceGroupStoreNew.isOpenBulkEditQuickView;
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

  const updateBatch = useCallback(
    async (overridePrices = false) => {
      const data = values.edit;
      const priceValueMultiplier = data.direction === 'increase' ? 1 : -1;

      const result = await priceGroupStoreNew.updateBatch({
        businessLineId,
        businessUnitId,
        application: data.application,
        source: data.source,
        calculation: data.calculation,
        value: data.value * priceValueMultiplier,
        target: defineTarget(data.type),
        overridePrices,
        effectiveDate: data.effectiveDate,
        equipmentItems: filterRatesArray(data.equipmentItems),
        lineItems: filterRatesArray(data.lineItems),
        materials: filterRatesArray(data.materials),
        services: filterRatesArray(data.services),
        applyTo:
          data.application === BulkRatesAffectedEntity.customerGroups
            ? filterRatesArray(data.applyTo)
            : data.applyTo,
      });

      return result;
    },
    [businessLineId, businessUnitId, priceGroupStoreNew, values.edit],
  );

  const handleApplyClick = useCallback(
    async (onCancel: () => void) => {
      const formErrors = await validateForm();

      if (!isEmpty(formErrors)) {
        return;
      }

      const isPendingOverrideUpdates = await updateBatch();

      if (isPendingOverrideUpdates) {
        setOverrideModalIsOpened(true);

        return;
      }

      onCancel();
    },
    [updateBatch, validateForm],
  );

  useScrollOnError(errors, !isValidating);

  const handleClose = useCallback(() => {
    priceGroupStoreNew.toggleBulkEditQuickView(false);
  }, [priceGroupStoreNew]);

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
      onCancel={() => priceGroupStoreNew.toggleBulkEditQuickView()}
      confirmModal={dirty ? !isOpenBulkEditQuickView : undefined}
      clickOutHandler={handleClose}
      size={isPreviewMode ? 'three-quarters' : 'moderate'}
    >
      {({ onCancel, onAddRef, scrollContainerHeight, tableQuickViewStyles }) => {
        const title = isPreviewMode
          ? t(`${I18N_PATH_MODAL}PricingUpdatesPreview`)
          : t(`${I18N_PATH_EDIT_TAB}PricingUpdate`);

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
                        {t(`${I18N_PATH_EDIT_TAB}BackToPricingOptions`)}
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
                    onClick={() => onCancel}
                  />
                </div>
              </Layouts.Flex>
              <div className={tableQuickViewStyles.dataContainer}>
                <div className={tableQuickViewStyles.quickViewTitle}>{title}</div>
              </div>
            </div>
            <Divider top />
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
                  <Button type="reset" variant="converseAlert" onClick={onCancel}>
                    {t('Text.Cancel')}
                  </Button>
                  <Layouts.Flex>
                    {isPreviewMode ? (
                      <Button onClick={handleAdjustClick}>
                        {t(`${I18N_PATH_EDIT_TAB}AdjustPricing`)}
                      </Button>
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
