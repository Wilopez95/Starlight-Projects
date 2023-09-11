import React, { useCallback } from 'react';
import { useFormik } from 'formik';
import { observer } from 'mobx-react-lite';

import { QuickViewConfirmModal, QuickViewContent, useQuickViewContext } from '@root/common';
import { FormContainer } from '@root/components';
import { useStores } from '@root/hooks';

import DomainsQuickViewActions from './DomainsQuickViewActions';
import DomainsQuickViewRightPanel from './DomainsQuickViewRightPanel';
import { DomainFormikData, getValues, validationSchema } from './formikData';

const DomainsQuickViewContent: React.FC = () => {
  const { domainStore } = useStores();
  const { forceCloseQuickView } = useQuickViewContext();

  const selectedDomain = domainStore.selectedEntity;

  const handleSubmit = useCallback(
    async (values: DomainFormikData) => {
      if (values.id) {
        await domainStore.validateDomain(values.id);
      } else {
        await domainStore.create(values.name);
      }

      forceCloseQuickView();

      domainStore.request();
    },
    [domainStore, forceCloseQuickView],
  );

  const formik = useFormik<DomainFormikData>({
    validationSchema,
    enableReinitialize: true,
    validateOnChange: false,
    initialValues: getValues(selectedDomain),
    onSubmit: handleSubmit,
  });

  return (
    <FormContainer formik={formik}>
      <QuickViewContent
        dirty={formik.dirty}
        rightPanelElement={<DomainsQuickViewRightPanel />}
        actionsElement={<DomainsQuickViewActions />}
        confirmModal={<QuickViewConfirmModal />}
      />
    </FormContainer>
  );
};

export default observer(DomainsQuickViewContent);
