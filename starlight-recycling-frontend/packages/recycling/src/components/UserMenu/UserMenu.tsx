import React, { useState, FC, useContext } from 'react';
import { Trans } from '../../i18n';

import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import Button from '@material-ui/core/Button';
import AccountCircle from '@material-ui/icons/AccountCircle';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import Menu from '@material-ui/core/Menu';
import { IsLoggedIn, NotLoggedIn, LogoutMenuItem } from '@starlightpro/common';
import LangSwitcher from '../LangSwitcher';

import { useGetUserInfoQuery } from '../../graphql/api';
import { spacing } from '../../theme/spacing';
import { DriverContext } from '../../views/Kiosk/components/DriverContext/DriverContext';
import { Box } from '@material-ui/core';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      flexGrow: 1,
      display: 'flex',
      justifyContent: 'flex-end',
    },
    userName: {
      textTransform: 'none',
    },
    logOutMenu: {
      marginTop: spacing(4.5),
    },
    userImg: {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      borderRadius: '50%',
    },
  }),
);

export interface UserMenuProps {
  showHelpIcon?: boolean;
  showLangSwitch?: boolean;
  showGreetings?: boolean;
}

export const UserMenu: FC<UserMenuProps> = ({
  showHelpIcon = true,
  showLangSwitch = true,
  showGreetings = true,
}) => {
  const { data } = useGetUserInfoQuery();
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { driver } = useContext(DriverContext);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const UserIcon = () => {
    if (driver?.photoUrl) {
      return (
        <Box width={30} height={30}>
          <img alt="profile" className={classes.userImg} src={driver?.photoUrl} />
        </Box>
      );
    }

    return <AccountCircle />;
  };

  return (
    <div className={classes.root}>
      <IsLoggedIn>
        {showHelpIcon && (
          <IconButton color="inherit">
            <HelpOutlineIcon />
          </IconButton>
        )}
        {showLangSwitch && <LangSwitcher />}
        <Button
          onClick={handleMenu}
          color="inherit"
          startIcon={<UserIcon />}
          endIcon={<ArrowDropDownIcon />}
        >
          {showGreetings && (
            <Typography variant="subtitle2" noWrap className={classes.userName}>
              <Trans>Hi , {{ userName: `${data?.userInfo.firstName}` }}</Trans>
            </Typography>
          )}
        </Button>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          className={classes.logOutMenu}
          open={open}
          onClose={handleClose}
        >
          <LogoutMenuItem>
            <Trans>Logout</Trans>
          </LogoutMenuItem>
        </Menu>
      </IsLoggedIn>
      <NotLoggedIn>
        <Button color="inherit">
          <Trans>Login</Trans>
        </Button>
      </NotLoggedIn>
    </div>
  );
};

export default UserMenu;
