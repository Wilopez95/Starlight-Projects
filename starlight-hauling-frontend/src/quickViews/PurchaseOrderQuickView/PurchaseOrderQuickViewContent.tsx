import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { Calendar, Checkbox, Layouts } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { isEmpty, noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import {
  FormInput,
  QuickViewConfirmModal,
  QuickViewContent,
  Typography,
  useQuickViewContext,
} from '@root/common';
import { Divider, Table } from '@root/common/TableTools';
import tableQuickViewStyles from '@root/common/TableTools/TableQuickView/css/styles.scss';
import { FormContainer } from '@root/components';
import { useDateIntl } from '@root/helpers/format/date';
import { buildI18Path } from '@root/i18n/helpers';
import { useIntl } from '@root/i18n/useIntl';
import { ICustomerPageParams } from '@root/pages/Customer/types';
import { ButtonContainer } from '@root/pages/SystemConfiguration/components';
import { useBusinessContext, useStores } from '@hooks';

import { getValues, validationSchema } from './formikData';

import styles from './css/styles.scss';

const I18N_PATH = buildI18Path('quickViews.PurchaseOrder.');

const PurchaseOrderQuickViewContent = () => {
  const { closeQuickView, forceCloseQuickView } = useQuickViewContext();

  const { purchaseOrderStore, businessUnitStore } = useStores();
  const { dateFormat, formatDate } = useDateIntl();
  const { currencySymbol, firstDayOfWeek } = useIntl();
  const { t } = useTranslation();
  const { customerId } = useParams<ICustomerPageParams>();
  const { businessUnitId } = useBusinessContext();
  const businessUnit = businessUnitStore.getById(businessUnitId);

  const selectedPurchaseOrder = purchaseOrderStore.selectedEntity;
  const isNew = !selectedPurchaseOrder;

  const formik = useFormik({
    validationSchema: validationSchema(t, I18N_PATH.ValidationErrors),
    validateOnChange: false,
    enableReinitialize: true,
    initialErrors: {},
    initialValues: getValues(selectedPurchaseOrder, businessUnit?.businessLines),
    onSubmit: noop,
  });

  const {
    values,
    errors,
    dirty,
    validateForm,
    handleChange,
    setFieldValue,
    isSubmitting,
    setValues,
  } = formik;

  const handlePurchaseOrderChange = useCallback(
    async data => {
      const formErrors = await validateForm();

      if (!isEmpty(formErrors)) {
        return;
      }

      if (data.id === 0) {
        await purchaseOrderStore.create({
          ...values,
          customerId,
        });
      } else {
        await purchaseOrderStore.update(values);
      }
      forceCloseQuickView();
    },
    [validateForm, values, forceCloseQuickView, purchaseOrderStore, customerId],
  );

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

  const title = isNew ? t(`${I18N_PATH.Text}NewPurchaseOrder`) : selectedPurchaseOrder?.poNumber;
  const businessLineIdsError = Array.isArray(errors.businessLineIds)
    ? errors.businessLineIds[0]
    : errors.businessLineIds;

  return (
    <FormContainer formik={formik}>
      <QuickViewContent
        shouldShowModal={dirty ? !isSubmitting : undefined}
        confirmModal={<QuickViewConfirmModal />}
        rightPanelElement={
          <>
            <Layouts.Padding padding="3">
              <div className={tableQuickViewStyles.quickViewTitle}>{title}</div>
              {!isNew ? (
                <div className={tableQuickViewStyles.quickViewDescription}>
                  {t(`${I18N_PATH.Text}PurchaseOrder`)}
                </div>
              ) : null}
            </Layouts.Padding>
            <Divider />
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
                            color="secondary"
                            as="label"
                            htmlFor="poNumber"
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
                          firstDayOfWeek={firstDayOfWeek}
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
                          firstDayOfWeek={firstDayOfWeek}
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
          </>
        }
        actionsElement={
          <ButtonContainer
            isCreating={isNew}
            onCancel={closeQuickView}
            submitButtonType="button"
            submitButtonText={t(`${I18N_PATH.Text}PurchaseOrder`)}
            onSave={() => {
              handlePurchaseOrderChange(values);
            }}
          />
        }
      />
    </FormContainer>
  );
};

export default observer(PurchaseOrderQuickViewContent);
