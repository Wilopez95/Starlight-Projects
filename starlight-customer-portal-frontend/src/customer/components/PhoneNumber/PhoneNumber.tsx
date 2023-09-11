import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Layouts, FormInput, Typography } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';

import { Select } from '@root/core/common';
import {
  phoneNumberPrimaryOptions,
  phoneNumberSecondaryOptions,
} from '@root/core/consts/phoneNumber';
import { IPhoneNumber } from '@root/core/types';
import {
  Extension,
  RemoveIcon,
  RemoveIconFirst,
  TextOnly,
  Type,
  TypeWrapper,
} from '@root/customer/components/PhoneNumber/PhoneNumberStyles';

import PhoneField from '../PhoneField/PhoneField';

import { IPhoneNumberComponent } from './types';

const I18N_PATH_BASE = 'components.PhoneNumber.';
const I18N_PATH = `${I18N_PATH_BASE}Text.`;
const I18N_PATH_FORM = `${I18N_PATH_BASE}Form.`;

const PhoneNumber: React.FC<IPhoneNumberComponent> = ({
  index,
  phoneNumber,
  parentFieldName,
  firstNumberEnabled,
  firstNumberRemovable,
  showTextOnly,
  onRemove,
  onChange,
  onNumberChange,
  errors = [],
  errorsDuplicate,
}) => {
  const { t } = useTranslation();
  const { setFieldValue, values } = useFormikContext<{ phoneNumbers: IPhoneNumber[] }>();

  const handleRemoveClick = useCallback(() => {
    onRemove(index);
    if (index === 0 && values.phoneNumbers.length > 1) {
      setFieldValue('phoneNumbers[0].type', 'main');
    }
  }, [index, onRemove, setFieldValue, values.phoneNumbers.length]);

  const [errorDuplicate, setErrorDuplicate] = useState(errorsDuplicate);
  const handleErrorDuplicateRemove = useCallback(() => setErrorDuplicate(''), []);

  const { extension, number, textOnly, type } = phoneNumber;

  return (
    <Layouts.Flex>
      <Layouts.Column>
        <Layouts.Flex>
          <TypeWrapper>
            {index !== 0 && <RemoveIcon onClick={handleRemoveClick} />}
            {index === 0 && firstNumberRemovable && <RemoveIconFirst onClick={handleRemoveClick} />}
            <Type disabled={!firstNumberEnabled && !index}>
              {!index && (
                <Typography
                  color='secondary'
                  as='label'
                  shade='desaturated'
                  variant='bodyMedium'
                  htmlFor={`${parentFieldName}[${index}].type`}
                >
                  {t(`${I18N_PATH}PhoneType`)}
                </Typography>
              )}
              {firstNumberEnabled && (
                <Select
                  placeholder={t(`${I18N_PATH_FORM}SelectPhoneType`)}
                  name={`${parentFieldName}[${index}].type`}
                  key='type'
                  options={phoneNumberPrimaryOptions}
                  value={type}
                  onSelectChange={onNumberChange}
                  nonClearable
                />
              )}
              {!firstNumberEnabled && index ? (
                <Select
                  placeholder={t(`${I18N_PATH_FORM}SelectPhoneType`)}
                  name={`${parentFieldName}[${index}].type`}
                  key='type'
                  options={phoneNumberSecondaryOptions}
                  value={type}
                  onSelectChange={onNumberChange}
                  nonClearable
                />
              ) : (
                <FormInput
                  name={`${parentFieldName}[${index}].type`}
                  key='type'
                  value='Main'
                  onChange={onChange}
                  disabled
                />
              )}
            </Type>
          </TypeWrapper>
          <Layouts.Box width='100%'>
            {!index && (
              <Typography
                color='secondary'
                as='label'
                shade='desaturated'
                variant='bodyMedium'
                htmlFor={`${parentFieldName}[${index}].number`}
              >
                {t(`${I18N_PATH}PhoneNumber`)}
              </Typography>
            )}
            <PhoneField
              name={`${parentFieldName}[${index}].number`}
              key='number'
              value={number}
              onClick={handleErrorDuplicateRemove}
              onChange={onChange}
              error={errors[index]?.number || (!index && errorDuplicate)}
            />
          </Layouts.Box>
        </Layouts.Flex>
      </Layouts.Column>
      <Layouts.Column>
        <Layouts.Flex>
          <Extension>
            {!index && (
              <Typography
                color='secondary'
                as='label'
                shade='desaturated'
                variant='bodyMedium'
                htmlFor={`${parentFieldName}[${index}].extension`}
              >
                {t(`${I18N_PATH}Extension`)}
              </Typography>
            )}
            <FormInput
              name={`${parentFieldName}[${index}].extension`}
              value={extension}
              onChange={onChange}
              error={errors[index]?.extension}
            />
          </Extension>
          <TextOnly first={!index}>
            {showTextOnly && (
              <Checkbox
                id={`${parentFieldName}[${index}].textOnly`}
                name={`${parentFieldName}[${index}].textOnly`}
                value={textOnly}
                error={errors[index]?.textOnly}
                onChange={onChange}
              >
                Text messages only
              </Checkbox>
            )}
          </TextOnly>
        </Layouts.Flex>
      </Layouts.Column>
    </Layouts.Flex>
  );
};

export default PhoneNumber;
