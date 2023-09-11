import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Layouts } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { type ICustomersResume } from '@root/types';

import { FormContainerLayout } from '../layout/FormContainer';
import { type IForm } from '../types';

const I18N_BASE = `components.forms.CustomersResume.`;
const I18N_BASE_FORM = `${I18N_BASE}Form.`;

const CustomersResume: React.FC<IForm<ICustomersResume>> = ({ onSubmit, onClose }) => {
  const { t } = useTranslation();

  const formik = useFormik({
    validateOnChange: false,
    initialValues: {
      shouldUnholdTemplates: true,
    },
    onSubmit,
    onReset: onClose,
  });

  const { isSubmitting, handleChange, values } = formik;

  return (
    <FormContainerLayout formik={formik}>
      <Layouts.Flex direction="column" justifyContent="space-between">
        <Layouts.Padding top="3" right="7.5" left="5" bottom="3">
          <Typography variant="headerThree">{t(`${I18N_BASE_FORM}Title`)}</Typography>
          <Layouts.Padding top="1" bottom="2">
            <Typography variant="bodyMedium">{t(`${I18N_BASE_FORM}Message`)}</Typography>
          </Layouts.Padding>
          <Checkbox
            name="shouldUnholdTemplates"
            value={values.shouldUnholdTemplates}
            onChange={handleChange}
          >
            {t(`${I18N_BASE_FORM}ResumeAllRecurringServices`)}
          </Checkbox>
        </Layouts.Padding>
        <Divider />
        <Layouts.Padding padding="2" left="5" right="5">
          <Layouts.Flex justifyContent="space-between">
            <Button type="reset" disabled={isSubmitting}>
              {t('Text.Cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting} variant="primary">
              {t(`${I18N_BASE_FORM}Submit`)}
            </Button>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Flex>
    </FormContainerLayout>
  );
};

export default observer(CustomersResume);
