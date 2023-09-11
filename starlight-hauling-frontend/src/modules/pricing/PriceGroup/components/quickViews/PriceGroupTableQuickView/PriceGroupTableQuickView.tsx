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
import { handleEnterOrSpaceKeyDown } from '@root/helpers';
import { useBusinessContext, useCrudPermissions, useScrollOnError, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import {
  getDuplicateValues,
  getPriceGroupValidationSchema,
  getPriceGroupValues,
} from '@root/modules/pricing/PriceGroup/components/quickViews/components/PriceGroupForm/formikData';
import { IPriceGroup } from '@root/modules/pricing/types';
import { useDuplicate } from '@root/pages/SystemConfiguration/hooks/useDuplicate';

import { ButtonContainer } from '../../../../../../pages/SystemConfiguration/components';
import { PriceGroupsTab } from '../../PriceGroupTable/types';
import PriceGroupForm from '../components/PriceGroupForm/PriceGroupForm';

import styles from './css/styles.scss';

const I18N_PATH = 'modules.pricing.PriceGroup.components.quickViews.PriceGroupTableQuickView.Text.';

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
  const { priceGroupStoreNew, systemConfigurationStore, customRateStoreNew } = useStores();
  const intlConfig = useIntl();
  const { t } = useTranslation();

  const { businessUnitId, businessLineId } = useBusinessContext();

  const selectedPriceGroup = priceGroupStoreNew.selectedEntity;
  const isOpenRatesQuickView = customRateStoreNew.isOpenRatesQuickView;
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
    customRateStoreNew.toggleRatesQuickView();
  }, [customRateStoreNew]);

  const formik = useFormik({
    validationSchema: getPriceGroupValidationSchema(priceGroupStoreNew),
    enableReinitialize: true,
    validateOnChange: false,
    initialValues: isDuplicating ? getDuplicateValues(duplicate) : formValues,
    initialErrors: {},
    onSubmit: noop,
  });
  const { values, validateForm, setFieldError, dirty, errors, isValidating } = formik;

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
        serviceAreasIds:
          values.serviceAreasIds && !isEmpty(values.serviceAreasIds)
            ? Object.keys(values.serviceAreasIds)
                .filter(serviceAreaId => values.serviceAreasIds[serviceAreaId])
                .map(serviceAreaId => +serviceAreaId)
            : undefined,
      };

      if (selectedPriceGroup && !isDuplicating) {
        await priceGroupStoreNew.update(entity);
        if (isPreDuplicating) {
          closeConfirmModal?.();
          setDuplicate(values);

          return;
        }
      } else {
        if (
          priceGroupStoreNew.selectedEntity?.description?.toLowerCase() ===
          values.description.toLowerCase()
        ) {
          return setFieldError('description', 'Description must be unique');
        }
        if (isDuplicating) {
          priceGroupStoreNew.duplicate(entity.id, { ...entity, id: 0 });
        } else {
          await priceGroupStoreNew.create(entity);
          priceGroupStoreNew.cleanup();
          onRequest(currentTab.key);
        }
      }
      if (!priceGroupStoreNew.isPreconditionFailed) {
        onCancel(false);
      }
    },
    [
      validateForm,
      values,
      selectedPriceGroup,
      isDuplicating,
      priceGroupStoreNew,
      systemConfigurationStore,
      intlConfig.weekDays,
      isPreDuplicating,
      setDuplicate,
      setFieldError,
      onRequest,
      currentTab.key,
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
      store={priceGroupStoreNew}
      onCancel={handleCancelCreating}
      confirmModal={dirty ? !isOpenRatesQuickView : undefined}
      saveChanges={handlePriceGroupChange}
      clickOutHandler={isNew ? handleCancelCreating : undefined}
    >
      {({ onCancel, onDuplicate, onAddRef, scrollContainerHeight, tableQuickViewStyles }) => {
        const creationTitle = t(
          `${I18N_PATH}${isDuplicating ? 'DuplicatePriceGroup' : 'CreateNewPriceGroup'}`,
        );
        const title = isNew || !values.description ? creationTitle : values.description;
        const customerGroupName = selectedPriceGroup?.customerGroup?.description;
        const specificGroupName =
          !isDuplicating && customerGroupName ? t(`${I18N_PATH}SpecificGroupName`) : '';
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
                  onClick={() => onCancel}
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
                      {t(`${I18N_PATH}EditRackRates`)}
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
                isCreating={isNew}
                isDuplicating={isDuplicating}
                onSave={
                  canUpdatePriceGroups ? () => handlePriceGroupChange(() => onCancel) : undefined
                }
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
