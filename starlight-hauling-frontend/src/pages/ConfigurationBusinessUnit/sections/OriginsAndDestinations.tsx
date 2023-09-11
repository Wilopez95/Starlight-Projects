import React from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Layouts, Typography } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { IBusinessUnit } from '@root/types';

const I18N_PATH_BASE =
  'pages.SystemConfiguration.tables.BusinessUnit.sections.OriginsAndDestinations.';
const I18N_PATH_TEXT = `${I18N_PATH_BASE}Text.`;
const I18N_PATH_FORM = `${I18N_PATH_BASE}Form.`;

const OriginsAndDestinations: React.FC = () => {
  const { t } = useTranslation();
  const { values, handleChange } = useFormikContext<IBusinessUnit>();

  return (
    <Layouts.Padding left="3" bottom="3">
      <Layouts.Margin bottom="4">
        <Typography variant="headerFive">{t(`${I18N_PATH_TEXT}Title`)}</Typography>
      </Layouts.Margin>
      <Layouts.Flex alignItems="center">
        <Layouts.Margin right="3">
          <Checkbox
            name="requireOriginOfInboundLoads"
            value={values.requireOriginOfInboundLoads}
            onChange={handleChange}
          >
            {t(`${I18N_PATH_FORM}OriginIsRequired`)}
          </Checkbox>
        </Layouts.Margin>
        <Checkbox
          name="requireDestinationOnWeightOut"
          value={values.requireDestinationOnWeightOut}
          onChange={handleChange}
        >
          {t(`${I18N_PATH_FORM}DestinationIsRequired`)}
        </Checkbox>
      </Layouts.Flex>
    </Layouts.Padding>
  );
};

export default observer(OriginsAndDestinations);
