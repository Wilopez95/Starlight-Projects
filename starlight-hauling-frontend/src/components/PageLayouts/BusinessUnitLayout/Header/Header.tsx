import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Autocomplete, Layouts } from '@starlightpro/shared-components';

import { GlobalService } from '@root/api';
import { PageHeader } from '@root/components';
import { useBusinessContext } from '@root/hooks';

import * as Styles from './styles';
import { useBusinessUnitAutocomplete } from './useAutocomplete';

const I18N_PATH = 'components.PageLayouts.BusinessUnitLayout.Header.Text.';

export const BusinessUnitHeader: React.FC = () => {
  const [searchString, handleChange] = useState('');

  const { businessUnitId } = useBusinessContext();
  const { t } = useTranslation();
  const autocompleteConfigs = useBusinessUnitAutocomplete();

  const handleRequest = useCallback(
    (search: string) => {
      return GlobalService.advancedMultiSearch(search, businessUnitId);
    },
    [businessUnitId],
  );

  const handleSearchChange = useCallback((_: string, newValue: string) => {
    handleChange(newValue);
  }, []);

  return (
    <PageHeader>
      <Layouts.Box width="650px">
        <Autocomplete
          name="newOrder"
          placeholder={t(`${I18N_PATH}SearchPlaceholder`)}
          ariaLabel={t(`${I18N_PATH}SearchPlaceholder`)}
          search={searchString}
          onSearchChange={handleSearchChange}
          onRequest={handleRequest}
          size="medium"
          background={Styles.Background}
          minSearchLength={1}
          configs={autocompleteConfigs}
          noErrorMessage
        />
      </Layouts.Box>
    </PageHeader>
  );
};
