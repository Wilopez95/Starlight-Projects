import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Layouts,
  Checkbox,
  FormContainer,
  FormInput,
  Typography,
} from '@starlightpro/shared-components';
import { FieldArray, getIn, useFormik } from 'formik';
import { isEmpty, noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { CrossIcon } from '@root/assets';
import { Divider, TableQuickView, withQuickView } from '@root/core/common/TableTools';
import { useBusinessContext, useRegionConfig, useScrollOnError, useStores } from '@root/core/hooks';
import { IContact } from '@root/core/types';
import { ButtonContainer, PhoneNumber, PhoneNumberAdd } from '@root/customer/components';

import { IQuickView } from '../types';

import { getValues, validationSchema } from './formikData';
import { FormSubtitle } from './styles';

const I18N_PATH = 'pages.UserContacts.';

const ContactQuickView: React.FC<IQuickView> = ({ tableContainerRef, clickOutContainers }) => {
  const { contactStore, customerStore } = useStores();
  const { t } = useTranslation();
  const regionConfig = useRegionConfig();
  const selectedContact = contactStore.selectedEntity;
  const customer = customerStore.selectedEntity!;
  const isNew = !selectedContact;
  const formik = useFormik({
    validationSchema: validationSchema(regionConfig),
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
    async (data: IContact, onCancel: () => void) => {
      const formErrors = await validateForm();

      if (!isEmpty(formErrors)) {
        return;
      }

      if (data.id === 0) {
        await contactStore.create(
          {
            ...data,
            customerId: customer?.id,
          },
          businessUnitId,
        );
      } else {
        await contactStore.update(data, businessUnitId);
      }

      if (data.main) {
        contactStore.requestMyContact();
      }
      onCancel();
    },
    [contactStore, customer?.id, validateForm, businessUnitId],
  );

  const title = isNew ? t(`${I18N_PATH}addUser`) : `${values.firstName} ${values.lastName}`;

  const subTitle =
    !isNew &&
    `${values.main ? 'Main Contact' : ''}${values.jobTitle && values.main ? ' ・ ' : ''}${
      values.jobTitle ?? ''
    }`;

  return (
    <TableQuickView
      parentRef={tableContainerRef}
      clickOutContainers={[...(clickOutContainers ?? []), tableContainerRef]}
      store={contactStore}
      size='middle-fixed'
    >
      {({ onCancel, onAddRef, scrollContainerHeight, tableQuickViewStyles }) => (
        <>
          <div ref={onAddRef} className={tableQuickViewStyles.header}>
            <Layouts.Box
              top='7px'
              right='15px'
              position='absolute'
              className={tableQuickViewStyles.cancelButton}
            >
              <CrossIcon onClick={onCancel} />
            </Layouts.Box>
            <div className={tableQuickViewStyles.dataContainer}>
              <div className={tableQuickViewStyles.quickViewTitle}>{title}</div>
              <div className={tableQuickViewStyles.quickViewDescription}>{subTitle}</div>
            </div>
            <Divider top />
          </div>
          <FormContainer formik={formik}>
            <Layouts.Scroll height={scrollContainerHeight}>
              <Layouts.Padding padding='3'>
                <Layouts.Padding bottom='1'>
                  <Layouts.Flex>
                    <Layouts.Column>
                      <Layouts.Padding top='1' bottom='1'>
                        <Layouts.Flex>
                          <Layouts.Column>
                            <Typography
                              as='label'
                              shade='desaturated'
                              color='secondary'
                              htmlFor='active'
                            >
                              Status
                            </Typography>
                          </Layouts.Column>
                          <Layouts.Column>
                            <Checkbox
                              id='active'
                              name='active'
                              value={values.active}
                              error={errors.active}
                              onChange={handleChange}
                              disabled={values.main}
                            >
                              Active
                            </Checkbox>
                          </Layouts.Column>
                        </Layouts.Flex>
                      </Layouts.Padding>
                    </Layouts.Column>
                  </Layouts.Flex>
                </Layouts.Padding>
                <Layouts.Padding top='1' bottom='1'>
                  <Layouts.Flex>
                    <Layouts.Column>
                      <Typography
                        as='label'
                        shade='desaturated'
                        color='secondary'
                        htmlFor='firstName'
                      >
                        First Name
                      </Typography>
                      <FormInput
                        name='firstName'
                        value={values.firstName}
                        error={errors.firstName}
                        onChange={handleChange}
                      />
                      <Typography
                        as='label'
                        shade='desaturated'
                        color='secondary'
                        htmlFor='lastName'
                      >
                        Last Name
                      </Typography>
                      <FormInput
                        name='lastName'
                        value={values.lastName}
                        error={errors.lastName}
                        onChange={handleChange}
                      />
                    </Layouts.Column>
                    <Layouts.Column>
                      <Typography
                        as='label'
                        shade='desaturated'
                        color='secondary'
                        htmlFor='jobTitle'
                      >
                        {t(`${I18N_PATH}UsersGrid.title`)}
                      </Typography>
                      <FormInput
                        name='jobTitle'
                        value={values.jobTitle ?? ''}
                        error={errors.jobTitle}
                        onChange={handleChange}
                      />
                      <Typography as='label' shade='desaturated' color='secondary' htmlFor='email'>
                        Email
                      </Typography>
                      <FormInput
                        name='email'
                        value={values.email ?? ''}
                        error={errors.email}
                        onChange={handleChange}
                        disabled={isNew ? false : values.customerPortalUser}
                      />
                    </Layouts.Column>
                  </Layouts.Flex>
                </Layouts.Padding>

                <Divider both />
                <FieldArray name='phoneNumbers'>
                  {({ push, remove }) => {
                    return (
                      <>
                        <Layouts.Padding top='1' bottom='1'>
                          {values.phoneNumbers?.map((phoneNumber, index) => (
                            <PhoneNumber
                              index={index}
                              key={index}
                              phoneNumber={phoneNumber}
                              parentFieldName='phoneNumbers'
                              errors={getIn(errors, 'phoneNumbers')}
                              onRemove={remove}
                              onChange={handleChange}
                              onNumberChange={setFieldValue}
                              showTextOnly
                              firstNumberRemovable={!values.main}
                            />
                          ))}
                        </Layouts.Padding>
                        {values.phoneNumbers && values.phoneNumbers.length < 5 && (
                          <Layouts.Padding top='1' bottom='1'>
                            <Layouts.Flex>
                              <PhoneNumberAdd index={values.phoneNumbers.length} push={push} />
                            </Layouts.Flex>
                          </Layouts.Padding>
                        )}
                      </>
                    );
                  }}
                </FieldArray>
                <Divider both />
                <FormSubtitle>Permissions</FormSubtitle>
                <Layouts.Margin top='2'>
                  <Checkbox
                    id='allowCustomerPortal'
                    name='allowCustomerPortal'
                    value={values.allowCustomerPortal}
                    onChange={handleChange}
                    disabled={!isNew && values.main}
                  >
                    Allow customer portal
                  </Checkbox>
                </Layouts.Margin>
              </Layouts.Padding>
            </Layouts.Scroll>
          </FormContainer>
          <div ref={onAddRef} className={tableQuickViewStyles.buttonContainer}>
            <Divider bottom />
            <ButtonContainer
              isCreating={isNew}
              onCancel={onCancel}
              onSave={() => {
                handleContactChange(values, onCancel);
              }}
            />
          </div>
        </>
      )}
    </TableQuickView>
  );
};

export default withQuickView(observer(ContactQuickView));
