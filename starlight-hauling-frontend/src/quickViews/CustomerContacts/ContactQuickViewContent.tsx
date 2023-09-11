import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Layouts } from '@starlightpro/shared-components';
import cx from 'classnames';
import { FieldArray, getIn, useFormik } from 'formik';
import { isEmpty, noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import {
  FormInput,
  QuickViewConfirmModal,
  QuickViewContent,
  Typography,
  useQuickViewContext,
} from '@root/common';
import { Divider } from '@root/common/TableTools';
import tableQuickViewStyles from '@root/common/TableTools/TableQuickView/css/styles.scss';
import { FormContainer, PhoneNumber, PhoneNumberAdd } from '@root/components';
import { ConfirmModal } from '@root/components/modals';
import { mainPhoneNumber } from '@root/components/PhoneNumber/defaults';
import { isCore } from '@root/consts/env';
import {
  useBoolean,
  useBusinessContext,
  useIsRecyclingFacilityBU,
  usePermission,
  useScrollOnError,
  useStores,
} from '@root/hooks';
import { buildI18Path } from '@root/i18n/helpers';
import { useIntl } from '@root/i18n/useIntl';
import { ButtonContainer } from '@root/pages/SystemConfiguration/components';
import { IContact } from '@root/types';

import { getValues, validationSchema } from './formikData';

import styles from './css/styles.scss';

const MAX_PHONE_NUMBERS_COUNT = 5;

const I18N_PATH = buildI18Path('quickViews.CustomerContacts.');

const ContactQuickViewContent: React.FC = () => {
  const { closeQuickView, forceCloseQuickView } = useQuickViewContext();
  const { contactStore, customerStore } = useStores();
  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useBoolean();
  const intl = useIntl();
  const { t } = useTranslation();
  const isRecyclingFacilityBU = useIsRecyclingFacilityBU();

  const selectedContact = contactStore.selectedEntity;
  const customer = customerStore.selectedEntity!;
  const isNew = !selectedContact;

  const formik = useFormik({
    validationSchema: validationSchema(intl, I18N_PATH.ValidationErrors),
    validateOnChange: false,
    enableReinitialize: true,
    initialErrors: {},
    initialValues: getValues(selectedContact),
    onSubmit: noop,
  });

  const { values, errors, validateForm, handleChange, setFieldValue, isValidating } = formik;

  const { businessUnitId } = useBusinessContext();

  useScrollOnError(errors, !isValidating);

  const handleContactChange = useCallback(
    async (data: IContact) => {
      const formErrors = await validateForm();

      if (!isEmpty(formErrors)) {
        return;
      }

      if (data.id === 0) {
        contactStore.create(
          {
            ...data,
            customerId: customer.id,
          },
          businessUnitId,
        );
      } else {
        contactStore.update(data, businessUnitId);
      }
      forceCloseQuickView();
    },
    [contactStore, customer.id, validateForm, businessUnitId, forceCloseQuickView],
  );

  const canManageContacts = usePermission('customers:contacts:perform');

  const handleDelete = useCallback(() => {
    contactStore.delete(values.id);
    closeDeleteModal();
    closeQuickView();
  }, [closeDeleteModal, contactStore, values.id, closeQuickView]);

  const handleMainContactAssign = useCallback(() => {
    setFieldValue('main', true);
    if (values.phoneNumbers?.length === 0) {
      setFieldValue('phoneNumbers', [mainPhoneNumber]);
    }
  }, [setFieldValue, values.phoneNumbers?.length]);

  const title = isNew
    ? t(`${I18N_PATH.Text}CreateNewContact`)
    : `${values.firstName} ${values.lastName}`;

  const mainSubTitle = values.main ? t(`${I18N_PATH.Text}MainContact`) : '';

  const subTitle =
    !isNew &&
    `${mainSubTitle}${values.jobTitle && values.main ? ' ・ ' : ''}${values.jobTitle ?? ''}`;

  return (
    <FormContainer formik={formik}>
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        cancelButton={t(`Text.Cancel`)}
        submitButton={t(`${I18N_PATH.Text}DeleteContact`)}
        title={t(`${I18N_PATH.Text}DeleteContact`)}
        subTitle={t(`${I18N_PATH.Text}AreYouSure`)}
        onCancel={closeDeleteModal}
        onSubmit={handleDelete}
      />
      <QuickViewContent
        dirty={formik.dirty}
        confirmModal={<QuickViewConfirmModal />}
        rightPanelElement={
          <>
            <Layouts.Padding padding="3">
              <div className={tableQuickViewStyles.quickViewTitle}>{title}</div>
              <div className={tableQuickViewStyles.quickViewDescription}>{subTitle}</div>
            </Layouts.Padding>
            <Divider />

            <Layouts.Scroll>
              <Layouts.Padding padding="3">
                <Layouts.Padding bottom="1">
                  <Layouts.Flex>
                    <Layouts.Column>
                      <Layouts.Padding top="1" bottom="1">
                        <Layouts.Flex>
                          <Layouts.Column>
                            <Typography shade="desaturated" color="secondary">
                              {t('Text.Status')}
                            </Typography>
                          </Layouts.Column>
                          <Layouts.Column>
                            <Checkbox
                              id="active"
                              name="active"
                              value={values.active}
                              error={errors.active}
                              onChange={handleChange}
                              disabled={values.main}
                            >
                              {t('Text.Active')}
                            </Checkbox>
                          </Layouts.Column>
                        </Layouts.Flex>
                      </Layouts.Padding>
                    </Layouts.Column>
                  </Layouts.Flex>
                </Layouts.Padding>
                <Layouts.Padding top="1" bottom="1">
                  <Layouts.Flex>
                    <Layouts.Column>
                      <Typography
                        as="label"
                        shade="desaturated"
                        color="secondary"
                        htmlFor="firstName"
                      >
                        {t('Text.FirstName')}*
                      </Typography>
                      <FormInput
                        name="firstName"
                        value={values.firstName}
                        error={errors.firstName}
                        onChange={handleChange}
                      />
                      <Typography
                        as="label"
                        shade="desaturated"
                        color="secondary"
                        htmlFor="lastName"
                      >
                        {t('Text.LastName')}*
                      </Typography>
                      <FormInput
                        name="lastName"
                        value={values.lastName}
                        error={errors.lastName}
                        onChange={handleChange}
                      />
                      {!values.main && canManageContacts ? (
                        <Typography
                          color="information"
                          onClick={values.active ? () => handleMainContactAssign() : noop}
                          className={cx({ [styles.disabled]: !values.active })}
                        >
                          {t(`${I18N_PATH.Text}AssignMainContact`)}
                        </Typography>
                      ) : null}
                    </Layouts.Column>
                    <Layouts.Column>
                      <Typography
                        as="label"
                        shade="desaturated"
                        color="secondary"
                        htmlFor="jobTitle"
                      >
                        {t('Text.JobTitle')}
                      </Typography>
                      <FormInput
                        name="jobTitle"
                        value={values.jobTitle ?? ''}
                        error={errors.jobTitle}
                        onChange={handleChange}
                      />
                      <Typography as="label" shade="desaturated" color="secondary" htmlFor="email">
                        {t('Text.Email')}*
                      </Typography>
                      <FormInput
                        name="email"
                        value={values.email}
                        error={errors.email}
                        onChange={handleChange}
                        disabled={!isNew ? values.customerPortalUser : undefined}
                      />
                    </Layouts.Column>
                  </Layouts.Flex>
                </Layouts.Padding>

                <Divider both />

                <FieldArray name="phoneNumbers">
                  {({ push, remove }) => {
                    return (
                      <>
                        <Layouts.Padding top="1" bottom="1">
                          {values.phoneNumbers?.map((phoneNumber, index) => (
                            <PhoneNumber
                              index={index}
                              key={index}
                              phoneNumber={phoneNumber}
                              parentFieldName="phoneNumbers"
                              errors={getIn(errors, 'phoneNumbers')}
                              onRemove={remove}
                              onChange={handleChange}
                              onNumberChange={setFieldValue}
                              showTextOnly
                              firstNumberRemovable={!values.main}
                            />
                          ))}
                        </Layouts.Padding>
                        {values.phoneNumbers &&
                        values.phoneNumbers.length < MAX_PHONE_NUMBERS_COUNT ? (
                          <Layouts.Padding top="1" bottom="1">
                            <Layouts.Flex>
                              <PhoneNumberAdd index={values.phoneNumbers.length} push={push} />
                            </Layouts.Flex>
                          </Layouts.Padding>
                        ) : null}
                      </>
                    );
                  }}
                </FieldArray>

                <Divider both />

                {!isRecyclingFacilityBU ? (
                  <>
                    <div className={styles.formSubTitle}>Permissions</div>
                    <Layouts.Padding top="3" bottom="3">
                      <Layouts.Margin bottom="2">
                        <Checkbox
                          id="allowContractorApp"
                          name="allowContractorApp"
                          value={values.allowContractorApp}
                          error={errors.allowContractorApp}
                          onChange={handleChange}
                        >
                          {t(`${I18N_PATH.Text}AllowContractorApp`)}
                        </Checkbox>
                      </Layouts.Margin>
                      {!isCore ? (
                        <Checkbox
                          id="allowCustomerPortal"
                          name="allowCustomerPortal"
                          value={values.allowCustomerPortal}
                          onChange={handleChange}
                        >
                          {t(`${I18N_PATH.Text}AllowCustomerPortal`)}
                        </Checkbox>
                      ) : null}
                    </Layouts.Padding>
                  </>
                ) : null}
              </Layouts.Padding>
            </Layouts.Scroll>
          </>
        }
        actionsElement={
          canManageContacts ? (
            <ButtonContainer
              isCreating={isNew}
              onCancel={closeQuickView}
              submitButtonType="button"
              onDelete={selectedContact?.active ? undefined : openDeleteModal}
              onSave={() => {
                handleContactChange(values);
              }}
            />
          ) : undefined
        }
      />
    </FormContainer>
  );
};

export default observer(ContactQuickViewContent);
