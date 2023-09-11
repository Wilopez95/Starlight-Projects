import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { FormInput, RadioButton, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { useStores } from '@root/hooks';
import { buildI18Path } from '@root/i18n/helpers';
import { CustomerGroupType, ICustomerGroup } from '@root/types';

const I18N_PATH = buildI18Path('pages.SystemConfiguration.tables.CustomerGroups.QuickView.');

const CustomerGroupRightPanel: React.FC = () => {
  const { customerGroupStore, systemConfigurationStore } = useStores();
  const { t } = useTranslation();
  const { values, errors, setFieldValue, handleChange } = useFormikContext<ICustomerGroup>();

  const selectedCustomerGroup = customerGroupStore.selectedEntity;
  const isCreating = systemConfigurationStore.isCreating;

  const isWalkUpGroup = values.id > 0 && values.type === CustomerGroupType.walkUp;
  const isNew = isCreating || !selectedCustomerGroup;

  const setCommercial = useCallback(() => {
    setFieldValue('type', CustomerGroupType.commercial);
  }, [setFieldValue]);

  const setNonCommercial = useCallback(() => {
    setFieldValue('type', CustomerGroupType.nonCommercial);
  }, [setFieldValue]);

  const setWalkUp = useCallback(() => {
    setFieldValue('type', CustomerGroupType.walkUp);
  }, [setFieldValue]);

  const subTitle = useMemo(() => {
    let label;

    switch (values.type) {
      case CustomerGroupType.commercial:
        label = 'Commercial';
        break;
      case CustomerGroupType.nonCommercial:
        label = 'NonCommercial';
        break;
      case CustomerGroupType.walkUp:
        label = 'WalkUp';
        break;
      default:
        return null;
    }

    return t(`${I18N_PATH.Text}${label}`);
  }, [t, values.type]);

  const title =
    isNew || !values.description
      ? t(`${I18N_PATH.Text}CreateNewCustomerGroup`)
      : values.description;

  return (
    <Layouts.Scroll>
      <Layouts.Padding padding="3">
        <Typography variant="headerThree">{title}</Typography>
        <Typography variant="caption" textTransform="uppercase">
          {subTitle}
        </Typography>
        <Divider both />

        <Layouts.Grid columns={3} rowGap="2" alignItems="center">
          <Typography as="label" color="secondary" htmlFor="activeCheckbox">
            Status
          </Typography>
          <Layouts.Cell width={2}>
            <Checkbox
              id="activeCheckbox"
              name="active"
              value={values.active}
              onChange={handleChange}
            >
              {t('Text.Active')}
            </Checkbox>
          </Layouts.Cell>
          <Layouts.Padding bottom="1">
            <Typography as="label" htmlFor="description" variant="bodyMedium" shade="light">
              {`${t('Text.Description')}*`}
            </Typography>
          </Layouts.Padding>
          <Layouts.Cell width={2}>
            <FormInput
              onChange={handleChange}
              value={values.description}
              name="description"
              error={errors.description}
            />
          </Layouts.Cell>

          <Typography as="label" color="secondary">
            Type
          </Typography>
          <Layouts.Cell width={2}>
            <Layouts.Flex direction="column" gap="1rem">
              <RadioButton
                disabled={isWalkUpGroup}
                name="commercial"
                onChange={setCommercial}
                value={values.type === CustomerGroupType.commercial}
                id="commercialRadioButton"
              >
                {t(`${I18N_PATH.Text}Commercial`)}
              </RadioButton>
              <RadioButton
                disabled={isWalkUpGroup}
                name="commercial"
                onChange={setNonCommercial}
                value={values.type === CustomerGroupType.nonCommercial}
                id="Non-commercialRadioButton"
              >
                {t(`${I18N_PATH.Text}NonCommercial`)}
              </RadioButton>
              <RadioButton
                disabled
                name="walkUp"
                onChange={setWalkUp}
                value={values.type === CustomerGroupType.walkUp}
                id="Walk-upRadioButton"
              >
                {t(`${I18N_PATH.Text}WalkUp`)}
              </RadioButton>
            </Layouts.Flex>
          </Layouts.Cell>
        </Layouts.Grid>

        <Layouts.Padding top="3">
          <Checkbox name="spUsed" value={values?.spUsed} onChange={noop} disabled>
            {t(`${I18N_PATH.Text}UsedForSalesPointOrders`)}
          </Checkbox>
        </Layouts.Padding>
      </Layouts.Padding>
    </Layouts.Scroll>
  );
};

export default observer(CustomerGroupRightPanel);
