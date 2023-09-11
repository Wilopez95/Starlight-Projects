import { TaxDistrictForOrderFragment, useGetTaxDistrictsForOrderQuery } from '../../../graphql/api';
import { orderStatuses } from '../../OrdersView/constant';
import { isNil, isObject } from 'lodash-es';
import React, { useEffect, useMemo } from 'react';
import { useField } from 'react-final-form';
import { useCompanySettings } from '../../../hooks/useCompanySettings';
import { showError } from '@starlightpro/common';
import { Trans } from '../../../i18n';

export interface UseTaxesConfig {}

export const useTaxes = () => {
  const {
    input: { value: customer },
  } = useField('customer', {
    subscription: { value: true },
  });
  const {
    input: { value: jobSite },
  } = useField('jobSite', {
    subscription: { value: true, dirty: true },
  });
  const {
    input: { value: originDistrictId },
  } = useField<number | string | null | undefined>('originDistrictId', {
    subscription: { value: true, dirty: true },
  });
  const {
    meta: { initial: status },
  } = useField('status', {
    subscription: { initial: true },
  });
  const {
    input: { value: taxDistrictsFromOrder },
  } = useField<TaxDistrictForOrderFragment[] | null | undefined>('taxDistricts', {
    subscription: { value: true },
  });
  const companySettings = useCompanySettings();

  const { data: taxDistrictsData, loading, error } = useGetTaxDistrictsForOrderQuery({
    variables: {
      filter: {
        customerId: customer.id,
        originDistrictId: Number(originDistrictId) || null,
        jobSiteId: jobSite?.id || (originDistrictId ? null : companySettings.jobSiteId),
      },
    },
    skip:
      orderStatuses.includes(status) ||
      !isObject(customer) ||
      (isNil(jobSite?.id || companySettings.jobSiteId) && isNil(originDistrictId || null)),
    fetchPolicy: 'no-cache',
  });

  useEffect(() => {
    if (error) {
      showError(<Trans>Failed to load taxes</Trans>);
    }
  }, [error]);

  const taxDistricts = useMemo(() => {
    if (orderStatuses.includes(status)) {
      return taxDistrictsFromOrder || [];
    }

    return taxDistrictsData?.taxDistrictsForOrder || [];
  }, [status, taxDistrictsData?.taxDistrictsForOrder, taxDistrictsFromOrder]);

  return { loading, error, taxDistricts };
};
