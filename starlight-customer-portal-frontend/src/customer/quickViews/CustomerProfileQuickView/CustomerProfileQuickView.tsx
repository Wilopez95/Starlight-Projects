import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Checkbox,
  FormContainer,
  FormInput,
  Layouts,
  Typography,
} from '@starlightpro/shared-components';
import { FieldArray, getIn, useFormik, validateYupSchema, yupToFormErrors } from 'formik';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';
import * as Yup from 'yup';

import { CrossIcon } from '@root/assets';
import { GlobalService } from '@root/core/api/global/global';
import { Autocomplete, AutocompleteConfig } from '@root/core/common';
import { Address } from '@root/core/common/Autocomplete/components';
import { Divider, TableQuickView, withQuickView } from '@root/core/common/TableTools';
import { useRegionConfig, useScrollOnError, useStores } from '@root/core/hooks';
import { CustomerGroupType } from '@root/core/types';
import { AddressSuggestion } from '@root/core/types/responseEntities';
import { ButtonContainer, PhoneNumber, PhoneNumberAdd } from '@root/customer/components';
import { GeneralInformationName } from '@root/customer/forms/EditCustomer/components';
import {
  addressTabShape,
  customerInfoShape,
  generalInformationCommercialShape,
  generalInformationNonCommercialShape,
  getValues,
} from '@root/customer/forms/EditCustomer/formikData';

import { IQuickView } from '../types';

const ProfileQuickView: React.FC<IQuickView> = ({ tableContainerRef }) => {
  const { customerStore, contactStore } = useStores();
  const customer = customerStore.selectedEntity!;

  const regionConfig = useRegionConfig();
  const { t } = useTranslation();
  const I18N_PATH = 'quickViews.ProfileQuickView.';

  const handleCancel = useCallback(() => {
    customerStore.toggleEditQuickView(false);
  }, [customerStore]);

  useEffect(() => {
    return () => customerStore.toggleEditQuickView(false);
  }, [customerStore]);

  const commercialSchema = Yup.object().shape({
    ...customerInfoShape(regionConfig, t),
    ...generalInformationCommercialShape(t),
    ...addressTabShape(t),
  });

  const nonCommercialSchema = Yup.object().shape({
    ...customerInfoShape(regionConfig, t),
    ...generalInformationNonCommercialShape(t),
    ...addressTabShape(t),
  });

  const commercial =
    customerStore.selectedEntity?.customerGroup.type === CustomerGroupType.commercial;
  const schema = commercial ? commercialSchema : nonCommercialSchema;

  const formik = useFormik({
    initialValues: getValues(customer),
    validationSchema: schema,
    validateOnChange: false,
    initialErrors: {},
    onSubmit: noop,
    onReset: handleCancel,
  });

  const {
    values,
    errors,
    handleChange,
    setFieldValue,
    setFormikState,
    setErrors,
    setValues,
    isValidating,
    dirty,
  } = formik;

  useScrollOnError(errors, !isValidating);

  const handleBillingAddressSameAsMailingChange = useCallback(() => {
    setFormikState((state) => ({
      ...state,
      errors: {},
      values: {
        ...state.values,
        billingAddress: {
          billingAddressSameAsMailing: !state.values.billingAddress.billingAddressSameAsMailing,
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          zip: '',
          id: 0,
        },
      },
    }));
  }, [setFormikState]);

  const handleAutocompleteSelect = useCallback(
    (suggestion: AddressSuggestion) => {
      setFormikState((state) => ({
        ...state,
        values: {
          ...state.values,
          searchString: suggestion.fullAddress ?? '',
          mailingAddress: {
            id: suggestion.id,
            addressLine1: suggestion.address ?? '',
            addressLine2: '',
            city: suggestion.city ?? '',
            zip: suggestion.zip ?? '',
            state: suggestion.state ?? '',
          },
        },
      }));
    },
    [setFormikState],
  );

  const handleSubmit = useCallback(async () => {
    try {
      await validateYupSchema(values, schema);
      await customerStore.update({
        ...values,
        commercial,
        billingAddress: values.billingAddress.billingAddressSameAsMailing
          ? values.mailingAddress
          : values.billingAddress,
      });

      if (!commercial) {
        await contactStore.requestMyContact();
      }

      if (customerStore.isPreconditionFailed) {
        setValues(getValues(customerStore.selectedEntity!));
      } else {
        handleCancel();
      }
    } catch (errors) {
      setErrors(yupToFormErrors(errors));
    }
  }, [commercial, contactStore, customerStore, handleCancel, schema, setErrors, setValues, values]);

  return (
    <TableQuickView
      parentRef={tableContainerRef}
      clickOutContainers={tableContainerRef}
      store={customerStore}
      onCancel={handleCancel}
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
              <div className={tableQuickViewStyles.quickViewTitle}>{customer?.name}</div>
            </div>
            <Divider top />
          </div>
          <FormContainer formik={formik}>
            <Layouts.Scroll height={scrollContainerHeight}>
              <Layouts.Padding padding='3' bottom='0'>
                <Layouts.Padding bottom='3'>
                  <Typography variant='headerFour'>{t(`${I18N_PATH}GeneralInfo`)}</Typography>
                </Layouts.Padding>
                <Layouts.Flex justifyContent='space-between'>
                  <Layouts.Column>
                    <GeneralInformationName commercial={commercial} />
                  </Layouts.Column>
                  <Layouts.Column>
                    <FormInput
                      type='email'
                      label={t(`${I18N_PATH}Email`)}
                      name='email'
                      value={values.email ?? ''}
                      error={errors.email}
                      onChange={handleChange}
                      disabled={!commercial}
                    />
                  </Layouts.Column>
                </Layouts.Flex>
                <Divider bottom />
                <Layouts.Padding bottom='3'>
                  <Typography variant='headerFour'>{t(`${I18N_PATH}Phone`)}</Typography>
                </Layouts.Padding>
                <FieldArray name='phoneNumbers'>
                  {({ push, remove }) => {
                    return (
                      <>
                        {values.phoneNumbers.map((phoneNumber, index) => (
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
                          />
                        ))}
                        <Layouts.Padding top='1' bottom='3'>
                          <Layouts.Flex>
                            {values.phoneNumbers.length < 5 && (
                              <PhoneNumberAdd index={values.phoneNumbers.length} push={push} />
                            )}
                          </Layouts.Flex>
                        </Layouts.Padding>
                      </>
                    );
                  }}
                </FieldArray>
                <Divider bottom />
                <Layouts.Padding bottom='3'>
                  <Typography variant='headerFour'>{t(`${I18N_PATH}MailingAddress`)}</Typography>
                </Layouts.Padding>
                <Layouts.Margin bottom='3'>
                  <Autocomplete
                    label={t(`${I18N_PATH}SearchAddress`)}
                    id='addresses'
                    name='searchString'
                    placeholder={t(`${I18N_PATH}EnterAddress`)}
                    value={values.searchString}
                    onChange={handleChange}
                    onRequest={GlobalService.addressSuggestions}
                  >
                    <AutocompleteConfig name='addresses' hiddenHeader>
                      <Address onClick={handleAutocompleteSelect} />
                    </AutocompleteConfig>
                  </Autocomplete>
                </Layouts.Margin>
                <Layouts.Flex>
                  <Layouts.Column>
                    <FormInput
                      label={t(`${I18N_PATH}AddressLine1`)}
                      name='mailingAddress.addressLine1'
                      value={values.mailingAddress.addressLine1}
                      error={errors.mailingAddress?.addressLine1}
                      onChange={handleChange}
                    />
                    <FormInput
                      label={t(`${I18N_PATH}City`)}
                      name='mailingAddress.city'
                      value={values.mailingAddress.city}
                      error={errors.mailingAddress?.city}
                      onChange={handleChange}
                    />
                  </Layouts.Column>
                  <Layouts.Column>
                    <FormInput
                      label={t(`${I18N_PATH}AddressLine2`)}
                      name='mailingAddress.addressLine2'
                      value={values.mailingAddress.addressLine2 ?? ''}
                      error={errors.mailingAddress?.addressLine2}
                      onChange={handleChange}
                    />
                    <Layouts.Flex>
                      <Layouts.Column>
                        <FormInput
                          label={t(`${I18N_PATH}State`)}
                          name='mailingAddress.state'
                          value={values.mailingAddress.state}
                          error={errors.mailingAddress?.state}
                          onChange={handleChange}
                        />
                      </Layouts.Column>
                      <Layouts.Column>
                        <FormInput
                          label={t(`${I18N_PATH}ZIP`)}
                          name='mailingAddress.zip'
                          value={values.mailingAddress.zip}
                          error={errors.mailingAddress?.zip}
                          onChange={handleChange}
                        />
                      </Layouts.Column>
                    </Layouts.Flex>
                  </Layouts.Column>
                </Layouts.Flex>
                <Typography variant='headerFour'>{t(`${I18N_PATH}BillingAddress`)}</Typography>
                <Layouts.Flex as={Layouts.Box} height='60px'>
                  <Checkbox
                    id='billingAddressSameAsMailing'
                    name='billingAddress.billingAddressSameAsMailing'
                    value={values.billingAddress.billingAddressSameAsMailing}
                    error={errors.billingAddress?.billingAddressSameAsMailing}
                    onChange={handleBillingAddressSameAsMailingChange}
                  >
                    Billing address same as mailing address
                  </Checkbox>
                </Layouts.Flex>
                {!values.billingAddress.billingAddressSameAsMailing && (
                  <>
                    <Layouts.Flex>
                      <Layouts.Column>
                        <FormInput
                          label={t(`${I18N_PATH}AddressLine1`)}
                          name='billingAddress.addressLine1'
                          value={values.billingAddress.addressLine1}
                          error={errors.billingAddress?.addressLine1}
                          onChange={handleChange}
                        />
                        <FormInput
                          label={t(`${I18N_PATH}City`)}
                          name='billingAddress.city'
                          value={values.billingAddress.city}
                          error={errors.billingAddress?.city}
                          onChange={handleChange}
                        />
                      </Layouts.Column>
                      <Layouts.Column>
                        <FormInput
                          label={t(`${I18N_PATH}AddressLine2`)}
                          name='billingAddress.addressLine2'
                          value={values.billingAddress.addressLine2 ?? ''}
                          error={errors.billingAddress?.addressLine2}
                          onChange={handleChange}
                        />
                        <Layouts.Flex>
                          <Layouts.Column>
                            <FormInput
                              label={t(`${I18N_PATH}State`)}
                              name='billingAddress.state'
                              value={values.billingAddress.state}
                              error={errors.billingAddress?.state}
                              onChange={handleChange}
                            />
                          </Layouts.Column>
                          <Layouts.Column>
                            <FormInput
                              label={t(`${I18N_PATH}ZIP`)}
                              name='billingAddress.zip'
                              value={values.billingAddress.zip}
                              error={errors.billingAddress?.zip}
                              onChange={handleChange}
                            />
                          </Layouts.Column>
                        </Layouts.Flex>
                      </Layouts.Column>
                    </Layouts.Flex>
                  </>
                )}
              </Layouts.Padding>
            </Layouts.Scroll>
          </FormContainer>
          <div ref={onAddRef} className={tableQuickViewStyles.buttonContainer}>
            <Divider bottom />
            <ButtonContainer onCancel={onCancel} onSave={handleSubmit} disabled={!dirty} />
          </div>
        </>
      )}
    </TableQuickView>
  );
};

export default withQuickView(observer(ProfileQuickView));
