import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ISelectOption, Select } from '@starlightpro/shared-components';
import { FormikHelpers, useFormik } from 'formik';
import { isEmpty } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { QuickViewConfirmModal, QuickViewContent, useQuickViewContext } from '@root/common';
import { FormContainer } from '@root/components';
import { useScrollOnError, useStores } from '@root/hooks';
import { buildI18Path } from '@root/i18n/helpers';

import { generateValidationSchema, getValues, IMaterialCodeFormData } from './formikData';
import MaterialMappingQuickViewActions from './MaterialMappingQuickViewActions';
import MaterialMappingQuickViewRightPanel from './MaterialMappingQuickViewRightPanel';

const I18N_PATH = buildI18Path(
  'pages.SystemConfiguration.tables.DisposalSites.MaterialMappingQuickView.',
);

const MaterialMappingQuickViewContent: React.FC = () => {
  const { businessLineStore, disposalSiteStore, materialStore, lineItemStore } = useStores();
  const { t } = useTranslation();
  const { forceCloseQuickView } = useQuickViewContext();

  const selectedDisposalSite = disposalSiteStore.selectedEntity;

  const businessLinesOptions: ISelectOption[] = businessLineStore.sortedValues.reduce(
    (acc: ISelectOption[], businessLine) => {
      if (!businessLine.active) {
        return acc;
      }

      return [...acc, { label: businessLine.name, value: businessLine.id }] as ISelectOption[];
    },
    [],
  );

  const [businessLineId, setBusinessLineId] = useState<number>(+businessLinesOptions[0].value || 0);

  useEffect(() => {
    if (!selectedDisposalSite) {
      return;
    }
    disposalSiteStore.requestMaterialCodes(+selectedDisposalSite.id, businessLineId);
    const { recycling, businessUnitId, recyclingTenantName } = selectedDisposalSite;

    if (recycling && businessUnitId && recyclingTenantName) {
      disposalSiteStore.requestRecyclingCodes(businessUnitId, recyclingTenantName);
    }

    materialStore.cleanup();
    lineItemStore.cleanup();

    materialStore.request({ businessLineId });
    lineItemStore.request({ businessLineId });
  }, [businessLineId, disposalSiteStore, lineItemStore, materialStore, selectedDisposalSite]);

  const handleBusinessLineTypeChange = useCallback((_: string, value: number) => {
    setBusinessLineId(value);
  }, []);

  const handleMaterialCodesUpdate = useCallback(
    async (values: IMaterialCodeFormData, formikHelpers: FormikHelpers<IMaterialCodeFormData>) => {
      const formErrors = await formikHelpers.validateForm();

      if (!isEmpty(formErrors)) {
        return;
      }
      if (selectedDisposalSite?.recycling) {
        disposalSiteStore.updateMaterialMapping(
          selectedDisposalSite.id,
          values.materialCodes.map(code => {
            return {
              ...code,
              billableLineItemId: code.billableLineItemId ?? null,
              recyclingMaterialId: code.recyclingMaterialId?.toString() ?? null,
            };
          }),
        );
      }
      if (!disposalSiteStore.isPreconditionFailed) {
        forceCloseQuickView();
      }
    },
    [disposalSiteStore, forceCloseQuickView, selectedDisposalSite],
  );

  const formik = useFormik({
    validationSchema: generateValidationSchema(t, I18N_PATH.ValidationErrors),
    validateOnChange: false,
    enableReinitialize: true,
    initialErrors: {},
    initialValues: getValues({
      materials: materialStore.sortedValues,
      items: disposalSiteStore.materialCodes,
      businessLineId,
    }),
    onSubmit: handleMaterialCodesUpdate,
  });

  useScrollOnError(formik.errors, !formik.isValidating);

  return (
    <FormContainer formik={formik}>
      <QuickViewContent
        dirty={formik.dirty}
        confirmModal={<QuickViewConfirmModal />}
        rightPanelElement={
          <MaterialMappingQuickViewRightPanel>
            <Select
              name="lineOfBusiness"
              options={businessLinesOptions}
              value={businessLineId}
              onSelectChange={handleBusinessLineTypeChange}
              nonClearable
              label={t(`${I18N_PATH.Form}LineOfBusiness`)}
              noErrorMessage
            />
          </MaterialMappingQuickViewRightPanel>
        }
        actionsElement={<MaterialMappingQuickViewActions />}
      />
    </FormContainer>
  );
};

export default observer(MaterialMappingQuickViewContent);
