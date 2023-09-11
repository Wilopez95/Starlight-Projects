import React, { FC } from 'react';
import cs from 'classnames';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import { SearchOption } from './Search';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(({ palette }) => ({
  root: {
    height: 18,
    borderRadius: 6,
    backgroundColor: palette.primary.main,
    width: 24,
    textAlign: 'center',
  },
  label: {
    position: 'relative',
    top: -3,
    color: palette.common.white,
    fontSize: 14,
  },
}));

export interface FilterIconProps {
  label: SearchOption['label'];
  className?: string;
}

export const SearchOptionIcon: FC<FilterIconProps> = ({ label, className }) => {
  const classes = useStyles();

  return (
    <Box className={cs(classes.root, className)}>
      <Typography variant="caption" className={classes.label}>
        {label}
      </Typography>
    </Box>
  );
};

export default SearchOptionIcon;
