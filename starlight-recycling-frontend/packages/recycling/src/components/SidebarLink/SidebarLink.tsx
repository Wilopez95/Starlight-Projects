import React, { FC, ReactElement } from 'react';
import cx from 'classnames';
import { Link, useRouteMatch } from 'react-router-dom';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';

import { createStyles, makeStyles } from '@material-ui/core/styles';

export interface SidebarLinkProps {
  link: string;
  parent?: boolean;
  exact?: boolean;
  text: string | ReactElement;
  icon?: ReactElement;
  className?: string;
}

const useStyles = makeStyles(
  ({ palette, sidebarMenu, spacing }) =>
    createStyles({
      link: {
        padding: spacing(1, 3),
        '& .MuiListItemIcon-root': {
          minWidth: 'unset',
          marginRight: spacing(1.5),
          color: palette.grey[100],
        },
        '&.Mui-selected, &.Mui-selected:hover': {
          color: palette.grey[900],
          backgroundColor: palette.background.default,
          '& .MuiListItemIcon-root': {
            color: palette.grey[800],
          },
        },
        '&:hover': {
          color: sidebarMenu.color,
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          '&:hover .MuiListItemIcon-root': {
            color: palette.grey[100],
          },
        },
      },
      parent: {
        paddingLeft: spacing(0.5, 3),
      },
      itemIcon: {
        minWidth: 40,
        color: sidebarMenu.iconColor,
      },
      itemIconActive: {
        color: palette.grey[800],
      },
    }),
  { name: 'SidebarLink' },
);

export const SidebarLink: FC<SidebarLinkProps> = ({ link, parent, text, icon, exact }) => {
  const classes = useStyles();
  let match = useRouteMatch({ path: link, exact });

  return (
    <ListItem
      className={cx(classes.link, { [classes.parent]: parent })}
      button
      component={Link}
      to={link}
      selected={!!match}
    >
      {icon && (
        <ListItemIcon className={cx(classes.itemIcon, { [classes.itemIconActive]: !!match })}>
          {icon}
        </ListItemIcon>
      )}
      <ListItemText primary={text} />
    </ListItem>
  );
};

export default SidebarLink;
