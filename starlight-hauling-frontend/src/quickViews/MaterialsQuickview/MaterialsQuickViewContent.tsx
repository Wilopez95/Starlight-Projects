import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormikHelpers, useFormik } from 'formik';
import { isEmpty } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { QuickViewConfirmModal, QuickViewContent, useQuickViewContext } from '@root/common';
import { FormContainer } from '@root/components';
import { NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { buildI18Path } from '@root/i18n/helpers';
import { useDuplicate } from '@root/pages/SystemConfiguration/hooks/useDuplicate';
import { IMaterial } from '@root/types';
import { useBusinessContext, useCrudPermissions, useScrollOnError, useStores } from '@hooks';

import { generateValidationSchema, getDuplicateValues, getValues } from './formikData';
import MaterialQuickViewActions from './MaterialQuickViewActions';
import { MaterialQuickViewRightPanel } from './MaterialsQuickViewRightPanel';

const I18N_PATH = buildI18Path(
  'pages.SystemConfiguration.tables.BusinessLinesConfiguration.tables.Materials.QuickView.',
);

const MaterialsQuickView: React.FC = () => {
  const { materialStore, equipmentItemStore, systemConfigurationStore, businessLineStore } =
    useStores();
  const [isLoading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { forceCloseQuickView } = useQuickViewContext();
  const { businessLineId } = useBusinessContext();
  const [canViewEquipment] = useCrudPermissions('configuration', 'equipment');

  const selectedMaterial = materialStore.selectedEntity;
  const isDuplicating = systemConfigurationStore.isDuplicating;
  const isPreDuplicating = systemConfigurationStore.isPreDuplicating;
  const isRollOffLoB = businessLineStore.isRollOffType(businessLineId);

  const getFormValues = useCallback(
    () => getValues(businessLineId, selectedMaterial),
    [businessLineId, selectedMaterial],
  );

  const [duplicate, setDuplicate] = useDuplicate(getFormValues, selectedMaterial);

  const handleSubmit = useCallback(
    async (values: IMaterial, formikHelpers: FormikHelpers<IMaterial>) => {
      const formErrors = await formikHelpers.validateForm();

      setLoading(true);
      if (!isEmpty(formErrors)) {
        systemConfigurationStore.togglePreDuplicating(false);

        return;
      }
      if (selectedMaterial && !isDuplicating) {
        await materialStore.update(values);

        if (isPreDuplicating) {
          setDuplicate(values);

          return;
        }
      } else {
        if (
          materialStore.selectedEntity?.description?.toLowerCase() ===
          values.description?.toLowerCase()
        ) {
          return formikHelpers.setFieldError(
            'description',
            t(`${I18N_PATH.ValidationErrors}DescriptionIsRequired`),
          );
        }

        const recyclingDefaultEquipment = equipmentItemStore.values.find(
          item => item.recyclingDefault,
        );

        if (recyclingDefaultEquipment) {
          values.equipmentItemIds = [recyclingDefaultEquipment.id];
        }

        values.businessLineId = businessLineId;
        materialStore.create(values);
      }

      setLoading(false);

      if (!materialStore.isPreconditionFailed) {
        forceCloseQuickView();
      }
    },
    [
      selectedMaterial,
      isDuplicating,
      materialStore,
      systemConfigurationStore,
      equipmentItemStore.values,
      isPreDuplicating,
      setDuplicate,
      businessLineId,
      forceCloseQuickView,
      t,
    ],
  );

  const initialValues = useMemo(() => {
    const initialFormValues = isDuplicating ? getDuplicateValues(duplicate) : getFormValues();

    // yard=true for recycling LoB by default
    const values = isRollOffLoB ? { ...initialFormValues, yard: false } : initialFormValues;

    return values;
  }, [duplicate, getFormValues, isDuplicating, isRollOffLoB]);

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: false,
    initialErrors: {},
    validationSchema: generateValidationSchema(
      materialStore,
      t,
      I18N_PATH.ValidationErrors,
      isDuplicating,
    ),
    initialValues,
    onSubmit: handleSubmit,
  });

  const { errors, isValidating } = formik;

  useScrollOnError(errors, !isValidating);

  useEffect(() => {
    if (!canViewEquipment) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
    }
  }, [canViewEquipment]);

  return (
    <FormContainer formik={formik}>
      <QuickViewContent
        dirty={formik.dirty}
        confirmModal={<QuickViewConfirmModal />}
        rightPanelElement={<MaterialQuickViewRightPanel />}
        actionsElement={<MaterialQuickViewActions isLoading={isLoading} />}
      />
    </FormContainer>
  );
};

export default observer(MaterialsQuickView);
