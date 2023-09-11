import React, { FC } from 'react';
import { Box, makeStyles } from '@material-ui/core';
import { HeaderComponentProps } from '@starlightpro/common/components/SidepanelView';
import ArrowRight from '@material-ui/icons/ArrowRightAltSharp';

const useStyles = makeStyles(
  ({ spacing }) => ({
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: spacing(3),
    },
    headerTextWrapper: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerText: {
      fontSize: '1rem',
      fontWeight: 500,
      textTransform: 'uppercase',
    },
  }),
  { name: 'FormHeader' },
);

export interface FormHeaderProps extends HeaderComponentProps {
  headerText: JSX.Element;
  icon: JSX.Element;
}

export const FormHeader: FC<FormHeaderProps> = ({ headerText, icon }) => {
  const classes = useStyles();

  return (
    <Box className={classes.header}>
      <Box display="flex" alignItems="flex-end">
        {icon}
      </Box>
      <Box className={classes.headerTextWrapper}>
        <Box className={classes.headerText}>{headerText}</Box>
        <ArrowRight />
      </Box>
    </Box>
  );
};
