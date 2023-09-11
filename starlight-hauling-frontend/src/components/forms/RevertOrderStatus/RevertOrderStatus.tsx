import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { useFormik } from 'formik';

import { FormInput, RadioButton, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { type RevertableStatus, type ScheduledOrInProgress } from '@root/types';

import { FormContainerLayout } from '../layout/FormContainer';

import { getDefaultValue, validationSchema } from './formikData';
import {
  type IRevertOrderStatusData,
  type IRevertOrderStatusForm,
  type IRevertStatusForm,
} from './types';

import formStyles from './css/styles.scss';

const actions: Record<RevertableStatus, string> = {
  completed: 'Text.Uncomplete',
  approved: 'Text.Unapprove',
  finalized: 'Text.Unfinalize',
};

const statuses: Record<ScheduledOrInProgress, string> = {
  scheduled: 'Text.SCHEDULED',
  inProgress: 'Text.IN_PROGRESS',
};

const I18N_PATH = 'components.forms.RevertOrderStatus.RevertOrderStatus.Text.';

const RevertOrderStatusForm: React.FC<IRevertOrderStatusForm<IRevertOrderStatusData>> = ({
  onSubmit,
  onClose,
  status,
  toStatus = [],
}) => {
  const { t } = useTranslation();
  const formik = useFormik<IRevertStatusForm>({
    validationSchema,
    initialValues: getDefaultValue(status, toStatus),
    validateOnChange: false,
    onSubmit,
    onReset: onClose,
  });

  const { values, errors, handleChange, isSubmitting, setFieldValue } = formik;
  const action = actions[status];

  const handleChangeStatus = useCallback(
    statusInfo => {
      setFieldValue('status', statusInfo);
    },
    [setFieldValue],
  );

  return (
    <FormContainerLayout formik={formik}>
      <Layouts.Flex direction="column">
        <Layouts.Padding top="3" right="5" left="5">
          <Typography variant="headerThree">
            {t(action)} {t('Text.Order')}
          </Typography>
        </Layouts.Padding>
        <Layouts.Flex direction="column" flexGrow={1}>
          <Layouts.Padding left="5" right="5" top="3">
            <FormInput
              label={t('Text.Comment')}
              name="comment"
              value={values.comment}
              error={errors.comment}
              onChange={handleChange}
              className={formStyles.comment}
              area
            />
          </Layouts.Padding>
        </Layouts.Flex>
        {toStatus.length >= 1 ? (
          <Layouts.Padding left="5" right="5" bottom="2.5">
            <Layouts.Flex alignItems="center">
              <Layouts.Margin right="3">
                <Typography variant="bodyMedium" color="secondary" shade="light">
                  {t(`${I18N_PATH}MoveTo`)}
                </Typography>
              </Layouts.Margin>
              {toStatus.map(statusInfo => (
                <Layouts.Margin key={status} right="2">
                  <RadioButton
                    name="status"
                    value={values.status === statusInfo}
                    onChange={() => handleChangeStatus(statusInfo)}
                  >
                    <Typography variant="bodyMedium" color="secondary" shade="light">
                      {t(statuses[statusInfo])}
                    </Typography>
                  </RadioButton>
                </Layouts.Margin>
              ))}
            </Layouts.Flex>
          </Layouts.Padding>
        ) : null}
        <Divider />
        <Layouts.Padding padding="4" left="5" right="5">
          <Layouts.Flex justifyContent="space-between">
            <Button type="reset" disabled={isSubmitting}>
              {t('Text.Cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting} variant="alert">
              {t(action)} {t('Text.Order')}
            </Button>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Flex>
    </FormContainerLayout>
  );
};

export default RevertOrderStatusForm;
