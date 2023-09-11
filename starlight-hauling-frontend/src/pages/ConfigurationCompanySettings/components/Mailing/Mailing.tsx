import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, CollapsibleBar, Layouts, Select } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { isEmpty, noop, omit } from 'lodash-es';

import { CompanyService } from '@root/api';
import { ApiError } from '@root/api/base/ApiError';
import { DescriptiveTooltip, FormInput, MultiInput, Protected, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { FormContainer } from '@root/components';
import { emailBodyVariables } from '@root/consts';
import { isCore } from '@root/consts/env';
import { convertDates, getFormikErrors, NotificationHelper, notNullObject } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { useScrollOnError } from '@root/hooks';
import { buildI18Path } from '@root/i18n/helpers';
import { IDomain, IMailSettings, JsonConversions } from '@root/types';

import { getDefaultValues, getInitialValues, validationSchema } from './formikData';
import TemplateSettings from './TemplateSettings';
import { MailSettingsFormValue } from './types';

import styles from './css/styles.scss';

const isCurrentMailSettings = (
  settings: JsonConversions<IMailSettings> | MailSettingsFormValue,
): settings is JsonConversions<IMailSettings> => typeof settings.updatedAt === 'string';

const I18N_PATH = buildI18Path(
  'pages.SystemConfiguration.tables.CompanySettings.components.Mailing.',
);

const MailingSettings: React.FC = () => {
  const [domains, setDomains] = useState<Omit<IDomain, 'createdAt' | 'updatedAt'>[]>();
  const [currentSettings, setCurrentSettings] = useState<MailSettingsFormValue>();
  const { t } = useTranslation();

  const formik = useFormik({
    validationSchema: validationSchema(t, I18N_PATH.ValidationErrors),
    enableReinitialize: true,
    validateOnChange: false,
    initialValues: currentSettings ?? getInitialValues(t),
    onSubmit: noop,
  });

  const {
    values,
    errors,
    handleChange,
    setFieldValue,
    isSubmitting,
    isValidating,
    validateForm,
    setErrors,
  } = formik;

  const handleSaveMailSettings = useCallback(async () => {
    const formErrors = await validateForm();

    if (isEmpty(formErrors)) {
      try {
        await CompanyService.updateMailSettings(
          omit(values, ['subscriptionsEndReplyTo', 'subscriptionsResumeReplyTo']),
        );

        NotificationHelper.success('update', 'Mailing settings');
      } catch (error: unknown) {
        const typedError = error as ApiError;
        NotificationHelper.error(
          'update',
          typedError.response.code as ActionCode,
          'Mailing settings',
        );
        const err = getFormikErrors(typedError.response);

        setErrors(err);
      }
    }
  }, [validateForm, values, setErrors]);

  useScrollOnError(errors, !isValidating);

  useEffect(() => {
    let canceled = false;
    const load = async () => {
      const [domainsData, mailSettings] = await Promise.all([
        CompanyService.getDomains({ validatedOnly: true }),
        CompanyService.getMailSettings().catch((error: ApiError) => {
          if (error.response.code === ActionCode.NOT_FOUND) {
            return getDefaultValues(t);
          }

          NotificationHelper.error('loadMailSettings');
        }),
      ]);

      if (!canceled) {
        setDomains(domainsData);
        if (mailSettings) {
          const normalizedMailSettings = isCurrentMailSettings(mailSettings)
            ? convertDates(mailSettings)
            : mailSettings;
          const initialValues = getInitialValues(t);
          const settings = notNullObject<MailSettingsFormValue>(
            normalizedMailSettings,
            initialValues,
          );

          setCurrentSettings(settings);
        }
      }
    };

    load();

    return () => {
      canceled = true;
    };
  }, [t]);

  const domainOptions = useMemo(
    () => domains?.map(domain => ({ value: domain.id, label: `@${domain.name}` })) ?? [],
    [domains],
  );

  const currentDomain = useMemo(
    () => domainOptions.find(({ value }) => value === values.domainId)?.label,
    [domainOptions, values.domainId],
  );

  return (
    <>
      <Layouts.Scroll>
        <Layouts.Box as={Layouts.Padding} width="100%" padding="4" backgroundColor="white">
          <FormContainer formik={formik}>
            <Layouts.Margin top="2" bottom="2">
              <Typography variant="headerThree">{t(`${I18N_PATH.Text}MailingSettings`)}</Typography>
            </Layouts.Margin>
            <Layouts.Box width="60%">
              <Layouts.Grid columns="1fr 2fr">
                <Typography as="label" htmlFor="adminEmail" color="secondary">
                  {`${t(`${I18N_PATH.Text}AdminEmail`)}*`.concat(` `)}
                  <DescriptiveTooltip
                    position="top"
                    text={t(`${I18N_PATH.Text}ThisEmailWillBeUsed`)}
                  />
                </Typography>
                <FormInput
                  name="adminEmail"
                  placeholder={t(`${I18N_PATH.Form}EnterEmail`)}
                  value={values.adminEmail}
                  error={errors.adminEmail}
                  onChange={handleChange}
                />
                <Typography as="label" htmlFor="notificationEmails" color="secondary">
                  {`${t(`${I18N_PATH.Text}NotificationEmails`)} `}
                  <DescriptiveTooltip
                    position="top"
                    text={t(`${I18N_PATH.Text}TheseContactsWillReceive`)}
                  />
                </Typography>
                <MultiInput
                  name="notificationEmails"
                  placeholder={t(`${I18N_PATH.Form}EnterCommaSeparatedEmails`)}
                  values={values.notificationEmails || []}
                  error={errors.notificationEmails}
                  onChange={setFieldValue}
                />
                <Typography as="label" htmlFor="domainId" color="secondary">
                  {t('Text.Domain')}
                </Typography>
                <Select
                  placeholder={t(`${I18N_PATH.Text}SelectDomain`)}
                  name="domainId"
                  options={domainOptions}
                  value={values.domainId ?? undefined}
                  onSelectChange={setFieldValue}
                />
              </Layouts.Grid>
            </Layouts.Box>
            <Divider both />
            <Layouts.Margin bottom="3">
              <Typography variant="headerThree">{t(`${I18N_PATH.Text}EmailTemplates`)}</Typography>
            </Layouts.Margin>
            <CollapsibleBar
              arrowLeft
              containerClassName={styles.containerClassName}
              label={
                <Typography variant="headerFive" shade="dark">
                  {t(`${I18N_PATH.Text}Invoices`)}
                </Typography>
              }
            >
              <TemplateSettings kind="invoices" showDisclaimer domain={currentDomain} />
            </CollapsibleBar>
            <CollapsibleBar
              arrowLeft
              containerClassName={styles.containerClassName}
              label={
                <Typography variant="headerFive" shade="dark">
                  {t(`${I18N_PATH.Text}Statements`)}
                </Typography>
              }
            >
              <TemplateSettings kind="statements" showDisclaimer domain={currentDomain} />
            </CollapsibleBar>
            <CollapsibleBar
              arrowLeft
              containerClassName={styles.containerClassName}
              label={
                <Typography variant="headerFive" shade="dark">
                  {t(`${I18N_PATH.Text}ReceiptNotification`)}
                </Typography>
              }
            >
              <TemplateSettings kind="receipts" showDisclaimer domain={currentDomain} />
            </CollapsibleBar>
            <CollapsibleBar
              arrowLeft
              containerClassName={styles.containerClassName}
              label={
                <Typography variant="headerFive" shade="dark">
                  {t(`${I18N_PATH.Text}ServiceNotification`)}
                </Typography>
              }
            >
              <TemplateSettings kind="services" domain={currentDomain} />
            </CollapsibleBar>
            {!isCore ? (
              <>
                <CollapsibleBar
                  arrowLeft
                  containerClassName={styles.containerClassName}
                  label={
                    <Typography variant="headerFive" shade="dark">
                      {t(`${I18N_PATH.Text}EndingSubscription`)}
                    </Typography>
                  }
                >
                  <TemplateSettings
                    kind="subscriptionsEnd"
                    domain={currentDomain}
                    showSendCopy={false}
                    disableReplyTo
                    variables={[emailBodyVariables.subscriptionIds]}
                  />
                </CollapsibleBar>
                <CollapsibleBar
                  arrowLeft
                  containerClassName={styles.containerClassName}
                  label={
                    <Typography variant="headerFive" shade="dark">
                      {t(`${I18N_PATH.Text}ResumingSubscription`)}
                    </Typography>
                  }
                >
                  <TemplateSettings
                    kind="subscriptionsResume"
                    domain={currentDomain}
                    showSendCopy={false}
                    disableReplyTo
                    variables={[emailBodyVariables.subscriptionIds]}
                  />
                </CollapsibleBar>
              </>
            ) : null}
            <CollapsibleBar
              arrowLeft
              containerClassName={styles.containerClassName}
              label={
                <Typography variant="headerFive" shade="dark">
                  {t(`${I18N_PATH.Text}WeightTicketMailing`)}
                </Typography>
              }
            >
              <TemplateSettings kind="weightTicket" domain={currentDomain} />
            </CollapsibleBar>
            <CollapsibleBar
              arrowLeft
              containerClassName={styles.containerClassName}
              label={
                <Typography variant="headerFive" shade="dark">
                  {t(`${I18N_PATH.Text}CustomerIsPutOnHold`)}
                </Typography>
              }
            >
              <TemplateSettings
                kind="customerOnHold"
                domain={currentDomain}
                showSendCopy={false}
                disableReplyTo
                variables={[
                  emailBodyVariables.subscriptionIds,
                  emailBodyVariables.recurringOrdersIds,
                  emailBodyVariables.customerName,
                ]}
              />
            </CollapsibleBar>
          </FormContainer>
        </Layouts.Box>
      </Layouts.Scroll>

      <Layouts.Box height="92px" backgroundColor="white">
        <Layouts.Padding left="4" right="4">
          <Divider />
        </Layouts.Padding>
        <Layouts.Padding padding="4" top="3">
          <Layouts.Flex justifyContent="flex-end">
            <Protected permissions="configuration:company-settings:update">
              <Button onClick={handleSaveMailSettings} variant="primary" disabled={isSubmitting}>
                {t(`${I18N_PATH.Text}SaveChanges`)}
              </Button>
            </Protected>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Box>
    </>
  );
};

export default MailingSettings;
