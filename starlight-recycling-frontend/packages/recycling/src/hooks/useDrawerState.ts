import { useCallback, useState } from 'react';
import { useMediaQuery, useTheme } from '@material-ui/core';

interface DrawerStateHook {
  open: boolean;
  desktop: boolean;
  tablet: boolean;
  handleDrawerToggle: () => void;
  handleDrawerSet: (opened: boolean) => void;
}

export function useDrawerState(): DrawerStateHook {
  const [open, setOpen] = useState(false);

  const handleDrawerToggle = useCallback(() => setOpen((openedState) => !openedState), []);

  const handleDrawerSet = useCallback((opened: boolean) => setOpen(opened), []);

  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('lg'));
  const tablet = useMediaQuery(theme.breakpoints.down('lg'));

  return {
    desktop,
    tablet,
    handleDrawerToggle,
    handleDrawerSet,
    open,
  };
}
