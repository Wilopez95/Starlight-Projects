import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Calendar, Checkbox, Layouts } from '@starlightpro/shared-components';
import { useFormik } from 'formik';

import { FormInput, Typography } from '@root/common';
import { Divider, Table } from '@root/common/TableTools';
import { useDateIntl } from '@root/helpers/format/date';
import { buildI18Path } from '@root/i18n/helpers';
import { useIntl } from '@root/i18n/useIntl';
import styles from '@root/quickViews/PurchaseOrderQuickView/css/styles.scss';
import { IPurchaseOrder } from '@root/types';
import { useBusinessContext, useStores } from '@hooks';

import { FormContainerLayout } from '../layout/FormContainer';
import { IForm } from '../types';

import { getValues, validationSchema } from './formikData';

const I18N_PATH = buildI18Path('components.forms.PurchaseOrder.');

const NewPurchaseOrder: React.FC<IForm<IPurchaseOrder>> = ({ onSubmit, onClose }) => {
  const { currencySymbol } = useIntl();
  const { t } = useTranslation();
  const { dateFormat, formatDate } = useDateIntl();
  const { businessUnitStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const businessUnit = businessUnitStore.getById(businessUnitId);

  const formik = useFormik({
    validationSchema: validationSchema(t, I18N_PATH.ValidationErrors),
    initialValues: getValues(businessUnit?.businessLines),
    validateOnChange: false,
    initialErrors: {},
    onSubmit,
    onReset: onClose,
  });

  const { values, errors, handleChange, isSubmitting, setFieldValue, setValues } = formik;

  const handleChangeCheckbox = useCallback(
    businessLineId => {
      if (isSubmitting) {
        return;
      }

      const businessLineIds = values.businessLineIds.some(item => item === businessLineId)
        ? values.businessLineIds.filter(item => item !== businessLineId)
        : [...values.businessLineIds, businessLineId];

      setValues({
        ...values,
        businessLineIds,
      });
    },
    [isSubmitting, setValues, values],
  );

  const businessLineIdsError = Array.isArray(errors.businessLineIds)
    ? errors.businessLineIds[0]
    : errors.businessLineIds;

  return (
    <FormContainerLayout formik={formik}>
      <Layouts.Flex direction="column">
        <Layouts.Padding padding="3">
          <Typography variant="headerThree">{t(`${I18N_PATH.Text}CreateNew`)}</Typography>
        </Layouts.Padding>
        <Layouts.Scroll>
          <Layouts.Padding padding="3" left="2" right="2">
            <Table className={styles.formContainer}>
              <tbody>
                <tr>
                  <td>
                    <Layouts.Padding bottom="3">
                      <Typography variant="bodyMedium" color="secondary" shade="light">
                        {t('Text.Status')}
                      </Typography>
                    </Layouts.Padding>
                  </td>
                  <td>
                    <Layouts.Padding bottom="3">
                      <Checkbox
                        disabled
                        id="activeCheckbox"
                        name="active"
                        value={values.active}
                        onChange={handleChange}
                      >
                        {t('Text.Active')}
                      </Checkbox>
                    </Layouts.Padding>
                  </td>
                </tr>
                <tr>
                  <td>
                    <Layouts.Padding bottom="3">
                      <Typography
                        variant="bodyMedium"
                        as="label"
                        htmlFor="poNumber"
                        color="secondary"
                        shade="light"
                      >
                        {t(`${I18N_PATH.Text}PO`)} #*
                      </Typography>
                    </Layouts.Padding>
                  </td>
                  <td>
                    <FormInput
                      name="poNumber"
                      onChange={handleChange}
                      value={values.poNumber}
                      error={errors.poNumber}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <Layouts.Padding bottom="3">
                      <Typography
                        variant="bodyMedium"
                        as="label"
                        htmlFor="effectiveDate"
                        color="secondary"
                        shade="light"
                      >
                        {t(`${I18N_PATH.Text}EffectiveDate`)}
                      </Typography>
                    </Layouts.Padding>
                  </td>
                  <td>
                    <Calendar
                      name="effectiveDate"
                      withInput
                      onDateChange={setFieldValue}
                      value={values.effectiveDate}
                      placeholder={t('Text.SetDate')}
                      dateFormat={dateFormat}
                      formatDate={formatDate}
                      error={errors.effectiveDate}
                      maxDate={values.expirationDate ?? undefined}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <Layouts.Padding bottom="3">
                      <Typography
                        variant="bodyMedium"
                        as="label"
                        htmlFor="expirationDate"
                        color="secondary"
                        shade="light"
                      >
                        {t('Text.ExpirationDate')}
                      </Typography>
                    </Layouts.Padding>
                  </td>
                  <td>
                    <Calendar
                      name="expirationDate"
                      withInput
                      onDateChange={setFieldValue}
                      value={values.expirationDate}
                      placeholder={t('Text.SetDate')}
                      dateFormat={dateFormat}
                      formatDate={formatDate}
                      error={errors.expirationDate}
                      minDate={values.effectiveDate ?? undefined}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <Layouts.Padding bottom="3">
                      <Typography
                        variant="bodyMedium"
                        as="label"
                        htmlFor="poAmount"
                        color="secondary"
                        shade="light"
                      >
                        {t(`${I18N_PATH.Text}POAmount`, { currencySymbol })}
                      </Typography>
                    </Layouts.Padding>
                  </td>
                  <td>
                    <FormInput
                      type="number"
                      name="poAmount"
                      onChange={handleChange}
                      value={values.poAmount}
                      error={errors.poAmount}
                    />
                  </td>
                </tr>
                <tr>
                  <td className={styles.lob}>
                    <Layouts.Padding top="0.5">
                      <Typography variant="bodyMedium" color="secondary" shade="light">
                        {t(`${I18N_PATH.Text}LinesOfBusiness`)}
                      </Typography>
                    </Layouts.Padding>
                  </td>
                  <td>
                    {businessUnit?.businessLines.map(({ name, id }) => {
                      const isChecked = values.businessLineIds.some(item => item === id);

                      return (
                        <Layouts.Margin bottom="1.5" key={id}>
                          <Checkbox
                            value={isChecked}
                            onChange={() => handleChangeCheckbox(id)}
                            name="businessLineIds"
                            error={businessLineIdsError}
                          >
                            {name}
                          </Checkbox>
                        </Layouts.Margin>
                      );
                    })}
                    {businessLineIdsError ? (
                      <Typography color="alert" variant="bodySmall">
                        {businessLineIdsError}
                      </Typography>
                    ) : null}
                  </td>
                </tr>
              </tbody>
            </Table>
          </Layouts.Padding>
        </Layouts.Scroll>
        <Divider />
        <Layouts.Padding padding="3" left="4" right="4">
          <Layouts.Flex justifyContent="space-between">
            <Button type="reset" disabled={isSubmitting}>
              {t('Text.Cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting} variant="success">
              {t(`${I18N_PATH.Text}CreatePurchaseOrder`)}
            </Button>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Flex>
    </FormContainerLayout>
  );
};

export default NewPurchaseOrder;
