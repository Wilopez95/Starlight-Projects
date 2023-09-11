/* eslint-disable no-negated-condition */
import React from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { isNil } from 'lodash-es';

import { Badge } from '@root/common';
import { useIntl } from '@root/i18n/useIntl';

import { SubjectRow } from '../SubjectRow/SubjectRow';

import { formatValue } from './helpers';
import { IDifferenceRow } from './types';

export const DifferenceRow: React.FC<IDifferenceRow> = ({
  subject,
  to,
  from,
  format,
  prefix,
  label = 'changed',
}) => {
  const intlConfig = useIntl();

  return (
    <SubjectRow subject={subject} prefix={prefix}>
      {label}
      {!isNil(from) ? (
        <>
          <Layouts.Margin left="0.5" right="0.5">
            from
          </Layouts.Margin>
          <Badge color="secondary" shade="dark" bgColor="grey" bgShade="light">
            {formatValue(from, intlConfig, format)}
          </Badge>
        </>
      ) : null}
      {!isNil(to) ? (
        <>
          <Layouts.Margin left="0.5" right="0.5">
            to
          </Layouts.Margin>
          <Badge color="secondary" shade="dark" bgColor="grey" bgShade="light">
            {formatValue(to, intlConfig, format)}
          </Badge>
        </>
      ) : null}
    </SubjectRow>
  );
};
