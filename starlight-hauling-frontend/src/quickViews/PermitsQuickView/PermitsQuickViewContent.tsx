import React, { useCallback, useState } from 'react';
import { FormikHelpers, useFormik } from 'formik';
import { isEmpty } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import {
  QuickViewConfirmModal,
  QuickViewContent,
  useQuickViewContext,
} from '@root/common/QuickView';
import { FormContainer } from '@root/components';
import { useBusinessContext, useScrollOnError, useStores } from '@root/hooks';
import { IPermit } from '@root/types/entities/permit';

import { getValidationSchema, getValues } from './formikData';
import PermitsQuickViewActions from './PermitsQuickViewActions';
import PermitsQuickViewRightPanel from './PermitsQuickViewRightPanel';

const PermitsQuickViewContent: React.FC = () => {
  const { permitStore, systemConfigurationStore } = useStores();
  const [isLoading, setLoading] = useState(false);
  const { forceCloseQuickView } = useQuickViewContext();
  const { businessLineId, businessUnitId } = useBusinessContext();

  const selectedPermit = permitStore.selectedEntity;
  const isCreating = systemConfigurationStore.isCreating;
  const isNew = isCreating || !selectedPermit;

  const handleSubmit = useCallback(
    async (values: IPermit, formikHelpers: FormikHelpers<IPermit>) => {
      const formErrors = await formikHelpers.validateForm();

      if (!isEmpty(formErrors)) {
        return;
      }

      setLoading(true);
      if (values.id === 0) {
        permitStore.create({
          ...values,
          id: isNew ? 0 : selectedPermit?.id ?? 0,
        });
      } else {
        await permitStore.update(values);
      }
      if (!permitStore.isPreconditionFailed) {
        forceCloseQuickView();
      }
      setLoading(false);
    },
    [forceCloseQuickView, permitStore, selectedPermit?.id, isNew],
  );

  const formik = useFormik({
    validationSchema: getValidationSchema(isNew),
    validateOnChange: false,
    enableReinitialize: true,
    initialErrors: {},
    initialValues: getValues({ businessUnitId, businessLineId }, selectedPermit) as IPermit,
    onSubmit: handleSubmit,
  });

  const { errors, isValidating } = formik;

  useScrollOnError(errors, !isValidating);

  return (
    <FormContainer formik={formik}>
      <QuickViewContent
        dirty={formik.dirty}
        confirmModal={<QuickViewConfirmModal />}
        rightPanelElement={<PermitsQuickViewRightPanel isLoading={isLoading} />}
        actionsElement={<PermitsQuickViewActions isLoading={isLoading} />}
      />
    </FormContainer>
  );
};

export default observer(PermitsQuickViewContent);
