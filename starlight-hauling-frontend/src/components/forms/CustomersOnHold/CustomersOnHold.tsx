import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { useStores } from '@root/hooks';
import { type ICustomersOnHold } from '@root/types';

import { FormContainerLayout } from '../layout/FormContainer';
import SubscriptionOnHoldReasons from '../SubscriptionOnHold/components/OnHoldReasons.tsx/OnHoldReasons';
import { type IForm } from '../types';

import NoSubscriptionsMessage from './components/NoSubscriptionsMessage/NoSubscriptionsMessage';
import { generateValidationSchema, useGetInitialValues } from './formikData';

const I18N_BASE = `components.forms.CustomersOnHold.`;
const I18N_BASE_FORM = `${I18N_BASE}Form.`;
const I18N_BASE_FORM_VALIDATORS = `${I18N_BASE}ValidationErrors.`;

const CustomersOnHold: React.FC<IForm<ICustomersOnHold>> = ({ onSubmit, onClose }) => {
  const { t } = useTranslation();
  const { customerStore } = useStores();
  const haveAnySubscriptions = customerStore.availableSelectedCustomersSubscriptions;

  const formik = useFormik({
    validationSchema: generateValidationSchema(t, I18N_BASE_FORM_VALIDATORS),
    validateOnChange: false,
    initialValues: useGetInitialValues(),
    onSubmit,
    onReset: onClose,
  });

  const { isSubmitting } = formik;

  return (
    <FormContainerLayout formik={formik}>
      <Layouts.Flex direction="column" justifyContent="space-between">
        <Layouts.Padding top="3" right="7.5" left="5" bottom="2">
          <Typography variant="headerThree">{t(`${I18N_BASE_FORM}Title`)}</Typography>
          <Layouts.Padding top="1" bottom="1">
            <Typography variant="bodyMedium">{t(`${I18N_BASE_FORM}SubTitle`)}</Typography>
          </Layouts.Padding>
        </Layouts.Padding>
        <Divider />
        <Layouts.Padding top="1.5" right="5" left="5" bottom="1">
          <Typography variant="headerFour">{t(`${I18N_BASE_FORM}HoldSubscriptions`)}</Typography>
        </Layouts.Padding>
        {haveAnySubscriptions ? (
          <Layouts.Scroll>
            <SubscriptionOnHoldReasons />
          </Layouts.Scroll>
        ) : (
          <NoSubscriptionsMessage />
        )}
        <Divider />
        <Layouts.Padding padding="2" left="5" right="5">
          <Layouts.Flex justifyContent="space-between">
            <Button type="reset" disabled={isSubmitting}>
              {t('Text.Cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting} variant="primary">
              {t('Text.OnHold')}
            </Button>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Flex>
    </FormContainerLayout>
  );
};

export default observer(CustomersOnHold);
