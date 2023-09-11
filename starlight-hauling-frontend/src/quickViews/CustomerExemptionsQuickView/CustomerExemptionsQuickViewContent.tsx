import React, { useCallback, useEffect, useState } from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { isEmpty, noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { TaxExemptionService } from '@root/api';
import { QuickViewConfirmModal, QuickViewContent, useQuickViewContext } from '@root/common';
import { Divider } from '@root/common/TableTools';
import tableQuickViewStyles from '@root/common/TableTools/TableQuickView/css/styles.scss';
import { FormContainer } from '@root/components';
import { TaxExemptionForm } from '@root/components/forms';
import {
  defaultValue as taxExemptionDefaultValue,
  getTaxExemptionFormValue,
  sanitizeTaxExemptionValue,
  taxExemptionValidationSchema,
} from '@root/components/forms/TaxExemption/formikData';
import { convertTaxExemptionDates } from '@root/components/forms/TaxExemption/helpers';
import { type FormikTaxExemption } from '@root/components/forms/TaxExemption/types';
import { NotificationHelper } from '@root/helpers';
import { useBusinessContext, useCleanup, useScrollOnError, useStores } from '@root/hooks';
import { ButtonContainer } from '@root/pages/SystemConfiguration/components';
import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';

const CustomerExemptionsQuickViewContent: React.FC = () => {
  const { forceCloseQuickView, closeQuickView } = useQuickViewContext();

  const { customerStore, taxDistrictStore } = useStores();
  const [loading, setLoading] = useState(true);
  const { businessLineId } = useBusinessContext();

  useCleanup(taxDistrictStore);

  const currentCustomer = customerStore.selectedEntity!;
  const taxDistricts = taxDistrictStore.values;

  const formik = useFormik({
    initialValues: taxExemptionDefaultValue,
    validateOnChange: false,
    validationSchema: taxExemptionValidationSchema,
    onSubmit: noop,
    onReset: forceCloseQuickView,
  });

  const { values, errors, isValidating, setValues, validateForm } = formik;

  useScrollOnError(errors, !isValidating);

  useEffect(() => {
    taxDistrictStore.request({ businessLineId });
  }, [taxDistrictStore, businessLineId]);

  const handleExemptionsSave = useCallback(
    async (valuesTax: FormikTaxExemption) => {
      const formErrors = await validateForm();

      if (!isEmpty(formErrors)) {
        return;
      }

      try {
        await TaxExemptionService.updateCustomerTaxExemptions(
          currentCustomer.id,
          sanitizeTaxExemptionValue(valuesTax),
        );

        NotificationHelper.success('update', 'Tax exemptions');
      } catch (error: unknown) {
        const typedError = error as ApiError;
        NotificationHelper.error(
          'update',
          typedError.response.code as ActionCode,
          'Tax exemptions',
        );
      }
      forceCloseQuickView();
    },
    [currentCustomer.id, validateForm, forceCloseQuickView],
  );

  useEffect(() => {
    (async () => {
      if (!taxDistrictStore.loading) {
        const districtIds = taxDistricts
          .filter(district => district.active)
          .map(district => district.id);

        try {
          setLoading(true);
          const taxExemptions = await TaxExemptionService.getCustomerTaxExemptions(
            currentCustomer.id,
          );

          const exemptionValues = taxExemptions
            ? convertTaxExemptionDates(taxExemptions)
            : undefined;

          setValues(getTaxExemptionFormValue(districtIds, exemptionValues));
        } catch {
          setValues(getTaxExemptionFormValue(districtIds));
        }
        setLoading(false);
      }
    })();
  }, [currentCustomer.id, setValues, taxDistrictStore.loading, taxDistricts]);

  return (
    <FormContainer formik={formik}>
      <QuickViewContent
        dirty={formik.dirty}
        confirmModal={<QuickViewConfirmModal />}
        rightPanelElement={
          <>
            <Layouts.Padding padding="3">
              <div className={tableQuickViewStyles.quickViewTitle}>Taxes Information</div>
            </Layouts.Padding>
            <Divider />

            <Layouts.Scroll>
              <Layouts.Padding padding="3">
                <TaxExemptionForm loading={loading} taxDistricts={taxDistricts} />
              </Layouts.Padding>
            </Layouts.Scroll>
          </>
        }
        actionsElement={
          <ButtonContainer
            submitButtonType="button"
            onCancel={closeQuickView}
            onSave={() => handleExemptionsSave(values)}
          />
        }
      />
    </FormContainer>
  );
};

export default observer(CustomerExemptionsQuickViewContent);
