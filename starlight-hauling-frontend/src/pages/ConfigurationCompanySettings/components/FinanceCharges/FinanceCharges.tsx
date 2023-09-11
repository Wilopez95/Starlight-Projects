import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { useFormik } from 'formik';

import { CompanyService } from '@root/api';
import { FormInput, RadioButton, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { FormContainer } from '@root/components';
import { convertDates, NotificationHelper } from '@root/helpers';
import { usePermission } from '@root/hooks';
import { buildI18Path } from '@root/i18n/helpers';
import { useIntl } from '@root/i18n/useIntl';
import { FinanceChargeMethod, IEntity, IFinanceChargesSettings } from '@root/types';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { ConvertDateFields, DeepMap } from '../../../../types/helpers/JsonConversions';
import { FinanceChargesSettings, initialValues, validationSchema } from './formikData';

const I18N_PATH = buildI18Path(
  'pages.SystemConfiguration.tables.CompanySettings.components.FinanceCharges.',
);

const FinanceChargesSettings: React.FC = () => {
  const [currentSettings, setCurrentSettings] = useState<FinanceChargesSettings>();
  const { t } = useTranslation();
  const { currencySymbol } = useIntl();
  const canUpdateCompanySettings = usePermission('configuration:company-settings:update');

  const handleSubmit = useCallback(async (values: IFinanceChargesSettings) => {
    try {
      await CompanyService.updateFinanceChargesSettings(values);

      NotificationHelper.success('update', 'Finance charges settings');
    } catch (error) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError.response.code as ActionCode);
    }
  }, []);

  const formik = useFormik({
    validationSchema: validationSchema(t, I18N_PATH.ValidationErrors),
    enableReinitialize: true,
    validateOnChange: false,
    initialValues: currentSettings ?? initialValues,
    onSubmit: handleSubmit,
  });

  const { values, errors, handleChange, setFieldValue, isSubmitting } = formik;

  useEffect(() => {
    (async () => {
      try {
        const financeChargesSettings = await CompanyService.getFinanceChargesSettings();

        if (financeChargesSettings) {
          setCurrentSettings(
            convertDates(
              financeChargesSettings as
                | DeepMap<ConvertDateFields<Omit<IEntity, 'id'>>>
                | null
                | undefined,
            ) as FinanceChargesSettings,
          );
        }
      } catch (error) {
        const typedError = error as ApiError;
        NotificationHelper.error(
          'update',
          typedError.response.code as ActionCode,
          'Finance charges settings',
        );
      }
    })();
  }, []);

  const handleMethodChange = useCallback(
    (value: string) => {
      setFieldValue('financeChargeMethod', value);
    },
    [setFieldValue],
  );

  return (
    <Layouts.Flex flexGrow={1}>
      <Layouts.Box as={Layouts.Padding} padding="4" width="100%" backgroundColor="white">
        <FormContainer fullHeight formik={formik}>
          <Layouts.Flex
            as={Layouts.Box}
            height="100%"
            direction="column"
            justifyContent="space-between"
          >
            <Layouts.Box width="50%">
              <Layouts.Margin bottom="3">
                <Layouts.Grid
                  role="radiogroup"
                  aria-labelledby="financeChargeMethod"
                  columns="2fr 1fr 1fr"
                >
                  <Layouts.Padding top="1">
                    <Typography id="financeChargeMethod" color="secondary" shade="light">
                      {t(`${I18N_PATH.Text}Method`)}
                    </Typography>
                  </Layouts.Padding>
                  <RadioButton
                    name="financeChargeMethod"
                    onChange={() => handleMethodChange(FinanceChargeMethod.days)}
                    value={values.financeChargeMethod === FinanceChargeMethod.days}
                  >
                    {t(`${I18N_PATH.Text}Days`)}
                  </RadioButton>
                  <RadioButton
                    name="financeChargeMethod"
                    onChange={() => handleMethodChange(FinanceChargeMethod.daysPeriod30)}
                    value={values.financeChargeMethod === FinanceChargeMethod.daysPeriod30}
                  >
                    {t(`${I18N_PATH.Text}30DaysPeriods`)}
                  </RadioButton>
                </Layouts.Grid>
              </Layouts.Margin>
              <Layouts.Grid columns="3fr 1fr 2fr">
                <Layouts.Padding top="1">
                  <Typography as="label" htmlFor="financeChargeApr" color="secondary" shade="light">
                    {t(`${I18N_PATH.Text}APR`)}*
                  </Typography>
                </Layouts.Padding>
                <FormInput
                  name="financeChargeApr"
                  placeholder={t(`${I18N_PATH.Form}APR`)}
                  value={values.financeChargeApr}
                  error={errors.financeChargeApr}
                  onChange={handleChange}
                />
                <Layouts.Padding top="1" left="1">
                  %
                </Layouts.Padding>
              </Layouts.Grid>
              <Layouts.Grid columns="1fr 1fr">
                <Layouts.Padding top="1">
                  <Typography
                    as="label"
                    htmlFor="financeChargeMinBalance"
                    color="secondary"
                    shade="light"
                  >
                    {t(`${I18N_PATH.Text}MinimumBalance`, { currencySymbol })}*
                  </Typography>
                </Layouts.Padding>
                <FormInput
                  name="financeChargeMinBalance"
                  placeholder={t(`${I18N_PATH.Form}MinimumBalance`)}
                  value={values.financeChargeMinBalance}
                  error={errors.financeChargeMinBalance}
                  onChange={handleChange}
                />
              </Layouts.Grid>
              <Layouts.Grid columns="1fr 1fr">
                <Layouts.Padding top="1">
                  <Typography
                    as="label"
                    htmlFor="financeChargeMinValue"
                    color="secondary"
                    shade="light"
                  >
                    {t(`${I18N_PATH.Text}MinimumFinance`, { currencySymbol })}*
                  </Typography>
                </Layouts.Padding>
                <FormInput
                  name="financeChargeMinValue"
                  placeholder={t(`${I18N_PATH.Form}MinimumFinanceCharge`)}
                  value={values.financeChargeMinValue}
                  error={errors.financeChargeMinValue}
                  onChange={handleChange}
                />
              </Layouts.Grid>
            </Layouts.Box>
            <Layouts.Box>
              <Layouts.Padding bottom="3">
                <Divider />
              </Layouts.Padding>
              <Layouts.Flex justifyContent="flex-end">
                {canUpdateCompanySettings ? (
                  <Button type="submit" variant="primary" disabled={isSubmitting}>
                    {t(`${I18N_PATH.Text}SaveChanges`)}
                  </Button>
                ) : null}
              </Layouts.Flex>
            </Layouts.Box>
          </Layouts.Flex>
        </FormContainer>
      </Layouts.Box>
    </Layouts.Flex>
  );
};

export default FinanceChargesSettings;
