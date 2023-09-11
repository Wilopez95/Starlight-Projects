import React from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { FieldArray, getIn, useFormikContext } from 'formik';

import { FormInput } from '@root/common';
import { Divider } from '@root/common/TableTools';
import PhoneNumber from '@root/components/PhoneNumber/PhoneNumber';
import PhoneNumberAdd from '@root/components/PhoneNumber/PhoneNumberAdd';

import { INewCustomerData } from '../../types';

const MAX_PHONE_NUMBERS_COUNT = 5;

const MainContactTab: React.FC = () => {
  const { values, errors, handleChange, setFieldValue } = useFormikContext<INewCustomerData>();

  return (
    <Layouts.Flex flexGrow={1} direction="column">
      <Layouts.Padding padding="5" top="3">
        <Layouts.Flex>
          <Layouts.Column>
            <FormInput
              label="First Name*"
              name="mainFirstName"
              value={values.mainFirstName}
              error={errors.mainFirstName}
              onChange={handleChange}
            />
            <FormInput
              label="Last Name*"
              name="mainLastName"
              value={values.mainLastName}
              error={errors.mainLastName}
              onChange={handleChange}
            />
          </Layouts.Column>
          <Layouts.Column>
            <FormInput
              label="Title"
              name="mainJobTitle"
              value={values.mainJobTitle ?? ''}
              error={errors.mainJobTitle}
              onChange={handleChange}
            />
            <FormInput
              label="Email"
              type="email"
              name="mainEmail"
              value={values.mainEmail}
              error={errors.mainEmail}
              onChange={handleChange}
            />
          </Layouts.Column>
        </Layouts.Flex>
      </Layouts.Padding>
      <Divider />
      <FieldArray name="mainPhoneNumbers">
        {({ push, remove }) => {
          return (
            <>
              <Layouts.Box backgroundColor="grey" backgroundShade="desaturated">
                <Layouts.Padding padding="3" left="5" right="5">
                  {values.mainPhoneNumbers?.map((phoneNumber, index) => (
                    <PhoneNumber
                      index={index}
                      key={index}
                      phoneNumber={phoneNumber}
                      parentFieldName="mainPhoneNumbers"
                      errors={getIn(errors, 'mainPhoneNumbers')}
                      errorsDuplicate={errors.mainPhoneNumbers}
                      onRemove={remove}
                      onChange={handleChange}
                      onNumberChange={setFieldValue}
                      showTextOnly
                    />
                  ))}
                </Layouts.Padding>
              </Layouts.Box>
              <Divider />
              <Layouts.Box>
                <Layouts.Padding padding="5" top="3" bottom="3">
                  {values.mainPhoneNumbers &&
                  values.mainPhoneNumbers.length < MAX_PHONE_NUMBERS_COUNT ? (
                    <PhoneNumberAdd index={values.mainPhoneNumbers.length} push={push} />
                  ) : null}
                </Layouts.Padding>
              </Layouts.Box>
            </>
          );
        }}
      </FieldArray>
    </Layouts.Flex>
  );
};

export default MainContactTab;
