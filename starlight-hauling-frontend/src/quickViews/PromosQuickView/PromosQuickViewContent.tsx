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
import { IPromo } from '@root/types';

import { getValidationSchema, getValues } from './formikData';
import PromosQuickViewActions from './PromosQuickViewActions';
import PromosQuickViewRightPanel from './PromosQuickViewRightPanel';

const PromosQuickViewContent: React.FC = () => {
  const { promoStore, systemConfigurationStore } = useStores();
  const [isLoading, setLoading] = useState(false);
  const { forceCloseQuickView } = useQuickViewContext();
  const { businessLineId, businessUnitId } = useBusinessContext();

  const selectedPromo = promoStore.selectedEntity;
  const isCreating = systemConfigurationStore.isCreating;
  const isNew = isCreating || !selectedPromo;

  const handleSubmit = useCallback(
    async (values: IPromo, formikHelpers: FormikHelpers<IPromo>) => {
      const formErrors = await formikHelpers.validateForm();

      if (!isEmpty(formErrors)) {
        return;
      }

      setLoading(true);
      if (values.id === 0) {
        promoStore.create({
          ...values,
          description: values.description ?? null,
        });
      } else {
        await promoStore.update(values);
      }
      if (!promoStore.isPreconditionFailed) {
        forceCloseQuickView();
      }
      setLoading(false);
    },
    [forceCloseQuickView, promoStore],
  );

  const formik = useFormik({
    validationSchema: getValidationSchema(promoStore, isNew),
    validateOnChange: false,
    enableReinitialize: true,
    initialErrors: {},
    initialValues: getValues({ businessUnitId, businessLineId }, selectedPromo),
    onSubmit: handleSubmit,
  });

  const { errors, isValidating } = formik;

  useScrollOnError(errors, !isValidating);

  return (
    <FormContainer formik={formik}>
      <QuickViewContent
        dirty={formik.dirty}
        confirmModal={<QuickViewConfirmModal />}
        rightPanelElement={<PromosQuickViewRightPanel isLoading={isLoading} />}
        actionsElement={<PromosQuickViewActions isLoading={isLoading} />}
      />
    </FormContainer>
  );
};

export default observer(PromosQuickViewContent);
