import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';

import { Typography } from '@root/common';
import { INewCustomerData } from '@root/components/forms/NewCustomer/types';

const I18N_PATH =
  'components.forms.NewCustomer.Tabs.GeneralInformation.AdditionalPreferences.Text.';

const AdditionalPreferences: React.FC = () => {
  const { t } = useTranslation();
  const { values, handleChange, setFieldValue } = useFormikContext<INewCustomerData>();

  const handleGradingRequiredChange = useCallback(
    ({ target: { checked } }: React.ChangeEvent<HTMLInputElement>) => {
      setFieldValue('gradingRequired', checked);
      if (checked) {
        setFieldValue('gradingNotification', true);
      }
    },
    [setFieldValue],
  );

  return (
    <>
      <Layouts.Padding bottom="3" top="1">
        <Typography variant="headerThree">{t(`${I18N_PATH}AdditionalPreferences`)}</Typography>
      </Layouts.Padding>
      <Layouts.Flex as={Layouts.Padding} bottom="2.5">
        <Layouts.Column>
          <Layouts.Box minHeight="44px">
            <Checkbox
              id="workOrderRequired"
              name="workOrderRequired"
              value={values.workOrderRequired}
              onChange={handleChange}
            >
              {t(`${I18N_PATH}WorkOrderRequired`)}
            </Checkbox>
          </Layouts.Box>
          <Layouts.Box minHeight="44px">
            <Checkbox
              id="gradingRequired"
              name="gradingRequired"
              value={values.gradingRequired}
              onChange={handleGradingRequiredChange}
            >
              {t(`${I18N_PATH}GradingRequired`)}
            </Checkbox>
          </Layouts.Box>
          <Checkbox
            id="gradingNotification"
            name="gradingNotification"
            value={values.gradingNotification}
            onChange={handleChange}
            disabled={values.gradingRequired}
          >
            {t(`${I18N_PATH}GradingNotification`)}
          </Checkbox>
        </Layouts.Column>
        <Layouts.Column>
          <Layouts.Box minHeight="44px">
            <Checkbox
              id="canTareWeightRequired"
              name="canTareWeightRequired"
              value={values.canTareWeightRequired}
              onChange={handleChange}
            >
              {t(`${I18N_PATH}CanTareWeightRequired`)}
            </Checkbox>
          </Layouts.Box>
          <Layouts.Box minHeight="44px">
            <Checkbox
              id="selfServiceOrderAllowed"
              name="selfServiceOrderAllowed"
              value={values.selfServiceOrderAllowed}
              onChange={handleChange}
            >
              {t(`${I18N_PATH}SelfServiceOrderAllowed`)}
            </Checkbox>
          </Layouts.Box>
          <Checkbox
            id="jobSiteRequired"
            name="jobSiteRequired"
            value={values.jobSiteRequired}
            onChange={handleChange}
          >
            {t(`${I18N_PATH}JobSiteRequired`)}
          </Checkbox>
        </Layouts.Column>
      </Layouts.Flex>
    </>
  );
};

export default AdditionalPreferences;
