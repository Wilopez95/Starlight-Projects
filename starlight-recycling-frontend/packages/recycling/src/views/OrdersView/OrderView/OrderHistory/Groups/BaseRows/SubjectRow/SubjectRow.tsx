import React from 'react';

import { Box, makeStyles } from '@material-ui/core';

import { ISubjectRow } from './types';
import { useTranslation } from '@starlightpro/common/i18n';

const useStyles = makeStyles(() => ({
  subject: {
    fontWeight: 'bold',
  },
}));

export const SubjectRow: React.FC<ISubjectRow> = ({ subject, children, prefix = '' }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Box display="flex" alignItems="center" flexWrap="wrap">
      {t(prefix)}
      <Box mr={0.5} ml={prefix ? 0.5 : 0}>
        <span className={classes.subject}>{t(subject)}</span>
      </Box>
      {children}
    </Box>
  );
};
