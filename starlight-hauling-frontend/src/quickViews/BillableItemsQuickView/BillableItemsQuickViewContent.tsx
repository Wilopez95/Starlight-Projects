import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormikHelpers, useFormik } from 'formik';
import { isEmpty, isEqual } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { QuickViewConfirmModal, QuickViewContent, useQuickViewContext } from '@root/common';
import { FormContainer } from '@root/components';
import { BillableItemActionEnum } from '@root/consts';
import { buildI18Path } from '@root/i18n/helpers';
import { useDuplicate } from '@root/pages/SystemConfiguration/hooks/useDuplicate';
import { IBillableService, ISurcharge } from '@root/types';
import { useBusinessContext, useScrollOnError, useStores } from '@hooks';

import BillableItemsQuickViewActions from './BillableItemsQuickViewActions';
import BillableItemsQuickViewRightPanel from './BillableItemsQuickViewRightPanel';
import { getDuplicateValues, getValidationSchema, getValues } from './formikData';
import { BillableItemType, EntityType, IBillableItemQuickView } from './types';

const I18N_PATH = buildI18Path(
  'pages.SystemConfiguration.tables.BusinessLinesConfiguration.tables.BillableItems.QuickView.BillableItemsQuickView.',
);

const BillableItemsQuickViewContent: React.FC<IBillableItemQuickView> = ({
  store,
  selectedTab,
  quickViewSubtitle,
}) => {
  const { t } = useTranslation();

  const { billableServiceStore, systemConfigurationStore } = useStores();

  const { forceCloseQuickView } = useQuickViewContext();
  const { businessLineId } = useBusinessContext();

  const selectedBillableItem = store.selectedEntity;
  const isCreating = systemConfigurationStore.isCreating;
  const isPreDuplicating = systemConfigurationStore.isPreDuplicating;
  const isDuplicating = systemConfigurationStore.isDuplicating;
  const isNew = isCreating || !selectedBillableItem;

  const [isLoading, setLoading] = useState(false);

  const getFormValues = useCallback(
    () => getValues(selectedTab, businessLineId, selectedBillableItem),
    [selectedTab, businessLineId, selectedBillableItem],
  );

  const [duplicate, setDuplicate] = useDuplicate(getFormValues, selectedBillableItem);

  const handleSubmit = useCallback(
    async (values: EntityType, formikHelpers: FormikHelpers<EntityType>) => {
      const formErrors = await formikHelpers.validateForm();

      if (!isEmpty(formErrors)) {
        systemConfigurationStore.togglePreDuplicating(false);

        return;
      }

      setLoading(true);
      if (selectedBillableItem && !isDuplicating) {
        await store.update(values as ISurcharge as never);
        if (isPreDuplicating && !store.isPreconditionFailed) {
          setDuplicate(values);

          return;
        }
      } else {
        if (store.selectedEntity?.description?.toLowerCase() === values.description.toLowerCase()) {
          return formikHelpers.setFieldError(
            'description',
            t(`${I18N_PATH.ValidationErrors}DescriptionUniq`),
          );
        }
        formikHelpers.setFieldValue('businessLineId', businessLineId);
        await store.create(values as ISurcharge as never);
      }
      if (!store.isPreconditionFailed) {
        forceCloseQuickView();
      }
      setLoading(false);
    },
    [
      t,
      store,
      isDuplicating,
      isPreDuplicating,
      selectedBillableItem,
      setDuplicate,
      systemConfigurationStore,
      businessLineId,
      forceCloseQuickView,
    ],
  );

  const formik = useFormik<EntityType>({
    validationSchema: getValidationSchema(
      selectedTab,
      store,
      t,
      I18N_PATH.ValidationErrors,
      isDuplicating,
    ),
    validateOnChange: false,
    enableReinitialize: true,
    initialValues: isDuplicating ? getDuplicateValues(selectedTab, duplicate) : getFormValues(),
    onSubmit: handleSubmit,
  });

  const { values, errors, isValidating, setFieldValue } = formik;

  const [initialData, setInitialData] = useState<IBillableService>(values as IBillableService);

  const checkChanges = useMemo(() => {
    return isEqual(values, initialData);
  }, [values, initialData]);

  useScrollOnError(errors, !isValidating);

  useEffect(() => {
    (async () => {
      if (
        selectedTab === BillableItemType.recurringService &&
        !isNew &&
        (values as IBillableService).action === BillableItemActionEnum.service &&
        !(values as IBillableService).frequencies &&
        !(values as IBillableService).oneTime
      ) {
        await billableServiceStore.requestFrequencies(values.id);

        if (!isEmpty(billableServiceStore.frequencies)) {
          const frequencies = billableServiceStore.frequencies.filter(frequency => frequency.id);

          setFieldValue('frequencies', frequencies);
          setInitialData(initial => ({
            ...((initial.id === values.id ? initial : values) as IBillableService),
            frequencies,
          }));
        }
      }
    })();
  }, [values, billableServiceStore, selectedTab, isNew, setFieldValue, setInitialData]);

  return (
    <FormContainer formik={formik}>
      <QuickViewContent
        dirty={formik.dirty ? !checkChanges : undefined}
        confirmModal={<QuickViewConfirmModal />}
        rightPanelElement={
          <BillableItemsQuickViewRightPanel
            store={store}
            selectedTab={selectedTab}
            quickViewSubtitle={quickViewSubtitle}
          />
        }
        actionsElement={
          <BillableItemsQuickViewActions
            store={store}
            selectedTab={selectedTab}
            isLoading={isLoading}
          />
        }
      />
    </FormContainer>
  );
};

export default observer(BillableItemsQuickViewContent);
