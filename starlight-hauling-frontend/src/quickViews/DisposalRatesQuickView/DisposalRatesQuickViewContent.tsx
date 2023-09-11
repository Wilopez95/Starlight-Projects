import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ISelectOption, Select } from '@starlightpro/shared-components';
import { FormikHelpers, useFormik } from 'formik';
import { isEmpty } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { QuickViewConfirmModal, QuickViewContent } from '@root/common';
import { FormContainer } from '@root/components';
import { useScrollOnError, useStores } from '@root/hooks';
import { buildI18Path } from '@root/i18n/helpers';

import DisposalRatesQuickViewActions from './DisposalRatesQuickViewActions';
import DisposalRatesQuickViewRightPanel from './DisposalRatesQuickViewRightPanel';
import { generateValidationSchema, getValues, IDisposalRateFormData } from './formikData';

const I18N_PATH = buildI18Path(
  'pages.SystemConfiguration.tables.DisposalSites.DisposalRatesQuickView.',
);

const DisposalRatesQuickViewContent: React.FC = () => {
  const { disposalSiteStore, businessLineStore, materialStore } = useStores();
  const { t } = useTranslation();

  const selectedDisposalSite = disposalSiteStore.selectedEntity;

  const businessLinesOptions: ISelectOption[] = businessLineStore.sortedValues.reduce(
    (acc: ISelectOption[], businessLine) => {
      if (!businessLine.active) {
        return acc;
      }

      return [...acc, { label: businessLine.name, value: businessLine.id }];
    },
    [],
  );

  const [businessLineId, setBusinessLineId] = useState<number>(+businessLinesOptions[0].value || 0);

  const handleBusinessLineTypeChange = useCallback((_: string, value: number) => {
    setBusinessLineId(value);
  }, []);

  useEffect(() => {
    if (selectedDisposalSite) {
      materialStore.cleanup();
      materialStore.request({ businessLineId, activeOnly: true });
      disposalSiteStore.requestDisposalRates(+selectedDisposalSite.id, businessLineId);
    }
  }, [businessLineId, disposalSiteStore, materialStore, selectedDisposalSite]);

  const handleDisposalRatesUpdate = useCallback(
    async (values: IDisposalRateFormData, formikHelpers: FormikHelpers<IDisposalRateFormData>) => {
      const formErrors = await formikHelpers.validateForm();

      if (!isEmpty(formErrors)) {
        return;
      }

      if (selectedDisposalSite) {
        disposalSiteStore.updateDisposalRates(selectedDisposalSite.id, values.disposalRates);
      }

      if (!disposalSiteStore.isPreconditionFailed) {
        disposalSiteStore.closeRates();
      }
    },
    [selectedDisposalSite, disposalSiteStore],
  );

  const formik = useFormik({
    validationSchema: generateValidationSchema(t, I18N_PATH.ValidationErrors),
    validateOnChange: false,
    enableReinitialize: true,
    initialErrors: {},
    initialValues: getValues({
      materials: materialStore.sortedValues,
      items: disposalSiteStore.disposalRates,
      businessLineId,
    }),
    onSubmit: handleDisposalRatesUpdate,
  });

  useScrollOnError(formik.errors, !formik.isValidating);

  return (
    <FormContainer formik={formik}>
      <QuickViewContent
        dirty={formik.dirty}
        rightPanelElement={
          <DisposalRatesQuickViewRightPanel>
            <Select
              name="lineOfBusiness"
              options={businessLinesOptions}
              value={businessLineId}
              onSelectChange={handleBusinessLineTypeChange}
              nonClearable
              noErrorMessage
            />
          </DisposalRatesQuickViewRightPanel>
        }
        actionsElement={<DisposalRatesQuickViewActions />}
        confirmModal={<QuickViewConfirmModal />}
      />
    </FormContainer>
  );
};

export default observer(DisposalRatesQuickViewContent);
