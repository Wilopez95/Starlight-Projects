import React, { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Layouts, TextInputElement, Typography } from '@starlightpro/shared-components';
import { getIn, useFormik } from 'formik';
import { isEmpty, noop } from 'lodash-es';

import { useToggle } from '@root/core/hooks';
import { useIntl } from '@root/core/i18n/useIntl';

import { FilterConfigContext } from '../../context';
import { AddFilterIcon } from '../../FilterDropdownList';

import { generateValidationSchema, getInitialValues } from './formikData';
import type { IDateRangeFilter } from './types';

const I18N_PATH = 'common.TableTools.TableFilter.Filters.NumberRangeFilter.Text.';

const DateRangeFilter: React.FC<IDateRangeFilter> = ({ fromDatePropName, toDatePropName }) => {
  const { filterByKey, filterState, setFilterValue } = useContext(FilterConfigContext);
  const { formatDateTime } = useIntl();

  const [isInputVisible, toggleInputVisible] = useToggle(false);

  const { t } = useTranslation();

  const { values, setFieldValue, errors, validateForm } = useFormik({
    initialValues: getInitialValues(fromDatePropName, toDatePropName),
    validationSchema: generateValidationSchema(fromDatePropName, toDatePropName),
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

      const fromDate = getIn(values, fromDatePropName) as Date;
      const toDate = getIn(values, toDatePropName) as Date;

      const label = `${formatDateTime(fromDate).date} - ${formatDateTime(toDate).date}`;

      setFilterValue(filterByKey, { label, value: values });

      toggleInputVisible();
    },
    [
      filterByKey,
      formatDateTime,
      fromDatePropName,
      setFilterValue,
      toDatePropName,
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
          <Calendar
            name={fromDatePropName}
            withInput
            value={getIn(values, fromDatePropName)}
            onDateChange={setFieldValue}
            error={getIn(errors, fromDatePropName)}
            onKeyUp={handleKeyUp}
            dateFormat=''
          />
        </Layouts.Box>
        <Layouts.Margin left='2' right='2'>
          <Typography color='secondary' variant='bodyMedium'>
            {t(`${I18N_PATH}to`)}
          </Typography>
        </Layouts.Margin>
        <Layouts.Box width='250px'>
          <Calendar
            name={toDatePropName}
            withInput
            value={getIn(values, toDatePropName)}
            onDateChange={setFieldValue}
            error={getIn(errors, toDatePropName)}
            onKeyUp={handleKeyUp}
            dateFormat=''
          />
        </Layouts.Box>
      </Layouts.Flex>
    );
  }

  return <AddFilterIcon onClick={toggleInputVisible} />;
};

export default DateRangeFilter;
