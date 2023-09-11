import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Select } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { FormInput, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { normalizeOptions } from '@root/helpers';
import { useStores } from '@root/hooks';

import { DomainFormikData } from './formikData';

const I18N_PATH =
  'pages.SystemConfiguration.tables.CompanySettings.components.Domains.DomainsQuickView.Text.';

const domainProviderOptions = ['GoDaddy', 'AWS Route 53', 'Cloudflare'];

const DomainsQuickViewRightPanel: React.FC = () => {
  const { systemConfigurationStore, domainStore } = useStores();
  const { t } = useTranslation();
  const { values, errors, setFieldValue, handleChange } = useFormikContext<DomainFormikData>();

  const isCreating = systemConfigurationStore.isCreating;
  const selectedDomain = domainStore.selectedEntity;

  const isNew = isCreating || !selectedDomain;

  return (
    <Layouts.Scroll>
      <Layouts.Padding padding="3">
        <Typography variant="headerThree">
          {isNew || !values.name ? t(`${I18N_PATH}NewDomain`) : values.name}
        </Typography>
        <Divider both />

        {isNew ? (
          <Layouts.Grid columns={3}>
            <Layouts.Padding top="1.5">
              <Typography as="label" htmlFor="provider" color="secondary">
                {t(`${I18N_PATH}DNSProvider`)}
              </Typography>
            </Layouts.Padding>

            <Layouts.Cell width={2}>
              <Select
                name="provider"
                options={normalizeOptions(domainProviderOptions)}
                value={values.provider}
                onSelectChange={setFieldValue}
              />
            </Layouts.Cell>
          </Layouts.Grid>
        ) : null}

        <Layouts.Grid columns={3}>
          <Layouts.Padding top="1.5">
            <Typography as="label" htmlFor="name" color="secondary">
              {t(`${I18N_PATH}Domain`)}
            </Typography>
          </Layouts.Padding>

          <Layouts.Cell width={2}>
            <FormInput
              name="name"
              value={values.name}
              error={errors.name}
              onChange={handleChange}
            />
          </Layouts.Cell>
        </Layouts.Grid>

        {!isNew && selectedDomain?.validationStatus === 'pending' ? (
          <Typography color="secondary">{t(`${I18N_PATH}PleaseProceed`)}</Typography>
        ) : null}
      </Layouts.Padding>
    </Layouts.Scroll>
  );
};

export default observer(DomainsQuickViewRightPanel);
