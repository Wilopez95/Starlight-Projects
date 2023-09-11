import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Layouts, Select } from '@starlightpro/shared-components';
import cx from 'classnames';

import { DeleteIcon } from '@root/assets';
import { FormInput, Typography } from '@root/common';
import { phoneNumberPrimaryOptions, phoneNumberSecondaryOptions } from '@root/consts/phoneNumber';
import { handleEnterOrSpaceKeyDown } from '@root/helpers';

import PhoneField from '../PhoneField/PhoneField';

import { IPhoneNumberComponent } from './types';

import styles from './css/styles.scss';

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

  const handleRemoveClick = useCallback(() => {
    onRemove(index);
  }, [index, onRemove]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        handleRemoveClick();
      }
    },
    [handleRemoveClick],
  );

  const [errorDuplicate, setErrorDuplicate] = useState(errorsDuplicate);
  const handleErrorDuplicateRemove = useCallback(() => setErrorDuplicate(''), []);

  const { extension, number, textOnly, type } = phoneNumber;

  return (
    <Layouts.Flex>
      <Layouts.Column>
        <Layouts.Flex>
          <div className={styles.typeWrapper}>
            {index !== 0 ? (
              <DeleteIcon
                role="button"
                aria-label={t('Text.Delete')}
                tabIndex={0}
                className={styles.removeIcon}
                onKeyDown={handleKeyDown}
                onClick={handleRemoveClick}
              />
            ) : null}
            {index === 0 && firstNumberRemovable ? (
              <DeleteIcon
                role="button"
                aria-label={t('Text.Delete')}
                tabIndex={0}
                className={cx(styles.removeIcon, styles.first)}
                onKeyDown={handleKeyDown}
                onClick={handleRemoveClick}
              />
            ) : null}
            <div className={cx(styles.type, { [styles.disabled]: !firstNumberEnabled && !index })}>
              {!index ? (
                <Typography
                  color="secondary"
                  as="label"
                  shade="desaturated"
                  variant="bodyMedium"
                  htmlFor={`${parentFieldName}[${index}].type`}
                >
                  {t(`${I18N_PATH}PhoneType`)}
                </Typography>
              ) : null}
              {firstNumberEnabled ? (
                <Select
                  placeholder={t(`${I18N_PATH_FORM}SelectPhoneType`)}
                  name={`${parentFieldName}[${index}].type`}
                  key="type"
                  options={phoneNumberPrimaryOptions}
                  value={type}
                  onSelectChange={onNumberChange}
                  nonClearable
                />
              ) : null}
              {!firstNumberEnabled && index ? (
                <Select
                  placeholder={t(`${I18N_PATH_FORM}SelectPhoneType`)}
                  name={`${parentFieldName}[${index}].type`}
                  key="type"
                  options={phoneNumberSecondaryOptions}
                  value={type}
                  onSelectChange={onNumberChange}
                  nonClearable
                />
              ) : (
                <FormInput
                  name={`${parentFieldName}[${index}].type`}
                  key="type"
                  value="Main"
                  onChange={onChange}
                  disabled
                />
              )}
            </div>
          </div>
          <div className={styles.number}>
            {!index ? (
              <Typography
                color="secondary"
                as="label"
                shade="desaturated"
                variant="bodyMedium"
                htmlFor={`${parentFieldName}[${index}].number`}
              >
                {t(`${I18N_PATH}PhoneNumber`)}*
              </Typography>
            ) : null}
            <PhoneField
              name={`${parentFieldName}[${index}].number`}
              key="number"
              value={number}
              onClick={handleErrorDuplicateRemove}
              onChange={onChange}
              error={errors[index]?.number || (!index && errorDuplicate)}
            />
          </div>
        </Layouts.Flex>
      </Layouts.Column>
      <Layouts.Column>
        <Layouts.Flex>
          <div className={styles.extension}>
            {!index ? (
              <Typography
                color="secondary"
                as="label"
                shade="desaturated"
                variant="bodyMedium"
                htmlFor={`${parentFieldName}[${index}].extension`}
              >
                {t(`${I18N_PATH}Extension`)}
              </Typography>
            ) : null}
            <FormInput
              name={`${parentFieldName}[${index}].extension`}
              value={extension}
              onChange={onChange}
              error={errors[index]?.extension}
            />
          </div>
          <div className={cx(styles.textOnly, { [styles.default]: !index })}>
            {showTextOnly ? (
              <Checkbox
                id={`${parentFieldName}[${index}].textOnly`}
                name={`${parentFieldName}[${index}].textOnly`}
                value={textOnly}
                error={errors[index]?.textOnly}
                onChange={onChange}
              >
                Text messages only
              </Checkbox>
            ) : null}
          </div>
        </Layouts.Flex>
      </Layouts.Column>
    </Layouts.Flex>
  );
};

export default PhoneNumber;
