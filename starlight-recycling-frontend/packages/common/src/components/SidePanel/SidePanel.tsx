import React, { FC, useEffect, useState } from 'react';
import Drawer from '@material-ui/core/Drawer';
import { debounce } from 'lodash-es';
import { ClassNameMap } from '@material-ui/styles/withStyles/withStyles';

export interface SidePanelProps {
  isOpen?: boolean;
  content?: React.ReactNode | null;
  anchor?: 'left' | 'right';
  onClose?: () => Promise<any>;
  container?: React.ReactInstance | (() => React.ReactInstance | null) | null;
  classes?: Partial<ClassNameMap<any>>;
}

const MODAL_TRANSITION_DURATION = 200;

const closestOffsetParentTop = (element: HTMLElement): number => {
  return (
    element.offsetTop ||
    (element.offsetParent ? closestOffsetParentTop(element.offsetParent as HTMLElement) : 0)
  );
};

export const SidePanel: FC<SidePanelProps> = ({
  container = null,
  classes,
  anchor = 'right',
  isOpen,
  content,
  onClose,
}) => {
  const [open, setOpen] = useState(!isOpen);
  const debouncedOpen = debounce(() => {
    setOpen(!!isOpen);
  }, MODAL_TRANSITION_DURATION);

  useEffect(() => {
    debouncedOpen();
  }, [debouncedOpen, isOpen, open]);

  return (
    <Drawer
      open={open}
      anchor={anchor}
      onClose={onClose}
      ModalProps={{
        disableAutoFocus: false,
      }}
      transitionDuration={MODAL_TRANSITION_DURATION}
      classes={classes}
      style={{
        top: container ? closestOffsetParentTop(container as HTMLElement) : 0,
      }}
    >
      {content}
    </Drawer>
  );
};

export default SidePanel;
