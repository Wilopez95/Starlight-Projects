import React, { useCallback, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { FormikHelpers, useFormik } from 'formik';
import { observer } from 'mobx-react-lite';

import { CompanyService } from '@root/api';
import { FormInput, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { FormContainer, PhoneField } from '@root/components';
import Addresses from '@root/components/ConfigurationAddresses/Addresses';
import { convertDates, NotificationHelper } from '@root/helpers';
import { usePermission, useScrollOnError, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { type ICompanySection } from '../types';

import styles from '../css/styles.scss';
import { getEntityValues, getFormValues, validationSchema } from './formikData';
import { type FormikCompanyInformation } from './types';

const I18N_BASE = 'pages.SystemConfiguration.tables.Companies.sections.CompanyInformation.';
const I18N_PATH = `${I18N_BASE}Text.`;
const I18N_PATH_FORM = `${I18N_BASE}Form.`;

const CompanyInformationSection: React.FC<ICompanySection> = ({
  loading,
  company,
  onSetCurrentCompany,
  onSetCompany,
}) => {
  const { i18nStore } = useStores();
  const { t } = useTranslation();
  const intl = useIntl();
  const canUpdateProfile = usePermission('configuration:company-profile:update');

  const onSubmit = useCallback(
    async (val: FormikCompanyInformation, helpers: FormikHelpers<FormikCompanyInformation>) => {
      try {
        const entity = getEntityValues(val);

        const { updatedAt } = convertDates(
          await CompanyService.updateCompanyInformation({
            ...entity,
            mailingAddress: { ...entity.mailingAddress, region: i18nStore.region },
            physicalAddress: { ...entity.physicalAddress, region: i18nStore.region },
          }),
        );

        if (company) {
          onSetCompany?.({
            ...company,
            updatedAt,
            mailingAddress: { ...company.mailingAddress, region: i18nStore.region },
            physicalAddress: { ...company.physicalAddress, region: i18nStore.region },
          });
        }
        helpers.setFieldValue('updatedAt', updatedAt);
        NotificationHelper.success('update', 'Company information');
      } catch (error: unknown) {
        const typedError = error as ApiError;
        if (typedError.statusCode === 412) {
          onSetCurrentCompany?.();
        }
        NotificationHelper.error(
          'update',
          typedError.response.code as ActionCode,
          'Company information',
        );
      }
    },
    [company, onSetCompany, i18nStore.region, onSetCurrentCompany],
  );

  const formik = useFormik({
    enableReinitialize: loading,
    initialValues: getFormValues(company),
    validationSchema: validationSchema(intl),
    onSubmit,
    validateOnChange: false,
  });

  const { values, errors, handleChange, isSubmitting, setFieldValue } = formik;

  useScrollOnError(errors, isSubmitting);

  useLayoutEffect(() => {
    setFieldValue('updatedAt', company?.updatedAt);
  }, [company, setFieldValue]);

  return (
    <FormContainer formik={formik}>
      <div className={styles.section}>
        <Layouts.Padding padding="3" bottom="0">
          <Layouts.Margin bottom="3">
            <Typography variant="headerThree">{t(`${I18N_PATH}CompanyInformation`)}</Typography>
          </Layouts.Margin>
          <Layouts.Margin bottom="3">
            <Typography variant="headerFive">General Info</Typography>
          </Layouts.Margin>
          <Layouts.Column>
            <Layouts.Flex>
              <Layouts.Column>
                <FormInput
                  name="officialEmail"
                  label={t(`${I18N_PATH_FORM}OfficialEmail`)}
                  value={values.officialEmail}
                  onChange={handleChange}
                  error={errors.officialEmail}
                />
                <PhoneField
                  name="phone"
                  label={`${t(`${I18N_PATH_FORM}Phone`)}*`}
                  value={values.phone}
                  onChange={handleChange}
                  error={errors.phone}
                />
              </Layouts.Column>
              <Layouts.Column>
                <FormInput
                  name="officialWebsite"
                  label={t(`${I18N_PATH_FORM}OfficialWebSite`)}
                  value={values.officialWebsite}
                  onChange={handleChange}
                  error={errors.officialWebsite}
                />
                <PhoneField
                  name="fax"
                  label={t(`${I18N_PATH_FORM}Fax`)}
                  value={values.fax}
                  onChange={handleChange}
                  error={errors.fax}
                />
              </Layouts.Column>
            </Layouts.Flex>
          </Layouts.Column>
        </Layouts.Padding>
        <Addresses />
        <Divider />
        <Layouts.Flex justifyContent="flex-end">
          <Layouts.Padding padding="3">
            {canUpdateProfile ? (
              <Button type="submit" variant="primary">
                {t(`${I18N_PATH}SaveInfo`)}
              </Button>
            ) : null}
          </Layouts.Padding>
        </Layouts.Flex>
      </div>
    </FormContainer>
  );
};

export default observer(CompanyInformationSection);
