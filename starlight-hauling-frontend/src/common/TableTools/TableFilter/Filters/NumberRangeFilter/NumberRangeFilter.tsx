import React, { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, TextInput, TextInputElement } from '@starlightpro/shared-components';
import { getIn, useFormik } from 'formik';
import { isEmpty, noop } from 'lodash-es';

import { Typography } from '@root/common';
import { useToggle } from '@root/hooks';

import { FilterConfigContext } from '../../context';
import { AddFilterIcon } from '../../FilterDropdownList';

import { generateValidationSchema, getInitialValues } from './formikData';
import { type INumberRangeFilter } from './types';

const I18N_PATH = 'common.TableTools.TableFilter.Filters.NumberRangeFilter.Text.';

const NumberRangeFilter: React.FC<INumberRangeFilter> = ({
  fromNumberPropName,
  toNumberPropName,
  unit = '',
}) => {
  const { filterByKey, filterState, setFilterValue } = useContext(FilterConfigContext);

  const { t } = useTranslation();

  const [isInputVisible, toggleInputVisible] = useToggle(false);

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
      const newErrors = await validateForm();

      if (!isEmpty(newErrors)) {
        return;
      }

      const from = getIn(values, fromNumberPropName) as string;
      const to = getIn(values, toNumberPropName) as string;

      const label = `${unit}${parseFloat(from).toFixed(2)} - ${unit}${parseFloat(to).toFixed(2)}`;

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
      fromNumberPropName,
      setFilterValue,
      toNumberPropName,
      toggleInputVisible,
      unit,
      validateForm,
      values,
    ],
  );

  if (getIn(filterState, `${filterByKey}.value`)) {
    return null;
  }

  if (isInputVisible) {
    return (
      <Layouts.Flex alignItems="baseline">
        <Layouts.Margin left="3" right="2">
          <Typography
            as="label"
            htmlFor={fromNumberPropName}
            color="secondary"
            variant="bodyMedium"
          >
            {t(`${I18N_PATH}from`)}*
          </Typography>
        </Layouts.Margin>
        <Layouts.Box width="250px">
          <TextInput
            name={fromNumberPropName}
            value={getIn(values, fromNumberPropName)}
            error={getIn(errors, fromNumberPropName)}
            onChange={handleChange}
            onKeyUp={handleKeyUp}
            type="number"
            noError
          />
        </Layouts.Box>
        <Layouts.Margin left="2" right="2">
          <Typography as="label" htmlFor={toNumberPropName} color="secondary" variant="bodyMedium">
            {t(`${I18N_PATH}to`)}*
          </Typography>
        </Layouts.Margin>
        <Layouts.Box width="250px">
          <TextInput
            name={toNumberPropName}
            value={getIn(values, toNumberPropName)}
            error={getIn(errors, toNumberPropName)}
            onChange={handleChange}
            onKeyUp={handleKeyUp}
            type="number"
            noError
          />
        </Layouts.Box>
      </Layouts.Flex>
    );
  }

  return <AddFilterIcon onClick={toggleInputVisible} />;
};

export default NumberRangeFilter;
