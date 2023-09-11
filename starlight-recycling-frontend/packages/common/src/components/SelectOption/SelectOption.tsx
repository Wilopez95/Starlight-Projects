import React, { memo, forwardRef } from 'react';
import cs from 'classnames';
import { makeStyles } from '@material-ui/core/styles';
import MenuItem, { MenuItemProps } from '@material-ui/core/MenuItem';
import Box from '@material-ui/core/Box';

const useStyles = makeStyles(
  ({ palette, spacing, transitions, typography }) => ({
    root: {
      ...typography.body2,
      cursor: 'pointer',
      position: 'relative',
      padding: spacing(1, 2),

      '&$selected': {
        background: 'transparent',
      },

      '&:before': {
        zIndex: 0,
        content: '"\\00a0"',
        pointerEvents: 'none', // Transparent to the hover style.
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: palette.grey[50],
        opacity: 0,
        transition: transitions.create('opacity', {
          duration: transitions.duration.shorter,
        }),
      },

      '&:hover:before': {
        opacity: 1,
      },
      '&:focus:before': {
        opacity: 1,
        borderTop: `1px solid ${palette.grey[200]}`,
        borderBottom: `1px solid ${palette.grey[200]}`,
        borderLeft: `2px solid ${palette.primary.main}`,
      },
    },
    content: {
      zIndex: 1,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      width: '100%',
    },
    hovered: {
      '&:before': {
        opacity: 1,
      },
    },
    focused: {
      '&:before': {
        opacity: 1,
        borderTop: `1px solid ${palette.grey[200]}`,
        borderBottom: `1px solid ${palette.grey[200]}`,
        borderLeft: `2px solid ${palette.primary.main}`,
      },
    },
    selected: {
      fontWeight: 600,
    },
    disabled: {
      color: palette.text.disabled,
      pointerEvents: 'none',

      '&$hovered': {
        '&:before': {
          opacity: 0,
        },
      },
    },
    icon: {
      marginRight: spacing(1),
      width: 24,
      height: 24,
      zIndex: 1,
    },
  }),
  {
    name: 'SelectOption',
  },
);

export interface SelectOptionProps extends MenuItemProps {
  hover?: boolean;
  disabled?: boolean;
  focused?: boolean;
  icon?: React.ReactNode;
  button?: true | undefined;
}

export const SelectOption = memo<SelectOptionProps>(
  forwardRef(({ children, icon, hover, disabled, focused, ...props }, ref) => {
    const classes = useStyles();

    return (
      <MenuItem
        {...props}
        ref={ref}
        className={cs(props.className, classes.root, {
          [classes.selected]: props.selected,
          [classes.hovered]: hover,
          [classes.focused]: focused,
          [classes.disabled]: disabled,
        })}
      >
        <Box display="flex" flexDirection="row" overflow="hidden" width="100%">
          {icon && <Box className={classes.icon}>{icon}</Box>}
          <Box className={classes.content}>{children}</Box>
        </Box>
      </MenuItem>
    );
  }),
);
