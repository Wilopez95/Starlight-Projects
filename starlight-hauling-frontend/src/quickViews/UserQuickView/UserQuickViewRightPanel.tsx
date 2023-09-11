import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Checkbox,
  ISelectOption,
  Layouts,
  MultiSelect,
  Navigation,
  Select,
} from '@starlightpro/shared-components';
import { FieldArray, getIn, useFormikContext } from 'formik';

import { DeleteIcon } from '@root/assets';
import { FormInput, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { PhoneNumber, PhoneNumberAdd, UserAndRolesPermissions } from '@root/components';
import { handleEnterOrSpaceKeyDown } from '@root/helpers';
import { useStores } from '@root/hooks';

import { usersNavigationConfig } from './config';
import { FormUser } from './formikData';
import { IUserQuickViewRightPanelData } from './types';

import styles from './css/styles.scss';

const I18N_PATH_BASE = 'pages.SystemConfiguration.tables.UsersAndRoles.components.User.QuickView.';
const I18N_PATH = `${I18N_PATH_BASE}Text.`;
const I18N_PATH_FORM = `${I18N_PATH_BASE}Form.`;

const MAX_PHONE_NUMBERS_COUNT = 2;

export const UserQuickViewRightPanel: React.FC<IUserQuickViewRightPanelData> = ({
  isNew,
  setActiveTab,
  activeTab,
}) => {
  const { businessUnitStore, roleStore, userStore } = useStores();
  const { t } = useTranslation();

  const { values, errors, handleChange, setFieldValue } = useFormikContext<FormUser>();

  const selectedUser = userStore.selectedEntity;

  const userRolesOptions: ISelectOption[] = roleStore.values
    .filter(role => role.active || selectedUser?.roleIds?.includes(role.id.toString()))
    .map(role => ({
      label: role.description,
      value: role.id,
    }));

  let title: string;

  if (isNew && (!values.firstName || !values.lastName)) {
    title = t(`${I18N_PATH}CreateNewUser`);
  } else if (values.firstName && values.lastName) {
    title = `${values.firstName} ${values.lastName}`;
  } else if (selectedUser?.name) {
    title = selectedUser.name;
  } else {
    title = '';
  }

  const availableBusinessUnits = businessUnitStore.values
    .filter(
      bu => !values.salesRepresentatives.some(({ businessUnitId }) => +businessUnitId === bu.id),
    )
    .map(bu => ({ label: bu.fullName, value: bu.id }));

  return (
    <>
      <Layouts.Padding padding="3" bottom="0">
        <Typography variant="headerThree">{title}</Typography>
        <Divider top />
      </Layouts.Padding>
      <Layouts.Scroll>
        <Layouts.Padding padding="3" top="0">
          <Navigation
            configs={usersNavigationConfig}
            activeTab={activeTab}
            onChange={setActiveTab}
            withEmpty
            border
          />
          {activeTab.key === 'general' ? (
            <Layouts.Padding top="3">
              <Layouts.Flex className={styles.status}>
                <Typography color="secondary" className={styles.title}>
                  {t('Text.Status')}
                </Typography>
                <Checkbox
                  id="activeCheckbox"
                  name="active"
                  value={values.active}
                  onChange={handleChange}
                  labelClass={styles.checkbox}
                >
                  {t('Text.Active')}
                </Checkbox>
              </Layouts.Flex>
              <Layouts.Grid gap="4" columns={2}>
                <FormInput
                  label={`${t(`${I18N_PATH_FORM}FirstName`)}*`}
                  name="firstName"
                  onChange={handleChange}
                  value={values.firstName}
                  error={errors.firstName}
                />

                <FormInput
                  label={`${t(`${I18N_PATH_FORM}LastName`)}*`}
                  name="lastName"
                  onChange={handleChange}
                  value={values.lastName}
                  error={errors.lastName}
                />
              </Layouts.Grid>
              <Layouts.Grid gap="4" columns={2}>
                <MultiSelect
                  name="roleIds"
                  label={t(`${I18N_PATH_FORM}AssignedRoles`)}
                  placeholder={t(`${I18N_PATH_FORM}AssignedRolesPlaceholder`)}
                  options={userRolesOptions}
                  value={values.roleIds}
                  onSelectChange={setFieldValue}
                />
                <FormInput
                  label={`${t(`Form.Title`)}*`}
                  name="title"
                  onChange={handleChange}
                  value={values.title}
                  error={errors.title}
                />
              </Layouts.Grid>
              <FieldArray name="salesRepresentatives">
                {({ push, remove }) => (
                  <>
                    {values.salesRepresentatives.length > 0 ? (
                      <Layouts.Flex>
                        <Layouts.Box width="345px">
                          <Typography color="secondary" shade="desaturated" variant="bodyMedium">
                            {t(`${I18N_PATH}SalesRep`)}*
                          </Typography>
                        </Layouts.Box>
                        <Typography color="secondary" shade="desaturated" variant="bodyMedium">
                          {t(`${I18N_PATH}Commission`)}*
                        </Typography>
                      </Layouts.Flex>
                    ) : null}
                    {values.salesRepresentatives.map((item, i) => {
                      const bu = item.businessUnitId
                        ? businessUnitStore.getById(item.businessUnitId)
                        : undefined;

                      return (
                        <Layouts.Flex key={i}>
                          <Layouts.Margin top="1">
                            <Layouts.IconLayout remove onClick={() => remove(i)}>
                              <DeleteIcon
                                role="button"
                                tabIndex={0}
                                aria-label={t('Text.Remove')}
                                onKeyDown={e => {
                                  if (handleEnterOrSpaceKeyDown(e)) {
                                    remove(i);
                                  }
                                }}
                              />
                            </Layouts.IconLayout>
                          </Layouts.Margin>
                          <Layouts.Margin right="2">
                            <Layouts.Box width="300px">
                              <Select
                                name={`salesRepresentatives[${i}].businessUnitId`}
                                ariaLabel={t(`${I18N_PATH}SalesRep`)}
                                options={
                                  bu
                                    ? [{ label: bu.fullName, value: bu.id }]
                                    : availableBusinessUnits
                                }
                                value={item.businessUnitId}
                                onSelectChange={setFieldValue}
                                error={getIn(errors, `salesRepresentatives[${i}].businessUnitId`)}
                              />
                            </Layouts.Box>
                          </Layouts.Margin>
                          <FormInput
                            name={`salesRepresentatives[${i}].commissionAmount`}
                            ariaLabel={t(`${I18N_PATH}Commission`)}
                            onChange={handleChange}
                            value={item.commissionAmount}
                            error={getIn(errors, `salesRepresentatives[${i}].commissionAmount`)}
                          />
                        </Layouts.Flex>
                      );
                    })}
                    <Typography
                      color="information"
                      variant="bodyMedium"
                      cursor="pointer"
                      role="button"
                      tabIndex={0}
                      onClick={() => push({})}
                      onKeyDown={e => {
                        if (handleEnterOrSpaceKeyDown(e)) {
                          push({});
                        }
                      }}
                    >
                      {t(`${I18N_PATH}AssignAsSalesRep`)}
                    </Typography>
                  </>
                )}
              </FieldArray>

              <Divider both />
              <Layouts.Grid gap="4" columns={2}>
                <FormInput
                  label={`${t(`${I18N_PATH_FORM}CorporateEmail`)}*`}
                  name="email"
                  onChange={handleChange}
                  disabled={!isNew}
                  value={values.email}
                  error={errors.email}
                />
                <FormInput
                  label={`${t(`Form.City`)}*`}
                  name="address.city"
                  onChange={handleChange}
                  value={values.address?.city}
                  error={getIn(errors, 'address.city')}
                />
              </Layouts.Grid>
              <Layouts.Grid gap="4" columns={2}>
                <FormInput
                  label={`${t(`Form.AddressLine`, { line: 1 })}*`}
                  name="address.addressLine1"
                  onChange={handleChange}
                  value={values.address?.addressLine1}
                  error={getIn(errors, 'address.addressLine1')}
                />
                <FormInput
                  label={`${t(`Form.State`)}*`}
                  name="address.state"
                  onChange={handleChange}
                  value={values.address?.state}
                  error={getIn(errors, 'address.state')}
                />
              </Layouts.Grid>
              <Layouts.Grid gap="4" columns={4}>
                <Layouts.Cell width={2}>
                  <FormInput
                    label={t(`Form.AddressLine`, { line: 2 })}
                    name="address.addressLine2"
                    onChange={handleChange}
                    value={values.address?.addressLine2}
                    error={getIn(errors, 'address.addressLine2')}
                  />
                </Layouts.Cell>

                <FormInput
                  label={`${t(`Form.Zip`)}*`}
                  name="address.zip"
                  onChange={handleChange}
                  value={values.address?.zip}
                  error={getIn(errors, 'address.zip')}
                />
              </Layouts.Grid>
              <FieldArray name="phones">
                {({ push, remove }) => {
                  return (
                    <>
                      {values.phones.map((phoneNumber, index) => (
                        <PhoneNumber
                          index={index}
                          key={index}
                          phoneNumber={phoneNumber}
                          parentFieldName="phones"
                          errors={getIn(errors, 'phones')}
                          onRemove={remove}
                          onChange={handleChange}
                          onNumberChange={setFieldValue}
                        />
                      ))}
                      <div className={styles.addPhone}>
                        {values.phones.length < MAX_PHONE_NUMBERS_COUNT ? (
                          <PhoneNumberAdd index={values.phones.length} push={push} />
                        ) : null}
                      </div>
                    </>
                  );
                }}
              </FieldArray>
            </Layouts.Padding>
          ) : (
            <UserAndRolesPermissions type="user" />
          )}
        </Layouts.Padding>
      </Layouts.Scroll>
    </>
  );
};
