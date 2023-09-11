import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Layouts, Select } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { toLower } from 'lodash-es';

import { Banner, FormInput, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { orderCancellationReasonTypeOptions } from '@root/consts';
import { normalizeOptions } from '@root/helpers';

import { FormContainerLayout } from '../layout/FormContainer';
import { type IForm } from '../types';

import { getValues, validationSchema } from './formikData';
import { CancelOrderTypesEnum, ICancelOrderData, ICancelOrderProps } from './types';

const I18N_PATH = 'components.forms.CancelOrder.Text.';

const CancelOrder: React.FC<IForm<ICancelOrderData> & ICancelOrderProps> = ({
  onSubmit,
  onClose,
  orderType = CancelOrderTypesEnum.Order,
}) => {
  const { t } = useTranslation();

  const formik = useFormik({
    validationSchema: validationSchema(t),
    initialValues: getValues(),
    validateOnChange: false,
    onSubmit,
    onReset: onClose,
  });

  const { values, errors, handleChange, isSubmitting, setFieldValue } = formik;

  const orderTypeText = useMemo(() => t(`Text.${orderType}`), [orderType, t]);

  return (
    <FormContainerLayout formik={formik}>
      <Layouts.Flex direction="column" justifyContent="space-between">
        <Layouts.Padding top="3" right="5" left="5" bottom="2">
          <Typography variant="headerThree">
            {t(`${I18N_PATH}CancelOrder`, { orderType: orderTypeText })}
          </Typography>
        </Layouts.Padding>
        <Layouts.Flex direction="column" flexGrow={1}>
          <Layouts.Padding left="5" right="5">
            <Layouts.Margin bottom="3">
              <Banner color="primary">
                {t(`${I18N_PATH}CancelOrderDescription`, { orderType: toLower(orderTypeText) })}
              </Banner>
            </Layouts.Margin>
            <Select
              label={t(`${I18N_PATH}ReasonType`)}
              name="reasonType"
              options={normalizeOptions(orderCancellationReasonTypeOptions)}
              value={values.reasonType}
              onSelectChange={setFieldValue}
            />

            <FormInput
              label={t(`${I18N_PATH}Comment`)}
              placeholder={t(`${I18N_PATH}CommentPlaceholder`)}
              name="comment"
              value={values.comment}
              error={errors.comment}
              onChange={handleChange}
              area
            />
            <Checkbox name="addTripCharge" onChange={handleChange} value={values.addTripCharge}>
              {t(`${I18N_PATH}AddTripCharge`)}
            </Checkbox>
          </Layouts.Padding>
        </Layouts.Flex>
        <Divider />
        <Layouts.Padding padding="4" left="5" right="5">
          <Layouts.Flex justifyContent="space-between">
            <Button type="reset" disabled={isSubmitting}>
              {t('Text.Cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting} variant="alert">
              {t(`${I18N_PATH}ConfirmCancellation`)}
            </Button>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Flex>
    </FormContainerLayout>
  );
};

export default CancelOrder;
