import React, { useEffect } from 'react';
import { useFormikContext } from 'formik';

import { TaxExemptionForm } from '@root/components/forms';
import { NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { usePermission } from '@root/hooks';
import { type ITaxExemption } from '@root/types';

import { type ICustomerJobSiteSettings } from '../formikData';

interface ICustomerJobSiteExemptions {
  loading: boolean;
  customerExemptions?: ITaxExemption;
}

const CustomerJobSiteExemptions: React.FC<ICustomerJobSiteExemptions> = ({
  loading,
  customerExemptions,
}) => {
  const canManageTaxExempts = usePermission('customers:tax-exempts:perform');
  const { values } = useFormikContext<ICustomerJobSiteSettings>();

  // Only showing this error when user actually navigates to the tab.
  // TODO: make Navigation smarter and let is accept configs with permissions.
  useEffect(() => {
    if (!canManageTaxExempts) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
    }
  }, [canManageTaxExempts]);

  return (
    <TaxExemptionForm
      taxDistricts={values?.details?.taxDistricts ?? []}
      loading={loading}
      basePath="taxExemptions"
      groupExemptedByDefault={customerExemptions?.enabled}
      districtsExemptedByDefault={customerExemptions?.nonGroup
        ?.filter(item => item.enabled)
        ?.map(item => item.taxDistrictId)}
    />
  );
};

export default CustomerJobSiteExemptions;
