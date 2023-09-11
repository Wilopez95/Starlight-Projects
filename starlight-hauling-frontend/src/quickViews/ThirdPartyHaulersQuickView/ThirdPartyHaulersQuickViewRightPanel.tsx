import React from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { FormInput, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { useStores } from '@root/hooks';
import { buildI18Path } from '@root/i18n/helpers';
import { IThirdPartyHauler } from '@root/types';

const I18N_PATH = buildI18Path('pages.SystemConfiguration.tables.ThirdPartyHaulers.QuickView.');

const ThirdPartyHaulersQuickViewRightPanel: React.FC = () => {
  const { thirdPartyHaulerStore, systemConfigurationStore } = useStores();

  const { t } = useTranslation();
  const { values, errors, handleChange } = useFormikContext<IThirdPartyHauler>();

  const selectedThirdPartyHauler = thirdPartyHaulerStore.selectedEntity;
  const isCreating = systemConfigurationStore.isCreating;
  const isNew = isCreating || !selectedThirdPartyHauler;

  const title = isNew
    ? t(`${I18N_PATH.Text}CreateNew3rdPartyHauler`)
    : values.description || selectedThirdPartyHauler?.description;

  return (
    <Layouts.Scroll>
      <Layouts.Padding padding="3">
        <Typography variant="headerThree" ellipsis>
          {title}
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
              error={errors.active}
            >
              {t(`Text.Active`)}
            </Checkbox>
          </Layouts.Cell>

          <Layouts.Padding bottom="2.5">
            <Typography as="label" htmlFor="description" variant="bodyMedium" shade="light">
              {t(`Text.Description`)}*
            </Typography>
          </Layouts.Padding>
          <Layouts.Cell width={2}>
            <FormInput
              name="description"
              onChange={handleChange}
              value={values.description}
              error={errors.description}
            />
          </Layouts.Cell>
        </Layouts.Grid>
      </Layouts.Padding>
    </Layouts.Scroll>
  );
};

export default observer(ThirdPartyHaulersQuickViewRightPanel);
