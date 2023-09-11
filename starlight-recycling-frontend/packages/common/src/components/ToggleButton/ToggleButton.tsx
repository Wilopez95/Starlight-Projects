import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Switch, { SwitchProps } from '@material-ui/core/Switch';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '35px',
    height: '21px',
    padding: theme.spacing(0),
    marginRight: theme.spacing(2),
  },
  switchBase: {
    padding: '2px',
    '&$checked': {
      transform: 'translateX(14px)',
      color: theme.palette.common.white,
      '& + $track': {
        backgroundColor: theme.palette.coreMain300,
        opacity: 1,
      },
    },
  },
  thumb: {
    width: '17px',
    height: '17px',
  },
  track: {
    borderRadius: 21 / 2,
    backgroundColor: theme.palette.grey[600],
    opacity: 1,
    transition: theme.transitions.create(['background-color']),
  },
  checked: {},
  focusVisible: {},
}));

export const ToggleButton: React.FC<SwitchProps> = (props) => {
  const styles = useStyles();

  return (
    <Switch
      focusVisibleClassName={styles.focusVisible}
      disableRipple
      classes={{
        root: styles.root,
        switchBase: styles.switchBase,
        thumb: styles.thumb,
        track: styles.track,
        checked: styles.checked,
      }}
      {...props}
    />
  );
};

export default ToggleButton;
