import React, { useCallback } from 'react';
import { Checkbox, Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { FormInput, Typography } from '@root/common';

import { IAddressesFormData } from './types';

const Addresses: React.FC = () => {
  const { values, errors, handleChange, setValues } = useFormikContext<IAddressesFormData>();

  const handleMailingAddressSameAsPhysicalChange = useCallback(() => {
    setValues({
      ...values,
      mailingAddress: {
        sameAsPhysical: !values.mailingAddress.sameAsPhysical,
        ...values.physicalAddress,
      },
    });
  }, [setValues, values]);

  return (
    <Layouts.Padding padding="3" top="0">
      <Layouts.Margin bottom="3">
        <Typography variant="headerFive">Physical Address</Typography>
      </Layouts.Margin>
      <Layouts.Flex>
        <Layouts.Column>
          <Layouts.Flex>
            <Layouts.Column>
              <FormInput
                name="physicalAddress.addressLine1"
                label="Address Line 1*"
                value={values.physicalAddress.addressLine1}
                onChange={handleChange}
                error={errors.physicalAddress?.addressLine1}
              />
              <FormInput
                name="physicalAddress.city"
                label="City*"
                value={values.physicalAddress.city}
                onChange={handleChange}
                error={errors.physicalAddress?.city}
              />
            </Layouts.Column>
            <Layouts.Column>
              <FormInput
                name="physicalAddress.addressLine2"
                label="Address Line 2"
                value={values.physicalAddress.addressLine2 ?? ''}
                onChange={handleChange}
                error={errors.physicalAddress?.addressLine2}
              />
              <Layouts.Flex>
                <Layouts.Column>
                  <FormInput
                    name="physicalAddress.state"
                    label="State*"
                    value={values.physicalAddress.state}
                    onChange={handleChange}
                    error={errors.physicalAddress?.state}
                  />
                </Layouts.Column>
                <Layouts.Column>
                  <FormInput
                    name="physicalAddress.zip"
                    label="ZIP*"
                    value={values.physicalAddress.zip}
                    onChange={handleChange}
                    error={errors.physicalAddress?.zip}
                  />
                </Layouts.Column>
              </Layouts.Flex>
            </Layouts.Column>
          </Layouts.Flex>
        </Layouts.Column>
      </Layouts.Flex>
      <Layouts.Margin bottom="3">
        <Typography variant="headerFive">Mailing Address</Typography>
      </Layouts.Margin>
      <Layouts.Margin bottom="3">
        <Checkbox
          name="mailingAddressSameAsPhysical"
          value={values.mailingAddress.sameAsPhysical}
          onChange={handleMailingAddressSameAsPhysicalChange}
        >
          Mailing address same as physical address
        </Checkbox>
      </Layouts.Margin>
      {values.mailingAddress.sameAsPhysical === false ||
      values.mailingAddress.sameAsPhysical === undefined ? (
        <Layouts.Flex>
          <Layouts.Column>
            <Layouts.Flex>
              <Layouts.Column>
                <FormInput
                  name="mailingAddress.addressLine1"
                  label="Address Line 1*"
                  value={values.mailingAddress.addressLine1}
                  onChange={handleChange}
                  error={errors.mailingAddress?.addressLine1}
                />
                <FormInput
                  name="mailingAddress.city"
                  label="City*"
                  value={values.mailingAddress.city}
                  onChange={handleChange}
                  error={errors.mailingAddress?.city}
                />
              </Layouts.Column>
              <Layouts.Column>
                <FormInput
                  name="mailingAddress.addressLine2"
                  label="Address Line 2"
                  value={values.mailingAddress.addressLine2 ?? ''}
                  onChange={handleChange}
                  error={errors.mailingAddress?.addressLine2}
                />
                <Layouts.Flex>
                  <Layouts.Column>
                    <FormInput
                      name="mailingAddress.state"
                      label="State*"
                      value={values.mailingAddress.state}
                      onChange={handleChange}
                      error={errors.mailingAddress?.state}
                    />
                  </Layouts.Column>
                  <Layouts.Column>
                    <FormInput
                      name="mailingAddress.zip"
                      label="ZIP*"
                      value={values.mailingAddress.zip}
                      onChange={handleChange}
                      error={errors.mailingAddress?.zip}
                    />
                  </Layouts.Column>
                </Layouts.Flex>
              </Layouts.Column>
            </Layouts.Flex>
          </Layouts.Column>
          <Layouts.Column />
        </Layouts.Flex>
      ) : null}
    </Layouts.Padding>
  );
};

export default observer(Addresses);
