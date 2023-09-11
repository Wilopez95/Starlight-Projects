import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  FormContainerLayout,
  FormInput,
  ReadOnlyFormField,
  Layouts,
  Typography,
} from '@starlightpro/shared-components';
import { FieldArray, getIn, useFormik } from 'formik';

import { Divider } from '@root/core/common/TableTools';
import { useRegionConfig } from '@root/core/hooks';
import { PhoneNumber, PhoneNumberAdd } from '@root/customer/components';
import { INewContact } from '@root/customer/forms/EditMyContact/types';

import { getValues, validationSchema } from './formikData';

const I18N_PATH = 'pages.UserContacts.UserQuickViewUpdate.';

const EditMyContact: React.FC<INewContact> = ({ onSubmit, onClose, contact }) => {
  const regionConfig = useRegionConfig();
  const { t } = useTranslation();

  const formik = useFormik({
    validationSchema: validationSchema(regionConfig),
    initialValues: getValues(contact),
    validateOnChange: false,
    initialErrors: {},
    onSubmit,
    onReset: onClose,
  });

  const { values, errors, handleChange, setFieldValue, dirty } = formik;

  const title = useMemo(() => {
    return contact ? `${contact.firstName} ${contact.lastName}` : null;
  }, [contact]);

  return (
    <FormContainerLayout formik={formik}>
      <Layouts.Flex direction='column'>
        <Layouts.Padding padding='3' bottom='0'>
          <Typography variant='headerThree'>{title}</Typography>
          {contact?.jobTitle ? (
            <Typography
              as={Layouts.Padding}
              top='1'
              color='secondary'
              shade='light'
              variant='bodySmall'
              textTransform='uppercase'
            >
              {contact.jobTitle}
            </Typography>
          ) : null}
          <Divider top />
        </Layouts.Padding>
        <Layouts.Scroll height={700}>
          <Layouts.Padding top='2'>
            <Layouts.Flex flexGrow={1} direction='column' justifyContent='flex-start'>
              <Layouts.Padding right='3' bottom='3' left='3'>
                <Layouts.Padding top='1' bottom='1'>
                  <Layouts.Flex>
                    <Layouts.Column>
                      <FormInput
                        label={t(`${I18N_PATH}firstName`)}
                        name='firstName'
                        value={values.firstName}
                        error={errors.firstName}
                        onChange={handleChange}
                      />

                      <FormInput
                        label={t(`${I18N_PATH}lastName`)}
                        name='lastName'
                        value={values.lastName}
                        error={errors.lastName}
                        onChange={handleChange}
                      />
                    </Layouts.Column>
                    <Layouts.Column>
                      <FormInput
                        label={t(`${I18N_PATH}jobTitle`)}
                        name='jobTitle'
                        value={values.jobTitle ?? ''}
                        error={errors.jobTitle}
                        onChange={handleChange}
                      />

                      <ReadOnlyFormField
                        label={t(`${I18N_PATH}email`)}
                        value={values.email ?? ''}
                      />
                    </Layouts.Column>
                  </Layouts.Flex>
                </Layouts.Padding>
                <Divider bottom />
                <FieldArray name='phoneNumbers'>
                  {({ push, remove }) => {
                    return (
                      <>
                        {values.phoneNumbers && values.phoneNumbers.length > 0 && (
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
                                firstNumberRemovable
                              />
                            ))}
                          </Layouts.Padding>
                        )}
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
              </Layouts.Padding>
            </Layouts.Flex>
          </Layouts.Padding>
        </Layouts.Scroll>
        <Layouts.Padding bottom='3' left='3' right='3'>
          <Divider bottom />
          <Layouts.Flex justifyContent='space-between'>
            <Button type='reset'>{t(`Text.Cancel`)}</Button>
            <Button type='submit' disabled={!dirty} variant='primary'>
              {t(`Text.SaveChanges`)}
            </Button>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Flex>
    </FormContainerLayout>
  );
};

export default EditMyContact;
