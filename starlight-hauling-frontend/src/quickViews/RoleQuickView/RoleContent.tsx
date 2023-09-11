import React, { useCallback, useEffect } from 'react';
import { FormikHelpers, useFormik } from 'formik';
import { isEmpty } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { QuickViewConfirmModal, QuickViewContent, useQuickViewContext } from '@root/common';
import { FormContainer } from '@root/components';
import { useScrollOnError, useStores } from '@root/hooks';
import { useDuplicate } from '@root/pages/SystemConfiguration/hooks/useDuplicate';

import { FormRole, getDuplicateValues, getValues, validationSchema } from './formikData';
import RoleButtonContainer from './RoleButtonContainer';
import { RoleQuickViewRightPanel } from './RoleRightPanel';

const RoleQuickViewContent: React.FC = () => {
  const { roleStore, systemConfigurationStore } = useStores();
  const { forceCloseQuickView, closeModal } = useQuickViewContext();

  const selectedRole = roleStore.selectedEntity;

  const isCreating = systemConfigurationStore.isCreating;
  const isPreDuplicating = systemConfigurationStore.isPreDuplicating;
  const isDuplicating = systemConfigurationStore.isDuplicating;
  const isNew = isCreating || !selectedRole;

  const [duplicate, setDuplicate, setInitialDuplicate] = useDuplicate(
    () => getValues(selectedRole),
    selectedRole,
  );

  useEffect(() => {
    setInitialDuplicate(getValues(selectedRole));
  }, [selectedRole, setInitialDuplicate, roleStore]);

  const handleRoleChange = useCallback(
    async (values: FormRole, formikHelpers: FormikHelpers<FormRole>) => {
      const formErrors = await formikHelpers.validateForm();

      if (!isEmpty(formErrors)) {
        systemConfigurationStore.togglePreDuplicating(false);
        closeModal();

        return;
      }
      if (isDuplicating && roleStore.values.find(role => role.description === values.description)) {
        formikHelpers.setFieldError('description', 'Description must be unique');

        return;
      }

      if (!selectedRole || isDuplicating) {
        await roleStore.create(values);
      } else {
        await roleStore.update(String(selectedRole.id), values);
        if (isPreDuplicating) {
          closeModal();
          setDuplicate(values);

          return;
        }
      }
      if (!roleStore.isPreconditionFailed) {
        forceCloseQuickView();
      }
    },
    [
      isDuplicating,
      roleStore,
      selectedRole,
      systemConfigurationStore,
      closeModal,
      isPreDuplicating,
      setDuplicate,
      forceCloseQuickView,
    ],
  );

  const formik = useFormik({
    validationSchema: validationSchema(roleStore, selectedRole),
    enableReinitialize: true,
    initialValues: isDuplicating ? getDuplicateValues(duplicate) : getValues(selectedRole),
    initialErrors: {},
    onSubmit: handleRoleChange,
    validateOnChange: false,
  });

  useScrollOnError(formik.errors, !formik.isValidating);

  return (
    <FormContainer formik={formik}>
      <QuickViewContent
        dirty={formik.dirty}
        rightPanelElement={<RoleQuickViewRightPanel isNew={isNew} />}
        actionsElement={<RoleButtonContainer isNew={isNew} />}
        confirmModal={<QuickViewConfirmModal />}
      />
    </FormContainer>
  );
};

export default observer(RoleQuickViewContent);
