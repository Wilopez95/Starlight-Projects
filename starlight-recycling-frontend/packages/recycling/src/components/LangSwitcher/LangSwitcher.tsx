import React, { FC, useState } from 'react';
import { Translation } from '../../i18n';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import Typography from '@material-ui/core/Typography';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Box from '@material-ui/core/Box';
import { LANGUAGES, Language, LANGUAGE_LABEL_MAPPING } from '../../constants/language';
import { spacing } from '../../theme/spacing';

const useStyles = makeStyles(
  () =>
    createStyles({
      root: {
        display: 'flex',
        alignItems: 'center',
        width: 80,
      },
      text: {
        textTransform: 'none',
      },
      menu: {
        marginTop: spacing(4.5),
      },
    }),
  { name: 'LangSwitcher' },
);

export interface LangSwitcherProps {}

export const LangSwitcher: FC<LangSwitcherProps> = () => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Translation>
      {(t, { i18n }) => (
        <Box className={classes.root}>
          <Button onClick={handleMenu} color="inherit" endIcon={<ArrowDropDownIcon />}>
            <Typography variant="subtitle2" noWrap className={classes.text}>
              {LANGUAGE_LABEL_MAPPING[i18n.language as Language]}
            </Typography>
          </Button>
          <Menu
            className={classes.menu}
            id="menu-lang"
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
            open={open}
            onClose={handleClose}
          >
            {LANGUAGES.map((lang) => (
              <MenuItem
                selected={i18n.language === lang}
                key={lang}
                onClick={async () => {
                  await i18n.changeLanguage(lang);
                  handleClose();
                }}
              >
                {LANGUAGE_LABEL_MAPPING[lang]}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      )}
    </Translation>
  );
};

export default LangSwitcher;
