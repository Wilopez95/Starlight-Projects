import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, FormInput, Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { RadioButton, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { useStores } from '@root/hooks';
import { buildI18Path } from '@root/i18n/helpers';
import { IBroker } from '@root/types';

const I18N_PATH = buildI18Path('pages.SystemConfiguration.tables.Brokers.QuickView.');

const ConfigurationBrokerRightPanel: React.FC = () => {
  const { systemConfigurationStore, brokerStore } = useStores();
  const { values, errors, handleChange, setFieldValue } = useFormikContext<IBroker>();
  const { t } = useTranslation();

  const isCreating = systemConfigurationStore.isCreating;
  const selectedBroker = brokerStore.selectedEntity;
  const isNew = isCreating || !selectedBroker;

  const setCustomer = useCallback(() => {
    setFieldValue('billing', 'customer');
  }, [setFieldValue]);

  const setBroker = useCallback(() => {
    setFieldValue('billing', 'broker');
  }, [setFieldValue]);

  return (
    <Layouts.Scroll>
      <Layouts.Padding padding="3">
        <Typography variant="headerThree">
          {isNew || !values.name ? t(`${I18N_PATH.Text}CreateNewBroker`) : values.name}
        </Typography>
        <Typography variant="caption" textTransform="uppercase">
          {isNew || !values.email ? null : values.email}
        </Typography>
        <Divider both />

        <Layouts.Grid columns={3} alignItems="center" rowGap="2">
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
              {t(`Text.Active`)}
            </Checkbox>
          </Layouts.Cell>

          <Layouts.Padding bottom="2.5">
            <Typography as="label" htmlFor="name" variant="bodyMedium" shade="light">
              Name*
            </Typography>
          </Layouts.Padding>
          <Layouts.Cell width={2}>
            <FormInput
              onChange={handleChange}
              value={values.name}
              name="name"
              error={errors.name}
            />
          </Layouts.Cell>

          <Layouts.Padding bottom="2.5">
            <Typography as="label" htmlFor="shortName" variant="bodyMedium" shade="light">
              {t(`${I18N_PATH.Text}ShortName`)}*
            </Typography>
          </Layouts.Padding>
          <Layouts.Cell width={2}>
            <FormInput
              onChange={handleChange}
              value={values.shortName}
              name="shortName"
              error={errors.shortName}
            />
          </Layouts.Cell>

          <Layouts.Padding bottom="2.5">
            <Typography as="label" htmlFor="email" variant="bodyMedium" shade="light">
              {t(`Text.Email`)}*
            </Typography>
          </Layouts.Padding>
          <Layouts.Cell width={2}>
            <FormInput
              onChange={handleChange}
              value={values.email}
              name="email"
              error={errors.email}
            />
          </Layouts.Cell>

          <Layouts.Cell width={3}>
            <Divider both />
          </Layouts.Cell>

          <Typography variant="bodyMedium" shade="light">
            Billing
          </Typography>

          <Layouts.Cell width={2}>
            <Layouts.Flex direction="column">
              <RadioButton
                name="billing"
                onChange={setBroker}
                value={values.billing === 'broker'}
                id="brokerRadioButton"
              >
                {t(`${I18N_PATH.Text}InvoiceBroker`)}
              </RadioButton>
              <RadioButton
                name="billing"
                onChange={setCustomer}
                value={values.billing === 'customer'}
                id="customerRadioButton"
              >
                {t(`${I18N_PATH.Text}InvoiceCustomer`)}
              </RadioButton>
            </Layouts.Flex>
          </Layouts.Cell>
        </Layouts.Grid>
      </Layouts.Padding>
    </Layouts.Scroll>
  );
};

export default observer(ConfigurationBrokerRightPanel);
