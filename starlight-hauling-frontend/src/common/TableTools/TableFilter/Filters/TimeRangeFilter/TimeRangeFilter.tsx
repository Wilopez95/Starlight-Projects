import React, { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, TextInputElement, TimePicker } from '@starlightpro/shared-components';
import { format } from 'date-fns';
import { getIn, useFormik } from 'formik';
import { isEmpty, noop } from 'lodash-es';

import { Typography } from '@root/common';
import { useToggle } from '@root/hooks';
import { dateFormatsEnUS } from '@root/i18n/format/date';

import { FilterConfigContext } from '../../context';
import { AddFilterIcon } from '../../FilterDropdownList';

import { generateValidationSchema, getInitialValues } from './formikData';
import { type ITimeRangeFilter } from './types';

const I18N_PATH = 'common.TableTools.TableFilter.Filters.NumberRangeFilter.Text.';

const TimeRangeFilter: React.FC<ITimeRangeFilter> = ({ fromTimePropName, toTimePropName }) => {
  const { filterByKey, filterState, setFilterValue } = useContext(FilterConfigContext);

  const [isInputVisible, toggleInputVisible] = useToggle(false);

  const { t } = useTranslation();

  const { values, setFieldValue, errors, validateForm } = useFormik({
    initialValues: getInitialValues(fromTimePropName, toTimePropName),
    validationSchema: generateValidationSchema(fromTimePropName, toTimePropName),
    validateOnChange: false,
    onSubmit: noop,
  });

  const handleKeyUp = useCallback(
    async (e: React.KeyboardEvent<TextInputElement>) => {
      if (e.key !== 'Enter') {
        return;
      }

      const errorsForm = await validateForm();

      if (!isEmpty(errorsForm)) {
        return;
      }

      const fromDate: number | Date = getIn(values, fromTimePropName);
      const toDate: number | Date = getIn(values, toTimePropName);

      const label = `${format(fromDate, dateFormatsEnUS.time)} - ${format(
        toDate,
        dateFormatsEnUS.time,
      )}`;

      setFilterValue(filterByKey, {
        label,
        value: {
          [fromTimePropName]: format(fromDate, dateFormatsEnUS.time24),
          [toTimePropName]: format(toDate, dateFormatsEnUS.time24),
        },
      });

      toggleInputVisible();
    },
    [
      filterByKey,
      fromTimePropName,
      setFilterValue,
      toTimePropName,
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
      <Layouts.Flex alignItems="baseline">
        <Layouts.Margin left="3" right="2">
          <Typography as="label" htmlFor={fromTimePropName} color="secondary" variant="bodyMedium">
            {t(`${I18N_PATH}from`)}
          </Typography>
        </Layouts.Margin>
        <Layouts.Box width="250px">
          <TimePicker
            name={fromTimePropName}
            onChange={setFieldValue}
            error={getIn(errors, fromTimePropName)}
            onKeyUp={handleKeyUp}
          />
        </Layouts.Box>
        <Layouts.Margin left="2" right="2">
          <Typography as="label" htmlFor={toTimePropName} color="secondary" variant="bodyMedium">
            {t(`${I18N_PATH}to`)}
          </Typography>
        </Layouts.Margin>
        <Layouts.Box width="250px">
          <TimePicker
            name={toTimePropName}
            onChange={setFieldValue}
            error={getIn(errors, toTimePropName)}
            onKeyUp={handleKeyUp}
          />
        </Layouts.Box>
      </Layouts.Flex>
    );
  }

  return <AddFilterIcon onClick={toggleInputVisible} />;
};

export default TimeRangeFilter;
