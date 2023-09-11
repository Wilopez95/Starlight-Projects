import React, { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, TextInput, TextInputElement, Typography } from '@starlightpro/shared-components';
import { getIn, useFormik } from 'formik';
import { isEmpty, noop } from 'lodash-es';

import { useToggle } from '@root/core/hooks';
import { useIntl } from '@root/core/i18n/useIntl';

import { FilterConfigContext } from '../../context';
import { AddFilterIcon } from '../../FilterDropdownList';

import { generateValidationSchema, getInitialValues } from './formikData';
import type { INumberRangeFilter } from './types';

const I18N_PATH = 'common.TableTools.TableFilter.Filters.NumberRangeFilter.Text.';

const NumberRangeFilter: React.FC<INumberRangeFilter> = ({
  fromNumberPropName,
  toNumberPropName,
}) => {
  const { filterByKey, filterState, setFilterValue } = useContext(FilterConfigContext);

  const { t } = useTranslation();

  const [isInputVisible, toggleInputVisible] = useToggle(false);

  const { formatCurrency } = useIntl();

  const { values, handleChange, errors, validateForm } = useFormik({
    initialValues: getInitialValues(fromNumberPropName, toNumberPropName),
    validationSchema: generateValidationSchema(fromNumberPropName, toNumberPropName),
    validateOnChange: false,
    onSubmit: noop,
  });

  const handleKeyUp = useCallback(
    async (e: React.KeyboardEvent<TextInputElement>) => {
      if (e.key !== 'Enter') {
        return;
      }
      const errors = await validateForm();

      if (!isEmpty(errors)) {
        return;
      }

      const from = getIn(values, fromNumberPropName);
      const to = getIn(values, toNumberPropName);

      const label = `${formatCurrency(from)} - ${formatCurrency(to)}`;

      setFilterValue(filterByKey, {
        label,
        value: {
          [fromNumberPropName]: Number(from),
          [toNumberPropName]: Number(to),
        },
      });

      toggleInputVisible();
    },
    [
      filterByKey,
      formatCurrency,
      fromNumberPropName,
      setFilterValue,
      toNumberPropName,
      toggleInputVisible,
      validateForm,
      values,
    ],
  );

  if (getIn(filterState, `${filterByKey}.value`)) {
    return null;
  }

  if (isInputVisible) {
    return (
      <Layouts.Flex alignItems='center'>
        <Layouts.Margin left='3' right='2'>
          <Typography color='secondary' variant='bodyMedium'>
            {t(`${I18N_PATH}from`)}
          </Typography>
        </Layouts.Margin>
        <Layouts.Box width='250px'>
          <TextInput
            name={fromNumberPropName}
            value={getIn(values, fromNumberPropName)}
            error={getIn(errors, fromNumberPropName)}
            onChange={handleChange}
            onKeyUp={handleKeyUp}
            noError
          />
        </Layouts.Box>
        <Layouts.Margin left='2' right='2'>
          <Typography color='secondary' variant='bodyMedium'>
            {t(`${I18N_PATH}to`)}
          </Typography>
        </Layouts.Margin>
        <Layouts.Box width='250px'>
          <TextInput
            name={toNumberPropName}
            value={getIn(values, toNumberPropName)}
            error={getIn(errors, toNumberPropName)}
            onChange={handleChange}
            onKeyUp={handleKeyUp}
            noError
          />
        </Layouts.Box>
      </Layouts.Flex>
    );
  }

  return <AddFilterIcon onClick={toggleInputVisible} />;
};

export default NumberRangeFilter;
