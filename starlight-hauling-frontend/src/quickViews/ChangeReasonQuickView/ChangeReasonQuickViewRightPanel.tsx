import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, FormInput, Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { useStores } from '@root/hooks';
import { buildI18Path } from '@root/i18n/helpers';

import { IChangeReasonFormData } from './types';

const I18N_PATH = buildI18Path(
  'pages.SystemConfiguration.tables.ChangeReasons.QuickView.ChangeReason.',
);

const ChangeReasonQuickViewRightPanel: React.FC = () => {
  const { values, errors, handleChange, setFieldValue, isSubmitting } =
    useFormikContext<IChangeReasonFormData>();
  const { changeReasonStore, systemConfigurationStore, businessLineStore } = useStores();
  const { t } = useTranslation();

  const selectedChangeReason = changeReasonStore.selectedEntity;
  const isCreating = systemConfigurationStore.isCreating;
  const isNew = !selectedChangeReason || isCreating;

  const handleChangeCheckbox = useCallback(
    businessLineId => {
      if (isSubmitting) {
        return;
      }

      const businessLineIds = values.businessLineIds.some(item => item === businessLineId)
        ? values.businessLineIds.filter(item => item !== businessLineId)
        : [...values.businessLineIds, businessLineId];

      setFieldValue('businessLineIds', businessLineIds);
    },
    [isSubmitting, setFieldValue, values],
  );
  const businessLineIdsError = Array.isArray(errors.businessLineIds)
    ? errors.businessLineIds[0]
    : errors.businessLineIds;

  const title = isNew
    ? t(`${I18N_PATH.Text}CreateNewReason`)
    : values.description || selectedChangeReason?.description;

  return (
    <Layouts.Scroll>
      <Layouts.Padding padding="3">
        <Typography variant="headerThree" ellipsis>
          {title}
        </Typography>
        <Divider both />
        <Layouts.Grid columns="125px 1fr" alignItems="center">
          <Layouts.Margin bottom="3">
            <Typography color="secondary" shade="light">
              {t('Text.Status')}
            </Typography>
          </Layouts.Margin>
          <Layouts.Margin bottom="3">
            <Checkbox name="active" value={values.active} onChange={handleChange}>
              {t('Text.Active')}
            </Checkbox>
          </Layouts.Margin>
          <Layouts.Cell alignSelf="flex-start">
            <Layouts.Margin top="1">
              <Typography color="secondary" shade="light">
                {t('Text.Description')}
              </Typography>
            </Layouts.Margin>
          </Layouts.Cell>

          <FormInput
            name="description"
            onChange={handleChange}
            value={values.description}
            error={errors.description}
          />
          <Layouts.Cell alignSelf="flex-start">
            <Layouts.Margin top="0.5">
              <Typography color="secondary" shade="light">
                {t(`${I18N_PATH.Text}LinesOfBusiness`)}
              </Typography>
            </Layouts.Margin>
          </Layouts.Cell>
          <Layouts.Box>
            {businessLineStore.values
              .filter(({ active }) => active)
              .map(({ name, id }) => {
                const isChecked = values.businessLineIds.includes(id);

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
          </Layouts.Box>
        </Layouts.Grid>
      </Layouts.Padding>
    </Layouts.Scroll>
  );
};

export default observer(ChangeReasonQuickViewRightPanel);
