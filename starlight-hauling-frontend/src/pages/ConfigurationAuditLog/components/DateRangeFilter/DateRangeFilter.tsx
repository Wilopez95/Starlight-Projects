import React, { useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Layouts, Select, TextInputElement } from '@starlightpro/shared-components';
import { endOfDay, format, subDays } from 'date-fns';
import { getIn, useFormik } from 'formik';
import { isEmpty, noop, reduce } from 'lodash-es';

import { Typography } from '@root/common';
import { FilterConfigContext } from '@root/common/TableTools/TableFilter/context';
import { useDateIntl } from '@root/helpers/format/date';
import { dateFormatsEnUS } from '@root/i18n/format/date';
import { useIntl } from '@root/i18n/useIntl';

import { generateValidationSchema, getInitialValues } from './formikData';
import { DateRanges, IDateRangeFilter } from './types';

const options = [
  {
    label: 'Last 30 Days',
    value: DateRanges.lastThirtyDays,
  },
  {
    label: 'Custom',
    value: DateRanges.custom,
  },
];

const DateRangeFilter: React.FC<IDateRangeFilter> = ({ fromDatePropName, toDatePropName }) => {
  const { filterByKey, filterState, setFilterValue } = useContext(FilterConfigContext);
  const [currentDateRange, setDateRange] = useState<DateRanges>();
  const { formatDateTime, firstDayOfWeek } = useIntl();

  const { t } = useTranslation();

  const { values, setFieldValue, errors, validateForm } = useFormik({
    initialValues: getInitialValues(fromDatePropName, toDatePropName),
    validationSchema: generateValidationSchema(fromDatePropName, toDatePropName, t),
    validateOnChange: false,
    onSubmit: noop,
  });

  const { dateFormat } = useDateIntl();

  const handleDateRangeChange = useCallback(
    (_, value: DateRanges) => {
      setDateRange(value);

      if (value === DateRanges.lastThirtyDays) {
        const currentDate = new Date();

        const formattedValue = {
          [fromDatePropName]: format(subDays(currentDate, 29), dateFormatsEnUS.ISO),
          [toDatePropName]: format(currentDate, dateFormatsEnUS.ISO),
        };

        setFilterValue(filterByKey, { label: '', value: formattedValue });
      } else {
        setFieldValue(fromDatePropName, undefined);
        setFieldValue(toDatePropName, undefined);

        setFilterValue(filterByKey, null);
      }
    },
    [filterByKey, setFilterValue, fromDatePropName, setFieldValue, toDatePropName],
  );

  const handleKeyUp = useCallback(
    async (e: React.KeyboardEvent<TextInputElement>) => {
      if (e.key !== 'Enter') {
        return;
      }
      const errorsData = await validateForm();

      if (!isEmpty(errorsData)) {
        return;
      }

      const fromDate = getIn(values, fromDatePropName) as Date;
      const toDate = getIn(values, toDatePropName) as Date;

      const label = `${formatDateTime(fromDate).date} - ${formatDateTime(toDate).date}`;

      const formattedValue = reduce(
        values,
        (acc, cur, key) => {
          if (acc[key]) {
            return acc;
          }

          return {
            ...acc,
            [key]: format(cur, dateFormatsEnUS.ISO),
          };
        },
        {
          [toDatePropName]: format(endOfDay(values[toDatePropName]), dateFormatsEnUS.ISO),
        },
      );

      setFilterValue(filterByKey, { label, value: formattedValue });
    },
    [
      filterByKey,
      formatDateTime,
      fromDatePropName,
      setFilterValue,
      toDatePropName,
      validateForm,
      values,
    ],
  );

  if (getIn(filterState, `${filterByKey}.value`) && currentDateRange === DateRanges.custom) {
    return null;
  }

  return (
    <Layouts.Flex alignItems="baseline">
      <Layouts.Box width="250px">
        <Select
          name="dateRange"
          options={options}
          value={currentDateRange}
          onSelectChange={handleDateRangeChange}
        />
      </Layouts.Box>
      {currentDateRange === DateRanges.custom ? (
        <>
          <Layouts.Margin left="3" right="2">
            <Typography
              as="label"
              htmlFor={fromDatePropName}
              color="secondary"
              variant="bodyMedium"
            >
              {t('Text.From')}*
            </Typography>
          </Layouts.Margin>
          <Layouts.Box width="250px">
            <Calendar
              name={fromDatePropName}
              withInput
              value={getIn(values, fromDatePropName)}
              placeholder={t('Text.SetDate')}
              firstDayOfWeek={firstDayOfWeek}
              dateFormat={dateFormat}
              onDateChange={setFieldValue}
              error={getIn(errors, fromDatePropName)}
              onKeyUp={handleKeyUp}
            />
          </Layouts.Box>
          <Layouts.Margin left="2" right="2">
            <Typography as="label" htmlFor={toDatePropName} color="secondary" variant="bodyMedium">
              {t('Text.To')}*
            </Typography>
          </Layouts.Margin>
          <Layouts.Box width="250px">
            <Calendar
              name={toDatePropName}
              withInput
              value={getIn(values, toDatePropName)}
              placeholder={t('Text.SetDate')}
              firstDayOfWeek={firstDayOfWeek}
              dateFormat={dateFormat}
              onDateChange={setFieldValue}
              error={getIn(errors, toDatePropName)}
              onKeyUp={handleKeyUp}
            />
          </Layouts.Box>
        </>
      ) : null}
    </Layouts.Flex>
  );
};

export default DateRangeFilter;
