import React, { useCallback, useMemo } from 'react';
import { FormikHelpers, useFormik } from 'formik';
import { isEmpty } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { QuickViewConfirmModal, QuickViewContent } from '@root/common/QuickView';
import { FormContainer } from '@root/components';
import { useScrollOnError, useStores } from '@root/hooks';
import { IEditableLandfillOperation } from '@root/types';

import { ActionPanel } from './ActionPanel/ActionPanel';
import { LeftPanel } from './LeftPanel/LeftPanel';
import { RightPanel } from './RightPanel/RightPanel';
import { getInitialValues } from './helpers';
import { defaultValidationSchema } from './validationSchema';

const LandfillOperationsEditQuickViewContent: React.FC = () => {
  const { landfillOperationStore } = useStores();

  const selectedLandfillOperation = landfillOperationStore.selectedEntity!;

  const handleSubmit = useCallback(
    async (
      values: IEditableLandfillOperation,
      formik: FormikHelpers<IEditableLandfillOperation>,
    ) => {
      const errors = await formik.validateForm(values);

      if (!isEmpty(errors)) {
        return;
      }

      landfillOperationStore.edit(values);
    },
    [landfillOperationStore],
  );

  const formikValues = useMemo(() => {
    return getInitialValues(selectedLandfillOperation);
  }, [selectedLandfillOperation]);

  const formik = useFormik({
    initialValues: formikValues,
    enableReinitialize: true,
    onSubmit: handleSubmit,
    validationSchema: defaultValidationSchema,
    validateOnChange: false,
  });

  useScrollOnError(formik.errors, true);

  return (
    <FormContainer formik={formik}>
      <QuickViewContent
        dirty={formik.dirty}
        confirmModal={<QuickViewConfirmModal />}
        leftPanelElement={<LeftPanel />}
        rightPanelElement={<RightPanel />}
        actionsElement={<ActionPanel />}
      />
    </FormContainer>
  );
};

export default observer(LandfillOperationsEditQuickViewContent);
