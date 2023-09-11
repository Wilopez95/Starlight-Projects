import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts, useToggle } from '@starlightpro/shared-components';
import { useFormik } from 'formik';

import { EyeIcon } from '@root/assets';
import { FormInput, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';

import { FormContainerLayout } from '../layout/FormContainer';

import { getValues, validationSchema } from './formikData';
import { IMerchantInput, type IAddEditMerchantForm } from './types';

const I18N_PATH = 'components.forms.AddEditMerchant.Text.';

const AddEditMerchant: React.FC<IAddEditMerchantForm> = ({
  hasApprovedMerchant,
  title,
  initialValues,
  onSubmit,
  onClose,
}) => {
  const { t } = useTranslation();
  const [isPasswordVisible, toggleShowPassword] = useToggle();

  const formik = useFormik<IMerchantInput>({
    validationSchema: validationSchema(t),
    initialValues: getValues(initialValues),
    validateOnChange: false,
    onSubmit,
    onReset: onClose,
  });

  const { values, errors, handleChange, isSubmitting } = formik;

  return (
    <FormContainerLayout formik={formik}>
      <Layouts.Flex direction="column" justifyContent="space-between">
        <Layouts.Padding top="3" right="5" left="5" bottom="2">
          <Typography variant="headerThree">{title}</Typography>
        </Layouts.Padding>
        <Layouts.Flex direction="column" flexGrow={1}>
          <Layouts.Padding left="5" right="5">
            <FormInput
              label={`${t(`${I18N_PATH}Merchant`)}*`}
              name="mid"
              value={values.mid}
              error={errors.mid}
              onChange={handleChange}
              disabled={hasApprovedMerchant}
            />
            <FormInput
              label={`${t(`${I18N_PATH}Username`)}*`}
              name="username"
              value={values.username}
              error={errors.username}
              onChange={handleChange}
            />
            <FormInput
              type={isPasswordVisible ? 'text' : 'password'}
              label={`${t(`${I18N_PATH}Password`)}*`}
              name="password"
              placeholder={t(`${I18N_PATH}PasswordPlaceholder`)}
              value={values.password}
              error={errors.password}
              onChange={handleChange}
              rightIcon={EyeIcon}
              onRightImageClick={toggleShowPassword}
            />
          </Layouts.Padding>
        </Layouts.Flex>
        <Divider />
        <Layouts.Padding padding="4" left="5" right="5">
          <Layouts.Flex justifyContent="space-between">
            <Button type="reset" disabled={isSubmitting}>
              {t('Text.Cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting} variant="success">
              {t(`${I18N_PATH}SaveMerchant`)}
            </Button>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Flex>
    </FormContainerLayout>
  );
};

export default AddEditMerchant;
