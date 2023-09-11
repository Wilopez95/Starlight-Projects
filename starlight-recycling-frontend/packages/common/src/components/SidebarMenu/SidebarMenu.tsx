import React, { FC, useState, ReactElement } from 'react';

import ListItem from '@material-ui/core/ListItem';
import Collapse from '@material-ui/core/Collapse';
import List from '@material-ui/core/List';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export interface SidebarMenuProps {
  text: string | ReactElement;
  icon: ReactElement;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    rootLink: {
      color: theme.sidebarMenu.color,
    },
    itemIcon: {
      minWidth: 40,
      color: theme.sidebarMenu.iconColor,
    },
    listItems: {
      '& .MuiButtonBase-root': {
        paddingLeft: theme.spacing(7),
      },
    },
  }),
);

export const SidebarMenu: FC<SidebarMenuProps> = ({ text, icon, children }) => {
  const classes = useStyles();
  const [open, setOpen] = useState(true);

  return (
    <>
      <ListItem className={classes.rootLink} button onClick={() => setOpen(!open)}>
        {icon && <ListItemIcon className={classes.itemIcon}>{icon}</ListItemIcon>}
        <ListItemText primary={text} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding className={classes.listItems}>
          {children}
        </List>
      </Collapse>
    </>
  );
};

export default SidebarMenu;
