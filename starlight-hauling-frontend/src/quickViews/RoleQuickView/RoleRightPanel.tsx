import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, FormInput, Layouts, Navigation } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';

import { Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import Permissions from '@root/components/UserAndRolesPermissions/Permissions';

import { rolesNavigationConfig } from './config';
import { FormRole } from './formikData';
import { IRoleQuickViewData } from './types';

export const RoleQuickViewRightPanel: React.FC<IRoleQuickViewData> = ({ isNew }) => {
  const { values, handleChange, errors } = useFormikContext<FormRole>();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(rolesNavigationConfig[0]);
  const title = isNew || !values.description ? t('Text.CreateNewRole') : values.description;

  return (
    <>
      <Layouts.Padding padding="3" bottom="0">
        <Typography variant="headerThree">{title}</Typography>
        <Typography variant="caption" textTransform="uppercase">
          {t('Text.Role')}
        </Typography>
        <Divider top />
      </Layouts.Padding>
      <Layouts.Scroll>
        <Layouts.Padding padding="3">
          <Layouts.Grid columns={4}>
            <Layouts.Padding top="2">
              <Typography as="label" htmlFor="description" color="secondary">
                {t('Text.Description')}*
              </Typography>
            </Layouts.Padding>
            <FormInput
              name="description"
              onChange={handleChange}
              value={values.description}
              error={errors.description}
            />

            <Layouts.Cell left={4}>
              <Layouts.Padding top="2">
                <Checkbox
                  id="activeCheckbox"
                  name="active"
                  value={values.active}
                  onChange={handleChange}
                >
                  {t('Text.Active')}
                </Checkbox>
              </Layouts.Padding>
            </Layouts.Cell>
          </Layouts.Grid>
          <Divider bottom />
          <Navigation
            configs={rolesNavigationConfig}
            activeTab={activeTab}
            onChange={setActiveTab}
            withEmpty
            border
          />

          <Layouts.Padding top="2">
            {activeTab.key === 'permissions' ? (
              <Permissions type="role" />
            ) : (
              <Permissions type="default" />
            )}
          </Layouts.Padding>
        </Layouts.Padding>
      </Layouts.Scroll>
    </>
  );
};
