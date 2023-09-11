import React, { useCallback } from 'react';
import { Button, Checkbox, Layouts } from '@starlightpro/shared-components';
import { FieldArray, getIn, useFormik } from 'formik';

import { FormInput, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import PhoneNumber from '@root/components/PhoneNumber/PhoneNumber';
import PhoneNumberAdd from '@root/components/PhoneNumber/PhoneNumberAdd';
import { isCore } from '@root/consts/env';
import { useIntl } from '@root/i18n/useIntl';

import { FormContainerLayout } from '../layout/FormContainer';
import { IForm } from '../types';

import { getValues, validationSchema } from './formikData';
import { IContactFormData } from './types';

const MAX_PHONE_NUMBERS_COUNT = 5;

const NewContact: React.FC<IForm<IContactFormData>> = ({ onSubmit, onClose }) => {
  const intl = useIntl();

  const formik = useFormik({
    validationSchema: validationSchema(intl),
    initialValues: getValues(),
    validateOnChange: false,
    initialErrors: {},
    onSubmit,
    onReset: onClose,
  });

  const { values, errors, handleChange, isSubmitting, setFieldValue } = formik;

  const handleChangeTemporaryContact = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
        setFieldValue('allowContractorApp', false);
      }
      handleChange(e);
    },
    [handleChange, setFieldValue],
  );

  return (
    <FormContainerLayout formik={formik}>
      <Layouts.Flex direction="column">
        <Layouts.Padding top="3" right="5" left="5">
          <Typography variant="headerThree">Create New Contact</Typography>
        </Layouts.Padding>
        <Layouts.Flex flexGrow={1} direction="column" justifyContent="space-around">
          <Layouts.Padding right="5" bottom="3" left="5">
            <Layouts.Padding top="1" bottom="1">
              <Layouts.Flex>
                <Layouts.Column>
                  <FormInput
                    label="Fist Name*"
                    name="firstName"
                    value={values.firstName}
                    error={errors.firstName}
                    onChange={handleChange}
                  />

                  <FormInput
                    label="Last Name*"
                    name="lastName"
                    value={values.lastName}
                    error={errors.lastName}
                    onChange={handleChange}
                  />
                  <Checkbox
                    id="temporaryContact"
                    name="temporaryContact"
                    value={values.temporaryContact}
                    error={errors.temporaryContact}
                    onChange={handleChangeTemporaryContact}
                  >
                    Temporary contact for this order only
                  </Checkbox>
                </Layouts.Column>
                <Layouts.Column>
                  <FormInput
                    label="Job title"
                    name="jobTitle"
                    value={values.jobTitle ?? ''}
                    error={errors.jobTitle}
                    onChange={handleChange}
                  />

                  <FormInput
                    label="Email*"
                    name="email"
                    value={values.email ?? ''}
                    error={errors.email}
                    onChange={handleChange}
                  />
                </Layouts.Column>
              </Layouts.Flex>
            </Layouts.Padding>
            <Divider both />
            <FieldArray name="phoneNumbers">
              {({ push, remove }) => {
                return (
                  <>
                    <Layouts.Padding top="1" bottom="1">
                      {values.phoneNumbers?.map((phoneNumber, index) => (
                        <PhoneNumber
                          index={index}
                          key={index}
                          phoneNumber={phoneNumber}
                          parentFieldName="phoneNumbers"
                          errors={getIn(errors, 'phoneNumbers')}
                          onRemove={remove}
                          onChange={handleChange}
                          onNumberChange={setFieldValue}
                          showTextOnly
                          firstNumberRemovable
                        />
                      ))}
                    </Layouts.Padding>
                    {values.phoneNumbers && values.phoneNumbers.length < MAX_PHONE_NUMBERS_COUNT ? (
                      <Layouts.Padding top="1" bottom="1">
                        <Layouts.Flex>
                          <PhoneNumberAdd index={values.phoneNumbers.length} push={push} />
                        </Layouts.Flex>
                      </Layouts.Padding>
                    ) : null}
                  </>
                );
              }}
            </FieldArray>
            <Divider both />
            <Typography variant="headerThree">Permissions</Typography>
            <Layouts.Padding top="3" bottom="3">
              <Layouts.Margin bottom="2">
                <Checkbox
                  id="allowContractorApp"
                  name="allowContractorApp"
                  value={values.allowContractorApp}
                  error={errors.allowContractorApp}
                  disabled={values.temporaryContact}
                  onChange={handleChange}
                >
                  Allow contractor app
                </Checkbox>
              </Layouts.Margin>
              {!isCore ? (
                <Checkbox
                  id="allowCustomerPortal"
                  name="allowCustomerPortal"
                  value={values.allowCustomerPortal}
                  onChange={handleChange}
                >
                  Allow customer portal
                </Checkbox>
              ) : null}
            </Layouts.Padding>
          </Layouts.Padding>
        </Layouts.Flex>
        <Divider />
        <Layouts.Padding padding="4" left="5" right="5">
          <Layouts.Flex justifyContent="space-between">
            <Button type="reset" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} variant="success">
              Create Contact
            </Button>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Flex>
    </FormContainerLayout>
  );
};

export default NewContact;
