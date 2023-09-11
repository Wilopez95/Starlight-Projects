import React, { useState, useRef, useEffect } from 'react';
import { isFunction } from 'lodash-es';
import cs from 'classnames';

import { makeStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import AddIcon from '@material-ui/icons/Add';

const useStyles = makeStyles(
  ({ palette, spacing }) => ({
    chip: {
      display: 'inline-flex',
      flexWrap: 'wrap',
      marginRight: spacing(2),
      backgroundColor: palette.grey[100],
      borderRadius: '17.5px',
    },
    addNewChip: {
      width: 32,
      height: 32,
    },
    chipIcon: {
      color: palette.grey[500],
      margin: 0,
      position: 'absolute',
    },
    hidden: {
      visibility: 'hidden',
      width: 0,
      height: 0,
      margin: 0,
    },
  }),
  {
    name: 'FilterInputAdd',
  },
);

export interface FilterInputAddProps {
  hide?: boolean;
  onClick?: () => void;
  children: (props: {
    onClose: () => void;
    open: boolean;
    ref: React.RefObject<any>;
  }) => JSX.Element | null;
}

export const FilterInputAdd = React.forwardRef<HTMLElement, FilterInputAddProps>(
  ({ children, hide, onClick }, ref) => {
    const classes = useStyles();
    const [open, setOpen] = useState(false);
    const chipRef = useRef<HTMLDivElement>();
    const [el, setEl] = useState<HTMLElement | null>(null);

    useEffect(() => {
      if (chipRef?.current) {
        chipRef.current.focus();
      }
    }, [open]);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      const nextRef = event.currentTarget;

      setOpen(true);
      setEl(el);

      if (ref) {
        if (isFunction(ref)) {
          ref(nextRef);
        } else {
          ref.current = nextRef;
        }
      }

      onClick && onClick();
    };

    const onClose = () => {
      setOpen(false);
    };

    return (
      <>
        <Chip
          innerRef={chipRef}
          clickable
          className={cs(classes.chip, {
            [classes.hidden]: open || hide,
          })}
          classes={{ root: classes.addNewChip, icon: classes.chipIcon }}
          icon={<AddIcon fontSize="small" />}
          onClick={handleClick}
        />
        {children({ onClose, open: open, ref: chipRef })}
      </>
    );
  },
);

export default FilterInputAdd;
