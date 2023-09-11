import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { observer } from 'mobx-react-lite';

import { RadioButton, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { defaultReminderSchedule } from '@root/consts';
import { useStores } from '@root/hooks';
import { IConfigurableReminderSchedule, ReminderTypes } from '@root/types';

import { FormContainerLayout } from '../layout/FormContainer';
import { type IForm } from '../types';

import ReminderForm from './components/ReminderForm/ReminderForm';
import { generateValidationSchema } from './formikData';

import styles from './css/styles.scss';

const I18N_BASE = `components.forms.ReminderConfigurationForm.`;
const I18N_BASE_FORM = `${I18N_BASE}Form.`;
const I18N_BASE_FORM_VALIDATORS = `${I18N_BASE}ValidationErrors.`;

const ReminderConfigurationForm: React.FC<IForm<IConfigurableReminderSchedule | null>> = ({
  onSubmit,
  onClose,
}) => {
  const { reminderStore } = useStores();
  const [isConfigVisible, toggleConfigVisibility] = useState(
    Boolean(reminderStore.currentReminderConfig),
  );
  const { t } = useTranslation();

  const getInitialValue = () => {
    if (reminderStore.currentReminderConfig) {
      return reminderStore.currentReminderConfig;
    }

    return {
      type: ReminderTypes.ProspectReminder,
      ...defaultReminderSchedule,
    };
  };

  const handleSubmitForm = (reminderConfig: IConfigurableReminderSchedule) => {
    onSubmit(isConfigVisible ? reminderConfig : null);
    onClose();
  };

  const formik = useFormik<IConfigurableReminderSchedule>({
    validationSchema: generateValidationSchema(isConfigVisible, t, I18N_BASE_FORM_VALIDATORS),
    validateOnChange: false,
    initialValues: getInitialValue(),
    onSubmit: handleSubmitForm,
    onReset: onClose,
  });

  const { isSubmitting } = formik;
  const formTitle = reminderStore.currentReminderConfig?.id ? 'EditReminder' : 'ScheduleReminder';

  return (
    <FormContainerLayout formik={formik}>
      <Layouts.Flex className={styles.noOverflow} direction="column" justifyContent="space-between">
        <Layouts.Margin top="3" right="5" left="5">
          <Layouts.Padding top="3" bottom="2">
            <Typography variant="headerThree">{t(`${I18N_BASE_FORM}${formTitle}`)}</Typography>
          </Layouts.Padding>
          <Layouts.Padding bottom="2">
            <Typography variant="bodyMedium">{t(`${I18N_BASE_FORM}SetOfferReminder`)}</Typography>
          </Layouts.Padding>
        </Layouts.Margin>

        <Layouts.Margin right="5" left="5" bottom="2">
          <Layouts.Flex>
            <RadioButton
              name="setReminder"
              onChange={() => toggleConfigVisibility(false)}
              value={!isConfigVisible}
            >
              {t(`${I18N_BASE_FORM}No`)}
            </RadioButton>
            <Layouts.Margin left="3" right="3">
              <RadioButton
                name="setReminder"
                onChange={() => toggleConfigVisibility(true)}
                value={isConfigVisible}
              >
                {t(`${I18N_BASE_FORM}Yes`)}
              </RadioButton>
            </Layouts.Margin>
          </Layouts.Flex>
        </Layouts.Margin>

        <Layouts.Flex flexGrow={1}>
          <Layouts.Margin right="5" left="5">
            {isConfigVisible ? (
              <Layouts.Flex>
                <ReminderForm />
              </Layouts.Flex>
            ) : null}
          </Layouts.Margin>
        </Layouts.Flex>

        <Divider />
        <Layouts.Padding padding="2" left="5" right="5">
          <Layouts.Flex justifyContent="space-between">
            <Button type="reset" disabled={isSubmitting}>
              {t('Text.Cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting} variant="primary">
              {t('Text.SaveDraft')}
            </Button>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Flex>
    </FormContainerLayout>
  );
};

export default observer(ReminderConfigurationForm);
