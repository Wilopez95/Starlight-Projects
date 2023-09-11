import React, { FC } from 'react';
import { Box, Toolbar, Typography } from '@material-ui/core';
import { Trans } from '../../../i18n';
import { makeStyles } from '@material-ui/core/styles';
import { Field } from 'react-final-form';
import cx from 'classnames';

interface Props {}

const useStyles = makeStyles(({ palette }) => ({
  toolbar: {
    minHeight: 112,
  },
  section: {
    flexGrow: 1,
    marginBottom: '1.5rem',
  },
  description: {
    backgroundColor: palette.grey[200],
    minHeight: 40,
    borderRadius: 4,
    padding: '0 1rem',
    '& > span': {
      marginLeft: 'auto',
    },
  },
  error: {
    border: `1px solid ${palette.error.dark}`,
    color: palette.error.main,
  },
}));

export const MaterialsInfo: FC<Props> = () => {
  const classes = useStyles();

  return (
    <Toolbar disableGutters className={classes.toolbar}>
      <Box className={classes.section}>
        <Toolbar disableGutters>
          <Box fontWeight={500}>
            <Typography variant="h5">
              <Trans>Grade Materials, %</Trans>
            </Typography>
          </Box>
        </Toolbar>
        <Field name="total" subscription={{ error: true, value: true }}>
          {({ input: { value: total }, meta: { error } }) => (
            <Toolbar
              disableGutters
              className={cx({
                [classes.description]: true,
                [classes.error]: error && total > 100, // display error state only when its above 100
              })}
            >
              <Typography variant="body2">
                <Trans>Sum of materials must be 100%</Trans>
              </Typography>
              <Typography variant="body2" component={'span'}>
                <Trans values={{ total }}>Current Total</Trans>
              </Typography>
            </Toolbar>
          )}
        </Field>
      </Box>
    </Toolbar>
  );
};
