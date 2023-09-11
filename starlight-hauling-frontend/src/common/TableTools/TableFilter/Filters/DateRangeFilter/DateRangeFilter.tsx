import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Layouts } from '@starlightpro/shared-components';
import { endOfDay, format } from 'date-fns';
import { getIn, useFormik } from 'formik';
import { isEmpty, noop, reduce } from 'lodash-es';

import { Typography } from '@root/common';
import { useDateIntl } from '@root/helpers/format/date';
import { useToggle } from '@root/hooks';
import { dateFormatsEnUS } from '@root/i18n/format/date';
import { useIntl } from '@root/i18n/useIntl';

import { FilterConfigContext } from '../../context';
import { AddFilterIcon } from '../../FilterDropdownList';

import { generateValidationSchema, getInitialValues } from './formikData';
import { IDateRangeFilter } from './types';

const I18N_PATH = 'common.TableTools.TableFilter.Filters.NumberRangeFilter.Text.';

const DateRangeFilter: React.FC<IDateRangeFilter> = ({
  fromDatePropName,
  toDatePropName,
  isCreateDate,
}) => {
  const { filterByKey, filterState, setFilterValue } = useContext(FilterConfigContext);
  const { formatDateTime } = useIntl();
  const [isInputVisible, toggleInputVisible] = useToggle(false);
  const [choseToDate, setChoseToDate] = useState(false);

  const { t } = useTranslation();

  const { values, errors, validateForm, setFieldValue } = useFormik({
    initialValues: getInitialValues(fromDatePropName, toDatePropName),
    validationSchema: generateValidationSchema(fromDatePropName, toDatePropName),
    validateOnChange: false,
    onSubmit: noop,
  });

  const { dateFormat } = useDateIntl();

  const fromDate = values[fromDatePropName];
  const toDate = values[toDatePropName];

  const applyFilters = useCallback(async () => {
    const errorsInfo = await validateForm();
    if (!isEmpty(errorsInfo)) {
      return;
    }

    const label = `${formatDateTime(fromDate).date} - ${formatDateTime(toDate).date}`;

    const formattedValue = reduce(
      values,
      (acc, cur, key) => {
        if (acc[key]) {
          return acc;
        }

        if (isCreateDate) {
          return {
            ...acc,
            [key]: cur.toISOString(),
          };
        }

        return {
          ...acc,
          [key]: format(cur, dateFormatsEnUS.ISO),
        };
      },
      {
        [toDatePropName]: isCreateDate
          ? endOfDay(values[toDatePropName]).toISOString()
          : format(endOfDay(values[toDatePropName]), dateFormatsEnUS.ISO),
      },
    );

    setFilterValue(filterByKey, { label, value: formattedValue });
    toggleInputVisible();
    setChoseToDate(false);
  }, [
    filterByKey,
    formatDateTime,
    fromDate,
    isCreateDate,
    setFilterValue,
    toDate,
    toDatePropName,
    toggleInputVisible,
    validateForm,
    values,
  ]);

  useEffect(() => {
    if (choseToDate) {
      applyFilters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, choseToDate]);

  if (getIn(filterState, `${filterByKey}.value`)) {
    return null;
  }

  if (isInputVisible) {
    return (
      <Layouts.Flex alignItems="baseline">
        <Layouts.Margin left="3" right="2">
          <Typography as="label" htmlFor={fromDatePropName} color="secondary" variant="bodyMedium">
            {t(`${I18N_PATH}from`)}*
          </Typography>
        </Layouts.Margin>
        <Layouts.Box width="250px">
          <Calendar
            name={fromDatePropName}
            withInput
            placeholder={t('Text.SetDate')}
            dateFormat={dateFormat}
            onDateChange={async (field: string, value: Date) => {
              await setFieldValue(field, value);
            }}
            error={getIn(errors, fromDatePropName)}
          />
        </Layouts.Box>
        <Layouts.Margin left="2" right="2">
          <Typography as="label" htmlFor={toDatePropName} color="secondary" variant="bodyMedium">
            {t(`${I18N_PATH}to`)}*
          </Typography>
        </Layouts.Margin>
        <Layouts.Box width="250px">
          <Calendar
            name={toDatePropName}
            withInput
            placeholder={t('Text.SetDate')}
            dateFormat={dateFormat}
            onDateChange={async (field: string, value: Date) => {
              await setFieldValue(field, value);
              setChoseToDate(true);
            }}
            error={getIn(errors, toDatePropName)}
          />
        </Layouts.Box>
      </Layouts.Flex>
    );
  }

  return <AddFilterIcon onClick={toggleInputVisible} />;
};

export default DateRangeFilter;
