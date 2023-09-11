import React, { FC, useMemo } from 'react';

import { SearchField } from '../../../components/FinalForm/SearchField';
import { useGetHaulingCustomerJobSitesQuery } from '../../../graphql/api';

export interface CustomerJobSiteSearchFieldProps {
  name: string;
  label: string;
  customerId: number;
  disabled?: boolean;
}

export const CustomerJobSiteSearchField: FC<CustomerJobSiteSearchFieldProps> = ({
  customerId,
  name,
  label,
  disabled,
}) => {
  const { data } = useGetHaulingCustomerJobSitesQuery({
    variables: {
      filter: {
        customerId,
      },
    },
  });
  const jobSites = useMemo(() => data?.haulingCustomerJobSites || [], [
    data?.haulingCustomerJobSites,
  ]);

  const options = useMemo(
    () =>
      jobSites.map((customerJobSite) => ({
        label: customerJobSite.fullAddress,
        value: customerJobSite,
      })),
    [jobSites],
  );

  return (
    <SearchField disabled={disabled} blurOnSelect name={name} options={options} label={label} />
  );
};

export default CustomerJobSiteSearchField;
