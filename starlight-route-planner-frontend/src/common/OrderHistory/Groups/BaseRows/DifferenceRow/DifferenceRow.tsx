import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';

import { useTimeZone } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import { Badge } from '../../common-styles';
import { SubjectRow } from '../SubjectRow/SubjectRow';

import { formatValue } from './helpers';
import { IDifferenceRow } from './types';

const I18N_ROOT_PATH = 'Text.';

export const DifferenceRow: React.FC<IDifferenceRow> = ({
  subject,
  to,
  from,
  format,
  prefix,
  label = 'changed',
}) => {
  const { t } = useTranslation();
  const { timeZone } = useTimeZone();
  const intlConfig = useIntl();

  return (
    <SubjectRow subject={subject} prefix={prefix}>
      {label}
      {from && (
        <>
          <Layouts.Margin left="0.5" right="0.5">
            {t(`${I18N_ROOT_PATH}From`)}
          </Layouts.Margin>
          <Badge color="default" shade="dark" bgColor="grey" bgShade="light">
            {formatValue(from, timeZone, intlConfig, format)}
          </Badge>
        </>
      )}
      {to && (
        <>
          <Layouts.Margin left="0.5" right="0.5">
            {t(`${I18N_ROOT_PATH}To`)}
          </Layouts.Margin>
          <Badge color="default" shade="dark" bgColor="grey" bgShade="light">
            {formatValue(to, timeZone, intlConfig, format)}
          </Badge>
        </>
      )}
    </SubjectRow>
  );
};
