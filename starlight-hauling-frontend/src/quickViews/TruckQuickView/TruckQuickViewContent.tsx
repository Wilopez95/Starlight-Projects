import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FormikHelpers, useFormik } from 'formik';
import { isEmpty } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { QuickViewConfirmModal, QuickViewContent, useQuickViewContext } from '@root/common';
import { FormContainer } from '@root/components';
import { useStores } from '@root/hooks';
import { buildI18Path } from '@root/i18n/helpers';
import { ITrucksFormikData } from '@root/types';

import { generateValidationSchema, getValues } from './formikData';
import TruckQuickViewActions from './TruckQuickViewActions';
import TruckQuickViewRightPanel from './TruckQuickViewRightPanel';

const I18N_PATH = buildI18Path('pages.SystemConfiguration.tables.TruckTypes.');

const TruckQuickViewContent: React.FC = () => {
  const { forceCloseQuickView } = useQuickViewContext();
  const { truckStore, systemConfigurationStore, businessUnitStore, truckTypeStore } = useStores();
  const { t } = useTranslation();

  const selectedTruck = truckStore.selectedEntity;
  const isCreating = systemConfigurationStore.isCreating;
  const isNew = !selectedTruck || isCreating;

  const handleSubmit = useCallback(
    async (values: ITrucksFormikData, formikHelpers: FormikHelpers<ITrucksFormikData>) => {
      const errors = await formikHelpers.validateForm();

      if (!isEmpty(errors)) {
        return;
      }

      if (isNew) {
        await truckStore.create(values);
      } else if (selectedTruck?.id) {
        await truckStore.update(values);
      }
      truckStore.cleanup();
      forceCloseQuickView();
    },
    [isNew, selectedTruck?.id, forceCloseQuickView, truckStore],
  );

  const formik = useFormik<ITrucksFormikData>({
    validationSchema: generateValidationSchema(truckStore, t, I18N_PATH.ValidationErrors),
    enableReinitialize: true,
    initialValues: getValues(selectedTruck, isNew),
    initialErrors: {},
    onSubmit: handleSubmit,
    validateOnChange: false,
  });

  useEffect(() => {
    businessUnitStore.request();
    truckTypeStore.requestAll({ activeOnly: true });
    if (selectedTruck?.id && !isNew) {
      truckStore.requestById(selectedTruck.id, true);
    }
  }, [selectedTruck?.id, truckTypeStore, businessUnitStore, truckStore, isNew]);

  return (
    <FormContainer formik={formik}>
      <QuickViewContent
        dirty={formik.dirty}
        rightPanelElement={<TruckQuickViewRightPanel />}
        actionsElement={<TruckQuickViewActions />}
        confirmModal={<QuickViewConfirmModal />}
      />
    </FormContainer>
  );
};

export default observer(TruckQuickViewContent);
