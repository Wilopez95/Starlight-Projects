import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Autocomplete,
  Checkbox,
  IAutocompleteConfig,
  Layouts,
} from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';

import { GlobalService } from '@root/api/global/global';
import { AutocompleteTemplates, FormInput, Typography } from '@root/common';
import { DEFAULT_ADDRESS } from '@root/consts/address';
import { useStores } from '@root/hooks';
import { CustomerGroupType } from '@root/types';
import { AddressSuggestion } from '@root/types/responseEntities';

import { INewCustomerData } from '../../types';

const AddressesTab: React.FC = () => {
  const { customerGroupStore, i18nStore, businessUnitStore } = useStores();
  const { t } = useTranslation();

  const { values, errors, handleChange, setFormikState, setFieldValue } =
    useFormikContext<INewCustomerData>();

  const customerGroupType =
    customerGroupStore.getById(values.customerGroupId)?.type ?? CustomerGroupType.commercial;

  const nonCommercial = customerGroupType === CustomerGroupType.nonCommercial;

  useEffect(() => {
    setFieldValue('createAndLinkJobSite', nonCommercial);
  }, [nonCommercial, setFieldValue]);

  const handleBillingAddressSameAsMailingChange = useCallback(() => {
    setFormikState(state => ({
      ...state,
      errors: {},
      values: {
        ...state.values,
        billingAddress: {
          ...DEFAULT_ADDRESS,
          region: i18nStore.region,
          billingAddressSameAsMailing: !state.values.billingAddress.billingAddressSameAsMailing,
        },
      },
    }));
  }, [i18nStore.region, setFormikState]);

  const handleAutocompleteSelect = useCallback(
    (suggestion: AddressSuggestion) => {
      setFormikState(state => ({
        ...state,
        errors: {},
        values: {
          ...state.values,
          searchString: suggestion.fullAddress ?? '',
          mailingAddress: {
            id: suggestion.id,
            addressLine1: suggestion.address ?? '',
            addressLine2: '',
            city: suggestion.city ?? '',
            zip: suggestion.zip ?? '',
            state: suggestion.state ?? '',
            region: i18nStore.region,
          },
          location: suggestion.location,
        },
      }));
    },
    [i18nStore.region, setFormikState],
  );

  const autocompleteConfigs = useMemo<IAutocompleteConfig[]>(() => {
    return [
      {
        name: 'addresses',
        template: <AutocompleteTemplates.Address />,
        onSelect: handleAutocompleteSelect,
      },
    ];
  }, [handleAutocompleteSelect]);

  return (
    <Layouts.Flex flexGrow={1} direction="column">
      <Layouts.Padding left="5" right="5">
        <Layouts.Padding top="3" bottom="1">
          <Typography variant="headerThree">Mailing address</Typography>
        </Layouts.Padding>
        <Layouts.Margin bottom="3">
          <Autocomplete
            name="searchString"
            label="Search address"
            placeholder="Enter Address"
            search={values.searchString}
            onSearchChange={setFieldValue}
            onRequest={query =>
              GlobalService.addressSuggestions(query, Number(businessUnitStore.selectedEntity?.id))
            }
            configs={autocompleteConfigs}
            noErrorMessage
          />
        </Layouts.Margin>
        <Layouts.Flex alignItems="flex-start">
          <Layouts.Column>
            <FormInput
              label={`${t(`Form.AddressLine`, { line: 1 })}*`}
              name="mailingAddress.addressLine1"
              value={values.mailingAddress.addressLine1}
              error={errors.mailingAddress?.addressLine1}
              onChange={handleChange}
            />
            <FormInput
              label={`${t(`Form.City`)}*`}
              name="mailingAddress.city"
              value={values.mailingAddress.city}
              error={errors.mailingAddress?.city}
              onChange={handleChange}
            />
          </Layouts.Column>
          <Layouts.Column>
            <FormInput
              label={t(`Form.AddressLine`, { line: 2 })}
              name="mailingAddress.addressLine2"
              value={values.mailingAddress.addressLine2 ?? ''}
              error={errors.mailingAddress?.addressLine2}
              onChange={handleChange}
            />
            <Layouts.Flex alignItems="flex-start">
              <Layouts.Column>
                <FormInput
                  label={`${t(`Form.State`)}*`}
                  name="mailingAddress.state"
                  value={values.mailingAddress.state}
                  error={errors.mailingAddress?.state}
                  onChange={handleChange}
                />
              </Layouts.Column>
              <Layouts.Column>
                <FormInput
                  label={`${t(`Form.Zip`)}*`}
                  name="mailingAddress.zip"
                  value={values.mailingAddress.zip}
                  error={errors.mailingAddress?.zip}
                  onChange={handleChange}
                />
              </Layouts.Column>
            </Layouts.Flex>
          </Layouts.Column>
        </Layouts.Flex>
        <Layouts.Padding top="3" bottom="1">
          <Typography variant="headerThree">Billing address</Typography>
        </Layouts.Padding>
        <Layouts.Flex as={Layouts.Box} height="60px">
          <Checkbox
            id="billingAddressSameAsMailing"
            name="billingAddress.billingAddressSameAsMailing"
            value={values.billingAddress.billingAddressSameAsMailing}
            error={errors.billingAddress?.billingAddressSameAsMailing}
            onChange={handleBillingAddressSameAsMailingChange}
          >
            Billing address same as mailing address
          </Checkbox>
        </Layouts.Flex>
        {!values.billingAddress.billingAddressSameAsMailing ? (
          <Layouts.Flex>
            <Layouts.Column>
              <FormInput
                label={`${t(`Form.AddressLine`, { line: 1 })}*`}
                name="billingAddress.addressLine1"
                value={values.billingAddress.addressLine1}
                error={errors.billingAddress?.addressLine1}
                onChange={handleChange}
              />

              <FormInput
                label={`${t(`Form.City`)}*`}
                name="billingAddress.city"
                value={values.billingAddress.city}
                error={errors.billingAddress?.city}
                onChange={handleChange}
              />
            </Layouts.Column>
            <Layouts.Column>
              <FormInput
                label={t(`Form.AddressLine`, { line: 1 })}
                name="billingAddress.addressLine2"
                value={values.billingAddress.addressLine2 ?? ''}
                error={errors.billingAddress?.addressLine2}
                onChange={handleChange}
              />
              <Layouts.Flex>
                <Layouts.Column>
                  <FormInput
                    label={`${t(`Form.State`)}*`}
                    name="billingAddress.state"
                    value={values.billingAddress.state}
                    error={errors.billingAddress?.state}
                    onChange={handleChange}
                  />
                </Layouts.Column>
                <Layouts.Column>
                  <FormInput
                    label={`${t(`Form.Zip`)}*`}
                    name="billingAddress.zip"
                    value={values.billingAddress.zip}
                    error={errors.billingAddress?.zip}
                    onChange={handleChange}
                  />
                </Layouts.Column>
              </Layouts.Flex>
            </Layouts.Column>
          </Layouts.Flex>
        ) : null}
        {nonCommercial ? (
          <>
            <Layouts.Padding top="3" bottom="1">
              <Typography variant="headerThree">Service address</Typography>
            </Layouts.Padding>
            <Layouts.Flex as={Layouts.Box} height="60px">
              <Checkbox
                id="createAndLinkJobSite"
                name="createAndLinkJobSite"
                value={values.createAndLinkJobSite}
                error={errors.createAndLinkJobSite}
                onChange={handleChange}
              >
                Create job site same as mailing address and link to the customer
              </Checkbox>
            </Layouts.Flex>
          </>
        ) : null}
      </Layouts.Padding>
    </Layouts.Flex>
  );
};

export default AddressesTab;
