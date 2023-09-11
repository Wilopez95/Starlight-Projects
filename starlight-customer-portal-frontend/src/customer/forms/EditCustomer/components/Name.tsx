import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormInput } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';

import { IEditCustomerData } from '@root/customer/forms/EditCustomer/types';

const GeneralInformationName: React.FC<{ commercial: boolean }> = ({ commercial }) => {
  const { values, errors, handleChange } = useFormikContext<IEditCustomerData>();

  const { t } = useTranslation();
  const I18N_PATH = 'components.GeneralInformationName.';

  return commercial ? (
    <FormInput
      label={t(`${I18N_PATH}BusinessName`)}
      name='businessName'
      value={values.businessName}
      error={errors.businessName}
      onChange={handleChange}
    />
  ) : (
    <>
      <FormInput
        label={t(`${I18N_PATH}FirstName`)}
        name='firstName'
        value={values.firstName}
        error={errors.firstName}
        onChange={handleChange}
      />
      <FormInput
        label={t(`${I18N_PATH}LastName`)}
        name='lastName'
        value={values.lastName}
        error={errors.lastName}
        onChange={handleChange}
      />
    </>
  );
};

export default GeneralInformationName;
