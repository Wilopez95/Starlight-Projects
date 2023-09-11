import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { type ISubscriptionOnHoldDetails } from '@root/types';

import { FormContainerLayout } from '../layout/FormContainer';
import { type IForm } from '../types';

import SubscriptionOnHoldReasons from './components/OnHoldReasons.tsx/OnHoldReasons';
import { generateValidationSchema, initialValues } from './formikData';
import { useReasonOptions } from './hooks';

const I18N_BASE = `components.forms.SubscriptionOnHold.`;
const I18N_BASE_FORM = `${I18N_BASE}Form.`;
const I18N_BASE_FORM_VALIDATORS = `${I18N_BASE}ValidationErrors.`;

const SubscriptionOnHold: React.FC<IForm<ISubscriptionOnHoldDetails> & { updateOnly: boolean }> = ({
  onSubmit,
  onClose,
  updateOnly,
}) => {
  const { t } = useTranslation();
  const reasonOptions = useReasonOptions();

  const formik = useFormik({
    validationSchema: generateValidationSchema(t, I18N_BASE_FORM_VALIDATORS),
    validateOnChange: false,
    initialValues: initialValues(reasonOptions[0].value.toString()),
    onSubmit,
    onReset: onClose,
  });

  const { isSubmitting } = formik;

  return (
    <FormContainerLayout formik={formik}>
      <Layouts.Flex direction="column" justifyContent="space-between">
        <Layouts.Padding top="3" right="5" left="5" bottom="2">
          <Typography variant="headerThree">{t(`${I18N_BASE_FORM}HoldSubscription`)}</Typography>
        </Layouts.Padding>
        <Divider />
        <SubscriptionOnHoldReasons />
        <Divider />
        <Layouts.Padding padding="2" left="5" right="5">
          <Layouts.Flex justifyContent="space-between">
            <Button type="reset" disabled={isSubmitting}>
              {t('Text.Cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting} variant="primary">
              {t(`Text.${updateOnly ? 'SaveChanges' : 'OnHold'}`)}
            </Button>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Flex>
    </FormContainerLayout>
  );
};

export default observer(SubscriptionOnHold);
