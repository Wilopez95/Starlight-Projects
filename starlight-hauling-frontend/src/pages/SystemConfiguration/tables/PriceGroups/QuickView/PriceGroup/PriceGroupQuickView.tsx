import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, NavigationConfigItem } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { capitalize, isEmpty, noop, pickBy } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { CrossIcon } from '@root/assets';
import { Typography } from '@root/common';
import { Divider, TableQuickView, withQuickView } from '@root/common/TableTools';
import { IBaseQuickView } from '@root/common/TableTools/TableQuickView/types';
import { FormContainer } from '@root/components';
import { PriceGroupForm } from '@root/components/forms';
import {
  getDuplicateValues,
  getPriceGroupValidationSchema,
  getPriceGroupValues,
} from '@root/components/forms/PriceGroup/formikData';
import { handleEnterOrSpaceKeyDown } from '@root/helpers';
import { useBusinessContext, useCrudPermissions, useScrollOnError, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { useDuplicate } from '@root/pages/SystemConfiguration/hooks/useDuplicate';
import { IPriceGroup } from '@root/types';

import { ButtonContainer } from '../../../../components';
import { PriceGroupsTab } from '../../types';

import styles from '../css/styles.scss';

interface IPriceGroupQuickView extends IBaseQuickView {
  currentTab: NavigationConfigItem<PriceGroupsTab>;
  onRequest(tab: PriceGroupsTab): void;
}

const PriceGroupQuickView: React.FC<IPriceGroupQuickView> = ({
  tableScrollContainerRef,
  tbodyContainerRef,
  newButtonRef,
  currentTab,
  onRequest,
}) => {
  const { priceGroupStore, systemConfigurationStore } = useStores();
  const intlConfig = useIntl();
  const { t } = useTranslation();

  const { businessUnitId, businessLineId } = useBusinessContext();

  const selectedPriceGroup = priceGroupStore.selectedEntity;
  const isOpenRatesQuickView = priceGroupStore.isOpenRatesQuickView;
  const isCreating = systemConfigurationStore.isCreating;
  const isPreDuplicating = systemConfigurationStore.isPreDuplicating;
  const isDuplicating = systemConfigurationStore.isDuplicating;
  const isNew = isCreating || !selectedPriceGroup;

  const formValues = useMemo(
    () =>
      getPriceGroupValues(
        { businessUnitId, businessLineId },
        currentTab.key,
        intlConfig,
        selectedPriceGroup,
      ),
    [businessUnitId, businessLineId, currentTab.key, intlConfig, selectedPriceGroup],
  );

  const [duplicate, setDuplicate] = useDuplicate(() => formValues, selectedPriceGroup);

  const handleCancelCreating = useCallback(() => {
    if (systemConfigurationStore.isCreating) {
      systemConfigurationStore.toggleCreating(false);
    }
    if (systemConfigurationStore.isDuplicating) {
      systemConfigurationStore.toggleDuplicating(false);
    }
  }, [systemConfigurationStore]);

  const handleOpenRates = useCallback(() => {
    priceGroupStore.toggleRatesQuickView();
  }, [priceGroupStore]);

  const formik = useFormik({
    validationSchema: getPriceGroupValidationSchema(priceGroupStore),
    enableReinitialize: true,
    validateOnChange: false,
    initialValues: isDuplicating ? getDuplicateValues(duplicate) : formValues,
    initialErrors: {},
    onSubmit: noop,
  });
  const { values, validateForm, setFieldError, dirty, errors, isValidating, resetForm } = formik;

  useScrollOnError(errors, !isValidating);

  const handlePriceGroupChange = useCallback(
    async (onCancel: (showModal?: boolean) => void, closeConfirmModal?: () => void) => {
      const formErrors = await validateForm();

      if (!isEmpty(formErrors)) {
        systemConfigurationStore.togglePreDuplicating(false);
        closeConfirmModal?.();

        return;
      }

      const entity: IPriceGroup = {
        ...values,
        validDays: Object.keys(pickBy(values.validDays)).map(dayKey => intlConfig.weekDays[dayKey]),
        serviceAreaIds:
          values.serviceAreaIds && !isEmpty(values.serviceAreaIds)
            ? Object.keys(values.serviceAreaIds)
                .filter(serviceAreaId => values.serviceAreaIds[serviceAreaId])
                .map(serviceAreaId => +serviceAreaId)
            : undefined,
      };

      if (selectedPriceGroup && !isDuplicating) {
        await priceGroupStore.update(entity);
        if (isPreDuplicating) {
          closeConfirmModal?.();
          setDuplicate(values);

          return;
        }
      } else {
        if (
          priceGroupStore.selectedEntity?.description?.toLowerCase() ===
          values.description.toLowerCase()
        ) {
          return setFieldError('description', 'Description must be unique');
        }
        if (isDuplicating) {
          priceGroupStore.duplicate(entity.id, { ...entity, id: 0 });
          systemConfigurationStore.toggleDuplicating(false);
        } else {
          await priceGroupStore.create(entity);
          priceGroupStore.cleanup();
          onRequest(currentTab.key);
        }
      }
      if (!priceGroupStore.isPreconditionFailed) {
        priceGroupStore.cleanup();
        resetForm();
        onCancel(false);
        systemConfigurationStore.toggleCreating(false);
      }
    },
    [
      validateForm,
      values,
      selectedPriceGroup,
      isDuplicating,
      priceGroupStore,
      systemConfigurationStore,
      intlConfig.weekDays,
      isPreDuplicating,
      setDuplicate,
      setFieldError,
      onRequest,
      currentTab.key,
      resetForm,
    ],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLOrSVGElement>, callback: () => void) => {
    if (handleEnterOrSpaceKeyDown(e)) {
      callback();
    }
  };
  const [_, canUpdatePriceGroups, canCreatePriceGroups] = useCrudPermissions(
    'configuration/price-groups',
    'price-groups',
  );

  return (
    <TableQuickView
      parentRef={tableScrollContainerRef}
      clickOutContainers={[tbodyContainerRef, newButtonRef]}
      store={priceGroupStore}
      onCancel={handleCancelCreating}
      confirmModal={dirty ? !isOpenRatesQuickView : undefined}
      saveChanges={handlePriceGroupChange}
      clickOutHandler={isNew ? handleCancelCreating : undefined}
    >
      {({ onCancel, onDuplicate, onAddRef, scrollContainerHeight, tableQuickViewStyles }) => {
        const creationTitle = `${(isDuplicating && 'Duplicate') || 'Create New'} Price Group`;
        const title = isNew || !values.description ? creationTitle : values.description;
        const customerGroupName = selectedPriceGroup?.customerGroup?.description;
        const specificGroupName =
          !isDuplicating && customerGroupName ? `for ${customerGroupName}s` : '';
        const subTitle = isNew ? 'Select Type' : specificGroupName;

        return (
          <>
            <div ref={onAddRef} className={styles.navigation}>
              <div className={tableQuickViewStyles.cancelButton}>
                <CrossIcon
                  tabIndex={0}
                  role="button"
                  aria-label={t('Text.Close')}
                  onKeyDown={e => handleKeyDown(e, onCancel)}
                  onClick={() => onCancel()}
                />
              </div>
              <div className={tableQuickViewStyles.dataContainer}>
                <div className={tableQuickViewStyles.quickViewTitle}>{capitalize(title)}</div>
                <div className={styles.subtitle}>
                  {subTitle ? (
                    <div className={tableQuickViewStyles.quickViewDescription}>{subTitle}</div>
                  ) : null}
                  {!isNew && !isDuplicating ? (
                    <Typography
                      cursor="pointer"
                      variant="bodyMedium"
                      color="information"
                      onClick={handleOpenRates}
                    >
                      Edit Rack Rates
                    </Typography>
                  ) : null}
                </div>
              </div>
              <Divider top />
            </div>
            <Layouts.Scroll height={scrollContainerHeight}>
              <Layouts.Padding padding="3">
                <FormContainer formik={formik} className={styles.formContainer}>
                  <PriceGroupForm />
                </FormContainer>
              </Layouts.Padding>
            </Layouts.Scroll>

            <div ref={onAddRef} className={styles.buttonsComponentContainer}>
              <Divider bottom />
              <ButtonContainer
                submitButtonType="button"
                isCreating={isNew}
                isDuplicating={isDuplicating}
                onSave={() => handlePriceGroupChange(() => onCancel())}
                disabled={!canUpdatePriceGroups}
                onCancel={onCancel}
                onDuplicate={canCreatePriceGroups ? onDuplicate : undefined}
              />
            </div>
          </>
        );
      }}
    </TableQuickView>
  );
};

export default withQuickView(observer(PriceGroupQuickView));
