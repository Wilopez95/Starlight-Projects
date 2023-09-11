import React, { FC, useEffect, useMemo } from 'react';
import { Trans } from '../../../i18n';
import { truncate } from 'lodash/fp';
import { useField } from 'react-final-form';
import { SearchField } from '../../../components/FinalForm/SearchField';
import { useGetOriginsLazyQuery, useGetRequireOriginQuery } from '../../../graphql/api';
import { ReadOnlyOrderFormComponent } from '../types';
import { LoadingInput } from '../../../components/LoadingInput';

interface OriginInputProps extends ReadOnlyOrderFormComponent {
  truncateLength?: number;
}

export const OriginInput: FC<OriginInputProps> = ({ truncateLength, readOnly }) => {
  const { data: requireOrigin } = useGetRequireOriginQuery();
  const {
    input: { value: customer },
  } = useField('customer', { subscription: { value: true } });
  const {
    input: { value: project },
  } = useField('project', { subscription: { value: true } });

  // eslint-disable-next-line
  const originsQueryVariables = () => ({
    variables: {
      sort: [{ field: 'createdAt', order: 'DESC' }],
      filter: {
        activeOnly: true,
      },
    },
  });

  // eslint-disable-next-line
  const [getOrigins, { data: origins, loading }] = useGetOriginsLazyQuery();

  useEffect(() => {
    if (customer) {
      getOrigins(originsQueryVariables());
    }
  }, [customer, getOrigins]);

  const options = useMemo(
    () =>
      origins?.origins.data.map((origin) => ({
        label: truncate({ length: truncateLength || 25 }, origin.description),
        value: origin.id,
      })),
    [origins, truncateLength],
  );

  if (loading) {
    return <LoadingInput label={<Trans>Origin</Trans>} />;
  }

  return (
    <SearchField
      options={options!}
      onChange={
        () => {}
        // TODO: remove stub after search
        // (searchText) => refetch(originsQueryVariables(searchText))
      }
      name="originId"
      disabled={readOnly || (!customer && !project)}
      required={!!requireOrigin?.company.requireOriginOfInboundLoads}
      label={<Trans>Origin</Trans>}
    />
  );
};
