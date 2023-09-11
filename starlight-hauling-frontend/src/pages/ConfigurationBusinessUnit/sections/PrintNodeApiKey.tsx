import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Typography } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { FormInput } from '@root/common';
import { IBusinessUnit } from '@root/types';

const I18N_PATH_BASE = 'pages.SystemConfiguration.tables.BusinessUnit.sections.PrintNodeApiKey.';
const I18N_PATH_TEXT = `${I18N_PATH_BASE}Text.`;
const I18N_PATH_FORM = `${I18N_PATH_BASE}Form.`;

const PrintNodeApiKey: React.FC = () => {
  const { t } = useTranslation();
  const { values, handleChange, errors } = useFormikContext<IBusinessUnit>();

  return (
    <Layouts.Padding left="3" bottom="3" top="3">
      <Layouts.Margin bottom="3">
        <Typography variant="headerFive">{t(`${I18N_PATH_TEXT}Title`)}</Typography>
      </Layouts.Margin>
      <Layouts.Flex>
        <Layouts.Column>
          <FormInput
            name="printNodeApiKey"
            label={t(`${I18N_PATH_FORM}PrintNodeApiKey`)}
            value={values.printNodeApiKey}
            onChange={handleChange}
            error={errors.printNodeApiKey}
          />
        </Layouts.Column>
      </Layouts.Flex>
    </Layouts.Padding>
  );
};

export default observer(PrintNodeApiKey);
