import React, { ReactNode, ElementRef, forwardRef, useCallback, useState } from 'react';
import { MenuItem, MenuItemProps, Typography, Box } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import cs from 'classnames';

import ChevronRightIcon from '../icons/ChevronRight';

type CompProps = { children?: React.ReactNode; className?: string };

export interface LobbyMenuItemProps extends MenuItemProps {
  title?: string;
  subtitle?: string;
  image?: string | null;
  icon?: ReactNode;
  updatedAt?: Date;
  components?: {
    MenuItemIconWrapper?: React.ComponentType<CompProps>;
    Title: React.ComponentType<CompProps>;
    SubTitle: React.ComponentType<CompProps>;
  };
}

export const getDefaultLogo = (companyName: string) => {
  const words = companyName.split(' ');

  return words
    .map((word) => word[0])
    .join('')
    .slice(0, 3);
};

const useStyles = makeStyles(
  ({ palette, spacing }) =>
    createStyles({
      menuItem: {
        display: 'flex',
        alignItems: 'center',
        padding: spacing(1),
        borderRadius: '4px',
        cursor: 'pointer',
      },
      menuItemIconWrapper: {
        width: '40px',
        height: '40px',
        marginRight: spacing(2),
        borderRadius: '4px',
        overflow: 'hidden',
      },
      menuItemIcon: {
        position: 'relative',
        display: 'flex',
        width: 16,
        height: 16,
        color: palette.common.white,
      },
      title: {
        width: '400px',
      },
      subtitle: {
        fontWeight: 'bold',
        color: palette.text.secondary,
        fontSize: 12,
      },
      image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '4px',
      },
      defaultLogo: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontWeight: 'bold',
        color: 'white',
        width: '100%',
        height: '100%',
        backgroundColor: palette.orange,
      },
      chevronIcon: {
        marginLeft: spacing(2),
        color: palette.text.secondary,
        width: 12,
        height: 12,
      },
    }),
  { name: 'LobbyMenuItem' },
);

const LobbyMenuItem = forwardRef<ElementRef<typeof MenuItem>, LobbyMenuItemProps>(
  (
    { title, subtitle, image, icon, updatedAt = new Date(), onClick, className, components = {} },
    ref,
  ) => {
    const classes = useStyles();
    const [imageExist, setImageExist] = useState(true);
    const {
      SubTitle = ({ children, className }: CompProps) => (
        <Typography variant="caption" className={className}>
          {children}
        </Typography>
      ),
      Title = ({ children, className }: CompProps) => (
        <Typography variant="body2" className={className} noWrap>
          {children}
        </Typography>
      ),
      MenuItemIconWrapper = (props: CompProps) => <Box {...props} />,
    } = components;
    const imageUrl =
      (image && (image.startsWith('data:') ? image : `${image}?modified=${updatedAt.valueOf()}`)) ||
      '';

    const handleError = useCallback(() => {
      setImageExist(false);
    }, []);

    return (
      <MenuItem className={cs(classes.menuItem, className)} onClick={onClick} ref={ref}>
        {icon ? (
          <MenuItemIconWrapper className={classes.menuItemIconWrapper}>
            <Box className={classes.defaultLogo}>
              <Box className={classes.menuItemIcon}>{icon}</Box>
            </Box>
          </MenuItemIconWrapper>
        ) : (
          <MenuItemIconWrapper className={classes.menuItemIconWrapper}>
            {image && imageExist ? (
              <img src={imageUrl} onError={handleError} className={classes.image} alt={title} />
            ) : (
              <Typography variant="body2" className={classes.defaultLogo}>
                {title ? getDefaultLogo(title) : null}
              </Typography>
            )}
          </MenuItemIconWrapper>
        )}
        <Box>
          <Title className={classes.title}>{title}</Title>
          {subtitle && <SubTitle className={classes.subtitle}>{subtitle}</SubTitle>}
        </Box>
        <ChevronRightIcon viewBox="0 0 7 12" className={classes.chevronIcon} />
      </MenuItem>
    );
  },
);

export default LobbyMenuItem;
