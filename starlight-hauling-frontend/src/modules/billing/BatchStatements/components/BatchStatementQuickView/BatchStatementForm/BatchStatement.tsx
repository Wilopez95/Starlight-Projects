import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Layouts } from '@starlightpro/shared-components';
import { endOfDay, endOfToday, endOfYesterday } from 'date-fns';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { useIntl } from '@root/i18n/useIntl';

import { Typography } from '../../../../../../common';
import { useDateIntl } from '../../../../../../helpers/format/date';
import { type INewBatchStatement } from '../../../types';
import CustomersTable from '../CustomersTable/CustomersTable';
import StatementsTable from '../StatementsTable/StatementsTable';

const I18N_PATH = 'quickViews.BatchStatement.BatchStatementQuickView.BatchStatementForm.';
const BatchStatementForm: React.FC<{
  viewMode: boolean;
}> = ({ viewMode }) => {
  const { t } = useTranslation();
  const { values, setFieldValue, errors } = useFormikContext<INewBatchStatement>();

  const handleDateChange = useCallback(
    (name: string, date: Date | null) => {
      setFieldValue(name, endOfDay(date ?? new Date()));
    },
    [setFieldValue],
  );

  const today = endOfToday();
  const yesterday = endOfYesterday();
  const { dateFormat } = useDateIntl();
  const { firstDayOfWeek } = useIntl();

  return (
    <Layouts.Margin top="3">
      <Layouts.Grid columnGap="4" columns="300px 300px">
        <Layouts.Flex alignItems="center">
          <Layouts.Margin bottom="3" right="2">
            <Typography
              as="label"
              htmlFor="statementDate"
              variant="bodyMedium"
              color="secondary"
              shade="desaturated"
            >
              {t(`${I18N_PATH}StatementDate`)}*
            </Typography>
          </Layouts.Margin>
          <Layouts.Box width="150px">
            <Calendar
              withInput
              name="statementDate"
              value={values.statementDate}
              placeholder={t('Text.SetDate')}
              firstDayOfWeek={firstDayOfWeek}
              dateFormat={dateFormat}
              onDateChange={handleDateChange}
              error={errors.statementDate}
              minDate={values.endDate}
              maxDate={today}
              readOnly={viewMode}
            />
          </Layouts.Box>
        </Layouts.Flex>
        <Layouts.Flex alignItems="center">
          <Layouts.Margin bottom="3" right="2">
            <Typography
              as="label"
              htmlFor="endDate"
              variant="bodyMedium"
              color="secondary"
              shade="desaturated"
            >
              {t(`${I18N_PATH}EndDate`)}*
            </Typography>
          </Layouts.Margin>
          <Layouts.Box width="150px">
            <Calendar
              withInput
              name="endDate"
              value={values.endDate}
              placeholder={t('Text.SetDate')}
              firstDayOfWeek={firstDayOfWeek}
              dateFormat={dateFormat}
              onDateChange={handleDateChange}
              error={errors.endDate}
              maxDate={yesterday}
              readOnly={viewMode}
            />
          </Layouts.Box>
        </Layouts.Flex>
      </Layouts.Grid>
      {viewMode ? <StatementsTable /> : <CustomersTable />}
    </Layouts.Margin>
  );
};

export default observer(BatchStatementForm);
