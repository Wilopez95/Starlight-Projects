import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FormikHelpers, useFormik } from 'formik';
import { isEmpty } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { QuickViewConfirmModal, QuickViewContent, useQuickViewContext } from '@root/common';
import { FormContainer } from '@root/components';
import { useStores } from '@root/hooks';
import { buildI18Path } from '@root/i18n/helpers';
import { ITruckFormikData } from '@root/types';

import { generateValidationSchema, getValues } from './formikData';
import TruckTypeQuickViewActions from './TruckTypeQuickViewActions';
import TruckTypeQuickViewRightPanel from './TruckTypeQuickViewRightPanel';

const I18N_PATH = buildI18Path('pages.SystemConfiguration.tables.TruckTypes.');

const TruckTypeQuickViewContent: React.FC = () => {
  const { truckTypeStore, systemConfigurationStore, businessLineStore } = useStores();
  const { t } = useTranslation();
  const { forceCloseQuickView } = useQuickViewContext();
  const selectedTruckType = truckTypeStore.selectedEntity;
  const { isCreating } = systemConfigurationStore;
  const isNew = !selectedTruckType || isCreating;

  const handleSubmit = useCallback(
    async (values: ITruckFormikData, formikHelpers: FormikHelpers<ITruckFormikData>) => {
      const errors = await formikHelpers.validateForm();

      if (!isEmpty(errors)) {
        return;
      }

      if (isNew) {
        await truckTypeStore.create(values);
      } else if (selectedTruckType?.id) {
        await truckTypeStore.update(values);
      }
      forceCloseQuickView();
      truckTypeStore.cleanup();
    },
    [isNew, forceCloseQuickView, truckTypeStore, selectedTruckType?.id],
  );

  const formik = useFormik<ITruckFormikData>({
    validationSchema: generateValidationSchema(truckTypeStore, t, I18N_PATH.ValidationErrors),
    enableReinitialize: true,
    initialValues: getValues(businessLineStore, selectedTruckType, isNew),
    initialErrors: {},
    onSubmit: handleSubmit,
    validateOnChange: false,
  });

  useEffect(() => {
    if (selectedTruckType?.id && !isNew) {
      truckTypeStore.requestById(selectedTruckType.id);
    }
  }, [selectedTruckType?.id, truckTypeStore, isNew]);

  return (
    <FormContainer formik={formik}>
      <QuickViewContent
        dirty={formik.dirty}
        confirmModal={<QuickViewConfirmModal />}
        rightPanelElement={<TruckTypeQuickViewRightPanel />}
        actionsElement={<TruckTypeQuickViewActions />}
      />
    </FormContainer>
  );
};

export default observer(TruckTypeQuickViewContent);
