import React from 'react';
import { useFormikContext } from 'formik';

import { FormInput } from '@root/common';

import { INewCustomerData } from '../../types';

const GeneralInformationName: React.FC<{ commercial: boolean }> = ({ commercial }) => {
  const { values, errors, handleChange } = useFormikContext<INewCustomerData>();

  return commercial ? (
    <FormInput
      label="Business Name*"
      name="businessName"
      value={values.businessName}
      error={errors.businessName}
      onChange={handleChange}
    />
  ) : (
    <>
      <FormInput
        label="First Name*"
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
    </>
  );
};

export default GeneralInformationName;
