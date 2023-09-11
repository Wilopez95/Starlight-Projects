import React, { useMemo } from 'react';
import { SearchField, SelectOptions } from '../../../components/FinalForm/SearchField';
import { useGetDestinationsQuery, useGetRequireDestinationQuery } from '../../../graphql/api';
import { ReadOnlyOrderFormComponent } from '../types';
import { useField } from 'react-final-form';

interface Props extends ReadOnlyOrderFormComponent {}

export const DestinationInput: React.FC<Props> = ({ readOnly }) => {
  const { data: destinations } = useGetDestinationsQuery({
    variables: { sort: [] },
  });
  const {
    input: { value: destinationId },
  } = useField('destinationId', { subscription: { value: true } });
  const { data: requireDestination } = useGetRequireDestinationQuery();

  const options = useMemo(
    () =>
      destinations?.destinations.data
        .filter((destination) => destination.id === destinationId || destination.active)
        .map((destination) => ({
          label: destination.description,
          value: destination.id,
        })) as SelectOptions,
    [destinationId, destinations?.destinations.data],
  );

  return (
    <SearchField
      required={!!requireDestination?.company.requireDestinationOnWeightOut}
      disabled={readOnly}
      label="Destination"
      name="destinationId"
      options={options}
    />
  );
};
