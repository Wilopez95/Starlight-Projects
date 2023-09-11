import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, FormInput, Layouts, RadioButton } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { BusinessLineTypes } from '@root/consts';
import { useStores } from '@root/hooks';
import { IBusinessLine } from '@root/types';

import { IBusinessLineQuickViewData } from './types';

const I18N_BASE = 'pages.SystemConfiguration.tables.BusinessLines.QuickView.';
const I18N_BASE_TEXT = `${I18N_BASE}Text.`;
const I18N_FORM_TEXT = `${I18N_BASE}Form.`;

const BusinessLineQuickViewRightPanel: React.FC<IBusinessLineQuickViewData> = ({ isNew }) => {
  const { values, errors, handleChange, setFieldValue } = useFormikContext<IBusinessLine>();
  const { businessLineStore, systemConfigurationStore } = useStores();

  const { t } = useTranslation();

  const selectedBusinessLine = businessLineStore.selectedEntity;

  const handleRadioChange = useCallback(
    (value: string) => {
      setFieldValue('type', value);
    },
    [setFieldValue],
  );

  return (
    <Layouts.Scroll>
      <Layouts.Padding padding="3">
        <Typography variant="headerThree">
          {isNew ? 'New Line of Business' : selectedBusinessLine?.name}
        </Typography>
        <Divider both />
        <Layouts.Flex direction="column">
          <Layouts.Padding top="1" bottom="2">
            <Checkbox
              id="activeCheckbox"
              name="active"
              value={values.active}
              onChange={handleChange}
            >
              {t('Text.Active')}
            </Checkbox>
          </Layouts.Padding>
          <FormInput
            onChange={handleChange}
            value={values.name}
            name="name"
            label={t(`${I18N_FORM_TEXT}Name`)}
            error={errors.name}
          />

          <FormInput
            onChange={handleChange}
            value={values.description}
            name="description"
            label={t(`${I18N_FORM_TEXT}Description`)}
            error={errors.description}
          />
          <FormInput
            onChange={handleChange}
            value={values.shortName}
            name="shortName"
            label={t(`${I18N_FORM_TEXT}ShortName`)}
            error={errors.shortName}
          />
          <div role="radiogroup" aria-labelledby="businessLinesType">
            <Typography
              color="secondary"
              as="label"
              shade="desaturated"
              variant="bodyMedium"
              id="businessLinesType"
            >
              {t('Text.Type')}
            </Typography>
            {!systemConfigurationStore.isCreating ? (
              <Typography color="secondary" textTransform="capitalize">
                {t(
                  `${I18N_BASE_TEXT}${
                    BusinessLineTypes.find(option => option.value === values.type)?.label as string
                  }`,
                )}
              </Typography>
            ) : (
              <>
                {BusinessLineTypes.map(({ value, hint }) => (
                  <Layouts.Margin top="0.5" key={value}>
                    <RadioButton
                      name="type"
                      id={value.toString()}
                      type="radio"
                      onChange={() => handleRadioChange(value.toString())}
                      value={values.type === value}
                    >
                      {t(`${I18N_BASE_TEXT}${hint as string}`)}
                    </RadioButton>
                  </Layouts.Margin>
                ))}
              </>
            )}
          </div>
        </Layouts.Flex>
      </Layouts.Padding>
    </Layouts.Scroll>
  );
};

export default observer(BusinessLineQuickViewRightPanel);
