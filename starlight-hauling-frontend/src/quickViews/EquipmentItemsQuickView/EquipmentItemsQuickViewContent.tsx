import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormikHelpers, useFormik } from 'formik';
import { isEmpty } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { QuickViewConfirmModal, QuickViewContent, useQuickViewContext } from '@root/common';
import { FormContainer } from '@root/components';
import { equipmentItemTypeByBusinessLine } from '@root/consts/businessLineEquipment';
import { buildI18Path } from '@root/i18n/helpers';
import { useDuplicate } from '@root/pages/SystemConfiguration/hooks/useDuplicate';
import { EquipmentItemWithImage } from '@root/types';
import { useBusinessContext, useScrollOnError, useStores } from '@hooks';

import EquipmentItemsQuickViewActions from './EquipmentItemsQuickViewActions';
import { EquipmentItemsQuickViewContentRightPanel } from './EquipmentItemsQuickViewContentRightPanel';
import { generateValidationSchema, getDuplicateValues, getValues } from './formikData';

const I18N_PATH = buildI18Path(
  'pages.SystemConfiguration.tables.BusinessLinesConfiguration.tables.EquipmentItems.QuickView.EquipmentItemsQuickView.',
);

const EquipmentItemsQuickViewContent: React.FC = () => {
  const { t } = useTranslation();
  const { equipmentItemStore, systemConfigurationStore, businessLineStore } = useStores();
  const { forceCloseQuickView } = useQuickViewContext();
  const { businessLineId } = useBusinessContext();
  const businessLine = businessLineStore.getById(businessLineId);
  const equipmentItemType = businessLine
    ? equipmentItemTypeByBusinessLine[businessLine.type]
    : undefined;

  const selectedEquipmentItem = equipmentItemStore.selectedEntity;
  const isPreDuplicating = systemConfigurationStore.isPreDuplicating;
  const isDuplicating = systemConfigurationStore.isDuplicating;

  const [isLoading, setLoading] = useState(false);

  const getFormValues = useCallback(
    () => getValues({ businessLineId, type: equipmentItemType }, selectedEquipmentItem),
    [businessLineId, equipmentItemType, selectedEquipmentItem],
  );

  const [duplicate, setDuplicate] = useDuplicate(getFormValues, selectedEquipmentItem);

  const handleSubmit = useCallback(
    async (
      values: EquipmentItemWithImage,
      formikHelpers: FormikHelpers<EquipmentItemWithImage>,
    ) => {
      const formErrors = await formikHelpers.validateForm();

      if (!isEmpty(formErrors)) {
        systemConfigurationStore.togglePreDuplicating(false);

        return;
      }

      if (selectedEquipmentItem && !isDuplicating) {
        formikHelpers.setFieldValue('businessLineId', businessLineId);
        await equipmentItemStore.update(values);

        if (isPreDuplicating) {
          setDuplicate(values);

          return;
        }
        if (!equipmentItemStore.isPreconditionFailed) {
          forceCloseQuickView();
        }

        return;
      }

      let hasError = false;

      if (equipmentItemStore.selectedEntity?.description === values.description) {
        formikHelpers.setFieldError('description', t(`${I18N_PATH.Text}DescriptionMustBeUnique`));
        hasError = true;
      }

      if (equipmentItemStore.selectedEntity?.shortDescription === values.shortDescription) {
        formikHelpers.setFieldError(
          'shortDescription',
          t(`${I18N_PATH.Text}ShortDescriptionMustBeUnique`),
        );
        hasError = true;
      }

      if (hasError) {
        return;
      }
      equipmentItemStore.create(values);
      forceCloseQuickView();

      setLoading(false);
    },
    [
      equipmentItemStore,
      forceCloseQuickView,
      businessLineId,
      isDuplicating,
      isPreDuplicating,
      selectedEquipmentItem,
      setDuplicate,
      systemConfigurationStore,
      t,
    ],
  );

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: false,
    validationSchema: generateValidationSchema(equipmentItemStore, t, I18N_PATH.ValidationErrors),
    initialValues: isDuplicating ? getDuplicateValues(duplicate) : getFormValues(),
    onSubmit: handleSubmit,
  });

  const { errors, isValidating, resetForm } = formik;

  useScrollOnError(errors, !isValidating);

  useEffect(() => {
    if (isDuplicating) {
      resetForm();
    }
  }, [resetForm, isDuplicating]);

  return (
    <FormContainer formik={formik}>
      <QuickViewContent
        dirty={formik.dirty}
        confirmModal={<QuickViewConfirmModal />}
        rightPanelElement={<EquipmentItemsQuickViewContentRightPanel />}
        actionsElement={<EquipmentItemsQuickViewActions isLoading={isLoading} />}
      />
    </FormContainer>
  );
};

export default observer(EquipmentItemsQuickViewContent);
