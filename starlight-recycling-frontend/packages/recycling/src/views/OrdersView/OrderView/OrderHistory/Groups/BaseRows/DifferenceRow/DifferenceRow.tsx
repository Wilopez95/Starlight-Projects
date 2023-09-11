import React from 'react';
import { isNil } from 'lodash-es';

import { SubjectRow } from '../SubjectRow/SubjectRow';

import { IDifferenceRow } from './types';
import { Box } from '@material-ui/core';
import { i18n, Trans } from '../../../../../../../i18n';
import Label from '../../../../../../../components/Label';
import { makeStyles } from '@material-ui/core';
import cx from 'classnames';

const useStyles = makeStyles(() => ({
  fontClass: {
    fontSize: '1.5rem',
  },
}));

export const DifferenceRow: React.FC<IDifferenceRow> = ({
  subject,
  to,
  from,
  prefix,
  format,
  label = 'changed',
}) => {
  const classes = useStyles();

  if (!to) {
    return (
      <SubjectRow subject={subject} prefix={prefix}>
        <Trans>deleted</Trans>
      </SubjectRow>
    );
  }
  const { format: f } = i18n;
  const [fromValue, toValue] = format ? [f(from, format), f(to, format)] : [from, to];

  return (
    <SubjectRow subject={subject} prefix={prefix}>
      {label}
      {!isNil(from) && (
        <>
          <Box mx={0.5}>
            <Trans>from</Trans>
          </Box>
          <Label className={cx(classes.fontClass)} variant="lightGrey">
            {fromValue}
          </Label>
        </>
      )}
      <>
        <Box mx={0.5}>
          <Trans>to</Trans>
        </Box>
        <Label className={cx(classes.fontClass)} variant="lightGrey">
          {toValue}
        </Label>
      </>
    </SubjectRow>
  );
};
