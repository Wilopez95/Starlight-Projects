import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Layouts, Select } from '@starlightpro/shared-components';
import { endOfToday } from 'date-fns/esm';
import { useFormikContext } from 'formik';

import { Section, Subsection, Typography } from '@root/common';
import { useDateIntl } from '@root/helpers/format/date';
import { buildI18Path } from '@root/i18n/helpers';
import { useIntl } from '@root/i18n/useIntl';

import { INewSubscription } from '../../types';

import { ICompetitor } from './types';

const today = endOfToday();

const I18N_PATH = buildI18Path(
  'pages.NewRequest.NewRequestForm.forms.Subscription.sections.Competitor.',
);

export const Competitor: React.FC<ICompetitor> = ({ thirdPartyHaulerOptions }) => {
  const { values, errors, setFieldValue } = useFormikContext<INewSubscription>();
  const { t } = useTranslation();
  const { dateFormat, formatDate } = useDateIntl();
  const { firstDayOfWeek } = useIntl();

  return (
    <Section>
      <Subsection>
        <Layouts.Margin bottom="2">
          <Typography variant="headerThree">{t(`${I18N_PATH.Text}Competitor`)}</Typography>
        </Layouts.Margin>
        <Layouts.Flex>
          <Layouts.Column>
            <Select
              label={t(`${I18N_PATH.Form}CurrentProvider`)}
              placeholder={t(`${I18N_PATH.Text}SelectCurrentProvider`)}
              name="competitorId"
              value={values.competitorId}
              options={thirdPartyHaulerOptions}
              error={errors.competitorId}
              onSelectChange={setFieldValue}
            />
          </Layouts.Column>
          <Layouts.Column>
            <Calendar
              label={t(`${I18N_PATH.Form}ExpirationDate`)}
              name="competitorExpirationDate"
              withInput
              value={values.competitorExpirationDate}
              minDate={today}
              error={errors.competitorExpirationDate}
              onDateChange={setFieldValue}
              firstDayOfWeek={firstDayOfWeek}
              dateFormat={dateFormat}
              formatDate={formatDate}
            />
          </Layouts.Column>
        </Layouts.Flex>
      </Subsection>
    </Section>
  );
};
